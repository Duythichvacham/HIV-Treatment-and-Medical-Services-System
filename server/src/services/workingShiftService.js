const { poolPromise } = require("../config/db");

//  Lấy tất cả ca làm việc
const getAllWorkingShiftDB = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT [shift_id]
          ,[account_id]
          ,[doctor_id]
          ,[lab_staff_id]
          ,[registration_staff_id]
          ,[shift_date]
          ,[room_id]
          ,[status]
          ,[created_at]
          ,[is_active]
    FROM [HIV_HEALTH_CARE].[dbo].[WorkingShifts]
  `);
  return result.recordset;
};

// Tạo ca làm việc
const createShift = async ({
  account_id,
  doctor_id,
  lab_staff_id,
  registration_staff_id,
  shift_date,
  room_id,
  is_active,
}) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("account_id", account_id ?? null)
    .input("doctor_id", doctor_id ?? null)
    .input("lab_staff_id", lab_staff_id ?? null)
    .input("registration_staff_id", registration_staff_id ?? null)
    .input("shift_date", shift_date)
    .input("room_id", room_id)
    .input("is_active", is_active)
    .query(`
      INSERT INTO WorkingShifts (
        account_id,
        doctor_id,
        lab_staff_id,
        registration_staff_id,
        shift_date,
        room_id,
        is_active
      )
      OUTPUT INSERTED.shift_id
      VALUES (
        @account_id,
        @doctor_id,
        @lab_staff_id,
        @registration_staff_id,
        @shift_date,
        @room_id,
        @is_active
      );
    `);

  return {
    shift_id: result.recordset[0].shift_id,
  };
};

// Cập nhật ca làm việc (không update is_active)
const updateShift = async (
  id,
  {
    
    doctor_id,
    lab_staff_id,
    registration_staff_id,
    shift_date,
    room_id,
    status,
  }
) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("id", id)
    .input("doctor_id", doctor_id ?? null)
    .input("lab_staff_id", lab_staff_id ?? null)
    .input("registration_staff_id", registration_staff_id ?? null)
    .input("shift_date", shift_date ?? null)
    .input("room_id", room_id ?? null)
    .input("status", status ?? null)
    .query(`
      UPDATE WorkingShifts
      SET 
        doctor_id = COALESCE(@doctor_id, doctor_id),
        lab_staff_id = COALESCE(@lab_staff_id, lab_staff_id),
        registration_staff_id = COALESCE(@registration_staff_id, registration_staff_id),
        shift_date = COALESCE(@shift_date, shift_date),
        room_id = COALESCE(@room_id, room_id),
        status = COALESCE(@status, status)
      WHERE shift_id = @id;

      SELECT * FROM WorkingShifts WHERE shift_id = @id;
    `);

  return result.recordset[0];
};

// Cập nhật trạng thái is_active
const setActiveShift = async (id, is_active) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("id", id)
    .input("is_active", is_active)
    .query(`
      UPDATE WorkingShifts
      SET is_active = @is_active
      WHERE shift_id = @id;

      SELECT * FROM WorkingShifts WHERE shift_id = @id;
    `);

  return result.recordset[0];
};

module.exports = {
  getAllWorkingShiftDB,
  createShift,
  updateShift,
  setActiveShift,
};
