const { poolPromise, sql } = require("../config/db");
const queueService = require("./queueService");

/**
 * Lấy danh sách TestRequests pending của ngày hiện tại và nhóm theo appointment_id
 * Điều kiện: TestRequests status = 'requested' và Invoice pending hoặc chưa có
 */
const getPendingTestRequests = async () => {
  const query = `
    SELECT 
      tr.request_id,
      tr.appointment_id,
      trd.service_id,
      tr.status,
      tr.request_date,
      tr.approved_at,
      trd.notes as service_notes,
      s.name as service_name,
      s.price as service_price,
      s.description as service_description,
      p.full_name as patient_name,
      p.phone as patient_phone,
      p.address as patient_address,
      a.bookingDate as appointment_date,
      sl.start_time as appointment_time,
      d.full_name as doctor_name,
      i.invoice_id,
      i.amount as invoice_amount,
      i.status as invoice_status
    FROM TestRequests tr
    JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
    JOIN Services s ON trd.service_id = s.service_id
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Doctors d ON tr.doctor_id = d.doctor_id
    LEFT JOIN Slots sl ON a.slot_id = sl.slot_id
    LEFT JOIN Invoices i ON tr.request_id = i.request_id
    WHERE tr.status = 'requested' 
      AND CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)
      AND (i.status = 'pending' OR i.status IS NULL)
    ORDER BY sl.start_time ASC, tr.request_date ASC
  `;

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    const rows = result.recordset;

    // Nhóm theo appointment_id
    const groupedRequests = {};

    rows.forEach((row) => {
      const appointmentId = row.appointment_id;

      if (!groupedRequests[appointmentId]) {
        groupedRequests[appointmentId] = {
          appointment_id: appointmentId,
          request_id: row.request_id,
          patient_name: row.patient_name,
          patient_phone: row.patient_phone,
          patient_address: row.patient_address,
          appointment_date: row.appointment_date,
          appointment_time: row.appointment_time,
          doctor_name: row.doctor_name,
          status: row.status,
          created_at: row.request_date,
          updated_at: row.approved_at,
          services: [],
          total_price: 0,
        };
      }

      // Thêm service vào nhóm
      groupedRequests[appointmentId].services.push({
        request_id: row.request_id,
        service_id: row.service_id,
        service_name: row.service_name,
        service_price: row.service_price,
        service_description: row.service_description,
        service_notes: row.service_notes,
      });

      // Cập nhật tổng tiền
      groupedRequests[appointmentId].total_price += parseFloat(
        row.service_price || 0
      );
    });

    // Chuyển object thành array
    return Object.values(groupedRequests);
  } catch (error) {
    console.error("Error in getPendingTestRequests:", error);
    throw error;
  }
};

/**
 * Thu tiền cho TestRequest - chỉ cập nhật Invoice thành 'paid'
 * TestRequest vẫn giữ status 'requested' để Lab Staff xử lý sau
 * @param {number} appointmentId - ID của appointment
 * @param {string} paymentMethod - Phương thức thanh toán (cash, qr_code)
 */
const approveTestRequest = async (appointmentId, paymentMethod = "cash") => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // 1. Lấy danh sách TestRequests cần approve
    const testRequestsQuery = `
      SELECT request_id, appointment_id
      FROM TestRequests 
      WHERE appointment_id = @appointmentId AND status = 'requested'
    `;

    const testRequestsResult = await transaction
      .request()
      .input("appointmentId", sql.Int, appointmentId)
      .query(testRequestsQuery);

    const testRequests = testRequestsResult.recordset;

    if (testRequests.length === 0) {
      await transaction.rollback();
      return {
        success: false,
        affectedRows: 0,
        message: `Không tìm thấy TestRequest nào cần thu tiền cho appointment ${appointmentId}`,
      };
    }

    // 2. Chỉ cập nhật Invoice status thành 'paid' cho các test request này
    // KHÔNG thay đổi TestRequest status - để Lab Staff xử lý sau
    if (testRequests.length > 0) {
      const requestIds = testRequests.map((tr) => tr.request_id);

      // Sử dụng parameterized query để tránh SQL injection
      const invoiceRequest = transaction.request();
      requestIds.forEach((id, index) => {
        invoiceRequest.input(`requestId${index}`, sql.Int, id);
      });

      const invoiceQuery = `
        UPDATE Invoices 
        SET status = 'paid', issued_at = GETDATE()
        WHERE request_id IN (${requestIds
          .map((_, index) => `@requestId${index}`)
          .join(",")})
          AND status = 'pending'
      `;

      const invoiceUpdateResult = await invoiceRequest.query(invoiceQuery);

      console.log(
        `📄 Updated ${invoiceUpdateResult.rowsAffected[0]} invoices to 'paid' status for appointment ${appointmentId}`
      );
    }

    // 4. Cấp số thứ tự cho từng TestRequest được approve
    const queueResults = [];
    let queueErrors = [];

    for (const testRequest of testRequests) {
      try {
        // Cấp số thứ tự cho TestRequest (loại test)
        const queueInfo = await queueService.createQueueForTestRequest(
          testRequest.request_id
        );
        queueResults.push({
          request_id: testRequest.request_id,
          queue_info: queueInfo,
        });

        console.log(
          `✅ Đã cấp số thứ tự ${queueInfo.queue_number} cho TestRequest ${testRequest.request_id}`
        );
      } catch (queueError) {
        // Log lỗi nhưng không fail toàn bộ transaction
        console.error(
          `❌ Lỗi khi cấp số thứ tự cho TestRequest ${testRequest.request_id}:`,
          queueError.message
        );
        queueErrors.push({
          request_id: testRequest.request_id,
          error: queueError.message,
        });
      }
    }

    await transaction.commit();

    return {
      success: true,
      affectedRows: testRequests.length,
      message: `Đã thu tiền cho ${testRequests.length} yêu cầu xét nghiệm (appointment ${appointmentId})`,
      queue_results: queueResults,
      queue_errors: queueErrors.length > 0 ? queueErrors : null,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in approveTestRequest:", error);
    throw error;
  }
};

