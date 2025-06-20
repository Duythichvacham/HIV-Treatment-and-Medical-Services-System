const { poolPromise } = require("../config/db");

// (GET, lấy danh sách bác sĩ)
exports.getDoctors = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT 
        d.doctor_id,
        d.full_name,
        d.email,
        d.phone,
        d.image_url,
        d.degrees,
        d.experience_years,
        d.created_at,
        a.username
      FROM Doctors d INNER JOIN Accounts a ON d.account_id = a.account_id
      WHERE a.status = 'active'
      ORDER BY d.experience_years DESC, d.created_at DESC
    `);
  // Format dữ liệu cho front :V
  const formatted = result.recordset.map((doctor) => ({
    id: doctor.doctor_id,
    name: doctor.full_name,
    email: doctor.email,
    phone: doctor.phone,
    avatar: doctor.image_url,
    degrees: doctor.degrees,
    experience: doctor.experience_years,
    joinedAt: new Date(doctor.created_at).toLocaleDateString("vi-VN"), // hoặc dùng thư viện dayjs nếu muốn
    username: doctor.username,
  }));
  return formatted;
};

// (GET, lấy danh sách bác sĩ theo ngày có WorkingShifts)
exports.getDoctorsByDate = async (date) => {
  const pool = await poolPromise;

  // Sử dụng approach khác để tránh lỗi với TEXT column
  const result = await pool.request().input("date", date).query(`
      SELECT 
        d.doctor_id,
        d.full_name,
        d.email, 
        d.phone,
        d.image_url,
        d.degrees,
        d.experience_years,
        d.created_at,
        a.username
      FROM Doctors d 
      INNER JOIN Accounts a ON d.account_id = a.account_id
      WHERE a.status = 'active'
        AND d.doctor_id IN (
          SELECT DISTINCT ws.doctor_id 
          FROM WorkingShifts ws 
          WHERE ws.shift_date = @date AND ws.status = 'approved'
        )
      ORDER BY d.experience_years DESC, d.created_at DESC
    `);

  // Format dữ liệu cho front
  const formatted = result.recordset.map((doctor) => ({
    id: doctor.doctor_id,
    name: doctor.full_name,
    email: doctor.email,
    phone: doctor.phone,
    avatar: doctor.image_url,
    degrees: doctor.degrees,
    experience: doctor.experience_years,
    joinedAt: new Date(doctor.created_at).toLocaleDateString("vi-VN"),
    username: doctor.username,
  }));

  return formatted;
};
//------------------------------------------------------------------
// Lấy danh sách bệnh nhân đang xét nghiệm (status = 'in_progress')
exports.getListWait = async () => {
  const pool = await poolPromise;
  const result = await pool.request()   
    .query(`
SELECT TOP (1000) [service_id]
      ,[request_id]
      ,[appointment_id]
      ,[name]
      ,[service_type]
      ,[description]
      ,[price]
      ,[test_type_id]
      ,[is_active]
  FROM [HIV_HEATH_CARE].[dbo].[Services]
  WHERE [service_type] like 'examination' or [service_type] like 'consultation'

    `);
  return result.recordset;
};

exports.getListInprogress = async () => {
  const pool = await poolPromise;
  const result = await pool.request()   
    .query(`
 SELECT 
    a.appointment_id,
    a.patient_id,
    p.full_name AS patient_name,
    a.doctor_id,
    d.full_name AS doctor_name,
    a.status,
    a.created_at
FROM Appointments a
JOIN Patients p ON a.patient_id = p.patient_id
JOIN Doctors d ON a.doctor_id = d.doctor_id
WHERE a.status = 'in_progress';

    `);
  return result.recordset;
};


exports.getListFinish= async () => {
  const pool = await poolPromise;
  const result = await pool.request()   
    .query(`
 SELECT 
    a.appointment_id,
    a.patient_id,
    p.full_name AS patient_name,
    a.doctor_id,
    d.full_name AS doctor_name,
    a.status,
    a.created_at
FROM Appointments a
JOIN Patients p ON a.patient_id = p.patient_id
JOIN Doctors d ON a.doctor_id = d.doctor_id
WHERE a.status = 'completed'
  AND a.doctor_id IS NOT NULL;


    `);
  return result.recordset;
};

exports.getExams = async (examID) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('examID', examID)
    
    .query(`
