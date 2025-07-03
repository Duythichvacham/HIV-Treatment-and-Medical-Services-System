const { poolPromise } = require("../config/db");

const getAllARVRegimens = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM ARVRegimens");

    return result.recordset; // Return the array of ARV regimens
  } catch (error) {
    console.error("Error fetching ARV regimens:", error);
    throw error; // Rethrow to handle in controller
  }
};
const getARVRegimenById = async (regimenId) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("regimenId", regimenId)
      .query(
        `SELECT 
            LTRIM(RTRIM(value)) AS Drug,
            LEFT(LTRIM(RTRIM(value)), PATINDEX('%[0-9]%', LTRIM(RTRIM(value))) - 1) AS drug_name,
            RIGHT(LTRIM(RTRIM(value)), LEN(LTRIM(RTRIM(value))) - PATINDEX('%[0-9]%', LTRIM(RTRIM(value))) + 1) AS dosage
        FROM ARVRegimens 
        CROSS APPLY STRING_SPLIT(components, '+') 
        WHERE arv_regimen_id = @regimenId`
      );

    if (result.recordset.length === 0) {
      return null; // No regimen found
    }
    return result.recordset;
  } catch (error) {
    console.error("Error fetching ARV regimen by ID:", error);
    throw error; // Rethrow to handle in controller
  }
};
module.exports = {
  getAllARVRegimens,
  getARVRegimenById,
};
