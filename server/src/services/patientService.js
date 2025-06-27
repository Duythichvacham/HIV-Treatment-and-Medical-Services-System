const { sql, poolPromise } = require("../config/db"); // điều chỉnh đường dẫn đúng

//GET, search bệnh nhân dựa vào sdt và tên

exports.searchPatientsByPartialNameAndPhone = async (name, phone) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("name", sql.NVarChar, name)
    .input("phone", sql.VarChar, phone).query(`
      SELECT [patient_id],
             [account_id],
             [full_name],
             [dob],
             [gender],
             [email],
             [phone],
             [address],
             [created_at]
      FROM [Patients]
      WHERE [full_name] COLLATE Latin1_General_CI_AI LIKE N'%' + @name + '%'
        AND [phone] LIKE '%' + @phone + '%'
    `);
  return result.recordset;
};

exports.searchPatientsByPartialNameAndPhone = async (name, phone) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("name", sql.NVarChar, name)
    .input("phone", sql.VarChar, phone).query(`
      SELECT [patient_id],
             [account_id],
             [full_name],
             [dob],
             [gender],
             [email],
             [phone],
             [address],
             [created_at]
      FROM [Patients]
      WHERE [full_name] COLLATE Latin1_General_CI_AI LIKE N'%' + @name + '%'
        AND [phone] LIKE '%' + @phone + '%'
    `);
  return result.recordset;
};

//
// exports.updateTestRequestStatus = async (appointment_id, doctor_id, status) => {
//   const pool = await poolPromise;
//   const result = await pool.request()
//     .input('appointment_id', appointment_id)
//     .input('doctor_id', doctor_id)
//     .input('status', status)
//     .query('UPDATE TestRequests SET status = @status WHERE appointment_id = @appointment_id AND doctor_id = @doctor_id; SELECT * FROM TestRequests WHERE appointment_id = @appointment_id AND doctor_id = @doctor_id');
//   return result.recordset[0];
// };
