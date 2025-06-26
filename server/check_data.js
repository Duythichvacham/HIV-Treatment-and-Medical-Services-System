const { poolPromise } = require('./src/config/db');

async function checkData() {
  try {
    const pool = await poolPromise;
    
    // Kiểm tra TestNotes
    console.log('=== TestNotes ===');
    const testNotes = await pool.request().query('SELECT TOP 5 * FROM TestNotes');
    console.log('TestNotes:', JSON.stringify(testNotes.recordset, null, 2));
    
    // Kiểm tra TestResults
    console.log('\n=== TestResults ===');
    const testResults = await pool.request().query('SELECT TOP 5 * FROM TestResults');
    console.log('TestResults:', JSON.stringify(testResults.recordset, null, 2));
    
    // Kiểm tra Appointments có service_type = 'test'
    console.log('\n=== Appointments with test services ===');
    const testAppointments = await pool.request().query(`
      SELECT a.appointment_id, a.patient_id, a.service_id, a.status, s.name as service_name, s.service_type
      FROM Appointments a
      JOIN Services s ON a.service_id = s.service_id
      WHERE s.service_type = 'test'
      ORDER BY a.appointment_id DESC
    `);
    console.log('Test Appointments:', JSON.stringify(testAppointments.recordset, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkData(); 