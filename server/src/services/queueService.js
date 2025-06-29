const { poolPromise } = require("../config/db");
const sql = require("mssql");

/**
 * Helper function: Lấy số thứ tự tiếp theo và kiểm tra max limit
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
 * Helper function: Validate duplicate queue
 * @param {Object} transaction - Database transaction
 * @param {Object} params - Validation parameters
 */
const validateDuplicateQueue = async (
  transaction,
  { queue_type, doctor_id, slot_id, appointment_id, request_id, formattedDate }
) => {
  if (queue_type === "examination" || queue_type === "consultation") {
    // Cho examination/consultation: kiểm tra trùng lặp theo queue_type, doctor_id, slot_id, queue_date
    if (!doctor_id || !slot_id) {
      throw new Error(
        `doctor_id và slot_id là bắt buộc cho queue_type '${queue_type}'`
      );
    }

    const duplicateCheck = await transaction
      .request()
      .input("queue_type", sql.VarChar(20), queue_type)
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
        `Appointment ${appointment_id} đã được cấp số thứ tự cho ` +
          `doctor_id=${doctor_id}, slot_id=${slot_id}, date=${formattedDate}`
      );
    }
  } else if (queue_type === "test") {
    // Cho test: kiểm tra trùng lặp theo queue_type, queue_date, và appointment_id/request_id
    if (appointment_id && request_id) {
      throw new Error("Không thể có cả appointment_id và request_id cùng lúc");
    }

    // Chỉ kiểm tra duplicate nếu có appointment_id hoặc request_id
    if (appointment_id || request_id) {
      const checkRequest = transaction
        .request()
        .input("queue_type", sql.VarChar(20), queue_type)
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
          `${sourceType} ${sourceId} đã được cấp số thứ tự cho ` +
            `test vào ngày ${formattedDate}`
        );
      }
    }
  }
};

/**
 * Tạo bản ghi mới trong QueueNumbers và cấp số thứ tự
 * Logic mới: Mỗi lần cấp số sẽ tạo bản ghi mới thay vì update bản ghi cũ
 *
 * @param {string} queue_type - 'examination', 'test', 'consultation'
 * @param {number} appointment_id - ID của appointment (NULL nếu từ TestRequest)
 * @param {number} request_id - ID của test request (NULL nếu từ Appointment)
 * @param {number} doctor_id - ID bác sĩ (NULL cho xét nghiệm)
 * @param {number} slot_id - ID slot (NULL cho xét nghiệm)
 * @param {Date} queue_date - Ngày cấp số (mặc định là hôm nay)
 * @returns {Promise<Object>} Thông tin số thứ tự được cấp
 */
exports.createQueueNumber = async ({
  queue_type,
  appointment_id = null,
  request_id = null,
  doctor_id = null,
  slot_id = null,
  queue_date = new Date(),
}) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // Chuyển đổi queue_date thành format YYYY-MM-DD
    const formattedDate = queue_date.toISOString().split("T")[0];

    // ===== VALIDATION LOGIC (thay thế unique constraint) =====
    // Kiểm tra xem đã có bản ghi trùng lặp chưa
    await validateDuplicateQueue(transaction, {
      queue_type,
      doctor_id,
      slot_id,
      appointment_id,
      request_id,
      formattedDate,
    });
    // ===== KẾT THÚC VALIDATION LOGIC =====

    // Đảm bảo doctor_id và slot_id là NULL cho test
    if (queue_type === "test") {
      doctor_id = null;
      slot_id = null;
    }

    // Sử dụng helper function để lấy số thứ tự tiếp theo
    const nextNumber = await getNextQueueNumber(
      transaction,
      queue_type,
      doctor_id,
      slot_id,
      formattedDate
    );

    // Xác định max_number dựa trên queue_type
    const maxNumber = queue_type === "test" ? 1000 : 8;

    // Tạo bản ghi mới trong QueueNumbers
    const request = transaction.request();

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

    const newQueueId = insertResult.recordset[0].queue_id;

    await transaction.commit();

    // Trả về thông tin số thứ tự vừa tạo
    return {
      queue_id: newQueueId,
      queue_number: nextNumber,
      queue_type,
      queue_date: formattedDate,
      appointment_id,
      request_id,
      doctor_id,
      slot_id,
      max_number: maxNumber,
    };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("❌ Error rolling back transaction:", rollbackError);
    }
    console.error("❌ Error creating queue number:", error);
    throw error;
  }
};

/**
 * Cấp số thứ tự cho Appointment (khám bệnh)
 * @param {number} appointment_id - ID của appointment
 * @param {number} doctor_id - ID bác sĩ
 * @param {number} slot_id - ID slot
 * @param {Date} queue_date - Ngày khám (mặc định lấy từ appointment.bookingDate)
 * @returns {Promise<Object>} Thông tin số thứ tự được cấp
 */
