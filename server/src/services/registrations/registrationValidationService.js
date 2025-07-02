const { poolPromise, sql } = require("../../config/db");

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

module.exports = {
  validateTestRequest,
  validateTestRoom,
  validateApprovalParams,
};
