const { poolPromise } = require('../config/db');

exports.updateAppointmentStatus = async (appointment_id, status) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('appointment_id', appointment_id)
    .input('status', status)
    .query('UPDATE Appointments SET status = @status WHERE appointment_id = @appointment_id; SELECT * FROM Appointments WHERE appointment_id = @appointment_id');
  return result.recordset[0];
};

exports.updateTestRequestStatus = async (appointment_id, doctor_id, status) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('appointment_id', appointment_id)
    .input('doctor_id', doctor_id)
    .input('status', status)
    .query('UPDATE TestRequests SET status = @status WHERE appointment_id = @appointment_id AND doctor_id = @doctor_id; SELECT * FROM TestRequests WHERE appointment_id = @appointment_id AND doctor_id = @doctor_id');
  return result.recordset[0];
};