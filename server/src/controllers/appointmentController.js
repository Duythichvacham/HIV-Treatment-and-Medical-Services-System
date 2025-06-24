const appointmentService = require("../services/appointmentService");
const { poolPromise } = require("../config/db");

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

// ❌ BỊ DUPLICATE — chỉ giữ 1 bản thôi
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

// Get lấy danh sách hẹn của người dùng - chưa làm
exports.getAppointments = async (req, res) => {};
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

    const listAppointment = await appointmentService.getAllByUser(patientId);

    return res.status(200).json({
      message: "lay thanh cong danh sach",
      patientId,
      listAppointment,
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
    const patient_id = result.recordset[0].patient_id; // Lấy dữ liệu từ body
    const { doctor_id, slot_id, service_id, room_id, bookingDate } = req.body;
    const serviceType = req.body.serviceType; // Giả sử serviceType cũng được gửi từ client
    let finalRoomId = room_id;

    // Nếu là dịch vụ xét nghiệm thì random 1 phòng có room_type = 'Xét nghiệm'
    if (serviceType === "service") {
      const roomResult = await pool
        .request()
        .query("SELECT room_id FROM Rooms WHERE room_type = N'Xét nghiệm'");
      const roomList = roomResult.recordset;
      if (roomList.length > 0) {
        const randomIdx = Math.floor(Math.random() * roomList.length);
        finalRoomId = roomList[randomIdx].room_id;
      }
    }

    // Nếu là đặt lịch bác sĩ thì lấy room_id từ WorkingShifts
    if (serviceType === "doctor" && doctor_id && bookingDate) {
      const shiftResult = await pool
        .request()
        .input("doctor_id", doctor_id)
        .input("bookingDate", bookingDate)
        .query(
          "SELECT TOP 1 room_id FROM WorkingShifts WHERE doctor_id = @doctor_id AND shift_date = @bookingDate AND status = 'approved'"
        );
      if (shiftResult.recordset.length === 0) {
        return res
          .status(400)
          .json({ message: "Bác sĩ chưa được phân công phòng trong ngày này" });
      }
      finalRoomId = shiftResult.recordset[0].room_id;
    } // Validate dữ liệu đầu vào
    if (!service_id || !finalRoomId || !bookingDate) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin đặt lịch cơ bản" });
    }

    // Với appointment dành cho bác sĩ, bắt buộc phải có doctor_id và slot_id
    if (serviceType === "doctor" && (!doctor_id || !slot_id)) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin bác sĩ hoặc khung giờ" });
    }

    // Gọi service để tạo mới
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
