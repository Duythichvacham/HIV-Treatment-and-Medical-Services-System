const { sql } = require("../../config/db");

/**
 * Helper functions cho queue number generation
 */

/**
 * Lấy số thứ tự tiếp theo và kiểm tra max limit
 * @param {Object} transaction - Database transaction
 * @param {string} queue_type - Loại queue
 * @param {number} doctor_id - ID bác sĩ (null cho test)
 * @param {number} slot_id - ID slot (null cho test)
 * @param {string} formattedDate - Ngày đã format
 * @returns {Promise<number>} Số thứ tự tiếp theo
 */
const getNextQueueNumber = async (
  transaction,
  queue_type,
  doctor_id,
  slot_id,
  formattedDate
) => {
  let query;
  let request = transaction
    .request()
    .input("queue_type", sql.VarChar(20), queue_type)
    .input("queue_date", sql.Date, formattedDate);

  if (queue_type === "examination" || queue_type === "consultation") {
    request
      .input("doctor_id", sql.Int, doctor_id)
      .input("slot_id", sql.Int, slot_id);

    query = `
      SELECT TOP 1 current_number, max_number
      FROM QueueNumbers 
      WHERE queue_type = @queue_type 
      AND doctor_id = @doctor_id
      AND slot_id = @slot_id
      AND queue_date = @queue_date
      ORDER BY queue_id DESC
    `;
  } else if (queue_type === "test") {
    query = `
      SELECT TOP 1 current_number, max_number
      FROM QueueNumbers 
      WHERE queue_type = @queue_type 
      AND doctor_id IS NULL
      AND slot_id IS NULL
      AND queue_date = @queue_date
      ORDER BY queue_id DESC
    `;
  }

  const lastRecord = await request.query(query);

  if (lastRecord.recordset.length > 0) {
    const { current_number, max_number } = lastRecord.recordset[0];

    // Kiểm tra đã đạt max chưa
    if (current_number >= max_number) {
      const errorMsg =
        queue_type === "test"
          ? `Đã đạt số thứ tự tối đa cho xét nghiệm (${queue_type}) Date: ${formattedDate}. Max: ${max_number}`
          : `Đã đạt số thứ tự tối đa cho khám bệnh (${queue_type}) Doctor ID: ${doctor_id}, Slot ID: ${slot_id}, Date: ${formattedDate}. Max: ${max_number}`;
      throw new Error(errorMsg);
    }

    return current_number + 1;
  }

  return 1; // Số đầu tiên
};

/**
 * Xác định max_number dựa trên queue_type
 * @param {string} queue_type - Loại queue
 * @returns {number} Max number
 */
const getMaxNumber = (queue_type) => {
  return queue_type === "test" ? 1000 : 8;
};

/**
 * Format date thành string YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
const formatQueueDate = (date) => {
  return date.toISOString().split("T")[0];
};

/**
 * Chuẩn bị input parameters cho SQL query
 * @param {Object} request - SQL request object
 * @param {Object} params - Parameters object
 */
const prepareInputParameters = (request, params) => {
  const {
    appointment_id,
    request_id,
    slot_id,
    doctor_id,
    queue_type,
    nextNumber,
    formattedDate,
    maxNumber,
  } = params;

  // Xử lý NULL values đúng cách cho SQL Server
  if (appointment_id !== null) {
    request.input("appointment_id", sql.Int, appointment_id);
  } else {
    request.input("appointment_id", sql.Int, null);
  }

  if (request_id !== null) {
    request.input("request_id", sql.Int, request_id);
  } else {
    request.input("request_id", sql.Int, null);
  }

  if (slot_id !== null) {
    request.input("slot_id", sql.Int, slot_id);
  } else {
    request.input("slot_id", sql.Int, null);
  }

  if (doctor_id !== null) {
    request.input("doctor_id", sql.Int, doctor_id);
  } else {
    request.input("doctor_id", sql.Int, null);
  }

  request
    .input("queue_type", sql.VarChar(20), queue_type)
    .input("current_number", sql.Int, nextNumber)
    .input("queue_date", sql.Date, formattedDate)
    .input("max_number", sql.Int, maxNumber);
};

/**
 * Execute insert query để tạo queue number mới
 * @param {Object} request - SQL request object
 * @returns {Promise<number>} New queue ID
 */
const executeInsertQueue = async (request) => {
  const insertResult = await request.query(`
    INSERT INTO QueueNumbers (
      appointment_id, 
      request_id, 
      queue_type, 
      slot_id, 
      doctor_id, 
      current_number, 
      queue_date, 
      max_number
    )
    VALUES (
      @appointment_id, 
      @request_id, 
      @queue_type, 
      @slot_id, 
      @doctor_id, 
      @current_number, 
      @queue_date, 
      @max_number
    );
    SELECT SCOPE_IDENTITY() as queue_id;
  `);

  return insertResult.recordset[0].queue_id;
};

module.exports = {
  getNextQueueNumber,
  getMaxNumber,
  formatQueueDate,
  prepareInputParameters,
  executeInsertQueue,
};