exports.createQueueForAppointment = async (
  appointment_id,
  doctor_id,
  slot_id,
  queue_date = new Date()
) => {
  const pool = await poolPromise;

  try {
    // Lấy thông tin appointment để xác định queue_type
    const appointmentInfo = await pool
      .request()
      .input("appointment_id", appointment_id).query(`
        SELECT a.bookingDate, s.service_type
        FROM Appointments a
        LEFT JOIN Services s ON a.service_id = s.service_id
        WHERE a.appointment_id = @appointment_id
      `);

    if (appointmentInfo.recordset.length === 0) {
      throw new Error(`Appointment với ID ${appointment_id} không tồn tại`);
    }

    const { bookingDate, service_type } = appointmentInfo.recordset[0];

    // Sử dụng bookingDate làm queue_date nếu không truyền vào
    const finalQueueDate = queue_date || new Date(bookingDate);

    // Xác định queue_type dựa trên service_type
    let queue_type;
    if (service_type === "examination") {
      queue_type = "examination";
    } else if (service_type === "test") {
      queue_type = "test";
      // Với test từ appointment, doctor_id và slot_id = null
      doctor_id = null;
      slot_id = null;
    } else if (service_type === "consultation") {
      queue_type = "consultation";
    } else {
      // Mặc định là examination nếu không xác định được
      queue_type = "examination";
    }

    return await exports.createQueueNumber({
      queue_type,
      appointment_id,
      request_id: null,
      doctor_id,
      slot_id,
      queue_date: finalQueueDate,
    });
  } catch (error) {
    console.error("❌ Error creating queue for appointment:", error);
    throw error;
  }
};

/**
 * Cấp số thứ tự cho TestRequest (xét nghiệm)
 * @param {number} request_id - ID của test request
 * @param {Date} queue_date - Ngày xét nghiệm (mặc định lấy từ request.request_date)
 * @returns {Promise<Object>} Thông tin số thứ tự được cấp
 */
exports.createQueueForTestRequest = async (
  request_id,
  queue_date = new Date()
) => {
  const pool = await poolPromise;

  try {
    // Lấy thông tin test request
    const requestInfo = await pool.request().input("request_id", request_id)
      .query(`
        SELECT request_date
        FROM TestRequests
        WHERE request_id = @request_id
      `);

    if (requestInfo.recordset.length === 0) {
      throw new Error(`TestRequest với ID ${request_id} không tồn tại`);
    }

    const { request_date } = requestInfo.recordset[0];

    // Sử dụng request_date làm queue_date nếu không truyền vào
    const finalQueueDate = queue_date || new Date(request_date);

    // Test luôn có doctor_id và slot_id = null, queue_type = 'test'
    return await exports.createQueueNumber({
      queue_type: "test",
      appointment_id: null,
      request_id,
      doctor_id: null,
      slot_id: null,
      queue_date: finalQueueDate,
    });
  } catch (error) {
    console.error("❌ Error creating queue for test request:", error);
    throw error;
  }
};

/**
 * Lấy danh sách số thứ tự theo ngày và loại
 * @param {string} queue_type - 'examination', 'test', 'consultation'
 * @param {Date} queue_date - Ngày cần lấy danh sách
 * @param {number} doctor_id - ID bác sĩ (optional, chỉ cho examination)
 * @param {number} slot_id - ID slot (optional, chỉ cho examination)
 * @returns {Promise<Array>} Danh sách số thứ tự
 */
exports.getQueueListByDate = async (
  queue_type,
  queue_date = new Date(),
  doctor_id = null,
  slot_id = null
) => {
  const pool = await poolPromise;
  const formattedDate = queue_date.toISOString().split("T")[0];

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
 * Lấy thông tin số thứ tự theo queue_id
 * @param {number} queue_id - ID của queue number
 * @returns {Promise<Object|null>} Thông tin số thứ tự
 */
exports.getQueueById = async (queue_id) => {
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
 * Kiểm tra số thứ tự có thuộc về appointment/request không
 * @param {number} queue_id - ID của queue number
 * @param {number} appointment_id - ID của appointment (optional)
 * @param {number} request_id - ID của request (optional)
 * @returns {Promise<boolean>} True nếu thuộc về
 */
exports.validateQueueOwnership = async (
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
 * Lấy thống kê số thứ tự theo ngày
 * @param {Date} queue_date - Ngày cần thống kê
 * @returns {Promise<Object>} Thống kê số thứ tự
 */
exports.getQueueStatsByDate = async (queue_date = new Date()) => {
  const pool = await poolPromise;
  const formattedDate = queue_date.toISOString().split("T")[0];

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
 * Lấy số thứ tự hiện tại cho một loại queue
 * @param {string} queue_type - "examination", "consultation", hoặc "test"
 * @param {number} doctor_id - ID bác sĩ (chỉ cho examination/consultation)
 * @param {number} slot_id - ID slot (chỉ cho examination/consultation)
 * @param {Date} queue_date - Ngày queue (mặc định hôm nay)
 * @returns {Promise<number>} Số thứ tự hiện tại (cao nhất)
 */
exports.getCurrentQueueNumber = async (
  queue_type,
  doctor_id = null,
  slot_id = null,
  queue_date = new Date()
) => {
  const pool = await poolPromise;
  const formattedDate = queue_date.toISOString().split("T")[0];

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

/**
 * Lấy số thứ tự tiếp theo cho một loại queue
 * @param {string} queue_type - "examination", "consultation", hoặc "test"
 * @param {number} doctor_id - ID bác sĩ (chỉ cho examination/consultation)
 * @param {number} slot_id - ID slot (chỉ cho examination/consultation)
 * @param {Date} queue_date - Ngày queue (mặc định hôm nay)
 * @returns {Promise<number>} Số thứ tự tiếp theo
 */
exports.getNextQueueNumber = async (
  queue_type,
  doctor_id = null,
  slot_id = null,
  queue_date = new Date()
) => {
  const currentNumber = await exports.getCurrentQueueNumber(
    queue_type,
    doctor_id,
    slot_id,
    queue_date
  );
  return currentNumber + 1;
};
