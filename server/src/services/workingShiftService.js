const { poolPromise } = require("../config/db");

//  Lấy tất cả ca làm việc
const getAllWorkingShiftDB = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT ws.shift_id
          ,ws.account_id
          ,ws.doctor_id
          ,ws.shift_date
          ,ws.room_id
          ,ws.status
          ,ws.created_at
          ,r.room_name,
          d.full_name as doctor_name
    FROM WorkingShifts as ws 
    LEFT JOIN Rooms as r ON ws.room_id = r.room_id
    RIGHT JOIN Doctors as d ON ws.doctor_id = d.doctor_id
    WHERE CAST(shift_date AS DATE) >= CAST(GETDATE() AS DATE)
    ORDER BY ws.shift_date DESC, ws.created_at DESC;
  `);
  return result.recordset;
};

// Tạo ca làm việc
const createShift = async ({
  account_id,
  doctor_id,
  shift_date,
  room_id,
  status = "approved", // Default status instead of is_active
}) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("account_id", account_id ?? null)
    .input("doctor_id", doctor_id ?? null)
    .input("shift_date", shift_date)
    .input("room_id", room_id)
    .input("status", status).query(`
      INSERT INTO WorkingShifts (
        account_id,
        doctor_id,
        shift_date,
        room_id,
        status
      )
      OUTPUT INSERTED.shift_id
      VALUES (
        @account_id,
        @doctor_id,
        @shift_date,
        @room_id,
        @status
      );
    `);

  return {
    shift_id: result.recordset[0].shift_id,
  };
};

// Cập nhật ca làm việc (không update is_active)
const updateShift = async (id, { doctor_id, shift_date, room_id, status }) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("id", id)
    .input("doctor_id", doctor_id ?? null)
    .input("shift_date", shift_date ?? null)
    .input("room_id", room_id ?? null)
    .input("status", status ?? null).query(`
      UPDATE WorkingShifts
      SET 
        doctor_id = COALESCE(@doctor_id, doctor_id),
        shift_date = COALESCE(@shift_date, shift_date),
        room_id = COALESCE(@room_id, room_id),
        status = COALESCE(@status, status)
      WHERE shift_id = @id;

      SELECT * FROM WorkingShifts WHERE shift_id = @id;
    `);

  return result.recordset[0];
};

// Cập nhật trạng thái is_active
// const setActiveShift = async (id, is_active) => {
//   const pool = await poolPromise;

//   const result = await pool
//     .request()
//     .input("id", id)
//     .input("is_active", is_active).query(`
//       UPDATE WorkingShifts
//       SET is_active = @is_active
//       WHERE shift_id = @id;

//       SELECT * FROM WorkingShifts WHERE shift_id = @id;
//     `);

//   return result.recordset[0];
// };

module.exports = {
  getAllWorkingShiftDB,
  createShift,
  updateShift,
};
