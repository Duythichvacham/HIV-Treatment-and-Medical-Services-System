const { poolPromise } = require("../config/db");

const saveClinicalExam = async (appointmentId, examData) => {
  const pool = await poolPromise;
  const transaction = await pool.transaction();

  const [
    huyet_ap,
    mach,
    nhiet_do,
    weight,
    height,
    bmi,
    clinical_signs,
    diagnosis_primary,
    diagnosis_secondary,
  ] = examData;

  const vitals = `Huyết áp: ${huyet_ap}, Mạch: ${mach}/phút, Nhiệt độ: ${nhiet_do}°C`;

  try {
    await transaction.begin();

    await transaction
      .request()
      .input("appointment_id", appointmentId)
      .input("vitals", vitals)
      .input("weight", weight)
      .input("height", height)
      .input("bmi", bmi)
      .input("clinical_signs", clinical_signs)
      .input("diagnosis_primary", diagnosis_primary)
      .input("diagnosis_secondary", diagnosis_secondary).query(`
        MERGE ClinicalExams AS target
        USING (SELECT @appointment_id AS appointment_id) AS source
        ON target.appointment_id = source.appointment_id
        WHEN MATCHED THEN 
          UPDATE SET 
            vitals = @vitals,
            weight = @weight,
            height = @height,
            bmi = @bmi,
            clinical_signs = @clinical_signs,
            diagnosis_primary = @diagnosis_primary,
            diagnosis_secondary = @diagnosis_secondary
        WHEN NOT MATCHED THEN
          INSERT (
            appointment_id, vitals, weight, height, bmi,
            clinical_signs, diagnosis_primary, diagnosis_secondary
          )
          VALUES (
            @appointment_id, @vitals, @weight, @height, @bmi,
            @clinical_signs, @diagnosis_primary, @diagnosis_secondary
          );
      `);

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    console.error("[saveClinicalExam] Error:", error);
    throw error;
  }
};

const getClinicalExamByAppointmentId = async (appointmentId) => {
  const pool = await poolPromise;
  try {
    const request = pool.request();
    request.input("appointmentId", parseInt(appointmentId, 10));

    const query = `
      SELECT 
        exam_id,
        appointment_id,
        vitals,
        weight,
        height,
        bmi,
        clinical_signs,
        diagnosis_primary,
        diagnosis_secondary
      FROM ClinicalExams
      WHERE appointment_id = @appointmentId
    `;

    const result = await request.query(query);
    const data = result.recordset[0];

    if (!data) return null;

    // 👉 Parse vitals từ chuỗi
    const vitals = data.vitals || "";
    const huyetApMatch = vitals.match(/Huyết áp:\s*([\d/]+)/);
    const machMatch = vitals.match(/Mạch:\s*(\d+)/);
    const nhietDoMatch = vitals.match(/Nhiệt độ:\s*([\d.]+)/);

    const huyet_ap = huyetApMatch ? huyetApMatch[1] : null;
    const mach = machMatch ? machMatch[1] : null;
    const nhiet_do = nhietDoMatch ? nhietDoMatch[1] : null;

    // 👉 Trả về object đã băm
    return {
      appointment_id: data.appointment_id,
      huyet_ap,
      mach,
      nhiet_do,
      weight: data.weight,
      height: data.height,
      bmi: data.bmi,
      clinical_signs: data.clinical_signs,
      diagnosis_primary: data.diagnosis_primary,
      diagnosis_secondary: data.diagnosis_secondary,
    };
  } catch (error) {
    console.error("[getClinicalExamByAppointmentId] Error:", error);
    throw error;
  }
};

module.exports = {
  saveClinicalExam,
  getClinicalExamByAppointmentId,
};
