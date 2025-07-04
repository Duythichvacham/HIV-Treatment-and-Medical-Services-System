const { poolPromise } = require("../config/db");

const savePrescription = async (
  appointment_id,
  arv_regimen_id,
  support_drugs,
  counseling_notes,
  follow_up_plan,
  doctor_notes,
  prescription_detail // Thêm prescription_detail parameter
) => {
  const pool = await poolPromise;

  try {
    console.log("[savePrescription] Input parameters:", {
      appointment_id,
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes,
      prescription_detail,
    });

    const request = pool.request();

    // Parse và validate appointment_id
    const parsedAppointmentId = parseInt(appointment_id, 10);
    if (isNaN(parsedAppointmentId)) {
      throw new Error("Invalid appointment_id: must be a valid number");
    }

    // Parse arv_regimen_id nếu có, nếu không thì set null
    let parsedArvRegimenId = null;
    if (
      arv_regimen_id !== undefined &&
      arv_regimen_id !== null &&
      arv_regimen_id !== ""
    ) {
      parsedArvRegimenId = parseInt(arv_regimen_id, 10);
      if (isNaN(parsedArvRegimenId)) {
        throw new Error("Invalid arv_regimen_id: must be a valid number");
      }
    }

    console.log("[savePrescription] Parsed values:", {
      parsedAppointmentId,
      parsedArvRegimenId,
    });

    const result = await request
      .input("appointment_id", parsedAppointmentId)
      .input("arv_regimen_id", parsedArvRegimenId)
      .input("support_drugs", support_drugs || "")
      .input("counseling_notes", counseling_notes || "")
      .input("follow_up_plan", follow_up_plan || "")
      .input("doctor_notes", doctor_notes || "").query(`
        MERGE Prescriptions AS target
        USING (SELECT @appointment_id AS appointment_id) AS source
        ON target.appointment_id = source.appointment_id
        WHEN MATCHED THEN
          UPDATE SET 
            arv_regimen_id = @arv_regimen_id,
            support_drugs = @support_drugs,
            counseling_notes = @counseling_notes,
            follow_up_plan = @follow_up_plan,
            doctor_notes = @doctor_notes
        WHEN NOT MATCHED THEN
          INSERT (appointment_id, arv_regimen_id, support_drugs, counseling_notes, follow_up_plan, doctor_notes)
          VALUES (@appointment_id, @arv_regimen_id, @support_drugs, @counseling_notes, @follow_up_plan, @doctor_notes)
        OUTPUT inserted.prescription_id;
      `);

    const prescriptionId = result.recordset[0]?.prescription_id;
    console.log(
      "[savePrescription] Created/Updated prescription ID:",
      prescriptionId
    );

    // Xử lý prescription details từ frontend
    if (
      prescription_detail &&
      prescription_detail.length > 0 &&
      prescriptionId
    ) {
      console.log(
        "[savePrescription] Processing prescription details:",
        prescription_detail
      );

      // Xóa các PrescriptionDetails cũ của prescription này
      await pool
        .request()
        .input("prescription_id", prescriptionId)
        .query(
          `DELETE FROM PrescriptionDetails WHERE prescription_id = @prescription_id`
        );

      // Insert từng prescription detail
      for (const detail of prescription_detail) {
        if (detail && detail.drug_name) {
          console.log(
            "[savePrescription] Inserting prescription detail:",
            detail
          );

          await pool
            .request()
            .input("prescription_id", prescriptionId)
            .input("drug_name", detail.drug_name)
            .input("dosage", detail.dosage || "")
            .input("frequency", detail.frequency || "")
            .input("duration_days", parseInt(detail.duration_days) || 30)
            .input("usage_instructions", detail.usage_instructions || "")
            .input("notes", detail.notes || "").query(`
              INSERT INTO PrescriptionDetails 
              (prescription_id, drug_name, dosage, frequency, duration_days, usage_instructions, notes)
              VALUES 
              (@prescription_id, @drug_name, @dosage, @frequency, @duration_days, @usage_instructions, @notes)
            `);
        } else {
          console.warn(
            "[savePrescription] Invalid prescription detail:",
            detail
          );
        }
      }

      console.log(
        `[savePrescription] Inserted ${prescription_detail.length} prescription details`
      );
    } else {
      console.log("[savePrescription] No prescription details to process");
    }

    return true;
  } catch (error) {
    console.error("[savePrescription] Error:", error);
    throw error;
  }
};

const getPrescriptionExamData = async (appointmentId) => {
  const pool = await poolPromise;
  try {
    const request = pool.request();
    request.input("appointmentId", parseInt(appointmentId, 10));

    // Lấy đơn thuốc chính (TOP 1)
    const prescriptionQuery = `
      SELECT TOP 1
        p.prescription_id, 
        p.appointment_id,
        a.name AS regimens_name, 
        a.for_group, 
        p.support_drugs,
        p.counseling_notes,
        p.follow_up_plan, 
        p.doctor_notes, 
        a.components 
      FROM Prescriptions p
      JOIN ARVRegimens a ON p.arv_regimen_id = a.arv_regimen_id
      WHERE p.appointment_id = @appointmentId
    `;

    const prescriptionResult = await request.query(prescriptionQuery);
    const prescription = prescriptionResult.recordset[0];

    if (!prescription) return null;

    // Lấy danh sách thuốc từ PrescriptionDetails
    const drugRequest = pool.request();
    drugRequest.input("prescriptionId", prescription.prescription_id);

    const drugQuery = `
      SELECT * FROM PrescriptionDetails
      WHERE prescription_id = @prescriptionId
    `;
    const drugResult = await drugRequest.query(drugQuery);
    const prescriptionDetails = drugResult.recordset;

    // Trả về kết quả gộp
    return {
      ...prescription,
      prescriptionDetails,
    };
  } catch (error) {
    console.error("[getPrescriptionExamData] Error:", error);
    throw error;
  }
};

module.exports = {
  savePrescription,
  getPrescriptionExamData,
};
