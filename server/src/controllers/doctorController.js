const doctorService = require("../services/doctorService");

// GET: Lấy danh sách lịch hẹn đang chờ khám hoặc tư vấn
const getAppointmentQueue = async (req, res) => {
  try {
    const doctor_id = req.params.doctorId;
    const queue = await doctorService.getAppointmentsByStatus(doctor_id, "requested");
    res.status(200).json({ success: true, data: queue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// GET: Lấy danh sách bệnh nhân đang khám
const getAppointmentInProgress = async (req, res) => {
  try {
    const doctor_id = req.params.doctorId;
    const in_progress = await doctorService.getAppointmentsByStatus(doctor_id, "in_progress");
    res.status(200).json({
      message: "Lấy danh sách bệnh nhân đang khám thành công",
      data: in_progress,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET: Lấy danh sách bệnh nhân hoàn thành khám
const getAppointmentFinshed = async (req, res) => {
  try {
    const doctor_id = req.params.doctorId;
    const finished = await doctorService.getAppointmentsByStatus(doctor_id, "completed");
    res.status(200).json({
      message: "Lấy danh sách bệnh nhân hoàn thành khám thành công",
      data: finished,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET: Lấy lịch sử khám bệnh của bệnh nhân
const getExamHistory = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const examHistory = await doctorService.getExamHistory(patientId);
    res.status(200).json({ success: true, data: examHistory });
  } catch (error) {
    console.error("Error fetching exam history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET: Lấy thông tin khám hiện tại
const getCurrentExam = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const currentExam = await doctorService.getCurrentExam(patientId);
    res.status(200).json({ success: true, data: currentExam });
  } catch (error) {
    console.error("Error fetching current exam:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET: Lấy danh sách bác sĩ
const getDoctors = async (req, res) => {
  try {
    const { date } = req.query;
    let doctors;
    if (date) {
      doctors = await doctorService.getDoctorsByDate(date);
    } else {
      doctors = await doctorService.getDoctors();
    }
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET: Danh sách bệnh nhân đang chờ khám theo service_type
const getPatientWait = async (req, res) => {
  try {
    const listWait = await doctorService.getListWait();
    res.json({ message: 'Lấy danh sách bệnh nhân đang chờ khám', data: listWait });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET: Danh sách bệnh nhân đang khám
const getPatientInProgress = async (req, res) => {
  try {
    const listInPro = await doctorService.getListInprogress();
    if (!listInPro || listInPro.length === 0) {
      return res.status(404).json({ message: 'Không có bệnh nhân nào đang khám!' });
    }
    res.status(200).json({ message: 'Lấy danh sách bệnh nhân đang khám', data: listInPro });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET: Danh sách bệnh nhân đã hoàn thành khám
const getPatientfinished = async (req, res) => {
  try {
    const listFinish = await doctorService.getListFinish();
    if (!listFinish || listFinish.length === 0) {
      return res.status(404).json({ message: 'Không có bệnh nhân nào hoàn thành!' });
    }
    res.status(200).json({ message: 'Lấy danh sách bệnh nhân hoàn thành khám', data: listFinish });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// POST: Tạo đơn thuốc
const createPrescription = async (req, res) => {
  try {
    const {
      appointment_id,
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes
    } = req.body;

    if (!appointment_id) {
      return res.status(400).json({ message: "Thiếu appointment_id!" });
    }

    const result = await doctorService.createPrescription({
      appointment_id,
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes
    });

    res.status(201).json({ message: "Tạo đơn thuốc thành công", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  getDoctors,
  getAppointmentQueue,
  getAppointmentInProgress,
  getAppointmentFinshed,
  getExamHistory,
  getCurrentExam,
  getPatientWait,
  getPatientInProgress,
  getPatientfinished,
  createPrescription,
};
