const appointmentService = require("../services/appointmentService");
const { autoCancelPendingAppointments } = require("../utils/scheduler");

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
      // TODO: Cần implement updateTestRequestStatus hoặc sử dụng hàm có sẵn khác
      return res.status(501).json({
        message: "updateTestRequestStatus chưa được implement",
      });
    }
  } catch (error) {
    next(error);
  }
};

// TODO: Cần implement logic lấy patient_id từ accountId
exports.getAppointmentsByPatientId = async (req, res, next) => {
  try {
    // phần xử lý lấy patient_id từ token này nên được thực hiện trong middleware
    const accountId = req.user.userId; // lấy từ token đã verify
    const listAppointments = await appointmentService.getAllByUser(accountId);
    return res.status(200).json({
      message: "Get appointments successfully",
      listAppointments,
    });
  } catch (error) {
    next(error);
  }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const accountId = req.user.userId; // lấy từ token đã verify

    // Sử dụng function tổng hợp đã refactor
    const appointment = await appointmentService.createAppointmentFromAccount(
      accountId,
      req.body
    );

    return res
      .status(201)
      .json({ message: "Đặt lịch thành công", appointment });
  } catch (error) {
    // Handle specific errors
    const errorMessages = {
      PATIENT_NOT_FOUND: "Không tìm thấy bệnh nhân cho tài khoản này",
      SERVICE_NOT_FOUND: "Không tìm thấy dịch vụ",
      MISSING_BASIC_INFO: "Thiếu thông tin đặt lịch cơ bản",
      MISSING_DOCTOR_SLOT_INFO: "Thiếu thông tin bác sĩ hoặc khung giờ",
      DOCTOR_NOT_ASSIGNED: "Bác sĩ chưa được phân công phòng trong ngày này",
      SLOT_FULL: "Khung giờ này đã đầy, vui lòng chọn khung giờ khác",
      NO_TEST_ROOM_AVAILABLE: "Không tìm thấy phòng xét nghiệm phù hợp",
    };

    if (errorMessages[error.message]) {
      return res.status(400).json({ message: errorMessages[error.message] });
    }

    next(error);
  }
};

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

exports.checkExistingAppointment = async (req, res, next) => {
  try {
    const { serviceId, bookingDate, doctorId } = req.query;
    const accountId = req.user.userId; // Lấy từ token

    // Validate đầu vào
    if (!serviceId || !bookingDate) {
      return res.status(400).json({
        message: "serviceId và bookingDate là bắt buộc",
      });
    }

    // Validate định dạng ngày
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(bookingDate)) {
      return res.status(400).json({
        message: "bookingDate phải có định dạng YYYY-MM-DD",
      });
    }

    const result = await appointmentService.checkExistingAppointment(
      accountId,
      parseInt(serviceId),
      bookingDate,
      doctorId ? parseInt(doctorId) : null
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Handle specific errors
    const errorMessages = {
      PATIENT_NOT_FOUND: "Không tìm thấy bệnh nhân cho tài khoản này",
      SERVICE_NOT_FOUND: "Không tìm thấy dịch vụ",
    };

    if (errorMessages[error.message]) {
      return res.status(400).json({
        success: false,
        message: errorMessages[error.message],
      });
    }

    next(error);
  }
};

// Thêm API endpoint để manual cancel pending appointments
exports.cancelPendingAppointments = async (req, res, next) => {
  try {
    await autoCancelPendingAppointments();
    return res.json({
      success: true,
      message: "Successfully cancelled all pending appointments for today",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bỏ
 * exports.getLabTestQueue = async (req, res, next) => {
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

 */
