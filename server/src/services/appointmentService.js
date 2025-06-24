const { poolPromise } = require("../config/db");
const { getQueueNumber } = require("./bookingServices");

//POST, cập nhật status cho appointments
exports.updateAppointmentStatus = async (appointment_id, status) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("appointment_id", appointment_id)
    .input("status", status)
    .query(
      "UPDATE Appointments SET status = @status WHERE appointment_id = @appointment_id; SELECT * FROM Appointments WHERE appointment_id = @appointment_id"
    );
  return result.recordset[0];
};

// Tạo mới lịch hẹn (appointment)
exports.createAppointment = async (data) => {
  const pool = await poolPromise;
  const {
    patient_id,
    doctor_id,
    slot_id,
    service_id,
    status,
    room_id,
    bookingDate,
  } = data;

  // Kiểm tra bệnh nhân đã có lịch khám chưa hoàn thành trong ngày chưa
  const existResult = await pool
    .request()
    .input("patient_id", patient_id)
    .input("bookingDate", bookingDate).query(`
      SELECT COUNT(*) AS count
      FROM Appointments
      WHERE patient_id = @patient_id
        AND bookingDate = @bookingDate
        AND status IN ('requested', 'in_progress')
    `);
  if (existResult.recordset[0].count > 0) {
    const err = new Error(
      "Bệnh nhân đã có lịch khám chưa hoàn thành trong ngày này. Vui lòng hoàn thành hoặc hủy lịch cũ trước khi đặt mới."
    );
    err.statusCode = 400;
    throw err;
  }

  // Sử dụng logic dùng chung để lấy queue_number
  const queue_number = await getQueueNumber({
    pool,
    doctorId: doctor_id,
    slotId: slot_id,
    bookingDate,
  });

  const result = await pool
    .request()
    .input("patient_id", patient_id)
    .input("doctor_id", doctor_id)
    .input("slot_id", slot_id)
    .input("service_id", service_id)
    .input("status", status || "requested")
    .input("queue_number", queue_number)
    .input("room_id", room_id)
    .input("bookingDate", bookingDate).query(`
      INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, queue_number, room_id, bookingDate)
      VALUES (@patient_id, @doctor_id, @slot_id, @service_id, @status, @queue_number, @room_id, @bookingDate);
      SELECT * FROM Appointments WHERE appointment_id = SCOPE_IDENTITY();
    `);
  return result.recordset[0];
};

//GET, lấy bệnh nhân chờ xét nghiệm với service_type='test' /api/v1/lab/appointments/queue
exports.getLabTestQueue = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
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
      LEFT JOIN ServicesTestTypes stt ON s.service_id = stt.service_id
      LEFT JOIN TestTypes tt ON stt.test_type_id = tt.test_type_id
      WHERE s.service_type = 'test'
      AND a.status = 'requested'
      ORDER BY a.created_at ASC
    `);
  return result.recordset;
};

// Lấy danh sách bệnh nhân đang xét nghiệm (status = 'in_progress')
exports.getLabTestInProgress = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
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
      LEFT JOIN ServicesTestTypes stt ON s.service_id = stt.service_id
      LEFT JOIN TestTypes tt ON stt.test_type_id = tt.test_type_id
      WHERE s.service_type = 'test'
      AND a.status = 'in_progress'
      ORDER BY a.created_at ASC
    `);
  return result.recordset;
};

///api/v1/lab/appointments/finished (GET, lấy bệnh nhân hoàn thành XN)
exports.getLabTestFinished = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
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
      LEFT JOIN ServicesTestTypes stt ON s.service_id = stt.service_id
      LEFT JOIN TestTypes tt ON stt.test_type_id = tt.test_type_id
      WHERE s.service_type = 'test'
      AND a.status = 'completed'
      ORDER BY a.created_at ASC
    `);
  return result.recordset;
};

exports.getAllByUser = async (patientId) => {
  const pool = await poolPromise;
  const result = await pool.request().input("patientId", patientId).query(`
     
SELECT  a.appointment_id
      ,a.patient_id
      ,s.start_time
      ,s.end_time
      ,sv.name as service_name
      ,sv.service_type
      ,a.status
      ,a.queue_number
      ,a.bookingDate
      ,a.created_at
      ,d.full_name as doctor_name
  FROM Appointments as a 
  LEFT JOIN Slots as s ON a.slot_id = s.slot_id
  LEFT JOIN Services as sv ON a.service_id = sv.service_id
  LEFT JOIN Rooms as r ON a.room_id = r.room_id
  LEFT JOIN Doctors as d ON a.doctor_id = d.doctor_id
  WHERE a.patient_id =@patientId
   `);

  return result.recordset.map((appointment) => {
    return {
      appointment_id: appointment.appointment_id,
      patient_id: appointment.patient_id,
      status: appointment.status,
      queue_number: appointment.queue_number,
      service_name: appointment.service_name,
      service_type: appointment.service_type,
      room: appointment.room_name,
      bookingDate: appointment.bookingDate.toISOString(),
      created_at: appointment.created_at.toISOString(),
      // spread operator để lấy các trường từ slot or doctor nếu có
      ...(appointment.service_type === "examination"
        ? {
            doctor_name: appointment.doctor_name,
            start_time: appointment.start_time.toISOString(),
            end_time: appointment.end_time.toISOString(),
          }
        : {}),
    };
  });
};
// chưa check - thằng này cho manager để quản lý lịch hẹn của tất cả bệnh nhân
exports.getAllAppointments = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT a.*, p.full_name as patient_name, s.name as service_name, r.room_name, d.full_name as doctor_name
      FROM Appointments a
      LEFT JOIN Patients p ON a.patient_id = p.patient_id
      LEFT JOIN Services s ON a.service_id = s.service_id
      LEFT JOIN Rooms r ON a.room_id = r.room_id
      LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
      ORDER BY a.created_at DESC
    `);
  return result.recordset;
};
// Lấy chi tiết lịch hẹn theo appointment_id
exports.getAppointmentDetail = async (appointment_id) => {
  const pool = await poolPromise;
  const result = await pool.request().input("appointment_id", appointment_id)
    .query(`
      SELECT a.*, p.full_name as patient_name, s.name as service_name, r.room_name, d.full_name as doctor_name
      FROM Appointments a
      LEFT JOIN Patients p ON a.patient_id = p.patient_id
      LEFT JOIN Services s ON a.service_id = s.service_id
      LEFT JOIN Rooms r ON a.room_id = r.room_id
      LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
      WHERE a.appointment_id = @appointment_id
    `);
  return result.recordset[0];
};