/**
 * Lấy thống kê cho Registration Staff - chỉ ngày hiện tại
 */
const getRegistrationStatistics = async () => {
  try {
    const pool = await poolPromise;

    // Đếm số TestRequests đang chờ xử lý (status = 'requested' và Invoice chưa thanh toán)
    const pendingQuery = `
      SELECT COUNT(DISTINCT tr.request_id) as pending_count
      FROM TestRequests tr
      JOIN Appointments a ON tr.appointment_id = a.appointment_id
      LEFT JOIN Invoices i ON tr.request_id = i.request_id
      WHERE tr.status = 'requested' 
        AND CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)
        AND (i.status = 'pending' OR i.status IS NULL)
    `;
    const pendingResult = await pool.request().query(pendingQuery);
    const pendingCount = pendingResult.recordset[0]?.pending_count || 0;

    // Tổng doanh thu từ các TestRequests đã thu tiền hôm nay (Invoice = 'paid')
    const revenueQuery = `
      SELECT SUM(s.price) as total_revenue
      FROM TestRequests tr
      JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
      JOIN Services s ON trd.service_id = s.service_id
      JOIN Appointments a ON tr.appointment_id = a.appointment_id
      JOIN Invoices i ON tr.request_id = i.request_id
      WHERE i.status = 'paid'
        AND CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)
        AND CAST(i.issued_at AS DATE) = CAST(GETDATE() AS DATE)
    `;
    const revenueResult = await pool.request().query(revenueQuery);
    const totalRevenue = revenueResult.recordset[0]?.total_revenue || 0;

    // Số TestRequests đã thu tiền hôm nay (Invoice = 'paid')
    const processedQuery = `
      SELECT COUNT(DISTINCT tr.request_id) as processed_count
      FROM TestRequests tr
      JOIN Appointments a ON tr.appointment_id = a.appointment_id
      JOIN Invoices i ON tr.request_id = i.request_id
      WHERE i.status = 'paid'
        AND CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)
        AND CAST(i.issued_at AS DATE) = CAST(GETDATE() AS DATE)
    `;
    const processedResult = await pool.request().query(processedQuery);
    const processedCount = processedResult.recordset[0]?.processed_count || 0;

    return {
      pending_requests: pendingCount,
      today_revenue: totalRevenue,
      processed_today: processedCount,
    };
  } catch (error) {
    console.error("Error in getRegistrationStatistics:", error);
    throw error;
  }
};

/**
 * Lấy lịch sử thanh toán ngày hiện tại (các TestRequests đã thu tiền - Invoice = 'paid')
 */
const getPaymentHistory = async (limit = 50) => {
  const query = `
    SELECT TOP (@limit)
      tr.request_id,
      tr.appointment_id,
      trd.service_id,
      tr.status,
      i.issued_at as payment_date,
      trd.notes as service_notes,
      s.name as service_name,
      s.price as service_price,
      p.full_name as patient_name,
      p.phone as patient_phone,
      a.bookingDate as appointment_date,
      sl.start_time as appointment_time,
      d.full_name as doctor_name,
      i.amount as total_amount
    FROM TestRequests tr
    JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
    JOIN Services s ON trd.service_id = s.service_id
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Doctors d ON tr.doctor_id = d.doctor_id
    JOIN Invoices i ON tr.request_id = i.request_id
    LEFT JOIN Slots sl ON a.slot_id = sl.slot_id
    WHERE i.status = 'paid'
      AND CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)
    ORDER BY i.issued_at DESC
  `;

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("limit", sql.Int, limit);
    const result = await request.query(query);
    const rows = result.recordset;

    // Nhóm theo appointment_id để hiển thị như một đơn thanh toán
    const groupedPayments = {};

    rows.forEach((row) => {
      const appointmentId = row.appointment_id;

      if (!groupedPayments[appointmentId]) {
        groupedPayments[appointmentId] = {
          appointment_id: appointmentId,
          request_id: row.request_id,
          patient_name: row.patient_name,
          patient_phone: row.patient_phone,
          appointment_date: row.appointment_date,
          appointment_time: row.appointment_time,
          doctor_name: row.doctor_name,
          payment_date: row.payment_date,
          status: row.status,
          services: [],
          total_price: 0,
        };
      }

      // Thêm service vào nhóm thanh toán
      groupedPayments[appointmentId].services.push({
        request_id: row.request_id,
        service_id: row.service_id,
        service_name: row.service_name,
        service_price: row.service_price,
        service_notes: row.service_notes,
      });

      // Cập nhật tổng tiền
      groupedPayments[appointmentId].total_price += parseFloat(
        row.service_price || 0
      );
    });

    // Chuyển object thành array và sắp xếp theo ngày thanh toán
    const groupedArray = Object.values(groupedPayments).sort(
      (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
    );

    // Giới hạn số lượng kết quả theo nhóm appointment, không phải theo record
    return groupedArray.slice(0, Math.ceil(limit / 2)); // Chia đôi vì có thể có nhiều service/appointment
  } catch (error) {
    console.error("Error in getPaymentHistory:", error);
    throw error;
  }
};

module.exports = {
  getPendingTestRequests,
  approveTestRequest,
  getRegistrationStatistics,
  getPaymentHistory,
};
