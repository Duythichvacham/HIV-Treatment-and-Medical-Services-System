const { poolPromise } = require("../config/db");

const saveClinicalExam = async (examData) => {
  try {
    const pool = await poolPromise;
    const {
      appointment_id,
      vitals,
      weight,
      height,
      bmi,
      clinical_signs,
      diagnosis_primary,
      diagnosis_secondary,
      action,
    } = examData;

    // Check if clinical exam already exists
    const existingExam = await pool
      .request()
      .input("appointment_id", appointment_id).query(`
        SELECT clinical_exam_id 
        FROM ClinicalExams 
        WHERE appointment_id = @appointment_id
      `);

    let result;

    if (existingExam.recordset.length > 0) {
      // Update existing exam
      const clinical_exam_id = existingExam.recordset[0].clinical_exam_id;

      result = await pool
        .request()
        .input("clinical_exam_id", clinical_exam_id)
        .input("vitals", vitals || null)
        .input("weight", weight || null)
        .input("height", height || null)
        .input("bmi", bmi || null)
        .input("clinical_signs", clinical_signs || null)
        .input("diagnosis_primary", diagnosis_primary || null)
        .input("diagnosis_secondary", diagnosis_secondary || null).query(`
          UPDATE ClinicalExams 
          SET 
            vitals = @vitals,
            weight = @weight,
            height = @height,
            bmi = @bmi,
            clinical_signs = @clinical_signs,
            diagnosis_primary = @diagnosis_primary,
            diagnosis_secondary = @diagnosis_secondary,
            updated_at = GETDATE()
          WHERE clinical_exam_id = @clinical_exam_id
        `);
    } else {
      // Create new exam
      result = await pool
        .request()
        .input("appointment_id", appointment_id)
        .input("vitals", vitals || null)
        .input("weight", weight || null)
        .input("height", height || null)
        .input("bmi", bmi || null)
        .input("clinical_signs", clinical_signs || null)
        .input("diagnosis_primary", diagnosis_primary || null)
        .input("diagnosis_secondary", diagnosis_secondary || null).query(`
          INSERT INTO ClinicalExams 
          (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary)
          VALUES 
          (@appointment_id, @vitals, @weight, @height, @bmi, @clinical_signs, @diagnosis_primary, @diagnosis_secondary)
        `);
    }

    // If action is "complete", update appointment status
    if (action === "complete") {
      await pool.request().input("appointment_id", appointment_id).query(`
          UPDATE Appointments 
          SET status = 'completed'
          WHERE appointment_id = @appointment_id
        `);
    }

    return {
      appointment_id,
      action,
      status: action === "complete" ? "completed" : "in_progress",
    };
  } catch (error) {
    console.error("Error in saveClinicalExam:", error);
    throw error;
  }
};

module.exports = {
  saveClinicalExam,
};
