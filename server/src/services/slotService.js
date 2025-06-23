const { poolPromise } = require("../config/db");

const getAllSlots = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`SELECT * FROM Slots ORDER BY start_time`);

    return result.recordset;
  } catch (err) {
    console.error("Error fetching slots:", err);
    throw err;
  }
};

// Lấy slots có sẵn cho doctor trong ngày cụ thể
const getAvailableSlots = async (doctorId, date) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("doctorId", doctorId)
      .input("date", date).query(`
        SELECT 
          s.slot_id,
          s.start_time,
          s.end_time,
          ws.max_patients_per_slot,
          COUNT(a.appointment_id) as current_bookings,
          (ws.max_patients_per_slot - COUNT(a.appointment_id)) as available_spots
        FROM Slots s
        CROSS JOIN WorkingShifts ws
        LEFT JOIN Appointments a
          ON a.doctor_id = ws.doctor_id
          AND a.bookingDate = ws.shift_date
          AND a.slot_id = s.slot_id
          AND a.status != 'cancelled'
        WHERE ws.doctor_id = @doctorId 
          AND ws.shift_date = @date
          AND ws.status = 'approved'
        GROUP BY s.slot_id, s.start_time, s.end_time, ws.max_patients_per_slot
        HAVING COUNT(a.appointment_id) < ws.max_patients_per_slot
        ORDER BY s.start_time
      `);

    return result.recordset;
  } catch (err) {
    console.error("Error fetching available slots:", err);
    throw err;
  }
};

module.exports = {
  getAllSlots,
  getAvailableSlots,
};
