const { sql } = require("../../config/db");

/**
 * Validation logic cho queue operations
 */

/**
 * Validate tham số cơ bản cho queue
 * @param {string} queue_type - Loại queue
 * @param {number} appointment_id - ID appointment
 * @param {number} request_id - ID request
 */
const validateQueueParams = (queue_type, appointment_id, request_id) => {
  const validTypes = ["examination", "consultation", "test"];
  if (!validTypes.includes(queue_type)) {
    throw new Error(`queue_type không hợp lệ: ${queue_type}`);
  }

  if (appointment_id && request_id) {
    throw new Error("Không thể có cả appointment_id và request_id cùng lúc");
  }

  if (!appointment_id && !request_id) {
    throw new Error("Phải có ít nhất appointment_id hoặc request_id");
  }
};

/**
 * Validate doctor_id và slot_id cho examination/consultation
 * @param {string} queue_type - Loại queue
 * @param {number} doctor_id - ID bác sĩ
 * @param {number} slot_id - ID slot
 */
const validateDoctorSlotParams = (queue_type, doctor_id, slot_id) => {
  if (queue_type === "examination" || queue_type === "consultation") {
    if (!doctor_id || !slot_id) {
      throw new Error(
        `doctor_id và slot_id là bắt buộc cho queue_type '${queue_type}'`
      );
    }
  }
};

/**
 * Kiểm tra duplicate queue cho examination/consultation
 * @param {Object} transaction - Database transaction
 * @param {Object} params - Parameters
 */
const validateExaminationDuplicate = async (
  transaction,
  { doctor_id, slot_id, appointment_id, formattedDate }
) => {
  const duplicateCheck = await transaction
    .request()
    .input("queue_type", sql.VarChar(20), "examination")
    .input("doctor_id", sql.Int, doctor_id)
    .input("slot_id", sql.Int, slot_id)
    .input("queue_date", sql.Date, formattedDate)
    .input("appointment_id", sql.Int, appointment_id).query(`
      SELECT COUNT(*) as count
      FROM QueueNumbers 
      WHERE queue_type = @queue_type 
      AND doctor_id = @doctor_id
      AND slot_id = @slot_id
      AND queue_date = @queue_date
      AND appointment_id = @appointment_id
    `);

  if (duplicateCheck.recordset[0].count > 0) {
    throw new Error(
      `Appointment ${appointment_id} đã được cấp số thứ tự cho doctor_id=${doctor_id}, slot_id=${slot_id}, date=${formattedDate}`
    );
  }
};

/**
 * Kiểm tra duplicate queue cho test
 * @param {Object} transaction - Database transaction
 * @param {Object} params - Parameters
 */
const validateTestDuplicate = async (
  transaction,
  { appointment_id, request_id, formattedDate }
) => {
  if (!appointment_id && !request_id) return;

  const checkRequest = transaction
    .request()
    .input("queue_type", sql.VarChar(20), "test")
    .input("queue_date", sql.Date, formattedDate);

  let checkQuery = `
    SELECT COUNT(*) as count
    FROM QueueNumbers 
    WHERE queue_type = @queue_type 
    AND doctor_id IS NULL
    AND slot_id IS NULL
    AND queue_date = @queue_date
  `;

  if (appointment_id) {
    checkRequest.input("appointment_id", sql.Int, appointment_id);
    checkQuery += ` AND appointment_id = @appointment_id`;
  } else {
    checkRequest.input("request_id", sql.Int, request_id);
    checkQuery += ` AND request_id = @request_id`;
  }

  const duplicateCheck = await checkRequest.query(checkQuery);

  if (duplicateCheck.recordset[0].count > 0) {
    const sourceType = appointment_id ? "Appointment" : "TestRequest";
    const sourceId = appointment_id || request_id;
    throw new Error(
      `${sourceType} ${sourceId} đã được cấp số thứ tự cho test vào ngày ${formattedDate}`
    );
  }
};

/**
 * Main duplicate validation function
 * @param {Object} transaction - Database transaction
 * @param {Object} params - All validation parameters
 */
const validateDuplicateQueue = async (transaction, params) => {
  const {
    queue_type,
    doctor_id,
    slot_id,
    appointment_id,
    request_id,
    formattedDate,
  } = params;

  if (queue_type === "examination" || queue_type === "consultation") {
    await validateExaminationDuplicate(transaction, {
      doctor_id,
      slot_id,
      appointment_id,
      formattedDate,
    });
  } else if (queue_type === "test") {
    await validateTestDuplicate(transaction, {
      appointment_id,
      request_id,
      formattedDate,
    });
  }
};

module.exports = {
  validateQueueParams,
  validateDoctorSlotParams,
  validateDuplicateQueue,
  validateExaminationDuplicate,
  validateTestDuplicate,
};
