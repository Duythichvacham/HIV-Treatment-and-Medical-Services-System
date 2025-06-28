const { poolPromise } = require("../config/db");

/**
 * Lấy số thứ tự tiếp theo và cập nhật QueueNumbers
 * @param {string} queue_type - 'examination', 'test', 'consultation'
 * @param {number} doctor_id - ID bác sĩ (NULL cho xét nghiệm)
 * @param {number} slot_id - ID slot (NULL cho xét nghiệm)
 * @returns {Promise<number>} Số thứ tự được cấp
 */
exports.getNextQueueNumber = async (
  queue_type,
  doctor_id = null,
  slot_id = null
) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // 1. Tìm hoặc tạo record trong QueueNumbers
    let queueRecord = await transaction
      .request()
      .input("queue_type", queue_type)
      .input("doctor_id", doctor_id)
      .input("slot_id", slot_id).query(`
        SELECT queue_id, current_number, max_number 
        FROM QueueNumbers 
        WHERE queue_type = @queue_type 
        AND ((@doctor_id IS NULL AND doctor_id IS NULL) OR doctor_id = @doctor_id)
        AND ((@slot_id IS NULL AND slot_id IS NULL) OR slot_id = @slot_id)
      `);

    if (queueRecord.recordset.length === 0) {
      // Tạo mới nếu chưa có - bắt đầu từ 0 để queue number đầu tiên là 1
      const maxNumber = queue_type === "test" ? 1000 : 8;
      const insertResult = await transaction
        .request()
        .input("queue_type", queue_type)
        .input("doctor_id", doctor_id)
        .input("slot_id", slot_id)
        .input("max_number", maxNumber).query(`
          INSERT INTO QueueNumbers (queue_type, doctor_id, slot_id, current_number, max_number)
          VALUES (@queue_type, @doctor_id, @slot_id, 0, @max_number);
          SELECT SCOPE_IDENTITY() as queue_id;
        `);

      // Lấy queue number đầu tiên là 1
      await transaction
        .request()
        .input("queue_id", insertResult.recordset[0].queue_id)
        .query(`
          UPDATE QueueNumbers 
          SET current_number = 1 
          WHERE queue_id = @queue_id
        `);

      await transaction.commit();
      return 1;
    }

    // 2. Kiểm tra đã đạt max chưa
    const { queue_id, current_number, max_number } = queueRecord.recordset[0];

    if (current_number >= max_number) {
      await transaction.rollback();
      throw new Error(
        `Đã đạt số thứ tự tối đa cho ${queue_type}: ${max_number}`
      );
    }

    // 3. Cập nhật current_number
    const nextNumber = current_number + 1;
    await transaction
      .request()
      .input("queue_id", queue_id)
      .input("next_number", nextNumber).query(`
        UPDATE QueueNumbers 
        SET current_number = @next_number 
        WHERE queue_id = @queue_id
      `);

    await transaction.commit();
    return nextNumber;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Lấy số thứ tự hiện tại (không cập nhật)
 * @param {string} queue_type - 'examination', 'test', 'consultation'
 * @param {number} doctor_id - ID bác sĩ (NULL cho xét nghiệm)
 * @param {number} slot_id - ID slot (NULL cho xét nghiệm)
 * @returns {Promise<number>} Số thứ tự hiện tại
 */
exports.getCurrentQueueNumber = async (
  queue_type,
  doctor_id = null,
  slot_id = null
) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("queue_type", queue_type)
    .input("doctor_id", doctor_id)
    .input("slot_id", slot_id).query(`
      SELECT current_number 
      FROM QueueNumbers 
      WHERE queue_type = @queue_type 
      AND ((@doctor_id IS NULL AND doctor_id IS NULL) OR doctor_id = @doctor_id)
      AND ((@slot_id IS NULL AND slot_id IS NULL) OR slot_id = @slot_id)
    `);

  return result.recordset[0]?.current_number || 0;
};

/**
 * Lấy tất cả thông tin queue theo type
 * @param {string} queue_type - 'examination', 'test', 'consultation'
 * @returns {Promise<Array>} Danh sách queue info
 */
exports.getQueueInfo = async (queue_type) => {
  const pool = await poolPromise;

  const result = await pool.request().input("queue_type", queue_type).query(`
      SELECT 
        qn.queue_id,
        qn.queue_type,
        qn.current_number,
        qn.max_number,
        qn.doctor_id,
        qn.slot_id,
        d.full_name as doctor_name,
        s.start_time,
        s.end_time
      FROM QueueNumbers qn
      LEFT JOIN Doctors d ON qn.doctor_id = d.doctor_id
      LEFT JOIN Slots s ON qn.slot_id = s.slot_id
      WHERE qn.queue_type = @queue_type
      ORDER BY qn.doctor_id, qn.slot_id
    `);

  return result.recordset;
};

/**
 * Reset tất cả queue numbers về 0 (chạy vào đầu ngày mới)
 */
exports.resetAllQueues = async () => {
  const pool = await poolPromise;

  await pool.request().query(`
    UPDATE QueueNumbers 
    SET current_number = 0
  `);

  console.log("✅ All queue numbers reset to 0");
};

/**
 * Reset queue numbers theo type
 * @param {string} queue_type - 'examination', 'test', 'consultation'
 */
exports.resetQueueByType = async (queue_type) => {
  const pool = await poolPromise;

  await pool.request().input("queue_type", queue_type).query(`
      UPDATE QueueNumbers 
      SET current_number = 0
      WHERE queue_type = @queue_type
    `);

  console.log(`✅ Queue numbers reset for type: ${queue_type}`);
};

/**
 * Khởi tạo queue numbers cho một ngày mới
 * @param {Date} date - Ngày cần khởi tạo (mặc định là hôm nay)
 */
exports.initializeDailyQueues = async (date = new Date()) => {
  const pool = await poolPromise;

  try {
    // Reset tất cả về 0
    await exports.resetAllQueues();

    // Khởi tạo queue cho test (global - không phụ thuộc doctor/slot)
    const testQueueExists = await pool.request().query(`
      SELECT COUNT(*) as count FROM QueueNumbers WHERE queue_type = 'test'
    `);

    if (testQueueExists.recordset[0].count === 0) {
      await pool.request().query(`
        INSERT INTO QueueNumbers (queue_type, doctor_id, slot_id, current_number, max_number)
        VALUES ('test', NULL, NULL, 0, 1000)
      `);
    }

    console.log(
      `✅ Daily queues initialized for ${date.toISOString().split("T")[0]}`
    );
  } catch (error) {
    console.error("❌ Error initializing daily queues:", error);
    throw error;
  }
};
