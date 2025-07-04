const { poolPromise } = require("../config/db");
const queueService = require("./queues/queueService");

//POST, cập nhật status cho appointments
exports.updateAppointmentStatus = async (appointment_id, status) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("appointment_id", appointment_id)
    .input("status", status)
    .query(
      "UPDATE Appointments SET status = @status WHERE appointment_id = @appointment_id; SELECT a.*, r.room_name FROM Appointments a LEFT JOIN Rooms r ON a.room_id = r.room_id WHERE a.appointment_id = @appointment_id"
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

  // 1. Tạo appointment trước
  const result = await pool
    .request()
    .input("patient_id", patient_id)
    .input("doctor_id", doctor_id)
    .input("slot_id", slot_id)
    .input("service_id", service_id)
    .input("status", status || "requested")
    .input("room_id", room_id)
    .input("bookingDate", bookingDate).query(`
      INSERT INTO Appointments (patient_id, doctor_id, slot_id, service_id, status, room_id, bookingDate)
      VALUES (@patient_id, @doctor_id, @slot_id, @service_id, @status, @room_id, @bookingDate);
      SELECT * FROM Appointments WHERE appointment_id = SCOPE_IDENTITY();
    `);

  const appointment = result.recordset[0];

  // 2. Lấy queue number từ queueService
  let queueNumber = 1;

  try {
    // Lấy thông tin service để xác định loại
    const serviceInfo = await this.getServiceInfo(service_id);

    if (
      serviceInfo.service_type === "examination" ||
      serviceInfo.service_type === "consultation"
    ) {
      // Cho khám bệnh/tư vấn: cần doctor_id và slot_id
      queueNumber = await queueService.getNextQueueNumber(
        serviceInfo.service_type,
        doctor_id,
        slot_id
      );
    } else if (serviceInfo.service_type === "test") {
      // Cho xét nghiệm: queue chung (không cần doctor_id, slot_id)
      queueNumber = await queueService.getNextQueueNumber("test");
    }
  } catch (error) {
    console.error("Error getting queue number:", error);
    // Fallback to 1 if queueService fails
    queueNumber = 1;
  }

  // 3. Lấy thông tin room_name để trả về cho frontend
  const pool2 = await poolPromise;
  const roomResult = await pool2
    .request()
    .input("roomId", room_id)
    .query("SELECT room_name FROM Rooms WHERE room_id = @roomId");

  const room_name = roomResult.recordset[0]?.room_name || "Chưa xác định";

  // 4. Trả về appointment với queue number và room_name
  return {
    ...appointment,
    queue_number: queueNumber,
    room_name: room_name,
  };
};
exports.getServiceInfo = async (serviceId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("serviceId", serviceId)
    .query(
      "SELECT service_type, price FROM Services WHERE service_id = @serviceId"
    );

  if (result.recordset.length === 0) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  return result.recordset[0];
};
exports.validateExaminationBooking = async (doctorId, slotId, bookingDate) => {
  const pool = await poolPromise;

  // Kiểm tra working shift
  const shiftResult = await pool
    .request()
    .input("doctor_id", doctorId)
    .input("bookingDate", bookingDate)
    .query(
      "SELECT TOP 1 room_id FROM WorkingShifts WHERE doctor_id = @doctor_id AND shift_date = @bookingDate AND status = 'approved'"
    );

  if (shiftResult.recordset.length === 0) {
    throw new Error("DOCTOR_NOT_ASSIGNED");
  }

  const roomId = shiftResult.recordset[0].room_id;

  // Lấy max_number từ QueueNumbers thay vì WorkingShifts
  const queueResult = await pool
    .request()
    .input("doctor_id", doctorId)
    .input("slot_id", slotId)
    .query(
      "SELECT max_number FROM QueueNumbers WHERE queue_type = 'examination' AND doctor_id = @doctor_id AND slot_id = @slot_id"
    );

  // Nếu không tìm thấy queue config, sử dụng default 6
  const maxPatientsPerSlot =
    queueResult.recordset.length > 0 ? queueResult.recordset[0].max_number : 6;

  // Kiểm tra slot availability
  const slotCountResult = await pool
    .request()
    .input("doctor_id", doctorId)
    .input("bookingDate", bookingDate)
    .input("slot_id", slotId)
    .query(
      "SELECT COUNT(*) AS count FROM Appointments WHERE doctor_id = @doctor_id AND bookingDate = @bookingDate AND slot_id = @slot_id AND status IN ('requested', 'in_progress')"
    );

  const currentBookings = slotCountResult.recordset[0].count;
  if (currentBookings >= maxPatientsPerSlot) {
    throw new Error("SLOT_FULL");
  }

  return roomId;
};
exports.getAvailableTestRoom = async (bookingDate) => {
  const pool = await poolPromise;
  const result = await pool.request().input("bookingDate", bookingDate).query(`
      SELECT r.room_id, COUNT(a.appointment_id) as patient_count
      FROM Rooms r
      LEFT JOIN Appointments a ON r.room_id = a.room_id 
        AND a.bookingDate = @bookingDate 
        AND a.status IN ('requested', 'in_progress')
      WHERE r.room_type = N'Xét nghiệm'
      GROUP BY r.room_id
      ORDER BY patient_count ASC
    `);

  if (result.recordset.length === 0) {
    throw new Error("NO_TEST_ROOM_AVAILABLE");
  }

  return result.recordset[0].room_id;
};
exports.getPatientIdByAccountId = async (accountId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("accountId", accountId)
    .query("SELECT patient_id FROM Patients WHERE account_id = @accountId");

  if (result.recordset.length === 0) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  return result.recordset[0].patient_id;
};

