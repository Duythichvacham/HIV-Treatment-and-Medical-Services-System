const { poolPromise } = require("../config/db");

exports.confirmPayment = async (invoiceId) => {
  const pool = await poolPromise;
  const result = await pool.request()
  .input('invoiceId', invoiceId)

  .query(`
     

    -- 1. Cập nhật hóa đơn thành 'paid' và issued_at = thời điểm hiện tại
    UPDATE Invoices
    SET status = 'paid',
        issued_at = GETDATE()
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
      ;
};
exports.cancelBooking = async (invoiceId) => {
    const pool = await poolPromise;
    const result = await pool.request()
    .input('invoiceId', invoiceId)
  
    .query(`
       
  
  -- 1. Cập nhật trạng thái hóa đơn thành 'paid'
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
          message: "Hùy lịch thành công !",
        
        };
        ;
  };




exports.confirmPayment = async (invoiceId) => {
  const pool = await poolPromise;
  await pool.request()
    .input('invoiceId', invoiceId)
    .query(`
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
  await pool.request()
    .input('invoiceId', invoiceId)
    .query(`
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

exports.createBooking = async ({ patientId, doctorId, bookingDate, slotId, serviceId }) => {
  const pool = await poolPromise;

  // Bước 1: Xác định room_id
  let roomId;
  if (doctorId) {
    const shiftResult = await pool.request()
      .input('doctorId', doctorId)
      .input('bookingDate', bookingDate)
      .query(`
        SELECT TOP 1 room_id 
        FROM WorkingShifts 
        WHERE doctor_id = @doctorId 
          AND shift_date = @bookingDate 
          AND status = 'approved'
      `);

    if (shiftResult.recordset.length === 0) {
      throw new Error('Không tìm thấy ca làm việc phù hợp cho bác sĩ');
    }

    roomId = shiftResult.recordset[0].room_id;
  } else {
    const roomResult = await pool.request().query(`
      SELECT TOP 1 room_id 
      FROM Rooms 
      WHERE room_type = N'Khám'
    `);

    if (roomResult.recordset.length === 0) {
      throw new Error('Không tìm thấy phòng khám phù hợp');
    }

    roomId = roomResult.recordset[0].room_id;
  }

  // Bước 2: Lấy thông tin giá từ service
  const serviceResult = await pool.request()
    .input('serviceId', serviceId)
    .query(`SELECT price FROM Services WHERE service_id = @serviceId`);

  if (serviceResult.recordset.length === 0) {
    throw new Error('Không tìm thấy dịch vụ tương ứng');
  }

  const price = serviceResult.recordset[0].price;

  // Bước 3: Tính queue_number theo ngày
  let queueNumberQuery = `
    SELECT COUNT(*) AS count
    FROM Appointments
    WHERE bookingDate = @bookingDate
  `;

  if (doctorId) {
    queueNumberQuery += ` AND doctor_id = @doctorId`;
  }

  const queueResult = await pool.request()
    .input('bookingDate', bookingDate)
    .input('doctorId', doctorId || null)
    .query(queueNumberQuery);

  const queueNumber = (queueResult.recordset[0].count || 0) + 1;

  // Bước 4: Tạo appointment
  const appointmentInsert = await pool.request()
    .input('patientId', patientId)
    .input('doctorId', doctorId || null)
    .input('slotId', slotId)
    .input('serviceId', serviceId)
    .input('status', 'requested')
    .input('queueNumber', queueNumber)
    .input('roomId', roomId)
    .input('bookingDate', bookingDate)
    .query(`
      INSERT INTO Appointments 
        (patient_id, doctor_id, slot_id, service_id, status, queue_number, room_id, bookingDate)
      OUTPUT INSERTED.appointment_id
      VALUES 
        (@patientId, @doctorId, @slotId, @serviceId, @status, @queueNumber, @roomId, @bookingDate)
    `);

  const appointmentId = appointmentInsert.recordset[0].appointment_id;

  // Bước 5: Tạo hóa đơn
  await pool.request()
    .input('patientId', patientId)
    .input('appointmentId', appointmentId)
    .input('amount', price)
    .input('serviceType', 'examination')
    .input('status', 'pending')
    .query(`
      INSERT INTO Invoices 
        (patient_id, appointment_id, amount, service_type, status)
      VALUES 
        (@patientId, @appointmentId, @amount, @serviceType, @status)
    `);

  return {
    message: 'Tạo lịch hẹn và hóa đơn thành công',
    appointmentId
  };
};
