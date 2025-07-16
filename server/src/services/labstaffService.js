const { poolPromise } = require("../config/db");

const saveTestResults = async ({
  request_id,
  appointment_id,
  created_by_id,
  test_datetime,
  notes,
  test_results,
}) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // Insert into TestNotes
    const testNoteQuery = `
      INSERT INTO TestNotes (request_id, appointment_id, created_by_id, test_datetime, notes)
      OUTPUT INSERTED.test_note_id
      VALUES (@request_id, @appointment_id, @created_by_id, @test_datetime, @notes)
    `;
    const testNoteResult = await transaction
      .request()
      .input("request_id", request_id)
      .input("appointment_id", appointment_id)
      .input("created_by_id", created_by_id)
      .input("test_datetime", test_datetime)
      .input("notes", notes)
      .query(testNoteQuery);

    const test_note_id = testNoteResult.recordset[0].test_note_id;

    // Insert into TestResults
    const testResultQuery = `
      INSERT INTO TestResults (test_note_id, test_type_id, result_value, unit, reference_range, created_at)
      VALUES (@test_note_id, @test_type_id, @result_value, @unit, @reference_range, GETDATE())
    `;
    for (const result of test_results) {
      await transaction
        .request()
        .input("test_note_id", test_note_id)
        .input("test_type_id", result.test_type_id)
        .input("result_value", result.result_value)
        .input("unit", result.unit)
        .input("reference_range", result.reference_range)
        .query(testResultQuery);
    }

    await transaction.commit();
    return { test_note_id, test_results };
  } catch (error) {
    await transaction.rollback();
    console.error("Error saving test results:", error);
    throw error;
  }
};

module.exports = {
  saveTestResults,
};
