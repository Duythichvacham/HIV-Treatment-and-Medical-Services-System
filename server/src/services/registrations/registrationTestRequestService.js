const { sql } = require("../../config/db");

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

/**
 * Lấy thông tin chi tiết TestRequest
 * @param {Object} transaction - Database transaction
 * @param {number} requestId - ID của test request
 * @returns {Promise<Object|null>} Thông tin test request hoặc null
 */
const getTestRequestDetails = async (transaction, requestId) => {
  const query = `
    SELECT 
      tr.request_id,
      tr.appointment_id,
      tr.doctor_id,
      tr.status,
      tr.approved_by_id,
      tr.approved_at,
      tr.room_id,
      a.patient_id,
      a.bookingDate
    FROM TestRequests tr
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    WHERE tr.request_id = @requestId
  `;

  const request = transaction.request();
  request.input("requestId", sql.Int, requestId);
  const result = await request.query(query);

  return result.recordset[0] || null;
};

/**
 * Cập nhật status của TestRequest
 * @param {Object} transaction - Database transaction
 * @param {number} requestId - ID của test request
 * @param {string} status - Trạng thái mới
 * @returns {Promise<boolean>} Kết quả cập nhật
 */
const updateTestRequestStatus = async (transaction, requestId, status) => {
  const query = `
    UPDATE TestRequests 
    SET status = @status
    WHERE request_id = @requestId
  `;

  const request = transaction.request();
  request.input("requestId", sql.Int, requestId);
  request.input("status", sql.VarChar(20), status);

  const result = await request.query(query);
  return result.rowsAffected[0] > 0;
};

/**
 * Lấy danh sách TestRequest theo appointment_id
 * @param {Object} transaction - Database transaction
 * @param {number} appointmentId - ID của appointment
 * @param {string} status - Trạng thái cần lọc (optional)
 * @returns {Promise<Array>} Danh sách test requests
 */
const getTestRequestsByAppointment = async (
  transaction,
  appointmentId,
  status = null
) => {
  let query = `
    SELECT 
      tr.request_id,
      tr.appointment_id,
      tr.doctor_id,
      tr.status,
      tr.approved_by_id,
      tr.approved_at,
      tr.room_id
    FROM TestRequests tr
    WHERE tr.appointment_id = @appointmentId
  `;

  const request = transaction.request();
  request.input("appointmentId", sql.Int, appointmentId);

  if (status) {
    query += ` AND tr.status = @status`;
    request.input("status", sql.VarChar(20), status);
  }

  query += ` ORDER BY tr.request_date`;

  const result = await request.query(query);
  return result.recordset;
};

module.exports = {
  updateTestRequestApproval,
  getTestRequestDetails,
  updateTestRequestStatus,
  getTestRequestsByAppointment,
};
