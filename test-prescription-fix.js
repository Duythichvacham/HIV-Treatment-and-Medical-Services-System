// Test script để kiểm tra fix cho prescription duplicate
const { poolPromise } = require("./server/src/config/db");

async function testPrescriptionDuplicates() {
  try {
    const pool = await poolPromise;

    // Kiểm tra bản ghi trùng lặp
    const duplicateQuery = `
      SELECT 
        pd.prescription_id,
        pd.drug_name,
        pd.notes,
        COUNT(*) as count
      FROM PrescriptionDetails pd
      GROUP BY pd.prescription_id, pd.drug_name, pd.notes
      HAVING COUNT(*) > 1
      ORDER BY pd.prescription_id
    `;

    console.log("Checking for duplicate prescription details...");
    const duplicateResult = await pool.request().query(duplicateQuery);

    if (duplicateResult.recordset.length > 0) {
      console.log("Found duplicate prescription details:");
      console.table(duplicateResult.recordset);

      // Xóa duplicates, giữ lại bản ghi mới nhất
      for (const duplicate of duplicateResult.recordset) {
        console.log(
          `Removing duplicates for prescription ${duplicate.prescription_id}, drug ${duplicate.drug_name}`
        );

        const deleteQuery = `
          DELETE FROM PrescriptionDetails 
          WHERE prescription_id = @prescription_id 
          AND drug_name = @drug_name 
          AND notes = @notes
          AND id NOT IN (
            SELECT MAX(id) 
            FROM PrescriptionDetails 
            WHERE prescription_id = @prescription_id 
            AND drug_name = @drug_name 
            AND notes = @notes
          )
        `;

        await pool
          .request()
          .input("prescription_id", duplicate.prescription_id)
          .input("drug_name", duplicate.drug_name)
          .input("notes", duplicate.notes)
          .query(deleteQuery);
      }

      console.log("Duplicate removal completed.");
    } else {
      console.log("No duplicate prescription details found.");
    }

    // Hiển thị tất cả prescription details hiện tại
    const allQuery = `
      SELECT 
        pd.prescription_id,
        pd.drug_name,
        pd.dosage,
        pd.frequency,
        pd.duration_days,
        pd.usage_instructions,
        pd.notes,
        pd.id
      FROM PrescriptionDetails pd
      ORDER BY pd.prescription_id, pd.id
    `;

    const allResult = await pool.request().query(allQuery);
    console.log("\nAll prescription details:");
    console.table(allResult.recordset);
  } catch (error) {
    console.error("Error:", error);
  }
}

testPrescriptionDuplicates();
