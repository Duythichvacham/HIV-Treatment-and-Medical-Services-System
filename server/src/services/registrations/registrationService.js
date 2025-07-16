const { poolPromise, sql } = require("../../config/db");
const queueService = require("../queues/queueService");
// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate và lấy danh sách TestRequests cần approve
 * @param {Object} transaction - Database transaction
 * @param {number} appointmentId - ID của appointment
 * @returns {Promise<Array>} Danh sách TestRequests hợp lệ
 */
const validateTestRequest = async (transaction, appointmentId) => {
  const testRequestsQuery = `
    SELECT 
      tr.request_id, 
      tr.appointment_id,
      a.patient_id,
      SUM(s.price) as total_amount
    FROM TestRequests tr
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
    JOIN Services s ON trd.service_id = s.service_id
    WHERE tr.appointment_id = @appointmentId AND tr.status = 'requested'
    GROUP BY tr.request_id, tr.appointment_id, a.patient_id
  `;

  const testRequestsResult = await transaction
    .request()
    .input("appointmentId", sql.Int, appointmentId)
    .query(testRequestsQuery);

  const testRequests = testRequestsResult.recordset;

  if (testRequests.length === 0) {
    throw new Error(
      `Không tìm thấy TestRequest nào cần thu tiền cho appointment ${appointmentId}`
    );
  }

  return testRequests;
};

/**
 * Validate và lấy phòng xét nghiệm khả dụng
 * @param {Object} transaction - Database transaction
 * @returns {Promise<Object>} Thông tin phòng xét nghiệm
 */
const validateTestRoom = async (transaction) => {
  const roomQuery = `
    SELECT TOP 1 room_id 
    FROM Rooms 
    WHERE room_type = N'Xét nghiệm'
    ORDER BY room_id
  `;

  const roomResult = await transaction.request().query(roomQuery);
  const testRoom = roomResult.recordset[0];

  if (!testRoom) {
    throw new Error("Không tìm thấy phòng xét nghiệm khả dụng");
  }

  return testRoom;
};

/**
 * Validate tham số đầu vào cho approveTestRequest
 * @param {number} appointmentId - ID appointment
 * @param {string} paymentMethod - Phương thức thanh toán
 * @param {number} registrationStaffId - ID nhân viên
 */
const validateApprovalParams = (
  appointmentId,
  paymentMethod,
  registrationStaffId
) => {
  if (!appointmentId || appointmentId <= 0) {
    throw new Error("appointmentId không hợp lệ");
  }

  if (!paymentMethod || !["cash", "qr_code", "card"].includes(paymentMethod)) {
    throw new Error("paymentMethod không hợp lệ");
  }

  if (!registrationStaffId || registrationStaffId <= 0) {
    throw new Error("registrationStaffId không hợp lệ");
  }
};
// ==================== INVOICE FUNCTIONS ====================
/**
 * Xử lý invoice cho TestRequest: cập nhật existing hoặc tạo mới
 * @param {Object} transaction - Database transaction
 * @param {Array} testRequests - Danh sách test requests
 * @returns {Promise<Object>} Kết quả xử lý invoice
 */
const processInvoices = async (transaction, testRequests) => {
  let updatedCount = 0;
  let createdCount = 0;

  for (const testRequest of testRequests) {
    // Kiểm tra xem đã có Invoice chưa
    const checkInvoiceQuery = `
      SELECT invoice_id, status 
      FROM Invoices 
      WHERE request_id = @requestId
    `;

    const checkInvoice = transaction.request();
    checkInvoice.input("requestId", sql.Int, testRequest.request_id);
    const invoiceResult = await checkInvoice.query(checkInvoiceQuery);

    if (invoiceResult.recordset.length > 0) {
      // Cập nhật Invoice existing thành 'paid'
      await updateExistingInvoice(transaction, testRequest.request_id);
      updatedCount++;
    } else {
      // Tạo Invoice mới với status 'paid'
      await createNewInvoice(transaction, testRequest);
      createdCount++;
    }
  }

  return {
    updated: updatedCount,
    created: createdCount,
    total: testRequests.length,
  };
};

/**
 * Cập nhật Invoice existing thành 'paid'
 * @param {Object} transaction - Database transaction
 * @param {number} requestId - ID của test request
 */
const updateExistingInvoice = async (transaction, requestId) => {
  const updateInvoiceQuery = `
    UPDATE Invoices 
    SET status = 'paid', issued_at = GETDATE()
    WHERE request_id = @requestId AND status = 'pending'
  `;

  const updateInvoice = transaction.request();
  updateInvoice.input("requestId", sql.Int, requestId);
  await updateInvoice.query(updateInvoiceQuery);
};

/**
 * Tạo Invoice mới với status 'paid'
 * @param {Object} transaction - Database transaction
 * @param {Object} testRequest - Thông tin test request
 */
const createNewInvoice = async (transaction, testRequest) => {
  const createInvoiceQuery = `
    INSERT INTO Invoices (patient_id, request_id, amount, service_type, status, issued_at)
    VALUES (@patientId, @requestId, @amount, N'test', 'paid', GETDATE())
  `;

  const createInvoice = transaction.request();
  createInvoice.input("patientId", sql.Int, testRequest.patient_id);
  createInvoice.input("requestId", sql.Int, testRequest.request_id);
  createInvoice.input("amount", sql.Decimal(10, 2), testRequest.total_amount);
  await createInvoice.query(createInvoiceQuery);
};

