const { poolPromise, sql } = require("../../config/db");

/**
 * Database operations cho queue management
 */

/**
 * Lấy thông tin appointment để xác định queue_type
 * @param {number} appointment_id - ID của appointment
 * @returns {Promise<Object>} Appointment info
 */
const getAppointmentInfo = async (appointment_id) => {
  const pool = await poolPromise;

  const result = await pool.request().input("appointment_id", appointment_id)
    .query(`
      SELECT a.bookingDate, s.service_type
      FROM Appointments a
      LEFT JOIN Services s ON a.service_id = s.service_id
      WHERE a.appointment_id = @appointment_id
    `);

  if (result.recordset.length === 0) {
    throw new Error(`Appointment với ID ${appointment_id} không tồn tại`);
  }

  return result.recordset[0];
};

/**
 * Lấy thông tin test request
 * @param {number} request_id - ID của test request
 * @returns {Promise<Object>} Test request info
 */
const getTestRequestInfo = async (request_id) => {
  const pool = await poolPromise;

  const result = await pool.request().input("request_id", request_id).query(`
      SELECT request_date
      FROM TestRequests
      WHERE request_id = @request_id
    `);

  if (result.recordset.length === 0) {
    throw new Error(`TestRequest với ID ${request_id} không tồn tại`);
  }

  return result.recordset[0];
};

/**
 * Lấy danh sách queue theo ngày và loại
 * @param {string} queue_type - Loại queue
 * @param {string} formattedDate - Ngày đã format
 * @param {number} doctor_id - ID bác sĩ (optional)
 * @param {number} slot_id - ID slot (optional)
 * @returns {Promise<Array>} Danh sách queue
 */
const getQueueListByDate = async (
  queue_type,
  formattedDate,
  doctor_id = null,
  slot_id = null
) => {
  const pool = await poolPromise;

  let query = `
    SELECT 
      qn.queue_id,
      qn.appointment_id,
      qn.request_id,
      qn.queue_type,
      qn.current_number,
      qn.queue_date,
      qn.doctor_id,
      qn.slot_id,
      qn.max_number,
      d.full_name as doctor_name,
      s.start_time,
      s.end_time,
      p.full_name as patient_name,
      CASE 
        WHEN qn.appointment_id IS NOT NULL THEN 'Appointment'
        WHEN qn.request_id IS NOT NULL THEN 'TestRequest'
        ELSE 'Unknown'
      END as source_type
    FROM QueueNumbers qn
    LEFT JOIN Doctors d ON qn.doctor_id = d.doctor_id
    LEFT JOIN Slots s ON qn.slot_id = s.slot_id
    LEFT JOIN Appointments a ON qn.appointment_id = a.appointment_id
    LEFT JOIN TestRequests tr ON qn.request_id = tr.request_id
    LEFT JOIN Patients p ON (a.patient_id = p.patient_id OR tr.appointment_id = a.appointment_id)
    WHERE qn.queue_type = @queue_type 
    AND qn.queue_date = @queue_date
  `;

  const request = pool
    .request()
    .input("queue_type", sql.VarChar(20), queue_type)
    .input("queue_date", sql.Date, formattedDate);

  // Thêm điều kiện cho examination
  if (queue_type === "examination" && doctor_id && slot_id) {
    query += ` AND qn.doctor_id = @doctor_id AND qn.slot_id = @slot_id`;
    request
      .input("doctor_id", sql.Int, doctor_id)
      .input("slot_id", sql.Int, slot_id);
  }

  query += ` ORDER BY qn.current_number ASC`;

  const result = await request.query(query);
  return result.recordset;
};

/**
 * Lấy thông tin queue theo ID
 * @param {number} queue_id - ID của queue
 * @returns {Promise<Object|null>} Queue info
 */
