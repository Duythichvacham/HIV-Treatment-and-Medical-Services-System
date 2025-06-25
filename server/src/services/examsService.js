const { poolPromise } = require("../config/db");


const getExams = async (examID) => {
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
//api/v1/doctor/exams/{exam_id} (PATCH, cập nhật thẻ khá	m), -- liên quan nhiều bảng - tham khảo trang demo
const updateExam = async ({
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
  
  module.exports = {
 
getExams ,
updateExam
  
  };