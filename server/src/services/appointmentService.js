const { poolPromise } = require("../config/db");
const queueService = require("./queues/queueService");
const invoiceService = require("./invoiceService");

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

  // Lấy max_number từ QueueNumbers
  const queueResult = await pool
    .request()
    .input("doctor_id", doctorId)
    .input("slot_id", slotId)
    .query(
      "SELECT max_number FROM QueueNumbers WHERE queue_type = 'examination' AND doctor_id = @doctor_id AND slot_id = @slot_id"
    );

  // Nếu không tìm thấy queue config, sử dụng default 8
  const maxPatientsPerSlot =
    queueResult.recordset.length > 0 ? queueResult.recordset[0].max_number : 8;

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
  const { doctor_id, slot_id, service_id, bookingDate } = appointmentData;

  // Validate cơ bản
  if (!service_id || !bookingDate) {
    throw new Error("MISSING_BASIC_INFO");
  }

  // 1. Lấy patient_id từ accountId
  const patient_id = await this.getPatientIdByAccountId(accountId);

  // 2. Lấy thông tin service
  const service = await this.getServiceInfo(service_id);

  let finalRoomId;

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

  // 5. Tạo Invoice
  const invoiceResult = await invoiceService.createInvoice({
    appointmentId: appointment.appointment_id,
    patientId: patient_id,
    amount: service.price,
    serviceType: service.service_type,
  });

  const invoice_id = invoiceResult.invoice_id;

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
             r.room_name, d.full_name as doctor_name, sl.start_time, sl.end_time, i.amount as fee
      FROM Appointments a
      LEFT JOIN Patients p ON a.patient_id = p.patient_id
      LEFT JOIN Services sv ON a.service_id = sv.service_id
      LEFT JOIN Rooms r ON a.room_id = r.room_id
      LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN Slots sl ON a.slot_id = sl.slot_id
      LEFT JOIN Invoices i ON a.appointment_id = i.appointment_id
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
// Kiểm tra lịch hẹn đã tồn tại (cho đặt lịch mới),nếu có trước đó chưa hoàn thành thì cancel
exports.checkExistingAppointment = async (
  accountId,
  serviceId,
  bookingDate
) => {
  const pool = await poolPromise;

  // Lấy patient_id từ accountId
  const patientId = await this.getPatientIdByAccountId(accountId);
  await this.cancelOldAppointments(patientId);
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
    // LOGIC CHO XÉT NGHIỆM: Không cho đặt xét nghiệm cùng loại nếu chưa hoàn thành trong ngày
    const existingTestResult = await pool
      .request()
      .input("patient_id", patientId)
      .input("bookingDate", bookingDate)
      .input("service_id", serviceId).query(`
        SELECT COUNT(*) AS count, s.name AS service_name
        FROM Appointments a
        JOIN Services s ON a.service_id = s.service_id
        WHERE a.patient_id = @patient_id
          AND CONVERT(date, a.bookingDate) = CONVERT(date, @bookingDate)
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

// chỉ được gọi khi patient cố đặt lịch khám mới
exports.cancelOldAppointments = async (patientId) => {
  const pool = await poolPromise;
  try {
    const oldAppointmentsResult = await pool
      .request()
      .input("patient_id", patientId).query(`
        SELECT appointment_id 
        FROM Appointments
        WHERE patient_id = @patient_id
          AND status IN ('requested', 'in_progress')
          AND CAST(bookingDate AS DATE) < CAST(GETDATE() AS DATE)
      `);

    const appointmentIdsToCancel = oldAppointmentsResult.recordset.map(
      (row) => row.appointment_id
    );
    if (appointmentIdsToCancel.length === 0) {
      return; // Không có lịch cần hủy thì thoát sớm
    }
    // Tạo chuỗi tham số động cho câu truy vấn IN
    const idParameters = appointmentIdsToCancel
      .map((_, index) => `@id${index}`)
      .join(",");
    const request = pool.request().input("patient_id", patientId);
    // có thể gọi nhiều input trước khi query, nó sẽ thực thi cùng lúc
    appointmentIdsToCancel.forEach((id, index) => {
      request.input(`id${index}`, id);
    });

    // Hủy các lịch hẹn
    await request.query(`
        UPDATE Appointments
        SET status = 'cancelled'
        WHERE appointment_id IN (${idParameters})
          AND patient_id = @patient_id
      `);

    // Hủy các hóa đơn liên quan
    await request.query(`
        UPDATE Invoices
        SET status = 'cancelled'
        WHERE appointment_id IN (${idParameters})
      `);
  } catch (error) {
    console.error("Lỗi khi tự động hủy lịch hẹn cũ:", error);
  }
};
// exports.cancelAppointments()
// Lấy invoice từ appointment_id - sử dụng invoiceService mới
exports.getInvoiceByAppointmentId = async (appointment_id) => {
  return await invoiceService.getInvoice({ appointmentId: appointment_id });
};

// Lấy tất cả cuộc hẹn của bác sĩ, có thể lọc theo status và bookingDate
exports.getAppointments = async (
  doctorId,
  status,
  bookingDate,
  slot_id,
  patient_id,
  service_type = "examination"
) => {
  const pool = await poolPromise;
  try {
    const request = pool.request().input("service_type", service_type);

    let selectDoctorFields = "";
    let joinDoctor = "";
    let timeSlot = "";
    let joinSlot = "";
    let testTypes = "";
    let joinTestTypes = "";

    if (service_type !== "test") {
      selectDoctorFields = `
        a.doctor_id,
        d.full_name AS doctor_name,`;
      joinDoctor = `LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id`;
      timeSlot = `sl.slot_id,
        CONVERT(VARCHAR(5), sl.start_time, 108) + ' - ' + CONVERT(VARCHAR(5), sl.end_time, 108) AS slot_time,`;
      joinSlot = `JOIN Slots sl ON sl.slot_id = a.slot_id`;
    } else {
      joinTestTypes = `join ServicesTestTypes st on st.service_id = s.service_id
	      join TestTypes tt on tt.test_type_id = st.test_type_id`;
      testTypes = `,
              tt.test_type_id as tt_id,
              tt.name as tt_name,
              tt.unit as tt_unit,
              tt.normal_range as reference_range`;
    }

    let query = `
      SELECT 
        a.appointment_id,
        a.patient_id,
        p.full_name,
        DATEDIFF(YEAR, p.dob, GETDATE()) AS age,
        p.gender,
        p.phone,
        p.email,
        p.address,
        ${timeSlot}
        s.service_type,
        a.status,
        FORMAT(a.created_at, 'dd-MM-yyyy HH:mm') AS created_at,
        ${selectDoctorFields}
        FORMAT(a.bookingDate, 'yyyy-MM-dd') AS bookingDate,
        s.name as service_name,
		    s.service_id
        ${testTypes}
      FROM Appointments a
      JOIN Services s ON a.service_id = s.service_id
      JOIN Patients p ON a.patient_id = p.patient_id
      ${joinSlot}
      ${joinDoctor}
      ${joinTestTypes}
      WHERE s.service_type = @service_type
    `;

    if (doctorId && service_type !== "test") {
      request.input("doctorId", parseInt(doctorId, 10));
      query += " AND a.doctor_id = @doctorId";
    }

    if (status) {
      request.input("status", status);
      query += " AND a.status = @status";
    }

    if (bookingDate) {
      request.input("bookingDate", bookingDate);
      query += " AND CAST(a.bookingDate AS DATE) = @bookingDate";
    }

    if (slot_id) {
      request.input("slot_id", parseInt(slot_id, 10));
      query += " AND a.slot_id = @slot_id";
    }

    if (patient_id) {
      request.input("patient_id", parseInt(patient_id, 10));
      query += " AND a.patient_id = @patient_id";
    }

    // query += " ORDER BY a.queue_number ASC"; // optional

    const result = await request.query(query);

    const records = result.recordset || [];

    if (service_type === "test") {
      const grouped = [];

      const map = new Map();

      for (const row of records) {
        const key = row.appointment_id;

        if (!map.has(key)) {
          const { tt_name, tt_unit, ...rest } = row;
          const newEntry = {
            ...rest,
            testTypes: [],
          };
          map.set(key, newEntry);
          grouped.push(newEntry);
        }

        // Push test type to the array
        map.get(key).testTypes.push({
          tt_id: row.tt_id,
          tt_name: row.tt_name,
          tt_unit: row.tt_unit,
          reference_range: row.reference_range,
        });
      }

      return grouped;
    }

    return records;
  } catch (error) {
    console.error("Error in getAppointments:", error);
    throw error;
  }
};

// Lấy danh sách lịch hẹn ngày mai
exports.getTomorrowAppointmentsGroupedByPatient = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT 
  a.appointment_id,
  a.patient_id,
  p.full_name,
  p.email,
  s.name AS service_name,
  d.full_name AS doctor_name,
  a.bookingDate,
  a.status,
  a.room_id,
  r.room_name,
  a.service_id,
  a.doctor_id,
  a.slot_id,
  sl.start_time,
  sl.end_time
FROM Appointments a
JOIN Patients p ON a.patient_id = p.patient_id
JOIN Services s ON a.service_id = s.service_id
LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
LEFT JOIN Rooms r ON a.room_id = r.room_id
LEFT JOIN Slots sl ON a.slot_id = sl.slot_id
WHERE 
  CAST(a.bookingDate AS DATE) = CAST(DATEADD(day, 1, GETDATE()) AS DATE)
  AND a.status = 'requested'
ORDER BY a.patient_id, sl.start_time    
  `);

  // Gom lịch theo bệnh nhân
  const grouped = {};
  for (const row of result.recordset) {
    if (!grouped[row.patient_id]) {
      grouped[row.patient_id] = {
        full_name: row.full_name,
        email: row.email,
        appointments: [],
      };
    }
    grouped[row.patient_id].appointments.push(row);
  }

  return Object.values(grouped);
};
// Hủy booking - sử dụng invoiceService mới
exports.cancelBooking = async (invoiceId) => {
  return await invoiceService.cancelBooking(invoiceId);
};

