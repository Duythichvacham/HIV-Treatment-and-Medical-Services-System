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

  return user; // Trả về user nếu hợp lệ
}

module.exports = { authenticateUser };