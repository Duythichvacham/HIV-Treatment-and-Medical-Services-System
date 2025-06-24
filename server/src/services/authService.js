const { poolPromise } = require('../config/db');
const sql = require('mssql');
const bcrypt = require('bcryptjs');

async function authenticateUser(username, password) {
  const pool = await poolPromise;
  
  // Query cơ bản để lấy thông tin account
  const result = await pool.request()
    .input('username', sql.NVarChar, username)
    .query('SELECT * FROM Accounts WHERE username = @username AND status = \'active\'');
  console.log('SQL result:', result);

  if (!result || !result.recordset || result.recordset.length === 0) return null;

  const user = result.recordset[0];

  // So sánh password với password_hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  console.log('Password match:', isMatch);
  if (!isMatch) return null;

  // Nếu user là Doctor, thêm thông tin từ bảng Doctors
  if (user.role === 'Doctor') {
    const doctorResult = await pool.request()
      .input('account_id', sql.Int, user.account_id)
      .query('SELECT doctor_id FROM Doctors WHERE account_id = @account_id');
    
    if (doctorResult.recordset && doctorResult.recordset.length > 0) {
      user.doctor_id = doctorResult.recordset[0].doctor_id;
    }
  }

  // Nếu user là Patient, thêm thông tin từ bảng Patients
  if (user.role === 'Patient') {
    const patientResult = await pool.request()
      .input('account_id', sql.Int, user.account_id)
      .query('SELECT patient_id FROM Patients WHERE account_id = @account_id');
    
    if (patientResult.recordset && patientResult.recordset.length > 0) {
      user.patient_id = patientResult.recordset[0].patient_id;
    }
  }

  // Các role khác (Lab-Staff, Registration-staff, Manager) chỉ lấy từ Accounts, không join thêm bảng nào!

  return user; // Trả về user nếu hợp lệ
}

module.exports = { authenticateUser };