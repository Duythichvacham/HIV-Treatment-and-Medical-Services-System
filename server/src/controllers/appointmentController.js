const appointmentService = require('../services/appointmentService');
const { poolPromise } = require('../config/db');



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


// Get lấy danh sách hẹn của người dùng
exports.getAppointments = async (req, res) => {

    try {
      const accountId = req.user.userId; // lấy từ token đã verify
      const pool = await poolPromise;
  
      const result = await pool.request()
        .input('accountId', accountId)
        .query('SELECT patient_id FROM Patients WHERE account_id = @accountId');
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy bệnh nhân cho tài khoản này' });
      }
  
      const patientId = result.recordset[0].patient_id;

      const listAppointment = await appointmentService.getAllByUser(patientId);


      return res.status(200).json({ 
        message : 'lay thanh cong danh sach',
        patientId,
        listAppointment
       });
    } catch (error) {
      console.error('Lỗi truy vấn patient_id:', error);
      return res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
  };

// Tạo mới lịch hẹn (appointment)
exports.createAppointment = async (req, res, next) => {
  try {
    // Lấy accountId từ token
    const accountId = req.user.userId;
    const pool = await require('../config/db').poolPromise;
    // Lấy patient_id từ accountId
    const result = await pool.request()
      .input('accountId', accountId)
      .query('SELECT patient_id FROM Patients WHERE account_id = @accountId');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bệnh nhân cho tài khoản này' });
    }
    const patient_id = result.recordset[0].patient_id;
    // Lấy dữ liệu từ body
    const { doctor_id, slot_id, service_id, room_id, bookingDate } = req.body;
    // Validate dữ liệu đầu vào (có thể bổ sung thêm)
    if (!doctor_id || !slot_id || !service_id || !room_id || !bookingDate) {
      return res.status(400).json({ message: 'Thiếu thông tin đặt lịch' });
    }
    // Gọi service để tạo mới
    const appointment = await appointmentService.createAppointment({
      patient_id,
      doctor_id,
      slot_id,
      service_id,
      status: 'requested',
      room_id,
      bookingDate
    });
    return res.status(201).json({ message: 'Đặt lịch thành công', appointment });
  } catch (error) {
    next(error);
  }
};

