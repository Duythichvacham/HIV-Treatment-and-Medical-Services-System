const patientService = require('../services/patientService.js');

exports.updateStatus = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { status, doctor_id } = req.body;

    const validStatus = ['requested', 'in_progress', 'completed', 'cancelled'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!doctor_id) {
      // Cập nhật status cho Appointment
      const appointment = await appointmentService.updateAppointmentStatus(appointment_id, status);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      return res.json({ message: 'Appointment status updated', appointment });
    } else {
      // Cập nhật status cho TestRequest
      const testRequest = await appointmentService.updateTestRequestStatus(appointment_id, doctor_id, status);
      if (!testRequest) {
        return res.status(404).json({ message: 'TestRequest not found' });
      }
      return res.json({ message: 'TestRequest status updated', testRequest });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//GET, search bệnh nhân theo tên và sdt
exports.getPatientByNameSdt = async (req, res) => {
    try {
      const { name, phone } = req.query;
  
      if (!name || !phone) {
        return res.status(400).json({
          message: 'Thiếu thông tin tên hoặc số điện thoại để tìm kiếm.',
        });
      }
  
      const list = await patientService.searchPatientsByPartialNameAndPhone(name, phone);
  
      if (list.length === 0) {
        return res.status(404).json({
          message: 'Không tìm thấy bệnh nhân nào phù hợp.',
        });
      }
  
      res.json({
        message: 'Tìm kiếm bệnh nhân thành công',
        data: list,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// GET, lấy bệnh nhân đang xét nghiệm với service_type='test'
exports.getLabTestInProgress = async (req, res) => {
  try {
    const inProgress = await appointmentService.getLabTestInProgress();
    res.json({
      message: 'Lấy danh sách bệnh nhân đang xét nghiệm thành công',
      data: inProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET, lấy bệnh nhân đã hoàn thành xét nghiệm với service_type='test'
exports.getLabTestFinished = async (req, res) => {
  try {
    const finished = await appointmentService.getLabTestFinished();
    res.json({
      message: 'Lấy danh sách bệnh nhân đã hoàn thành xét nghiệm thành công',
      data: finished
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET, lấy bệnh nhân đã hoàn thành xét nghiệm với service_type='test'
exports.getLabTestFinished = async (req, res) => {
  try {
    const finished = await appointmentService.getLabTestFinished();
    res.json({
      message: 'Lấy danh sách bệnh nhân đã hoàn thành xét nghiệm thành công',
      data: finished
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};