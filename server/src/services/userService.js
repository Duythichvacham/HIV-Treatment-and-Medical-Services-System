const { poolPromise } = require("../config/db");

const getUsers = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT a.username, a.role, a.status, a.created_at,
           p.email as patient_email, d.email as doctor_email
    FROM Accounts as a
    LEFT JOIN Patients as p ON a.account_id = p.accountId
    LEFT JOIN Doctors as d ON a.account_id = d.accountId
    ORDER BY a.role DESC, a.created_at DESC
    `);
  return (formattedData = result.recordset.map((user) => {
    let email = NULL;
    email =
      user.role === "patient" || user.role === "doctor"
        ? user.role === "patient"
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
  }));
};

module.exports = {
  getUsers,
};
