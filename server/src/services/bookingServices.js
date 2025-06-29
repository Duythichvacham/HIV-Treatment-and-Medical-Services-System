const { poolPromise } = require("../config/db");
const queueService = require("./queueService");

// Validation rules cho đặt lịch
const validateAppointmentRules = async (
  pool,
  patient_id,
  service_id,
  bookingDate,
  doctor_id = null
) => {
  // Chỉ kiểm tra duplicate xét nghiệm
  const serviceResult = await pool
    .request()
    .input("serviceId", service_id)
    .query("SELECT service_type FROM Services WHERE service_id = @serviceId");

  if (serviceResult.recordset.length === 0) {
    throw new Error("Không tìm thấy dịch vụ");
  }

  // Chỉ check duplicate cho xét nghiệm
  if (serviceResult.recordset[0].service_type === "test") {
    const pendingCount = await pool
      .request()
      .input("patient_id", patient_id)
      .input("service_id", service_id).query(`
        SELECT COUNT(*) AS count
        FROM Appointments a
        WHERE a.patient_id = @patient_id
          AND a.service_id = @service_id
          AND a.status IN ('requested', 'in_progress')
      `);

    if (pendingCount.recordset[0].count > 0) {
      throw new Error(
        "Không thể đặt xét nghiệm mới khi còn xét nghiệm cùng loại chưa hoàn thành"
      );
    }
  }
  return true;
};

exports.confirmPayment = async (invoiceId) => {
  const pool = await poolPromise;
  await pool.request().input("invoiceId", invoiceId).query(`
      -- 1. Cập nhật trạng thái hóa đơn thành 'paid'
      UPDATE Invoices
      SET status = 'paid', issued_at = GETDATE()
      WHERE invoice_id = @invoiceId;

      -- 2. Cập nhật luôn trạng thái Appointment nếu tồn tại
      UPDATE Appointments
      SET status = 'in_progress'
      WHERE appointment_id = (
        SELECT appointment_id
        FROM Invoices
        WHERE invoice_id = @invoiceId AND appointment_id IS NOT NULL
      );
    `);

  return {
    success: true,
    message: "Thanh toán thành công",
  };
};

exports.cancelBooking = async (invoiceId) => {
  const pool = await poolPromise;
  await pool.request().input("invoiceId", invoiceId).query(`
      -- 1. Cập nhật trạng thái hóa đơn thành 'cancelled'
      UPDATE Invoices
      SET status = 'cancelled'
      WHERE invoice_id = @invoiceId;

      -- 2. Cập nhật luôn trạng thái Appointment nếu tồn tại
      UPDATE Appointments
      SET status = 'cancelled'
      WHERE appointment_id = (
        SELECT appointment_id
        FROM Invoices
        WHERE invoice_id = @invoiceId AND appointment_id IS NOT NULL
      );
    `);

  return {
    success: true,
    message: "Huỷ lịch thành công!",
  };
};

exports.createBooking = async ({
  patientId,
  doctorId,
  bookingDate,
  slotId,
  serviceId,
}) => {
  const pool = await poolPromise;

  // Bước 0: Áp dụng validation rules mới
  await validateAppointmentRules(
    pool,
    patientId,
    serviceId,
    bookingDate,
    doctorId
  );

  // Bước 0.5: Kiểm tra duplicate booking (thêm validation cuối cùng)
  const duplicateCheck = await pool
    .request()
    .input("patientId", patientId)
    .input("serviceId", serviceId)
    .input("bookingDate", bookingDate)
    .input("doctorId", doctorId || null)
    .input("slotId", slotId || null).query(`
      SELECT COUNT(*) AS count
      FROM Appointments
      WHERE patient_id = @patientId
        AND service_id = @serviceId
        AND bookingDate = @bookingDate
        AND doctor_id = @doctorId
        AND (slot_id = @slotId OR (slot_id IS NULL AND @slotId IS NULL))
        AND status IN ('requested', 'in_progress')
    `);

  if (duplicateCheck.recordset[0].count > 0) {
    throw new Error(
      "Bạn đã có lịch hẹn tương tự trong ngày này. Vui lòng kiểm tra lại."
    );
  }

  // Bước 1: Xác định room_id
  let roomId;
  if (doctorId) {
    const shiftResult = await pool
      .request()
      .input("doctorId", doctorId)
      .input("bookingDate", bookingDate).query(`
        SELECT TOP 1 room_id 
        FROM WorkingShifts 
        WHERE doctor_id = @doctorId 
          AND shift_date = @bookingDate 
          AND status = 'approved'
      `);

    if (shiftResult.recordset.length === 0) {
      throw new Error("Không tìm thấy ca làm việc phù hợp cho bác sĩ");
    }

    roomId = shiftResult.recordset[0].room_id;
  } else {
    // Random phòng xét nghiệm
    const roomResult = await pool.request().query(`
      SELECT TOP 1 room_id 
      FROM Rooms 
      WHERE room_type = N'Xét nghiệm'
      ORDER BY NEWID()
    `);

    if (roomResult.recordset.length === 0) {
      throw new Error("Không tìm thấy phòng xét nghiệm phù hợp");
    }

    roomId = roomResult.recordset[0].room_id;
  }

  // Bước 2: Lấy thông tin giá từ service
  const serviceResult = await pool
    .request()
    .input("serviceId", serviceId)
    .query(`SELECT price FROM Services WHERE service_id = @serviceId`);

  if (serviceResult.recordset.length === 0) {
    throw new Error("Không tìm thấy dịch vụ tương ứng");
  }

  const price = serviceResult.recordset[0].price;

  // Bước 3: Tạo appointment trước
  const appointmentInsert = await pool
    .request()
    .input("patientId", patientId)
    .input("doctorId", doctorId || null)
    .input("slotId", slotId)
    .input("serviceId", serviceId)
    .input("status", "requested")
    .input("roomId", roomId)
    .input("bookingDate", bookingDate).query(`
      INSERT INTO Appointments 
        (patient_id, doctor_id, slot_id, service_id, status, room_id, bookingDate)
      OUTPUT INSERTED.appointment_id
      VALUES 
        (@patientId, @doctorId, @slotId, @serviceId, @status, @roomId, @bookingDate)
    `);

  const appointmentId = appointmentInsert.recordset[0].appointment_id;

  // Bước 4: Tạo queue number cho appointment
  let queueInfo = null;
  try {
    const queueType = doctorId ? "examination" : "test";
    queueInfo = await queueService.createQueueNumber({
      queue_type: queueType,
      appointment_id: appointmentId,
      request_id: null,
      doctor_id: doctorId || null,
      slot_id: slotId || null,
      queue_date: new Date(bookingDate),
    });
  } catch (queueError) {
    console.error("Error creating queue number:", queueError);
    // Không throw error vì appointment đã được tạo thành công
  }

  // Bước 5: Tạo hóa đơn
  await pool
    .request()
    .input("patientId", patientId)
    .input("appointmentId", appointmentId)
    .input("amount", price)
    .input("serviceType", doctorId ? "examination" : "test")
    .input("status", "pending").query(`
      INSERT INTO Invoices 
        (patient_id, appointment_id, amount, service_type, status)
      VALUES 
        (@patientId, @appointmentId, @amount, @serviceType, @status)
    `);

  return {
    message: "Tạo lịch hẹn và hóa đơn thành công",
    appointmentId,
    queue_info: queueInfo, // Trả về thông tin queue number cho frontend
  };
};

// Export validation function
exports.validateAppointmentRules = validateAppointmentRules;
