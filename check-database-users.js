const { poolPromise } = require("./server/src/config/db");

async function checkDatabase() {
  try {
    console.log("🔍 Checking database for users...");

    const pool = await poolPromise;

    // Check users table
    const usersResult = await pool.request().query(`
      SELECT user_id, email, role, full_name 
      FROM Users 
      WHERE role = 'doctor'
    `);

    console.log("\n👨‍⚕️ Doctors in database:");
    console.log(usersResult.recordset);

    // Check if table exists and show sample data
    const allUsersResult = await pool.request().query(`
      SELECT TOP 5 user_id, email, role, full_name 
      FROM Users
    `);

    console.log("\n👥 Sample users (top 5):");
    console.log(allUsersResult.recordset);
  } catch (error) {
    console.error("❌ Database error:", error.message);
  }
}

checkDatabase();
