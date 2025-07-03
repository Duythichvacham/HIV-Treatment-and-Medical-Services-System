const { poolPromise } = require("./server/src/config/db");

async function checkUsers() {
  try {
    const pool = await poolPromise;

    console.log("🔍 Checking users in database...\n");

    const result = await pool.request().query(`
      SELECT 
        account_id,
        username, 
        password_hash,
        role,
        status
      FROM Accounts 
      WHERE role = 'Doctor'
      ORDER BY account_id
    `);

    console.log(`Found ${result.recordset.length} doctor accounts:`);
    result.recordset.forEach((account, index) => {
      console.log(`${index + 1}. Account ID: ${account.account_id}`);
      console.log(`   Username: ${account.username}`);
      console.log(`   Role: ${account.role}`);
      console.log(`   Status: ${account.status}`);
      console.log(
        `   Password Hash: ${account.password_hash.substring(0, 20)}...`
      );
      console.log("");
    });

    // Kiểm tra doctor details
    console.log("🩺 Checking doctor details...\n");

    const doctorResult = await pool.request().query(`
      SELECT 
        d.doctor_id,
        d.account_id,
        d.full_name,
        d.email,
        d.phone,
        a.username
      FROM Doctors d
      JOIN Accounts a ON d.account_id = a.account_id
      ORDER BY d.doctor_id
    `);

    console.log(`Found ${doctorResult.recordset.length} doctors:`);
    doctorResult.recordset.forEach((doctor, index) => {
      console.log(`${index + 1}. Doctor ID: ${doctor.doctor_id}`);
      console.log(`   Account ID: ${doctor.account_id}`);
      console.log(`   Username: ${doctor.username}`);
      console.log(`   Full Name: ${doctor.full_name}`);
      console.log(`   Email: ${doctor.email}`);
      console.log(`   Phone: ${doctor.phone}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Database error:", error);
  }
}

checkUsers();
