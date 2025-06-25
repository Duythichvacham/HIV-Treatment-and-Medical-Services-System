const appointmentService = require("../services/appointmentService");
const { poolPromise } = require("../config/db");
const testService = require("../services/testService");

exports.updateStatus = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const { status, doctor_id } = req.body;

    const validStatus = ["requested", "in_progress", "completed", "cancelled"];
    if (!validStatus.includes(status)) {
      const err = new Error("Invalid status");
      err.statusCode = 400;
      throw err;
    }

    if (!doctor_id) {
      const appointment = await appointmentService.updateAppointmentStatus(
        appointment_id,
        status
      );
      if (!appointment) {
        const err = new Error("Appointment not found");
        err.statusCode = 404;
        throw err;
      }

      if (status === "in_progress" && (!appointment.doctor_id || appointment.doctor_id === null)) {
        const pool = await poolPromise;
        const testNoteRes = await pool
          .request()
          .input("appointment_id", appointment_id)
          .query("SELECT test_note_id FROM TestNotes WHERE appointment_id = @appointment_id");
        const test_note_id = testNoteRes.recordset[0]?.test_note_id;
        if (test_note_id) {
          await testService.updateTestNoteStatus(test_note_id, "in_progress");
        } else {
          const created_by_id = req.user?.userId || null;
          await pool.request()
            .input('appointment_id', appointment_id)
            .input('created_by_id', created_by_id)
            .input('test_datetime', new Date())
            .query(`INSERT INTO TestNotes (appointment_id, created_by_id, test_datetime) VALUES (@appointment_id, @created_by_id, @test_datetime)`);
        }
      }

      return res.json({ message: "Appointment status updated", appointment });
    } else {
      const testRequest = await appointmentService.updateTestRequestStatus(
        appointment_id,
        doctor_id,
        status
      );
      if (!testRequest) {
        const err = new Error("TestRequest not found");
        err.statusCode = 404;
        throw err;
      }
      return res.json({ message: "TestRequest status updated", testRequest });
    }
  } catch (error) {
    next(error); // Gửi lỗi sang errorHandler
  }
};