// Validation rules cho đặt lịch (được gộp từ bookingServices)
exports.validateAppointmentRules = async (
  patient_id,
  service_id
  // bookingDate,
  // doctor_id = null
) => {
  const pool = await poolPromise;

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

// Function tạo booking với logic từ bookingServices (refactored)
exports.createBooking = async ({
  patientId,
  doctorId,
  bookingDate,
  slotId,
  serviceId,
}) => {
  const pool = await poolPromise;

  // Bước 0: Áp dụng validation rules mới
  await this.validateAppointmentRules(
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

  // Bước 5: Tạo hóa đơn bằng invoiceService
  await invoiceService.createInvoice({
    patientId,
    appointmentId,
    amount: price,
    serviceType: doctorId ? "examination" : "test",
  });

  // Bước 6: Lấy room_name để trả về cho frontend
  const roomResult = await pool
    .request()
    .input("roomId", roomId)
    .query("SELECT room_name FROM Rooms WHERE room_id = @roomId");

  const room_name = roomResult.recordset[0]?.room_name || "Chưa xác định";

  return {
    message: "Tạo lịch hẹn và hóa đơn thành công",
    appointmentId,
    room_name, // Thêm room_name để frontend có thể sử dụng
    queue_info: queueInfo, // Trả về thông tin queue number cho frontend
  };
};
// Hủy lịch hẹn theo invoice_id nếu thanh toán thất bại
exports.cancelAppointmentByInvoiceId = async (invoiceId) => {
  const pool = await poolPromise;
  await pool.request().input("invoice_id", invoiceId).query(`
    UPDATE Appointments
    SET status = 'cancelled'
    WHERE appointment_id = (
      SELECT appointment_id FROM Invoices WHERE invoice_id = @invoice_id
    )
  `);
};
