const { poolPromise, sql } = require("../config/db");
const queueService = require("./queueService");

/**
 * Lấy danh sách TestRequests pending của ngày hiện tại và nhóm theo appointment_id
 * Mỗi nhóm sẽ có mảng services chứa tất cả dịch vụ thuộc appointment đó
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
      d.full_name as doctor_name
    FROM TestRequests tr
    JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
    JOIN Services s ON trd.service_id = s.service_id
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Doctors d ON tr.doctor_id = d.doctor_id
    LEFT JOIN Slots sl ON a.slot_id = sl.slot_id
    WHERE tr.status = 'requested' 
      AND CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)
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
 * Duyệt tất cả TestRequests thuộc 1 appointment, cấp số thứ tự và cập nhật Invoice thành 'paid'
 * @param {number} appointmentId - ID của appointment
 * @param {string} paymentMethod - Phương thức thanh toán (cash, qr_code)
 */
<<<<<<< HEAD
const approveTestRequest = async (appointmentId) => {
  const query = `
    -- 1. Cập nhật TestRequests status và approved_at
    UPDATE TestRequests 
    SET status = 'in_progress', approved_at = SWITCHOFFSET(GETDATE(), '+07:00') 
    WHERE appointment_id = @appointmentId AND status = 'requested';
    
    -- 2. Cập nhật Invoice status từ 'pending' sang 'paid'
    UPDATE Invoices 
    SET status = 'paid', issued_at = SWITCHOFFSET(GETDATE(), '+07:00') 
    WHERE appointment_id = @appointmentId AND status = 'pending';
    
    -- 3. Cập nhật Appointment status sang 'in_progress' 
    UPDATE Appointments 
    SET status = 'in_progress' 
    WHERE appointment_id = @appointmentId AND status = 'requested';
  `;
=======
const approveTestRequest = async (appointmentId, paymentMethod = "cash") => {
  const pool = await poolPromise;
  const transaction = pool.transaction();
>>>>>>> origin/feature/fullstack-multi-module-update

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
        message: `Không tìm thấy TestRequest nào cần duyệt cho appointment ${appointmentId}`,
      };
    }

    // 2. Update status của TestRequests
    const updateQuery = `
      UPDATE TestRequests 
      SET status = 'in_progress', approved_at = GETDATE() 
      WHERE appointment_id = @appointmentId AND status = 'requested'
    `;

    const updateResult = await transaction
      .request()
      .input("appointmentId", sql.Int, appointmentId)
      .query(updateQuery);

    // 3. Cập nhật Invoice status thành 'paid' cho appointment này
    const updateInvoiceQuery = `
      UPDATE Invoices 
      SET status = 'paid', issued_at = GETDATE()
      WHERE appointment_id = @appointmentId AND status = 'pending'
    `;

    const invoiceUpdateResult = await transaction
      .request()
      .input("appointmentId", sql.Int, appointmentId)
      .query(updateInvoiceQuery);

    console.log(
      `📄 Updated ${invoiceUpdateResult.rowsAffected[0]} invoices to 'paid' status for appointment ${appointmentId}`
    );

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
      affectedRows: updateResult.rowsAffected[0],
      message: `Đã duyệt ${updateResult.rowsAffected[0]} yêu cầu xét nghiệm cho appointment ${appointmentId}`,
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

    // Đếm số TestRequests theo trạng thái - chỉ ngày hiện tại
    const statusQuery = `
      SELECT tr.status, COUNT(*) as count
      FROM TestRequests tr
      JOIN Appointments a ON tr.appointment_id = a.appointment_id
      WHERE CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)
      GROUP BY tr.status
    `;
    const statusResult = await pool.request().query(statusQuery);
    const statusRows = statusResult.recordset;

    // Tổng doanh thu từ các TestRequests đã approved - chỉ ngày hiện tại
    const revenueQuery = `
      SELECT SUM(s.price) as total_revenue
      FROM TestRequests tr
      JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
      JOIN Services s ON trd.service_id = s.service_id
      JOIN Appointments a ON tr.appointment_id = a.appointment_id
      WHERE tr.status IN ('in_progress', 'completed')
        AND CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)
    `;
    const revenueResult = await pool.request().query(revenueQuery);
    const revenueRows = revenueResult.recordset;

    // Thống kê chi tiết ngày hiện tại
    const todayQuery = `
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN tr.status = 'requested' THEN 1 ELSE 0 END) as pending_requests,
        SUM(CASE WHEN tr.status IN ('in_progress', 'completed') THEN 1 ELSE 0 END) as processed_today
      FROM TestRequests tr
      JOIN Appointments a ON tr.appointment_id = a.appointment_id
      WHERE CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)
    `;
    const todayResult = await pool.request().query(todayQuery);
    const todayStats = todayResult.recordset[0];

    return {
      statusCounts: statusRows.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
      }, {}),
      totalRevenue: revenueRows[0]?.total_revenue || 0,
      pending_requests: todayStats?.pending_requests || 0,
      processed_today: todayStats?.processed_today || 0,
      today_revenue: revenueRows[0]?.total_revenue || 0,
    };
  } catch (error) {
    console.error("Error in getRegistrationStatistics:", error);
    throw error;
  }
};

/**
 * Lấy lịch sử thanh toán ngày hiện tại (các TestRequests đã approved)
 */
const getPaymentHistory = async (limit = 50) => {
  const query = `
    SELECT TOP (@limit)
      tr.request_id,
      tr.appointment_id,
      trd.service_id,
      tr.status,
      tr.approved_at as payment_date,
      trd.notes as service_notes,
      s.name as service_name,
      s.price as service_price,
      p.full_name as patient_name,
      p.phone as patient_phone,
      a.bookingDate as appointment_date,
      sl.start_time as appointment_time,
      d.full_name as doctor_name
    FROM TestRequests tr
    JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
    JOIN Services s ON trd.service_id = s.service_id
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Doctors d ON tr.doctor_id = d.doctor_id
    LEFT JOIN Slots sl ON a.slot_id = sl.slot_id
    WHERE tr.status IN ('in_progress', 'completed')
      AND CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)
    ORDER BY tr.approved_at DESC
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
