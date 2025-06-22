const doctorService = require("../services/doctorService");
// const doctor_id = 1;
// GET: Lấy danh sách lịch hẹn đang chờ khám hoặc tư vấn theo ngày
const getAppointmentQueue = async (req, res) => {
  try {
    const doctor_id = req.params.doctorId;
    const date = req.query.date;
    console.log("[API] getAppointmentQueue called with doctor_id:", doctor_id, "date:", date);
    const queue = await doctorService.getAppointmentsByStatus(
      doctor_id,
      "requested",
      date
    );
    console.log("[API] getAppointmentQueue result count:", queue?.length, "data:", queue);
    res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (err) {
    console.error("[API] getAppointmentQueue error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

//GET lấy danh sách bệnh nhân đang khám theo ngày
const getAppointmentInProgress = async (req, res) => {
  try {
    const doctor_id = req.params.doctorId;
    const date = req.query.date;
    console.log("[API] getAppointmentInProgress called with doctor_id:", doctor_id, "date:", date);
    const in_progress = await doctorService.getAppointmentsByStatus(
      doctor_id,
      "in_progress",
      date
    );
    console.log("[API] getAppointmentInProgress result count:", in_progress?.length, "data:", in_progress);
    res.status(200).json({
      message: "Lấy danh sách bệnh nhân đang khám thành công",
      data: in_progress,
    });
  } catch (err) {
    console.error("[API] getAppointmentInProgress error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET lấy danh sách bệnh nhân hoàn thành khám theo ngày
const getAppointmentFinshed = async (req, res) => {
  try {
    const doctor_id = req.params.doctorId;
    const date = req.query.date;
    console.log("[API] getAppointmentFinshed called with doctor_id:", doctor_id, "date:", date);
    const finished = await doctorService.getAppointmentsByStatus(
      doctor_id,
      "completed",
      date
    );
    console.log("[API] getAppointmentFinshed result count:", finished?.length, "data:", finished);
    res.status(200).json({
      message: "Lấy danh sách bệnh nhân hoàn thành khám thành công",
      data: finished,
    });
  } catch (err) {
    console.error("[API] getAppointmentFinshed error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getExamHistory = async (req, res) => {
  try {
    const patientId = req.params.patientId; // Lấy id từ URL
    console.log("getExamHistory called with patientId:", patientId);
    const examHistory = await doctorService.getExamHistory(patientId);
    res.status(200).json({
      success: true,
      data: examHistory,
    });
  } catch (error) {
    console.error("Error fetching exam history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCurrentExam = async (req, res) => {
  try {
    const patientId = req.params.patientId; // Lấy id từ URL
    console.log("getCurrentExam called with patientId:", patientId);
    const currentExam = await doctorService.getCurrentExam(patientId);
    res.status(200).json({
      success: true,
      data: currentExam,
    });
  } catch (error) {
    console.error("Error fetching current exam:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// (GET, lấy danh sách bác sĩ - có thể filter theo ngày)
const getDoctors = async (req, res) => {
  try {
    const { date } = req.query;
    console.log("getDoctors called with date:", date);

    let doctors;
    if (date) {
      // Lấy doctors có ca làm việc trong ngày được chỉ định
      console.log("Fetching doctors by date:", date);
      doctors = await doctorService.getDoctorsByDate(date);
    } else {
      // Lấy tất cả doctors
      console.log("Fetching all doctors");
      doctors = await doctorService.getDoctors();
    }

    console.log("Found doctors:", doctors.length);
    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);    res.status(500).json({ error: "Internal server error" });
  }
};

// POST: Lưu dữ liệu khám bệnh (chẩn đoán, kế hoạch điều trị, etc.)
const saveExamData = async (req, res) => {
  try {
    const { 
      appointment_id,
      diagnosis,
      treatment_plan,
      note,
      reExamDate,
      vitals,
      weight,
      height,
      clinical_signs
    } = req.body;
    
    console.log("saveExamData called with body:", req.body);
    
    if (!appointment_id || !diagnosis) {
      console.log("Missing required fields:", { appointment_id, diagnosis });
      return res.status(400).json({ 
        success: false, 
        error: "appointment_id và diagnosis là bắt buộc" 
      });
    }
    
    const result = await doctorService.saveExamData({
      appointment_id,
      diagnosis,
      treatment_plan,
      note,
      reExamDate,
      vitals,
      weight,
      height,
      clinical_signs
    });
    
    console.log("saveExamData successful:", result);
    
    res.status(200).json({
      success: true,
      message: "Lưu dữ liệu khám bệnh thành công",
      data: result
    });
  } catch (error) {
    console.error("Error saving exam data:", error);
    console.error("Error stack:", error.stack);
    
    // Phân loại lỗi chi tiết hơn
    let errorMessage = "Internal server error";
    let statusCode = 500;
    
    if (error.message.includes('FK')) {
      errorMessage = "Không tìm thấy cuộc hẹn trong hệ thống";
      statusCode = 400;
    } else if (error.message.includes('PRIMARY KEY')) {
      errorMessage = "Dữ liệu khám bệnh đã tồn tại cho cuộc hẹn này";
      statusCode = 400;
    } else if (error.message.includes('Invalid column')) {
      errorMessage = "Lỗi cấu trúc dữ liệu";
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      error: errorMessage,
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// GET: Lấy doctor_id theo account_id
const getDoctorByAccountId = async (req, res) => {
  try {
    const account_id = req.params.accountId;
    const pool = await require("../config/db").poolPromise;
    const result = await pool.request()
      .input('account_id', account_id)
      .query('SELECT doctor_id FROM Doctors WHERE account_id = @account_id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy doctor_id' });
    }
    res.json({ doctor_id: result.recordset[0].doctor_id });
  } catch (error) {
    console.error("getDoctorByAccountId error:", error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getDoctors,
  getAppointmentQueue,
  getAppointmentInProgress,
  getAppointmentFinshed,
  getExamHistory,
  getCurrentExam,
  saveExamData,
  getDoctorByAccountId,
};
