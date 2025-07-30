const { poolPromise } = require("../config/db");
const sql = require("mssql");
const bcrypt = require("bcryptjs");

async function authenticateUser(username, password) {
  const pool = await poolPromise;

  // Query cơ bản để lấy thông tin account
  const result = await pool
    .request()
    .input("username", sql.NVarChar, username)
    .query(
      "SELECT * FROM Accounts WHERE username = @username AND status = 'active'"
    );

  if (!result || !result.recordset || result.recordset.length === 0)
    return null;

  const user = result.recordset[0];

  // So sánh password với password_hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) return null;

  // Nếu user là Doctor, thêm thông tin từ bảng Doctors
  if (user.role === "Doctor") {
    const doctorResult = await pool
      .request()
      .input("account_id", sql.Int, user.account_id)
      .query("SELECT doctor_id FROM Doctors WHERE account_id = @account_id");

    if (doctorResult.recordset && doctorResult.recordset.length > 0) {
      user.doctor_id = doctorResult.recordset[0].doctor_id;
    }
  }

  // Nếu user là Patient, thêm thông tin từ bảng Patients
  if (user.role === "Patient") {
    const patientResult = await pool
      .request()
      .input("account_id", sql.Int, user.account_id)
      .query(
        "SELECT patient_id, full_name FROM Patients WHERE account_id = @account_id"
      );

    if (patientResult.recordset && patientResult.recordset.length > 0) {
      user.patient_id = patientResult.recordset[0].patient_id;
      user.patient_name = patientResult.recordset[0].full_name;
    }
  }

  return user; // Trả về user nếu hợp lệ
}

async function registerPatient(patientData) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Hash password
    const hashedPassword = await bcrypt.hash(patientData.password, 10);

    // Check if username already exists
    const existingUsername = await transaction
      .request()
      .input("username", sql.NVarChar, patientData.username)
      .query("SELECT account_id FROM Accounts WHERE username = @username");

    if (existingUsername.recordset.length > 0) {
      throw new Error("Username already exists");
    }

    // Check if email already exists
    const existingEmail = await transaction
      .request()
      .input("email", sql.VarChar, patientData.email)
      .query("SELECT patient_id FROM Patients WHERE email = @email");

    if (existingEmail.recordset.length > 0) {
      throw new Error("Email already exists");
    }

    // Check if phone already exists
    const existingPhone = await transaction
      .request()
      .input("phone", sql.VarChar, patientData.phone)
      .query("SELECT patient_id FROM Patients WHERE phone = @phone");

    if (existingPhone.recordset.length > 0) {
      throw new Error("Phone already exists");
    }

    // Insert into Accounts table
    const accountResult = await transaction
      .request()
      .input("username", sql.NVarChar, patientData.username)
      .input("password_hash", sql.VarChar, hashedPassword)
      .input("role", sql.VarChar, "Patient")
      .input("status", sql.VarChar, "active").query(`
        INSERT INTO Accounts (username, password_hash, role, status, created_at)
        OUTPUT INSERTED.account_id
        VALUES (@username, @password_hash, @role, @status, GETDATE())
      `);

    const accountId = accountResult.recordset[0].account_id;

    // Insert into Patients table
    const patientResult = await transaction
      .request()
      .input("account_id", sql.Int, accountId)
      .input("full_name", sql.NVarChar, patientData.fullName)
      .input("dob", sql.Date, patientData.dob)
      .input("gender", sql.NVarChar, patientData.gender)
      .input("email", sql.VarChar, patientData.email)
      .input("phone", sql.VarChar, patientData.phone)
      .input("address", sql.NVarChar, patientData.address || null).query(`
        INSERT INTO Patients (account_id, full_name, dob, gender, email, phone, address, created_at)
        OUTPUT INSERTED.patient_id
        VALUES (@account_id, @full_name, @dob, @gender, @email, @phone, @address, GETDATE())
      `);

    const patientId = patientResult.recordset[0].patient_id;

    await transaction.commit();

    return { patientId, accountId };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// change password
async function changePassword(userId, oldPassword, newPassword) {
  const pool = await poolPromise;
  // Lấy password_hash từ account_id
  const result = await pool
    .request()
    .input("account_id", sql.Int, userId)
    .query("SELECT password_hash FROM Accounts WHERE account_id = @account_id");
  if (!result.recordset.length) throw new Error("Không tìm thấy tài khoản.");
  const user = result.recordset[0];

  // Kiểm tra mật khẩu cũ
  const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isMatch) throw new Error("Mật khẩu cũ không đúng.");

  // Hash mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool
    .request()
    .input("account_id", sql.Int, userId)
    .input("password_hash", sql.VarChar, hashedPassword)
    .query(
      "UPDATE Accounts SET password_hash = @password_hash WHERE account_id = @account_id"
    );
  return true;
}

async function getAccountIdByEmail(email) {
  const pool = await poolPromise;
  const result = await pool.request().input("email", sql.VarChar, email).query(`
      SELECT a.account_id
      FROM Accounts a
      INNER JOIN Patients p ON a.account_id = p.account_id
      WHERE p.email = @email
    `);
  if (result.recordset.length === 0) return null;
  return result.recordset[0].account_id;
}

async function resetPassword(userId, newPassword) {
  const pool = await poolPromise;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool
    .request()
    .input("account_id", sql.Int, userId)
    .input("password_hash", sql.VarChar, hashedPassword)
    .query(
      "UPDATE Accounts SET password_hash = @password_hash WHERE account_id = @account_id"
    );
  return true;
}

module.exports = {
  authenticateUser,
  registerPatient,
  changePassword,
  getAccountIdByEmail,
  resetPassword,
};