//==================== MAIN FUNCTION ====================
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
    LEFT JOIN Doctors d ON tr.doctor_id = d.doctor_id
    LEFT JOIN Slots sl ON a.slot_id = sl.slot_id
    LEFT JOIN Invoices i ON tr.request_id = i.request_id
    WHERE tr.status = 'requested' 
      AND CAST(tr.request_date AS DATE) = CAST(GETDATE() AS DATE)
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
 * Thu tiền cho TestRequest - Orchestrator function
 * @param {number} appointmentId - ID của appointment
 * @param {string} paymentMethod - Phương thức thanh toán (cash, qr_code)
 * @param {number} registrationStaffId - ID của registration staff thực hiện
 */
const approveTestRequest = async (
  appointmentId,
  paymentMethod = "cash",
  registrationStaffId = 7
) => {
  // Validate tham số đầu vào
  validateApprovalParams(appointmentId, paymentMethod, registrationStaffId);

  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // 1. Validate và lấy danh sách TestRequests cần approve
    const testRequests = await validateTestRequest(transaction, appointmentId);

    // 2. Validate và lấy phòng xét nghiệm khả dụng
    const testRoom = await validateTestRoom(transaction);

    // 3. Cập nhật TestRequest: approve và gán room
    const updatedCount = await updateTestRequestApproval(
      transaction,
      testRequests,
      registrationStaffId,
      testRoom.room_id
    );

    // 4. Xử lý Invoice: cập nhật existing hoặc tạo mới
    const invoiceResult = await processInvoices(transaction, testRequests);

    // 5. Commit transaction trước khi cấp queue
    await transaction.commit();

    // 6. Cấp số thứ tự cho từng TestRequest được approve (outside transaction)
    const queueResult = await createQueueForRequests(
      testRequests,
      testRoom.room_id
    );
    const room_name = testRoom.room_name || "Phòng xét nghiệm A ";

    return {
      success: true,
      affectedRows: updatedCount,
      message: `Đã thu tiền, approve và cấp phòng cho ${testRequests.length} yêu cầu xét nghiệm (appointment ${appointmentId})`,
      room_assigned: testRoom.room_id,
      room_name: room_name, // Thêm room_name để frontend hiển thị
      invoice_result: invoiceResult,
      queue_result: queueResult,
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
      LEFT JOIN Invoices i ON tr.request_id = i.request_id
      WHERE tr.status = 'requested' 
        AND CAST(tr.request_date AS DATE) = CAST(GETDATE() AS DATE)
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

//==================== QUEUE FUNCTIONS ====================
/**
 * Cấp số thứ tự cho danh sách TestRequests
 * @param {Array} testRequests - Danh sách test requests
 * @param {number} roomId - ID phòng được gán
 * @returns {Promise<Object>} Kết quả cấp số thứ tự
 */
const createQueueForRequests = async (testRequests, roomId) => {
  const queueResults = [];
  const queueErrors = [];

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
    } catch (queueError) {
      // Log lỗi nhưng không fail toàn bộ process
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

  return {
    success: queueResults.length > 0,
    results: queueResults,
    errors: queueErrors.length > 0 ? queueErrors : null,
    summary: {
      total: testRequests.length,
      successful: queueResults.length,
      failed: queueErrors.length,
    },
  };
};
/**
 * Cập nhật TestRequest: approve và gán room
 * @param {Object} transaction - Database transaction
 * @param {Array} testRequests - Danh sách test requests
 * @param {number} registrationStaffId - ID nhân viên registration
 * @param {number} roomId - ID phòng xét nghiệm
 * @returns {Promise<number>} Số lượng test requests đã cập nhật
 */
const updateTestRequestApproval = async (
  transaction,
  testRequests,
  registrationStaffId,
  roomId
) => {
  const requestIds = testRequests.map((tr) => tr.request_id);

  const updateTestRequestQuery = `
    UPDATE TestRequests 
    SET approved_by_id = @registrationStaffId, 
        approved_at = GETDATE(),
        room_id = @roomId
    WHERE request_id IN (${requestIds
      .map((_, index) => `@requestId${index}`)
      .join(",")})
  `;

  const updateTestRequest = transaction.request();
  updateTestRequest.input("registrationStaffId", sql.Int, registrationStaffId);
  updateTestRequest.input("roomId", sql.Int, roomId);

  requestIds.forEach((id, index) => {
    updateTestRequest.input(`requestId${index}`, sql.Int, id);
  });

  const result = await updateTestRequest.query(updateTestRequestQuery);
  return result.rowsAffected[0] || 0;
};
module.exports = {
  getPendingTestRequests,
  approveTestRequest,
  getRegistrationStatistics,
  getPaymentHistory,
  // Export các service modules cho testing hoặc sử dụng riêng lẻ
  testRequestService: registrationTestRequestService,
  queueService: registrationQueueService,
};
