const { poolPromise } = require('../config/db');
const sql = require('mssql');
const bcrypt = require('bcryptjs');

async function authenticateUser(username, password) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('username', sql.NVarChar, username) // Dùng NVarChar cho đúng kiểu
    .query('SELECT * FROM Accounts WHERE username = @username AND status = \'active\'');
  console.log('SQL result:', result);

  if (!result || !result.recordset || result.recordset.length === 0) return null;

  const user = result.recordset[0];

  // So sánh password với password_hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  console.log('Password match:', isMatch);
  if (!isMatch) return null;

  return user; // Trả về user nếu hợp lệ
}

module.exports = { authenticateUser };