const { poolPromise } = require("../config/db");

const savePrescription = async (prescriptionData) => {
  try {
    const pool = await poolPromise;
    const {
      appointment_id,
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes,
    } = prescriptionData;

    // Check if prescription already exists
    const existingPrescription = await pool
      .request()
      .input("appointment_id", appointment_id).query(`
        SELECT prescription_id 
        FROM Prescriptions 
        WHERE appointment_id = @appointment_id
      `);

    let result;
    let prescription_id;

    if (existingPrescription.recordset.length > 0) {
      // Update existing prescription
      prescription_id = existingPrescription.recordset[0].prescription_id;

      await pool
        .request()
        .input("prescription_id", prescription_id)
        .input("arv_regimen_id", arv_regimen_id || null)
        .input("support_drugs", support_drugs || null)
        .input("counseling_notes", counseling_notes || null)
        .input("follow_up_plan", follow_up_plan || null)
        .input("doctor_notes", doctor_notes || null).query(`
          UPDATE Prescriptions 
          SET 
            arv_regimen_id = @arv_regimen_id,
            support_drugs = @support_drugs,
            counseling_notes = @counseling_notes,
            follow_up_plan = @follow_up_plan,
            doctor_notes = @doctor_notes
          WHERE prescription_id = @prescription_id
        `);
    } else {
      // Create new prescription
      const insertResult = await pool
        .request()
        .input("appointment_id", appointment_id)
        .input("arv_regimen_id", arv_regimen_id || null)
        .input("support_drugs", support_drugs || null)
        .input("counseling_notes", counseling_notes || null)
        .input("follow_up_plan", follow_up_plan || null)
        .input("doctor_notes", doctor_notes || null).query(`
          INSERT INTO Prescriptions 
          (appointment_id, arv_regimen_id, support_drugs, counseling_notes, follow_up_plan, doctor_notes)
          OUTPUT INSERTED.prescription_id
          VALUES 
          (@appointment_id, @arv_regimen_id, @support_drugs, @counseling_notes, @follow_up_plan, @doctor_notes)
        `);

      prescription_id = insertResult.recordset[0].prescription_id;
    }

    return {
      prescription_id,
      appointment_id,
    };
  } catch (error) {
    console.error("Error in savePrescription:", error);
    throw error;
  }
};

const savePrescriptionDetails = async (detailsData) => {
  try {
    const pool = await poolPromise;
    const { arv_regimen_id, drug } = detailsData;

    // Delete existing prescription details for this regimen
    await pool.request().input("arv_regimen_id", arv_regimen_id).query(`
        DELETE FROM PrescriptionDetails 
        WHERE prescription_id IN (
          SELECT prescription_id 
          FROM Prescriptions 
          WHERE arv_regimen_id = @arv_regimen_id
        )
      `);

    // Insert new prescription details
    const insertPromises = drug.map(async (drugItem) => {
      return pool
        .request()
        .input("prescription_id", drugItem.prescription_id)
        .input("drug_name", drugItem.drug_name)
        .input("dosage", drugItem.dosage)
        .input("frequency", drugItem.frequency)
        .input("duration_days", drugItem.duration_days)
        .input("usage_instructions", drugItem.usage_instructions || null)
        .input("notes", drugItem.notes || null).query(`
          INSERT INTO PrescriptionDetails 
          (prescription_id, drug_name, dosage, frequency, duration_days, usage_instructions, notes)
          VALUES 
          (@prescription_id, @drug_name, @dosage, @frequency, @duration_days, @usage_instructions, @notes)
        `);
    });

    await Promise.all(insertPromises);

    return {
      arv_regimen_id,
      drug_count: drug.length,
    };
  } catch (error) {
    console.error("Error in savePrescriptionDetails:", error);
    throw error;
  }
};

module.exports = {
  savePrescription,
  savePrescriptionDetails,
};
