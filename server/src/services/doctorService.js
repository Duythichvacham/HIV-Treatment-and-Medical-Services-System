const { poolPromise } = require("../config/db");

exports.getAppointmentsByStatus = async (doctor_id, status) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("doctorId", doctor_id)
    .input("status", status).query(`
      SELECT 
        p.full_name, p.gender, p.phone, 
        a.status, a.queue_number, 
        sv.name, sv.service_type, sv.description AS service_description, sv.price,
        tt.name AS name_test_type, 
        r.room_name, r.room_type, 
        sl.start_time, sl.end_time
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Services sv ON sv.appointment_id = a.appointment_id
      JOIN Doctors d ON d.doctor_id = a.doctor_id
      JOIN Rooms r ON a.room_id = r.room_id
      JOIN Slots sl ON sl.slot_id = a.slot_id
      LEFT JOIN TestTypes tt ON tt.test_type_id = sv.test_type_id
      WHERE sv.service_type IN ('examination', 'consultation')
        AND a.status = @status
        AND d.doctor_id = @doctorId
      ORDER BY sl.start_time ASC, a.queue_number ASC
    `);
  return result.recordset;
};
exports.test = async (doctor_id) => {
  const pool = await poolPromise;
  if (!doctor_id || isNaN(doctor_id)) {
    throw new Error("doctorId không hợp lệ");
  }
  // const result = await pool.request().input("doctorId", sql.Int, doctorId)
  //   .query(`
  //     SELECT * FROM DOCTORS
  //     WHERE doctor_id = @doctorId

  //   `);

  const result2 = await pool.request().input("doctor_id", doctor_id).query(`
      SELECT * FROM DOCTORS
      WHERE doctor_id = @doctor_id
        
    `);
  return result2.recordset;
};