SELECT 
    ce.exam_id,
    ce.vitals,
    ce.diagnosis_primary,

    a.appointment_id,
    a.created_at AS appointment_created_at,

    p.full_name AS patient_name,
    p.gender AS patient_gender,
    p.dob AS patient_dob

FROM ClinicalExams ce
JOIN Appointments a ON ce.appointment_id = a.appointment_id
JOIN Patients p ON a.patient_id = p.patient_id
WHERE ce.exam_id = @examID;

    `);
  return result.recordset;
};



exports.createPrescription = async ( {
  appointment_id,
  arv_regimen_id,
  support_drugs,
  counseling_notes,
  follow_up_plan,
  doctor_notes
} ) => {
 

  const pool = await poolPromise;
  const result = await pool.request()
    .input('appointment_id' ,  appointment_id)
    .input('arv_regimen_id',  arv_regimen_id)
    .input('support_drugs', support_drugs )
    .input('counseling_notes',  counseling_notes )
    .input('follow_up_plan', follow_up_plan)
    .input('doctor_notes',  doctor_notes )
    .query(`
      INSERT INTO Prescriptions (
        appointment_id, arv_regimen_id, support_drugs,
        counseling_notes, follow_up_plan, doctor_notes
      )
      OUTPUT INSERTED.*
      VALUES (
        @appointment_id, @arv_regimen_id, @support_drugs,
        @counseling_notes, @follow_up_plan, @doctor_notes
      );
    `);

  return result.recordset[0]; // đơn thuốc vừa tạo
};

//api/v1/doctor/exams/{exam_id} (PATCH, cập nhật thẻ khá	m), -- liên quan nhiều bảng - tham khảo trang demo
exports.updateExam = async ({
  exam_id,
  appointment_id,
  vitals,
  weight,
  height,
  bmi,
  clinical_signs,
  diagnosis_primary,
  diagnosis_secondary,
  exam_date,
  full_name,
  gender,
  dob
}) => {
  const pool = await poolPromise;
  const request = pool.request()
    .input('exam_id', exam_id)
    .input('appointment_id', appointment_id)
    .input('vitals', vitals)
    .input('weight', weight)
    .input('height', height)
    .input('bmi', bmi)
    .input('clinical_signs', clinical_signs)
    .input('diagnosis_primary', diagnosis_primary)
    .input('diagnosis_secondary', diagnosis_secondary)
    .input('full_name', full_name)
    .input('gender', gender)
    .input('dob', dob);

  await request.query(`
    UPDATE ClinicalExams SET
      vitals = ISNULL(@vitals, vitals),
      weight = ISNULL(@weight, weight),
      height = ISNULL(@height, height),
      bmi = ISNULL(@bmi, bmi),
      clinical_signs = ISNULL(@clinical_signs, clinical_signs),
      diagnosis_primary = ISNULL(@diagnosis_primary, diagnosis_primary),
      diagnosis_secondary = ISNULL(@diagnosis_secondary, diagnosis_secondary)
    WHERE exam_id = @exam_id;

    UPDATE Patients SET
      full_name = ISNULL(@full_name, full_name),
      gender = ISNULL(@gender, gender),
      dob = ISNULL(@dob, dob)
    WHERE patient_id = (
      SELECT patient_id FROM Appointments WHERE appointment_id = @appointment_id
    );
  `);

  if (exam_date) {
    await pool.request()
      .input('appointment_id', appointment_id)
      .input('exam_date', exam_date)
      .query(`
        UPDATE Appointments
        SET created_at = @exam_date
        WHERE appointment_id = @appointment_id;
      `);
  }

  const result = await pool.request()
    .input('examID', exam_id)
    .query(`
      SELECT 
        ce.exam_id,
        ce.vitals,
        ce.weight,
        ce.height,
        ce.bmi,
        ce.clinical_signs,
        ce.diagnosis_primary,
        ce.diagnosis_secondary,
        a.appointment_id,
        a.created_at AS appointment_created_at,
        p.full_name AS patient_name,
        p.gender AS patient_gender,
        p.dob AS patient_dob
      FROM ClinicalExams ce
      JOIN Appointments a ON ce.appointment_id = a.appointment_id
      JOIN Patients p ON a.patient_id = p.patient_id
      WHERE ce.exam_id = @examID;
    `);

  return result.recordset[0];
};


//module.exports = { getDoctors, getDoctorsByDate };
