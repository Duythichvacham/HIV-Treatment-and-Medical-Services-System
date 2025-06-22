const { poolPromise } = require('../config/db');

//POST, cập nhật status cho appointments
exports.updateAppointmentStatus = async (appointment_id, status) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('appointment_id', appointment_id)
    .input('status', status)
    .query('UPDATE Appointments SET status = @status WHERE appointment_id = @appointment_id; SELECT * FROM Appointments WHERE appointment_id = @appointment_id');
  return result.recordset[0];
};


// Tạo mới lịch hẹn (appointment)
exports.createAppointment = async (data) => {
  const pool = await poolPromise;
  const { patient_id, doctor_id, slot_id, service_id, status, room_id, bookingDate } = data;
  let queue_number = 1;

  if (doctor_id && slot_id) {
    // Đặt lịch bác sĩ: queue_number theo slot, mỗi slot 6 số, không trùng trong ngày
    // Lấy slot_index (thứ tự slot trong ngày)
    const slotIndexResult = await pool.request()
      .input('slot_id', slot_id)
      .query('SELECT slot_id FROM Slots ORDER BY slot_id ASC');
    let slot_index = 1;
    if (slotIndexResult.recordset.length > 0) {
      slot_index = slotIndexResult.recordset.findIndex(s => s.slot_id === slot_id) + 1;
    }
    // Đếm số lượng đã đặt trong slot này của ngày này
    const countResult = await pool.request()
      .input('slot_id', slot_id)
      .input('bookingDate', bookingDate)
      .query('SELECT COUNT(*) AS count FROM Appointments WHERE slot_id = @slot_id AND bookingDate = @bookingDate');
    const count = countResult.recordset[0].count;
    // Mỗi slot 6 số, bắt đầu từ (slot_index-1)*6+1
    queue_number = (slot_index - 1) * 6 + count + 1;
  } else {
    // Đặt lịch xét nghiệm: queue_number tăng dần trong ngày
    const countResult = await pool.request()
      .input('bookingDate', bookingDate)
      .query('SELECT COUNT(*) AS count FROM Appointments WHERE slot_id IS NULL AND bookingDate = @bookingDate');
    const count = countResult.recordset[0].count;
    queue_number = count + 1;
  }

  const result = await pool.request()
    .input('patient_id', patient_id)
    .input('doctor_id', doctor_id)
    .input('slot_id', slot_id)
    .input('service_id', service_id)
    .input('status', status || 'requested')
    .input('queue_number', queue_number)
    .input('room_id', room_id)
    .input('bookingDate', bookingDate)
    .query(`
      INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, queue_number, room_id, bookingDate)
      VALUES (@patient_id, @doctor_id, @slot_id, @service_id, @status, @queue_number, @room_id, @bookingDate);
      SELECT * FROM Appointments WHERE appointment_id = SCOPE_IDENTITY();
    `);
  return result.recordset[0];
};


//GET, lấy bệnh nhân chờ xét nghiệm với service_type='test' /api/v1/lab/appointments/queue
exports.getLabTestQueue = async () => {
  const pool = await poolPromise;
  const result = await pool.request()
    .query(`
      SELECT 
        a.appointment_id,
        a.queue_number,
        a.status,
        a.created_at,
        p.full_name as patient_name,
        p.phone as patient_phone,
        s.name as service_name,
        s.service_type,
        tt.name as test_type_name,
        tt.unit,
        tt.normal_range      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Services s ON a.service_id = s.service_id
      LEFT JOIN TestTypes tt ON s.test_type_id = tt.test_type_id
      WHERE s.service_type = 'test'
      AND a.status = 'requested'
      ORDER BY a.created_at ASC
    `);
  return result.recordset;
};

// Lấy danh sách bệnh nhân đang xét nghiệm (status = 'in_progress')
exports.getLabTestInProgress = async () => {
  const pool = await poolPromise;
  const result = await pool.request()
    .query(`
      SELECT 
        a.appointment_id,
        a.queue_number,
        a.status,
        a.created_at,
        p.full_name as patient_name,
        p.phone as patient_phone,
        s.name as service_name,
        s.service_type,
        tt.name as test_type_name,
        tt.unit,
        tt.normal_range      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Services s ON a.service_id = s.service_id
      LEFT JOIN TestTypes tt ON s.test_type_id = tt.test_type_id
      WHERE s.service_type = 'test'
      AND a.status = 'in_progress'
      ORDER BY a.created_at ASC
    `);
  return result.recordset;
};

///api/v1/lab/appointments/finished (GET, lấy bệnh nhân hoàn thành XN)
exports.getLabTestFinished = async () => {
  const pool = await poolPromise;
  const result = await pool.request()
    .query(`
      SELECT 
        a.appointment_id,
        a.queue_number,
        a.status,
        a.created_at,
        p.full_name as patient_name,
        p.phone as patient_phone,
        s.name as service_name,
        s.service_type,
        tt.name as test_type_name,
        tt.unit,
        tt.normal_range      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Services s ON a.service_id = s.service_id
      LEFT JOIN TestTypes tt ON s.test_type_id = tt.test_type_id
      WHERE s.service_type = 'test'
      AND a.status = 'completed'
      ORDER BY a.created_at ASC
    `);
  return result.recordset;
};

 exports.getAllByUser = async (patientId) => {
  const pool = await poolPromise;
  const result = await pool.request()
  .input('patientId', patientId)

  .query(`
     
SELECT  [appointment_id]
      ,[patient_id]
      ,[doctor_id]
      ,[slot_id]
      ,[status]
      ,[queue_number]
      ,[room_id]
      ,[created_at]
  FROM [HIV_HEATH_CARE].[dbo].[Appointments]
  WHERE [patient_id] =@patientId
   `);

  return result.recordset;
};