// Function tổng hợp để tạo appointment từ accountId
exports.createAppointmentFromAccount = async (accountId, appointmentData) => {
  const { doctor_id, slot_id, service_id, room_id, bookingDate } =
    appointmentData;

  // Validate cơ bản
  if (!service_id || !bookingDate) {
    throw new Error("MISSING_BASIC_INFO");
  }

  // 1. Lấy patient_id từ accountId
  const patient_id = await this.getPatientIdByAccountId(accountId);

  // 2. Lấy thông tin service
  const service = await this.getServiceInfo(service_id);

  let finalRoomId = room_id;

  // 3. Xử lý theo loại dịch vụ
  if (service.service_type === "examination") {
    if (!doctor_id || !slot_id) {
      throw new Error("MISSING_DOCTOR_SLOT_INFO");
    }
    finalRoomId = await this.validateExaminationBooking(
      doctor_id,
      slot_id,
      bookingDate
    );
  } else if (service.service_type === "test") {
    finalRoomId = await this.getAvailableTestRoom(bookingDate);
  }

  // 4. Tạo appointment (đã bao gồm queue number)
  const appointment = await this.createAppointment({
    patient_id,
    doctor_id,
    slot_id,
    service_id,
    status: "requested",
    room_id: finalRoomId,
    bookingDate,
  });

  // 5. Tạo Invoice (thêm logic này)
  const pool = await poolPromise;
  const invoiceResult = await pool
    .request()
    .input("patientId", patient_id)
    .input("appointmentId", appointment.appointment_id)
    .input("amount", service.price)
    .input("serviceType", service.service_type)
    .input("status", "pending").query(`
      INSERT INTO Invoices 
        (patient_id, appointment_id, amount, service_type, status)
      VALUES 
        (@patientId, @appointmentId, @amount, @serviceType, @status);
      SELECT SCOPE_IDENTITY() as invoice_id;
    `);

  const invoice_id = invoiceResult.recordset[0].invoice_id;

  // 6. Lấy thông tin đầy đủ cho response (bao gồm doctor_name, room_name)
  const pool2 = await poolPromise;
  const fullInfoResult = await pool2
    .request()
    .input("appointmentId", appointment.appointment_id).query(`
      SELECT a.*, 
             r.room_name,
             d.full_name as doctor_name,
             s.name as service_name
      FROM Appointments a
      LEFT JOIN Rooms r ON a.room_id = r.room_id
      LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN Services s ON a.service_id = s.service_id
      WHERE a.appointment_id = @appointmentId
    `);

  const fullAppointmentInfo = fullInfoResult.recordset[0];

  return {
    ...fullAppointmentInfo,
    invoice_id,
  };
};

