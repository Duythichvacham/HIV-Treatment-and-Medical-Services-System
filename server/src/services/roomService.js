const { poolPromise } = require("../config/db");
//get available rooms for a working shift
const getAvailableRooms = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT room_id, room_name FROM Rooms WHERE is_active = 1");

    return result.recordset;
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    throw error;
  }
};
module.exports = {
  getAvailableRooms,
};