const getQueueById = async (queue_id) => {
  const pool = await poolPromise;

  const result = await pool.request().input("queue_id", sql.Int, queue_id)
    .query(`
      SELECT 
        qn.*,
        d.full_name as doctor_name,
        s.start_time,
        s.end_time
      FROM QueueNumbers qn
      LEFT JOIN Doctors d ON qn.doctor_id = d.doctor_id
      LEFT JOIN Slots s ON qn.slot_id = s.slot_id
      WHERE qn.queue_id = @queue_id
    `);

  return result.recordset[0] || null;
};

/**
 * Kiểm tra ownership của queue
 * @param {number} queue_id - ID của queue
 * @param {number} appointment_id - ID appointment (optional)
 * @param {number} request_id - ID request (optional)
 * @returns {Promise<boolean>} True nếu thuộc về
 */
const validateQueueOwnership = async (
  queue_id,
  appointment_id = null,
  request_id = null
) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("queue_id", sql.Int, queue_id)
    .input("appointment_id", sql.Int, appointment_id)
    .input("request_id", sql.Int, request_id).query(`
      SELECT COUNT(*) as count
      FROM QueueNumbers 
      WHERE queue_id = @queue_id
      AND (
        (@appointment_id IS NOT NULL AND appointment_id = @appointment_id) OR
        (@request_id IS NOT NULL AND request_id = @request_id)
      )
    `);

  return result.recordset[0].count > 0;
};

/**
 * Lấy thống kê queue theo ngày
 * @param {string} formattedDate - Ngày đã format
 * @returns {Promise<Array>} Thống kê
 */
const getQueueStatsByDate = async (formattedDate) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("queue_date", sql.Date, formattedDate).query(`
      SELECT 
        queue_type,
        COUNT(*) as total_issued,
        MAX(current_number) as highest_number,
        MAX(max_number) as max_allowed
      FROM QueueNumbers 
      WHERE queue_date = @queue_date
      GROUP BY queue_type
    `);

  return result.recordset;
};

/**
 * Lấy số thứ tự hiện tại cao nhất
 * @param {string} queue_type - Loại queue
 * @param {string} formattedDate - Ngày đã format
 * @param {number} doctor_id - ID bác sĩ (optional)
 * @param {number} slot_id - ID slot (optional)
 * @returns {Promise<number>} Số thứ tự hiện tại
 */
const getCurrentQueueNumber = async (
  queue_type,
  formattedDate,
  doctor_id = null,
  slot_id = null
) => {
  const pool = await poolPromise;

  let query;
  let request = pool
    .request()
    .input("queue_type", sql.VarChar(20), queue_type)
    .input("queue_date", sql.Date, formattedDate);

  if (queue_type === "examination" || queue_type === "consultation") {
    if (!doctor_id || !slot_id) {
      throw new Error(
        `doctor_id và slot_id là bắt buộc cho queue_type '${queue_type}'`
      );
    }

    request
      .input("doctor_id", sql.Int, doctor_id)
      .input("slot_id", sql.Int, slot_id);

    query = `
      SELECT ISNULL(MAX(current_number), 0) as current_number
      FROM QueueNumbers 
      WHERE queue_type = @queue_type 
      AND doctor_id = @doctor_id
      AND slot_id = @slot_id
      AND queue_date = @queue_date
    `;
  } else if (queue_type === "test") {
    query = `
      SELECT ISNULL(MAX(current_number), 0) as current_number
      FROM QueueNumbers 
      WHERE queue_type = @queue_type 
      AND doctor_id IS NULL
      AND slot_id IS NULL
      AND queue_date = @queue_date
    `;
  } else {
    throw new Error(`Unsupported queue_type: ${queue_type}`);
  }

  const result = await request.query(query);
  return result.recordset[0].current_number || 0;
};

module.exports = {
  getAppointmentInfo,
  getTestRequestInfo,
  getQueueListByDate,
  getQueueById,
  validateQueueOwnership,
  getQueueStatsByDate,
  getCurrentQueueNumber,
};