exports.getAllByUser = async (accountId) => {
  const pool = await poolPromise;

  const patientId = await this.getPatientIdByAccountId(accountId);
  const result = await pool.request().input("patientId", patientId).query(`
     
SELECT  a.appointment_id
      ,a.patient_id
      ,s.start_time
      ,s.end_time
      ,sv.name as service_name
      ,sv.service_type
      ,a.status
      ,a.doctor_id
      ,a.slot_id
      ,a.bookingDate
      ,a.created_at
      ,r.room_name
      ,d.full_name as doctor_name
  FROM Appointments as a 
  LEFT JOIN Slots as s ON a.slot_id = s.slot_id
  LEFT JOIN Services as sv ON a.service_id = sv.service_id
  LEFT JOIN Rooms as r ON a.room_id = r.room_id
  LEFT JOIN Doctors as d ON a.doctor_id = d.doctor_id
  WHERE a.patient_id =@patientId
   `);

  // Sử dụng QueueService để tính queue_number thống nhất
  const appointmentsWithQueue = await Promise.all(
    result.recordset.map(async (appointment) => {
      let queueNumber = 1; // default fallback

      try {
        if (
          appointment.service_type === "examination" &&
          appointment.doctor_id &&
          appointment.slot_id
        ) {
          queueNumber = await queueService.getCurrentQueueNumber(
            "examination",
            appointment.doctor_id,
            appointment.slot_id
          );
        } else if (appointment.service_type === "test") {
          queueNumber = await queueService.getCurrentQueueNumber("test");
        }
      } catch (error) {
        // Fallback to ROW_NUMBER logic if QueueService fails
        queueNumber = 1;
      }

      return {
        appointment_id: appointment.appointment_id,
        patient_id: appointment.patient_id,
        status: appointment.status,
        queue_number: queueNumber,
        service_name: appointment.service_name,
        service_type: appointment.service_type,
        room: appointment.room_name,
        bookingDate: appointment.bookingDate
          ? appointment.bookingDate.toISOString()
          : null,
        created_at: appointment.created_at
          ? appointment.created_at.toISOString()
          : null,
        // spread operator để lấy các trường từ slot or doctor nếu có
        ...(appointment.service_type === "examination"
          ? {
              doctor_name: appointment.doctor_name,
              start_time: appointment.start_time
                ? appointment.start_time.toISOString()
                : null,
              end_time: appointment.end_time
                ? appointment.end_time.toISOString()
                : null,
            }
          : {}),
      };
    })
  );

  return appointmentsWithQueue;
};
// chưa check - thằng này cho manager để quản lý lịch hẹn của tất cả bệnh nhân
exports.getAllAppointments = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT a.*, p.full_name as patient_name, sv.name as service_name, sv.service_type,
             r.room_name, d.full_name as doctor_name
      FROM Appointments a
      LEFT JOIN Patients p ON a.patient_id = p.patient_id
      LEFT JOIN Services sv ON a.service_id = sv.service_id
      LEFT JOIN Rooms r ON a.room_id = r.room_id
      LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
      ORDER BY a.created_at DESC
    `);

  // Thêm queue number cho mỗi appointment
  const appointmentsWithQueue = await Promise.all(
    result.recordset.map(async (appointment) => {
      let queueNumber = 1;

      try {
        if (
          appointment.service_type === "examination" &&
          appointment.doctor_id &&
          appointment.slot_id
        ) {
          queueNumber = await queueService.getCurrentQueueNumber(
            "examination",
            appointment.doctor_id,
            appointment.slot_id
          );
        } else if (
          appointment.service_type === "consultation" &&
          appointment.doctor_id &&
          appointment.slot_id
        ) {
          queueNumber = await queueService.getCurrentQueueNumber(
            "consultation",
            appointment.doctor_id,
            appointment.slot_id
          );
        } else if (appointment.service_type === "test") {
          queueNumber = await queueService.getCurrentQueueNumber("test");
        }
      } catch (error) {
        console.error("Error getting queue number:", error);
        queueNumber = 1;
      }

      return {
        ...appointment,
        queue_number: queueNumber,
      };
    })
  );

  return appointmentsWithQueue;
};
// Lấy chi tiết lịch hẹn theo appointment_id
exports.getAppointmentDetail = async (appointment_id) => {
  const pool = await poolPromise;
  const result = await pool.request().input("appointment_id", appointment_id)
    .query(`
      SELECT a.*, p.full_name as patient_name, sv.name as service_name, sv.service_type, 
             r.room_name, d.full_name as doctor_name, sl.start_time, sl.end_time
      FROM Appointments a
      LEFT JOIN Patients p ON a.patient_id = p.patient_id
      LEFT JOIN Services sv ON a.service_id = sv.service_id
      LEFT JOIN Rooms r ON a.room_id = r.room_id
      LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN Slots sl ON a.slot_id = sl.slot_id
      WHERE a.appointment_id = @appointment_id
    `);

  const appointment = result.recordset[0];
  if (!appointment) {
    return null;
  }

  // Lấy queue number từ queueService
  let queueNumber = 1;
  try {
    if (
      appointment.service_type === "examination" &&
      appointment.doctor_id &&
      appointment.slot_id
    ) {
      queueNumber = await queueService.getCurrentQueueNumber(
        "examination",
        appointment.doctor_id,
        appointment.slot_id
      );
    } else if (
      appointment.service_type === "consultation" &&
      appointment.doctor_id &&
      appointment.slot_id
    ) {
      queueNumber = await queueService.getCurrentQueueNumber(
        "consultation",
        appointment.doctor_id,
        appointment.slot_id
      );
    } else if (appointment.service_type === "test") {
      queueNumber = await queueService.getCurrentQueueNumber("test");
    }
  } catch (error) {
    console.error("Error getting queue number for appointment detail:", error);
    queueNumber = 1;
  }

  // Trả về appointment với queue number
  return {
    ...appointment,
    queue_number: queueNumber,
  };
};
// Kiểm tra lịch hẹn đã tồn tại (cho đặt lịch mới)
exports.checkExistingAppointment = async (
  accountId,
  serviceId,
  bookingDate,
  doctorId = null
) => {
  const pool = await poolPromise;

  // Lấy patient_id từ accountId
  const patientId = await this.getPatientIdByAccountId(accountId);

  // Lấy thông tin service
  const service = await this.getServiceInfo(serviceId);

  if (service.service_type === "examination") {
    // LOGIC CHO KHÁM BỆNH: Không cho đặt 2 lịch khám trong cùng 1 ngày
    const existingExamResult = await pool
      .request()
      .input("patient_id", patientId)
      .input("bookingDate", bookingDate).query(`
        SELECT COUNT(*) AS count
        FROM Appointments a
        JOIN Services s ON a.service_id = s.service_id
        WHERE a.patient_id = @patient_id
          AND CONVERT(date, a.bookingDate) = CONVERT(date, @bookingDate)
          AND s.service_type = 'examination'
          AND a.status IN ('requested', 'in_progress')
      `);

    if (existingExamResult.recordset[0].count > 0) {
      return {
        hasExisting: true,
        type: "examination",
        message:
          "Bạn đã có lịch khám trong ngày này. Vui lòng chọn ngày khác hoặc hủy lịch cũ.",
      };
    }
  } else if (service.service_type === "test") {
    // LOGIC CHO XÉT NGHIỆM: Không cho đặt xét nghiệm cùng loại nếu chưa hoàn thành
    const existingTestResult = await pool
      .request()
      .input("patient_id", patientId)
      .input("service_id", serviceId).query(`
        SELECT COUNT(*) AS count, s.name AS service_name
        FROM Appointments a
        JOIN Services s ON a.service_id = s.service_id
        WHERE a.patient_id = @patient_id
          AND a.service_id = @service_id
          AND a.status IN ('requested', 'in_progress')
        GROUP BY s.name
      `);

    if (
      existingTestResult.recordset.length > 0 &&
      existingTestResult.recordset[0].count > 0
    ) {
      return {
        hasExisting: true,
        type: "test",
        message: `Bạn đã có lịch xét nghiệm "${existingTestResult.recordset[0].service_name}" chưa hoàn thành. Vui lòng hoàn thành trước khi đặt lại.`,
      };
    }
  }

  // Không có conflict
  return {
    hasExisting: false,
    message: "Có thể đặt lịch",
  };
};

// Lấy invoice từ appointment_id
exports.getInvoiceByAppointmentId = async (appointment_id) => {
  const pool = await poolPromise;
  const result = await pool.request().input("appointment_id", appointment_id)
    .query(`
      SELECT i.invoice_id, i.status, i.amount, i.created_at, i.issued_at
      FROM Invoices i 
      WHERE i.appointment_id = @appointment_id
    `);

  return result.recordset[0] || null;
};

// Lấy tất cả cuộc hẹn của bác sĩ, có thể lọc theo status và bookingDate
exports.getDoctorAppointments = async (
  doctorId,
  status,
  bookingDate,
  slot_id,
  patient_id
) => {
  const pool = await poolPromise;
  try {
    const request = pool.request().input("doctorId", parseInt(doctorId, 10));

    // Xây dựng câu query với các điều kiện lọc
    let query = `
      SELECT 
          a.appointment_id,
          a.patient_id,
          p.full_name,
        DATEDIFF(YEAR, p.dob, GETDATE()) AS age,
        p.gender,
        p.phone,
        p.address,
        sl.slot_id,
        CONVERT(VARCHAR(5), sl.start_time, 108) + ' - ' + CONVERT(VARCHAR(5), sl.end_time, 108) AS slot_time,
        s.service_type,
        a.status,
        FORMAT(a.created_at, 'dd-MM-yyyy HH:mm') as created_at,
        a.doctor_id,
        d.full_name as doctor_name,
        FORMAT(a.bookingDate, 'yyyy-MM-dd') as bookingDate
      FROM Appointments a
      JOIN Services s ON a.service_id = s.service_id
      JOIN Patients p on a.patient_id = p.patient_id
      JOIN Slots sl on sl.slot_id = a.slot_id
      join Doctors d on a.doctor_id = d.doctor_id
      WHERE 
          s.service_type = 'examination' 
        and a.doctor_id = @doctorId 
    `;

    // Thêm điều kiện lọc theo status nếu có
    if (status) {
      request.input("status", status);
      query += " AND a.status = @status";
    }

    // Thêm điều kiện lọc theo ngày nếu có
    if (bookingDate) {
      request.input("bookingDate", bookingDate);
      query += " AND CAST(a.bookingDate AS DATE) = @bookingDate";
    }

    // Thêm điều kiện lọc theo slot_id nếu có
    if (slot_id) {
      request.input("slot_id", parseInt(slot_id, 10));
      query += " AND a.slot_id = @slot_id";
    }
    if (patient_id) {
      request.input("patient_id", parseInt(patient_id, 10));
      query += " AND a.patient_id = @patient_id";
    }
    // Sắp xếp
    //query += " ORDER BY a.queue_number ASC";

    const result = await request.query(query);

    return result.recordset || [];
  } catch (error) {
    console.error("Error in getDoctorAppointments:", error);
    throw error;
  }
};

// Lấy danh sách lịch hẹn ngày mai
exports.getTomorrowAppointments = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT a.appointment_id, a.bookingDate, 
           p.full_name, p.email, s.name AS service_name, 
           d.full_name AS doctor_name, r.room_name
    FROM Appointments a
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON a.service_id = s.service_id
    LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
    LEFT JOIN Rooms r ON a.room_id = r.room_id
    WHERE 
      CAST(a.bookingDate AS DATE) = CAST(DATEADD(day, 1, GETDATE()) AS DATE)
      AND a.status = 'requested'
  `);
  return result.recordset;
};