exports.getLabTestQueue = async (req, res, next) => {
  try {
    const queue = await appointmentService.getLabTestQueue();
    res.json({
      message: "Lấy danh sách bệnh nhân chờ xét nghiệm thành công",
      data: queue,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLabTestInProgress = async (req, res, next) => {
  try {
    const inProgress = await appointmentService.getLabTestInProgress();
    res.json({
      message: "Lấy danh sách bệnh nhân đang xét nghiệm thành công",
      data: inProgress,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách bệnh nhân đã hoàn thành xét nghiệm
exports.getLabTestFinished = async (req, res, next) => {
  try {
    const finished = await appointmentService.getLabTestFinished();
    res.json({
      message: "Lấy danh sách bệnh nhân đã hoàn thành xét nghiệm thành công",
      data: finished,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách lịch hẹn của một bệnh nhân theo patient_id
exports.getAppointmentsByPatientId = async (req, res) => {
  try {
    // phần xử lý lấy patient_id từ token này nên được thực hiện trong middleware
    const accountId = req.user.userId; // lấy từ token đã verify
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("accountId", accountId)
      .query("SELECT patient_id FROM Patients WHERE account_id = @accountId");

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bệnh nhân cho tài khoản này" });
    }

    const patientId = result.recordset[0].patient_id;

    const listAppointments = await appointmentService.getAllByUser(patientId);

    return res.status(200).json({
      message: "lay thanh cong danh sach",
      patientId,
      listAppointments,
    });
  } catch (error) {
    console.error("Lỗi truy vấn patient_id:", error);
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// Tạo mới lịch hẹn (appointment)
exports.createAppointment = async (req, res, next) => {
  try {
    // Lấy accountId từ token
    const accountId = req.user.userId;
    const pool = await require("../config/db").poolPromise;
    
    // Lấy patient_id từ accountId
    const result = await pool
      .request()
      .input("accountId", accountId)
      .query("SELECT patient_id FROM Patients WHERE account_id = @accountId");
    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bệnh nhân cho tài khoản này" });
    }
    const patient_id = result.recordset[0].patient_id;
    
    // Lấy dữ liệu từ body
    const { doctor_id, slot_id, service_id, room_id, bookingDate } = req.body;
    const serviceType = req.body.serviceType; // "doctor" hoặc "service"
    let finalRoomId = room_id;

    // Validate dữ liệu đầu vào
    if (!service_id || !bookingDate) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin đặt lịch cơ bản" });
    }

    // Lấy thông tin service để xác định loại dịch vụ
    const serviceResult = await pool
      .request()
      .input("serviceId", service_id)
      .query("SELECT service_type, price FROM Services WHERE service_id = @serviceId");
    
    if (serviceResult.recordset.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy dịch vụ" });
    }
    
    const service = serviceResult.recordset[0];
    const actualServiceType = service.service_type; // "examination", "test", "consultation"

    // Xử lý theo loại dịch vụ thực tế
    if (actualServiceType === "examination") {
      // Dịch vụ khám bác sĩ
      if (!doctor_id || !slot_id) {
        return res
          .status(400)
          .json({ message: "Thiếu thông tin bác sĩ hoặc khung giờ" });
      }

      // Kiểm tra bác sĩ có working shift không
      const shiftResult = await pool
        .request()
        .input("doctor_id", doctor_id)
        .input("bookingDate", bookingDate)
        .query(
          "SELECT TOP 1 room_id, max_patients_per_slot FROM WorkingShifts WHERE doctor_id = @doctor_id AND shift_date = @bookingDate AND status = 'approved'"
        );
      
      if (shiftResult.recordset.length === 0) {
        return res
          .status(400)
          .json({ message: "Bác sĩ chưa được phân công phòng trong ngày này" });
      }
      
      finalRoomId = shiftResult.recordset[0].room_id;
      const maxPatientsPerSlot = shiftResult.recordset[0].max_patients_per_slot || 6;

      // Kiểm tra slot có đủ chỗ không
      const slotCountResult = await pool
        .request()
        .input("doctor_id", doctor_id)
        .input("bookingDate", bookingDate)
        .input("slot_id", slot_id)
        .query(
          "SELECT COUNT(*) AS count FROM Appointments WHERE doctor_id = @doctor_id AND bookingDate = @bookingDate AND slot_id = @slot_id AND status IN ('requested', 'in_progress')"
        );
      
      const currentBookings = slotCountResult.recordset[0].count;
      if (currentBookings >= maxPatientsPerSlot) {
        return res
          .status(400)
          .json({ message: "Khung giờ này đã đầy, vui lòng chọn khung giờ khác" });
      }

    } else if (actualServiceType === "test") {
      // Dịch vụ xét nghiệm
      // Chọn phòng xét nghiệm có ít bệnh nhân nhất
      const roomResult = await pool
        .request()
        .input("bookingDate", bookingDate)
        .query(`
          SELECT r.room_id, COUNT(a.appointment_id) as patient_count
          FROM Rooms r
          LEFT JOIN Appointments a ON r.room_id = a.room_id 
            AND a.bookingDate = @bookingDate 
            AND a.status IN ('requested', 'in_progress')
          WHERE r.room_type = N'Xét nghiệm'
          GROUP BY r.room_id
          ORDER BY patient_count ASC
        `);
      
      if (roomResult.recordset.length === 0) {
        return res
          .status(400)
          .json({ message: "Không tìm thấy phòng xét nghiệm phù hợp" });
      }
      
      finalRoomId = roomResult.recordset[0].room_id;
    }

    // Gọi service để tạo mới (validation sẽ được thực hiện trong service)
    const appointment = await appointmentService.createAppointment({
      patient_id,
      doctor_id,
      slot_id,
      service_id,
      status: "requested",
      room_id: finalRoomId,
      bookingDate,
    });
    
    return res
      .status(201)
      .json({ message: "Đặt lịch thành công", appointment });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết lịch hẹn theo appointment_id
exports.getAppointmentDetail = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const appointment = await appointmentService.getAppointmentDetail(
      appointment_id
    );
    if (!appointment) {
      return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
    }
    return res
      .status(200)
      .json({ message: "Lấy chi tiết lịch hẹn thành công", data: appointment });
  } catch (error) {
    next(error);
  }
};
