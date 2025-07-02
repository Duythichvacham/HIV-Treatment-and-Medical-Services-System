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

exports.getCurrentARVRegimen = async (patientId) => {
  const pool = await poolPromise;
  const result = await pool.request().input("patientId", sql.Int, patientId)
    .query(`
      SELECT TOP 1
        ar.arv_regimen_id,
        ar.name,
        ar.components,
        FORMAT(a.created_at, 'dd-MM-yyyy') as created_at,
        mh.arv_adherence,
        mh.arv_side_effects,
        pr.prescription_id,
        pr.doctor_notes
      FROM Prescriptions pr
      JOIN Appointments a ON pr.appointment_id = a.appointment_id
      JOIN Patients p ON a.patient_id = p.patient_id
      LEFT JOIN ARVRegimens ar ON pr.arv_regimen_id = ar.arv_regimen_id
      LEFT JOIN MedicalHistory mh ON p.patient_id = mh.patient_id
      WHERE p.patient_id = @patientId
        AND pr.arv_regimen_id IS NOT NULL
      ORDER BY a.created_at DESC
    `);

  return result.recordset[0] || null; // Trả về null nếu không tìm thấy regimen
};

exports.getLatestTestResults = async (patientId) => {
  const pool = await poolPromise;
  const query = `
      SELECT 
        tt.name as test_name,
        ISNULL(latest_tr.result_value, '') AS result_value,
        ISNULL(latest_tr.unit, '') AS unit,
        ISNULL(CONVERT(VARCHAR, latest_tr.created_at, 120), '') AS test_date,
        ISNULL(latest_tr.notes, '') AS notes
      FROM TestTypes tt
      OUTER APPLY (
          SELECT TOP 1 
              tr.result_value, 
              tr.unit, 
              tr.created_at, 
              tn.notes
          FROM Appointments a
          JOIN TestNotes tn ON a.appointment_id = tn.appointment_id
          JOIN TestResults tr ON tr.test_note_id = tn.test_note_id
          WHERE 
              a.patient_id = @patient_id AND 
              tr.test_type_id = tt.test_type_id
          ORDER BY tr.created_at DESC
      ) AS latest_tr
    `;

  const result = await pool
    .request()
    .input("patient_id", patientId)
    .query(query);

  console.log(`Found ${result.recordset.length} test results`);

  const testResults = {
    sang_loc: null,
    khang_dinh: null,
    cd4: null,
    viral_load: null,
  };

  result.recordset.forEach((test) => {
    const testData = {
      result_value: test.result_value,
      unit: test.unit,
      notes: test.notes,
      test_date: test.test_date,
    };

    switch (test.test_name) {
      case "Sàng lọc":
        testResults.sang_loc = {
          ...testData,
          test_name: "Sàng lọc HIV",
        };
        break;
      case "Khẳng định":
        testResults.khang_dinh = {
          ...testData,
          test_name: "Khẳng định HIV",
        };
        break;
      case "CD4":
        testResults.cd4 = {
          ...testData,
          test_name: "Số lượng CD4",
        };
        break;
      case "HIV Viral Load":
        testResults.viral_load = {
          ...testData,
          test_name: "Tải lượng virus",
        };
        break;
    }
  });

  return testResults;
};
