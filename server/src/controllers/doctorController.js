const doctorService = require("../services/doctorService");
// const doctor_id = 1;
// GET: Lấy danh sách lịch hẹn đang chờ khám hoặc tư vấn theo ngày
const getAppointmentQueue = async (req, res) => {
  try {
    const doctor_id = req.params.doctorId;
    const date = req.query.date;
    console.log(
      "[API] getAppointmentQueue called with doctor_id:",
      doctor_id,
      "date:",
      date
    );
    const queue = await doctorService.getAppointmentsByStatus(
      doctor_id,
      "requested",
      date
    );
    console.log(
      "[API] getAppointmentQueue result count:",
      queue?.length,
      "data:",
      queue
    );
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
    console.log(
      "[API] getAppointmentInProgress called with doctor_id:",
      doctor_id,
      "date:",
      date
    );
    const in_progress = await doctorService.getAppointmentsByStatus(
      doctor_id,
      "in_progress",
      date
    );
    console.log(
      "[API] getAppointmentInProgress result count:",
      in_progress?.length,
      "data:",
      in_progress
    );
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
    console.log(
      "[API] getAppointmentFinshed called with doctor_id:",
      doctor_id,
      "date:",
      date
    );
    const finished = await doctorService.getAppointmentsByStatus(
      doctor_id,
      "completed",
      date
    );
    console.log(
      "[API] getAppointmentFinshed result count:",
      finished?.length,
      "data:",
      finished
    );
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
    const patientId = req.params.patientId;
    const appointmentId = req.query.appointmentId || null; // lấy từ query string
    const result = await doctorService.getCurrentExam(patientId, appointmentId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("getCurrentExam error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
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
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST: Lưu dữ liệu khám bệnh (chẩn đoán, kế hoạch điều trị, etc.)
const saveExamData = async (req, res) => {
  try {
    const {
      appointment_id,
      diagnosis,
      diagnosis_secondary,
      treatment_plan,
      note,
      reExamDate,
      vitals,
      weight,
      height,
      clinical_signs,
      arv_regimen_id,
      prescription_details,
    } = req.body;

    console.log("saveExamData called with body:", req.body);

    if (!appointment_id || !diagnosis) {
      console.log("Missing required fields:", { appointment_id, diagnosis });
      return res.status(400).json({
        success: false,
        error: "appointment_id và diagnosis là bắt buộc",
      });
    }

    const result = await doctorService.saveExamData({
      appointment_id,
      diagnosis,
      diagnosis_secondary,
      treatment_plan,
      note,
      reExamDate,
      vitals,
      weight,
      height,
      clinical_signs,
      arv_regimen_id,
      prescription_details,
    });

    console.log("saveExamData successful:", result);

    res.status(200).json({
      success: true,
      message: "Lưu dữ liệu khám bệnh thành công",
      data: result,
    });
  } catch (error) {
    console.error("Error saving exam data:", error);
    console.error("Error stack:", error.stack);

    // Phân loại lỗi chi tiết hơn
    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error.message.includes("FK")) {
      errorMessage = "Không tìm thấy cuộc hẹn trong hệ thống";
      statusCode = 400;
    } else if (error.message.includes("PRIMARY KEY")) {
      errorMessage = "Dữ liệu khám bệnh đã tồn tại cho cuộc hẹn này";
      statusCode = 400;
    } else if (error.message.includes("Invalid column")) {
      errorMessage = "Lỗi cấu trúc dữ liệu";
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// POST: Lưu dữ liệu khám bệnh tạm thời (không yêu cầu validation chặt chẽ)
const saveExamDataTemp = async (req, res) => {
  try {
    const {
      appointment_id,
      diagnosis,
      diagnosis_secondary,
      treatment_plan,
      note,
      reExamDate,
      vitals,
      weight,
      height,
      clinical_signs,
      arv_regimen_id,
      prescription_details,
    } = req.body;
    console.log("saveExamDataTemp called with body:", req.body); // Kiểm tra tối thiểu: chỉ cần appointment_id
    if (!appointment_id) {
      console.log("Missing required field appointment_id");
      return res.status(400).json({
        success: false,
        error: "appointment_id là bắt buộc",
      });
    }

    // Sử dụng service giống với saveExamData nhưng không kiểm tra validation chặt chẽ
    const result = await doctorService.saveExamData({
      appointment_id,
      diagnosis: diagnosis || "Đang khám...", // Giá trị mặc định nếu chưa có
      diagnosis_secondary: diagnosis_secondary || "",
      treatment_plan: treatment_plan || "",
      note: note || "",
      reExamDate: reExamDate || "",
      vitals: vitals || "",
      weight: weight || 0,
      height: height || 0,
      clinical_signs: clinical_signs || "",
      arv_regimen_id: arv_regimen_id || null,
      prescription_details: prescription_details || [],
      is_temporary: true, // Thêm flag để phân biệt là lưu tạm
    });

    console.log("saveExamDataTemp successful:", result);

    res.status(200).json({
      success: true,
      message: "Lưu tạm dữ liệu khám bệnh thành công",
      data: result,
    });
  } catch (error) {
    console.error("Error saving temporary exam data:", error);
    console.error("Error stack:", error.stack);

    // Phân loại lỗi chi tiết hơn
    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error.message.includes("FK")) {
      errorMessage = "Không tìm thấy cuộc hẹn trong hệ thống";
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// GET: Lấy doctor_id theo account_id
const getDoctorByAccountId = async (req, res) => {
  try {
    const account_id = req.params.accountId;
    const pool = await require("../config/db").poolPromise;
    const result = await pool
      .request()
      .input("account_id", account_id)
      .query("SELECT doctor_id FROM Doctors WHERE account_id = @account_id");
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy doctor_id" });
    }
    res.json({ doctor_id: result.recordset[0].doctor_id });
  } catch (error) {
    console.error("getDoctorByAccountId error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// GET: Lấy danh sách phác đồ ARV
const getARVRegimens = async (req, res) => {
  try {
    console.log("[API] getARVRegimens called");
    const regimens = await doctorService.getARVRegimens();
    console.log("[API] getARVRegimens result count:", regimens?.length);
    res.status(200).json({
      success: true,
      data: regimens,
    });
  } catch (err) {
    console.error("[API] getARVRegimens error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// GET: Lấy danh sách thuốc theo phác đồ ARV
const getARVMedications = async (req, res) => {
  try {
    const regimenId = req.params.regimenId;
    console.log("[API] getARVMedications called with regimenId:", regimenId);

    if (!regimenId) {
      return res.status(400).json({
        success: false,
        error: "regimenId là bắt buộc",
      });
    }

    const medications = await doctorService.getARVMedications(regimenId);
    console.log("[API] getARVMedications result count:", medications?.length);

    res.status(200).json({
      success: true,
      data: medications,
    });
  } catch (err) {
    console.error("[API] getARVMedications error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
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
  saveExamDataTemp,
  getDoctorByAccountId,
  getARVRegimens,
  getARVMedications,
};
