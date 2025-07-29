const { poolPromise } = require("../config/db");
const bcrypt = require("bcryptjs");

const getUsers = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT a.username, a.role, a.status, a.created_at,
           p.email as patient_email, d.email as doctor_email
    FROM Accounts as a
    LEFT JOIN Patients as p ON a.account_id = p.account_id
    LEFT JOIN Doctors as d ON a.account_id = d.account_id
    ORDER BY a.role DESC, a.created_at DESC
    `);
  const formattedData = result.recordset.map((user) => {
    let email = null;
    email =
      user.role === "Patient" || user.role === "Doctor"
        ? user.role === "Patient"
          ? user.patient_email
          : user.doctor_email
        : null;
    return {
      userName: user.username,
      email: email,
      role: user.role,
      status: user.status,
      createdAt: user.created_at.toISOString().slice(0, 19).replace("T", " "),
    };
  });
  return formattedData;
};

const createUser = async (userData) => {
  const { username, password, role } = userData;
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if username already exists
    const checkUsername = await transaction
      .request()
      .input("username", username)
      .query("SELECT account_id FROM Accounts WHERE username = @username");

    if (checkUsername.recordset.length > 0) {
      throw new Error("Username already exists");
    }

    // Create account only
    const accountResult = await transaction
      .request()
      .input("username", username)
      .input("password", hashedPassword)
      .input("role", role).query(`
        INSERT INTO Accounts (username, password_hash, role, status, created_at)
        OUTPUT INSERTED.account_id
        VALUES (@username, @password, @role, 'active', GETDATE())
      `);

    const accountId = accountResult.recordset[0].account_id;

    const resultData = {
      accountId,
      username,
      role,
      message:
        "Tài khoản đã được tạo. Người dùng có thể cập nhật thông tin cá nhân sau khi đăng nhập.",
    };

    await transaction.commit();
    return resultData;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getUsers,
  createUser,
};
