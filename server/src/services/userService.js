const { poolPromise } = require("../config/db");

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
    let email = NULL;
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

module.exports = {
  getUsers,
};
