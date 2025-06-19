const { poolPromise } = require("../config/db");

const getAllSlots = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`SELECT * FROM Slots ORDER BY start_time`);

    return result.recordset;
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ message: "Failed to fetch slots" });
  }
};

module.exports = { getAllSlots };
