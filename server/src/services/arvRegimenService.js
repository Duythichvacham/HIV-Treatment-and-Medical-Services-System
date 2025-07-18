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
            LTRIM(RTRIM(value)) AS Drug_name--,
            --LEFT(LTRIM(RTRIM(value)), PATINDEX('%[0-9]%', LTRIM(RTRIM(value))) - 1) AS drug_name,
            --RIGHT(LTRIM(RTRIM(value)), LEN(LTRIM(RTRIM(value))) - PATINDEX('%[0-9]%', LTRIM(RTRIM(value))) + 1) AS dosage
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



const createARV= async (  name,
       for_group
      ,components
      ,is_active) => {
  const pool = await poolPromise;


  const result = await pool
    .request()
   
    .input("name", name)
    .input("for_group", for_group)
    .input("components",components)

    .input("is_active", is_active).query(`
      INSERT INTO ARVRegimens (name,for_group,components,is_active)
      OUTPUT INSERTED.arv_regimen_id
      VALUES (
       @name , @for_group , @components , @is_active 
      );
    `);

  return {
  arv_regimen_id:result.recordset[0].arv_regimen_id,
  };
};

const updateARV = async (id, name, for_group, components) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("id", id)
    .input("name", name ?? null)
    .input("for_group", for_group ?? null)
    .input("components", components ?? null)
    .query(`
      UPDATE ARVRegimens
      SET 
        name = COALESCE(@name, name),
        for_group = COALESCE(@for_group, for_group),
        components = COALESCE(@components, components)
      WHERE arv_regimen_id = @id;

      SELECT * FROM ARVRegimens WHERE arv_regimen_id = @id;
    `);

  return result.recordset[0];
};



const setActiveARV = async (is_active , id) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("is_active", is_active)
    .input("id", id)
    .query(`
      UPDATE ARVRegimens
      SET 
        is_active = @is_active 
      WHERE arv_regimen_id = @id;

      SELECT * FROM ARVRegimens WHERE arv_regimen_id = @id;
    `);

  return result.recordset[0];  
};

module.exports = {
  setActiveARV,
  updateARV,
  createARV,
  getAllARVRegimens,
  getARVRegimenById,
};
