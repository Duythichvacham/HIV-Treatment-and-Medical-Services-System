const appointmentService = require('../services/appointmentService');


exports.updateStatus = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const { status, doctor_id } = req.body;

    const validStatus = ['requested', 'in_progress', 'completed', 'cancelled'];
    if (!validStatus.includes(status)) {
      const err = new Error('Invalid status');
      err.statusCode = 400;
      throw err;
    }

    if (!doctor_id) {
      const appointment = await appointmentService.updateAppointmentStatus(appointment_id, status);
      if (!appointment) {
        const err = new Error('Appointment not found');
        err.statusCode = 404;
        throw err;
      }
      return res.json({ message: 'Appointment status updated', appointment });
    } else {
      const testRequest = await appointmentService.updateTestRequestStatus(appointment_id, doctor_id, status);
      if (!testRequest) {
        const err = new Error('TestRequest not found');
        err.statusCode = 404;
        throw err;
      }
      return res.json({ message: 'TestRequest status updated', testRequest });
    }
  } catch (error) {
    next(error); // Gửi lỗi sang errorHandler
  }
};


exports.getLabTestQueue = async (req, res, next) => {
  try {
    const queue = await appointmentService.getLabTestQueue();
    res.json({
      message: 'Lấy danh sách bệnh nhân chờ xét nghiệm thành công',
      data: queue
    });
  } catch (error) {
    next(error);
  }
};

exports.getLabTestInProgress = async (req, res, next) => {
  try {
    const inProgress = await appointmentService.getLabTestInProgress();
    res.json({
      message: 'Lấy danh sách bệnh nhân đang xét nghiệm thành công',
      data: inProgress
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
      message: 'Lấy danh sách bệnh nhân đã hoàn thành xét nghiệm thành công',
      data: finished
    });
  } catch (error) {
    next(error);
  }
};
