const { poolPromise } = require("../config/db");
const queueService = require("./queueService");

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

  return result.recordset[0];
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
      "SELECT TOP 1 room_id, max_patients_per_slot FROM WorkingShifts WHERE doctor_id = @doctor_id AND shift_date = @bookingDate AND status = 'approved'"
    );

  if (shiftResult.recordset.length === 0) {
    throw new Error("DOCTOR_NOT_ASSIGNED");
  }

  const roomId = shiftResult.recordset[0].room_id;
  const maxPatientsPerSlot =
    shiftResult.recordset[0].max_patients_per_slot || 6;

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

  // 4. Tạo appointment
  return await this.createAppointment({
    patient_id,
    doctor_id,
    slot_id,
    service_id,
    status: "requested",
    room_id: finalRoomId,
    bookingDate,
  });
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
      ,r.room_name
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
      SELECT a.*, p.full_name as patient_name, s.name as service_name, r.room_name, d.full_name as doctor_name,
             sl.start_time, sl.end_time
      FROM Appointments a
      LEFT JOIN Patients p ON a.patient_id = p.patient_id
      LEFT JOIN Services s ON a.service_id = s.service_id
      LEFT JOIN Rooms r ON a.room_id = r.room_id
      LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN Slots sl ON a.slot_id = sl.slot_id
      WHERE a.appointment_id = @appointment_id
    `);
  return result.recordset[0];
};
/*
//GET, lấy bệnh nhân chờ xét nghiệm với service_type='test' - sử dụng QueueService
exports.getLabTestQueue = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT 
        a.appointment_id,
        a.status,
        a.created_at,
        p.full_name as patient_name,
        p.phone as patient_phone,
        s.name as service_name,
        s.service_type,
        tt.name as test_type_name,
        tt.unit,
        tt.normal_range,
        r.room_name,
        a.room_id
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Services s ON a.service_id = s.service_id
      LEFT JOIN ServicesTestTypes stt ON s.service_id = stt.service_id
      LEFT JOIN TestTypes tt ON stt.test_type_id = tt.test_type_id
      LEFT JOIN Rooms r ON a.room_id = r.room_id
      WHERE s.service_type = 'test'
      AND a.status = 'requested'
      ORDER BY a.created_at ASC
    `);

  // Sử dụng QueueService để tính queue_number thống nhất
  const appointmentsWithQueue = await Promise.all(
    result.recordset.map(async (appointment, index) => {
      try {
        // Lấy queue number từ QueueService
        const queueNumber = await queueService.getCurrentQueueNumber('test');
        return {
          ...appointment,
          queue_number: queueNumber > 0 ? queueNumber : index + 1, // fallback nếu queue service chưa init
        };
      } catch (error) {
        // Fallback to index-based numbering
        return {
          ...appointment,
          queue_number: index + 1,
        };
      }
    })
  );

  return appointmentsWithQueue;
};

// Lấy danh sách bệnh nhân đang xét nghiệm (status = 'in_progress') - sử dụng QueueService
exports.getLabTestInProgress = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT 
        a.appointment_id,
        a.status,
        a.created_at,
        p.full_name as patient_name,
        p.phone as patient_phone,
        s.name as service_name,
        s.service_type,
        tt.name as test_type_name,
        tt.unit,
        tt.normal_range,
        r.room_name,
        a.room_id
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Services s ON a.service_id = s.service_id
      LEFT JOIN ServicesTestTypes stt ON s.service_id = stt.service_id
      LEFT JOIN TestTypes tt ON stt.test_type_id = tt.test_type_id
      LEFT JOIN Rooms r ON a.room_id = r.room_id
      WHERE s.service_type = 'test'
      AND a.status = 'in_progress'
      ORDER BY a.created_at ASC
    `);

  // Sử dụng QueueService để tính queue_number thống nhất
  const appointmentsWithQueue = await Promise.all(
    result.recordset.map(async (appointment, index) => {
      try {
        const queueNumber = await queueService.getCurrentQueueNumber('test');
        return {
          ...appointment,
          queue_number: queueNumber > 0 ? queueNumber : index + 1,
        };
      } catch (error) {
        return {
          ...appointment,
          queue_number: index + 1,
        };
      }
    })
  );

  return appointmentsWithQueue;
};

// Lấy bệnh nhân hoàn thành xét nghiệm (status = 'completed') - sử dụng QueueService
exports.getLabTestFinished = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT 
        a.appointment_id,
        a.status,
        a.created_at,
        p.full_name as patient_name,
        p.phone as patient_phone,
        s.name as service_name,
        s.service_type,
        tt.name as test_type_name,
        tt.unit,
        tt.normal_range,
        r.room_name,
        a.room_id
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Services s ON a.service_id = s.service_id
      LEFT JOIN ServicesTestTypes stt ON s.service_id = stt.service_id
      LEFT JOIN TestTypes tt ON stt.test_type_id = tt.test_type_id
      LEFT JOIN Rooms r ON a.room_id = r.room_id
      WHERE s.service_type = 'test'
      AND a.status = 'completed'
      ORDER BY a.created_at ASC
    `);

  // Sử dụng QueueService để tính queue_number thống nhất
  const appointmentsWithQueue = await Promise.all(
    result.recordset.map(async (appointment, index) => {
      try {
        const queueNumber = await queueService.getCurrentQueueNumber('test');
        return {
          ...appointment,
          queue_number: queueNumber > 0 ? queueNumber : index + 1,
        };
      } catch (error) {
        return {
          ...appointment,
          queue_number: index + 1,
        };
      }
    })
  );

  return appointmentsWithQueue;
};
*/
