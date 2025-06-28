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

//GET, lấy bệnh nhân chờ xét nghiệm với service_type='test' /api/v1/lab/appointments/queue
exports.getLabTestQueue = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT 
        a.appointment_id,
        a.queue_number,
        a.status,
        a.created_at,
        p.full_name as patient_name,
        p.phone as patient_phone,
        s.name as service_name,
        s.service_type,
        tt.name as test_type_name,
        tt.unit,
        tt.normal_range
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Services s ON a.appointment_id = s.appointment_id
      LEFT JOIN TestTypes tt ON s.test_type_id = tt.test_type_id
      WHERE s.service_type = 'test'
      AND a.status = 'requested'
      ORDER BY a.created_at ASC
    `);
  return result.recordset;
};

// Lấy danh sách bệnh nhân đang xét nghiệm (status = 'in_progress')
exports.getLabTestInProgress = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT 
        a.appointment_id,
        a.queue_number,
        a.status,
        a.created_at,
        p.full_name as patient_name,
        p.phone as patient_phone,
        s.name as service_name,
        s.service_type,
        tt.name as test_type_name,
        tt.unit,
        tt.normal_range
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Services s ON a.appointment_id = s.appointment_id
      LEFT JOIN TestTypes tt ON s.test_type_id = tt.test_type_id
      WHERE s.service_type = 'test'
      AND a.status = 'in_progress'
      ORDER BY a.created_at ASC
    `);
  return result.recordset;
};

///api/v1/lab/appointments/finished (GET, lấy bệnh nhân hoàn thành XN)
exports.getLabTestFinished = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT 
        a.appointment_id,
        a.queue_number,
        a.status,
        a.created_at,
        p.full_name as patient_name,
        p.phone as patient_phone,
        s.name as service_name,
        s.service_type,
        tt.name as test_type_name,
        tt.unit,
        tt.normal_range
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Services s ON a.appointment_id = s.appointment_id
      LEFT JOIN TestTypes tt ON s.test_type_id = tt.test_type_id
      WHERE s.service_type = 'test'
      AND a.status = 'completed'
      ORDER BY a.created_at ASC
    `);
  return result.recordset;
};
