const doctorService = require("../services/doctorService");
const appointmentService = require("../services/appointmentService");
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
const getAppointments = async (req, res) => {
  try {
    // Debug: Log headers và req.user
    console.log("[API] getAppointments - Headers:", req.headers.authorization);
    console.log("[API] getAppointments - req.user:", req.user);

    // Kiểm tra authentication
    if (!req.user || (!req.user.account_id && !req.user.userId)) {
      console.error(
        "[API] getAppointments - No user or account_id/userId in request"
      );
      console.error(
        "[API] getAppointments - Available headers:",
        Object.keys(req.headers)
      );
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Missing authentication",
      });
    }

    // Lấy account_id từ JWT token (support cả account_id và userId)
    const accountId = req.user.account_id || req.user.userId;
    console.log("[API] getAppointments called with accountId:", accountId);

    // Lấy doctor_id trực tiếp từ token hoặc query từ DB
    let doctorId;
    if (req.user.doctor_id) {
      // Nếu token đã có doctor_id, dùng luôn
      doctorId = req.user.doctor_id;
      console.log(
        "[API] getAppointments - Using doctor_id from token:",
        doctorId
      );
    } else {
      // Nếu không có, query từ DB
      console.log(
        "[API] getAppointments - Querying doctor_id from DB for account_id:",
        accountId
      );
      const pool = await require("../config/db").poolPromise;
      const doctorResult = await pool
        .request()
        .input("account_id", accountId)
        .query("SELECT doctor_id FROM Doctors WHERE account_id = @account_id");

      if (doctorResult.recordset.length === 0) {
        console.error(
          "[API] getAppointments - Doctor not found for account_id:",
          accountId
        );
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin bác sĩ",
        });
      }

      doctorId = doctorResult.recordset[0].doctor_id;
    }
    const { status, bookingDate, slot_id } = req.query;

    console.log("[API] getAppointments params:", {
      doctorId,
      status,
      bookingDate,
      slot_id,
    });

    // Thực hiện query dựa trên các tham số
    const appointments = await appointmentService.getDoctorAppointments(
      doctorId,
      status,
      bookingDate,
      slot_id
    );

    console.log("[API] getAppointments result count:", appointments?.length);

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// GET: Lấy lịch sử khám của bệnh nhân (danh sách tổng quan - chỉ thông tin cơ bản)
const getExamHistory = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    console.log("[getExamHistory] Called with patientId:", patientId);
    console.log("[getExamHistory] Request query params:", req.query);

    // Lấy thông tin chi tiết cho lịch sử khám - chỉ lấy completed
    const examHistory = await doctorService.getExamHistory(patientId);

    console.log("[getExamHistory] Success - returning data:", examHistory);
    res.status(200).json({
      success: true,
      message: "Lấy lịch sử khám thành công",
      data: examHistory,
    });
  } catch (error) {
    console.error("[getExamHistory] Error occurred:", error);
    console.error("[getExamHistory] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy lịch sử khám",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// GET: Lấy chi tiết một lần khám cụ thể
const getExamDetail = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    console.log("getExamDetail called with:", { patientId, appointmentId });

    const examDetail = await doctorService.getExamDetail(
      patientId,
      appointmentId
    );

    if (!examDetail) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy thông tin khám bệnh",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết khám thành công",
      data: examDetail,
    });
  } catch (error) {
    console.error("Error fetching exam detail:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy chi tiết khám",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getCurrentExam = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const appointmentId = req.query.appointmentId || null; // lấy từ query string

    console.log("[API] getCurrentExam called with:", {
      patientId,
      appointmentId,
    });

    const result = await doctorService.getCurrentExam(patientId, appointmentId);

    console.log("[API] getCurrentExam result:", result);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("getCurrentExam error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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
      // Clinical Exam data
      vitals, // Huyết áp + Mạch + Nhiệt độ
      weight, // Cân nặng
      height, // Chiều cao
      bmi, // BMI (có thể tính từ weight/height)
      clinical_signs, // Dấu hiệu lâm sàng
      diagnosis_primary, // Chẩn đoán chính
      diagnosis_secondary, // Chẩn đoán phụ

      // Prescription data
      regimen_type, // "continue" hoặc "change"
      arv_regimen_id, // ID phác đồ ARV nếu thay đổi
      arv_medications, // Danh sách thuốc ARV với chi tiết
      support_drugs, // Danh sách thuốc hỗ trợ
      counseling_notes, // Lời khuyên và tư vấn
      follow_up_plan, // Kế hoạch tái khám
      doctor_notes, // Ghi chú của bác sĩ

      // Test requests data
      test_requests, // Array of service IDs for test requests

      // Exam completion
      is_completed,
    } = req.body;

    console.log("saveExamData called with body:", req.body);

    // Validation for required fields
    if (!appointment_id) {
      return res.status(400).json({
        success: false,
        error: "appointment_id là bắt buộc",
      });
    }

    // Validate required fields for completion
    if (is_completed) {
      if (!vitals || !clinical_signs || !diagnosis_primary) {
        return res.status(400).json({
          success: false,
          error:
            "Sinh hiệu, dấu hiệu lâm sàng và chẩn đoán chính là bắt buộc để hoàn thành khám",
        });
      }

      if (regimen_type === "change" && !arv_regimen_id) {
        return res.status(400).json({
          success: false,
          error: "Phải chọn phác đồ điều trị khi thay đổi phác đồ",
        });
      }
    }

    // Prepare support drugs list for Prescriptions table
    const supportDrugNames =
      support_drugs && support_drugs.length > 0
        ? support_drugs.map((drug) => drug.drug_name).join(", ")
        : "";

    // Combine ARV medications and support drugs for PrescriptionDetails
    const allMedications = [];

    // Add ARV medications if present
    if (arv_medications && arv_medications.length > 0) {
      allMedications.push(
        ...arv_medications.map((med) => ({
          ...med,
          drug_type: "ARV",
        }))
      );
    }

    // Add support drugs if present
    if (support_drugs && support_drugs.length > 0) {
      allMedications.push(
        ...support_drugs.map((drug) => ({
          ...drug,
          drug_type: "SUPPORT",
        }))
      );
    }

    // Get doctor_id from token for test requests
    let doctorId;
    if (req.user.doctor_id) {
      doctorId = req.user.doctor_id;
    } else {
      const pool = await require("../config/db").poolPromise;
      const doctorResult = await pool
        .request()
        .input("account_id", req.user.userId)
        .query("SELECT doctor_id FROM Doctors WHERE account_id = @account_id");

      if (doctorResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Không tìm thấy thông tin bác sĩ",
        });
      }
      doctorId = doctorResult.recordset[0].doctor_id;
    }

    // Get patient_id from appointment
    const pool = await require("../config/db").poolPromise;
    const appointmentResult = await pool
      .request()
      .input("appointment_id", appointment_id)
      .query(
        "SELECT patient_id FROM Appointments WHERE appointment_id = @appointment_id"
      );

    if (appointmentResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy thông tin lịch hẹn",
      });
    }
    const patientId = appointmentResult.recordset[0].patient_id;

    const result = await doctorService.saveExamData({
      appointment_id,
      doctor_id: doctorId,
      patient_id: patientId,
      // ClinicalExams data
      vitals: vitals || "",
      weight: weight || 0,
      height: height || 0,
      bmi:
        bmi ||
        (weight && height
          ? (weight / Math.pow(height / 100, 2)).toFixed(2)
          : 0),
      clinical_signs: clinical_signs || "",
      diagnosis_primary: diagnosis_primary || "",
      diagnosis_secondary: diagnosis_secondary || "",

      // Prescriptions data
      arv_regimen_id: regimen_type === "change" ? arv_regimen_id : null,
      support_drugs: supportDrugNames,
      counseling_notes: counseling_notes || "",
      follow_up_plan: follow_up_plan || "",
      doctor_notes: doctor_notes || "",

      // PrescriptionDetails data
      prescription_details: allMedications,

      // Test requests data
      test_requests: test_requests || [],

      is_completed: is_completed || false,
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

// POST: Lưu tạm dữ liệu khám bệnh (không yêu cầu validation chặt chẽ)
const saveExamDataTemp = async (req, res) => {
  try {
    const {
      appointment_id,
      // Clinical Exam data
      vitals,
      weight,
      height,
      bmi,
      clinical_signs,
      diagnosis_primary,
      diagnosis_secondary,

      // Prescription data
      regimen_type,
      arv_regimen_id,
      arv_medications,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes,

      // Test requests data
      test_requests,
    } = req.body;

    console.log("saveExamDataTemp called with body:", req.body);

    // Kiểm tra tối thiểu: chỉ cần appointment_id
    if (!appointment_id) {
      console.log("Missing required field appointment_id");
      return res.status(400).json({
        success: false,
        error: "appointment_id là bắt buộc",
      });
    }

    // Prepare support drugs list for Prescriptions table
    const supportDrugNames =
      support_drugs && support_drugs.length > 0
        ? support_drugs.map((drug) => drug.drug_name).join(", ")
        : "";

    // Combine ARV medications and support drugs for PrescriptionDetails
    const allMedications = [];

    // Add ARV medications if present
    if (arv_medications && arv_medications.length > 0) {
      allMedications.push(
        ...arv_medications.map((med) => ({
          ...med,
          drug_type: "ARV",
        }))
      );
    }

    // Add support drugs if present
    if (support_drugs && support_drugs.length > 0) {
      allMedications.push(
        ...support_drugs.map((drug) => ({
          ...drug,
          drug_type: "SUPPORT",
        }))
      );
    }

    // Sử dụng service với dữ liệu tạm thời
    const result = await doctorService.saveExamData({
      appointment_id,
      // ClinicalExams data với giá trị mặc định
      vitals: vitals || "",
      weight: weight || 0,
      height: height || 0,
      bmi:
        bmi ||
        (weight && height
          ? (weight / Math.pow(height / 100, 2)).toFixed(2)
          : 0),
      clinical_signs: clinical_signs || "",
      diagnosis_primary: diagnosis_primary || "",
      diagnosis_secondary: diagnosis_secondary || "",

      // Prescriptions data
      arv_regimen_id: regimen_type === "change" ? arv_regimen_id : null,
      support_drugs: supportDrugNames,
      counseling_notes: counseling_notes || "",
      follow_up_plan: follow_up_plan || "",
      doctor_notes: doctor_notes || "",

      // PrescriptionDetails data
      prescription_details: allMedications,

      // Test requests data - không lưu test requests khi lưu tạm
      test_requests: [], // Temporary save không tạo test requests

      is_temporary: true, // Thêm flag để phân biệt là lưu tạm
      is_completed: false, // Draft save
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

//GET: lấy danh sách các loại thuốc
const getPrescriptionDetails = async (req, res) => {
  try {
    const prescriptionDetails = await doctorService.getPrescriptionDetails();
    res.status(200).json({
      success: true,
      data: prescriptionDetails,
    });
  } catch (err) {
    console.error("[API] getPrescriptionDetails error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// GET: Lấy danh sách thuốc ARV có sẵn
const getDrugOfARVMedications = async (req, res) => {
  try {
    const medications = await doctorService.getDrugOfARVMedications();
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

// GET: Lấy thông tin phác đồ ARV hiện tại của bệnh nhân
const getCurrentARVRegimen = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    console.log("[API] getCurrentARVRegimen called with patientId:", patientId);

    const arvData = await doctorService.getCurrentARVRegimen(patientId);

    res.status(200).json({
      success: true,
      data: arvData,
      message: arvData
        ? "Lấy thông tin phác đồ ARV thành công"
        : "Chưa có thông tin phác đồ ARV",
    });
  } catch (error) {
    console.error("[API] getCurrentARVRegimen error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi lấy thông tin phác đồ ARV",
    });
  }
};

// GET: Lấy kết quả xét nghiệm gần nhất của bệnh nhân
const getLatestTestResults = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    console.log("[API] getLatestTestResults called with patientId:", patientId);

    const testResults = await doctorService.getLatestTestResults(patientId);

    res.status(200).json({
      success: true,
      data: testResults,
      message: "Lấy kết quả xét nghiệm thành công",
    });
  } catch (error) {
    console.error("[API] getLatestTestResults error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi lấy kết quả xét nghiệm",
    });
  }
};

// GET: Lấy danh sách test có sẵn
const getAvailableTests = async (req, res) => {
  try {
    console.log("[API] getAvailableTests called");

    const tests = await doctorService.getAvailableTests();

    res.status(200).json({
      success: true,
      data: tests,
      message: "Lấy danh sách test thành công",
    });
  } catch (error) {
    console.error("[API] getAvailableTests error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi lấy danh sách test",
    });
  }
};

// GET: Lấy danh sách test đang thực hiện của bệnh nhân
const getOngoingTests = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    console.log("[API] getOngoingTests called with patientId:", patientId);

    const tests = await doctorService.getOngoingTests(patientId);

    res.status(200).json({
      success: true,
      data: tests,
      message: "Lấy danh sách test đang thực hiện thành công",
    });
  } catch (error) {
    console.error("[API] getOngoingTests error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi lấy danh sách test đang thực hiện",
    });
  }
};

// POST: Tạo test request cho bệnh nhân
const createTestRequest = async (req, res) => {
  try {
    const {
      patient_id,
      appointment_id,
      service_ids, // Array of service IDs
      notes,
    } = req.body;

    console.log("[API] createTestRequest called with:", {
      patient_id,
      appointment_id,
      service_ids,
      notes,
    });

    // Validate input
    if (
      !patient_id ||
      !appointment_id ||
      !service_ids ||
      !Array.isArray(service_ids) ||
      service_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Thiếu thông tin bắt buộc: patient_id, appointment_id, và service_ids",
      });
    }

    // Get doctor_id from token
    let doctorId;
    if (req.user.doctor_id) {
      doctorId = req.user.doctor_id;
    } else {
      const pool = await require("../config/db").poolPromise;
      const doctorResult = await pool
        .request()
        .input("account_id", req.user.userId)
        .query("SELECT doctor_id FROM Doctors WHERE account_id = @account_id");

      if (doctorResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Không tìm thấy thông tin bác sĩ",
        });
      }
      doctorId = doctorResult.recordset[0].doctor_id;
    }

    const result = await doctorService.createTestRequest({
      doctor_id: doctorId,
      patient_id,
      appointment_id,
      service_ids,
      notes,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: "Tạo chỉ định xét nghiệm thành công",
    });
  } catch (error) {
    console.error("[API] createTestRequest error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi tạo chỉ định xét nghiệm",
    });
  }
};

// Test Types and Test Requests Controllers for independent test ordering

// GET: Lấy danh sách test types
const getTestTypes = async (req, res) => {
  try {
    console.log("[API] getTestTypes called");
    const testTypes = await doctorService.getTestTypes();

    res.status(200).json({
      success: true,
      data: testTypes,
      message: "Lấy danh sách loại xét nghiệm thành công",
    });
  } catch (error) {
    console.error("[API] getTestTypes error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi lấy danh sách loại xét nghiệm",
    });
  }
};

// POST: Tạo test request độc lập
const createIndependentTestRequest = async (req, res) => {
  try {
    const doctorId = req.user?.doctor_id || req.user?.id;
    const { appointment_id, service_id, notes } = req.body;

    console.log("[API] createIndependentTestRequest called with:", {
      doctorId,
      appointment_id,
      service_id,
      notes,
    });

    if (!appointment_id || !service_id) {
      return res.status(400).json({
        success: false,
        message: "appointment_id và service_id là bắt buộc",
      });
    }

    const result = await doctorService.createIndependentTestRequest({
      doctor_id: doctorId,
      appointment_id,
      service_id,
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      data: result,
      message: "Tạo chỉ định xét nghiệm thành công",
    });
  } catch (error) {
    console.error("[API] createIndependentTestRequest error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi tạo chỉ định xét nghiệm",
    });
  }
};

// GET: Lấy danh sách test requests của bệnh nhân
const getTestRequestsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log(
      "[API] getTestRequestsByPatient called with patientId:",
      patientId
    );

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId là bắt buộc",
      });
    }

    const testRequests = await doctorService.getTestRequestsByPatient(
      patientId
    );

    res.status(200).json({
      success: true,
      data: testRequests,
      message: "Lấy danh sách chỉ định xét nghiệm thành công",
    });
  } catch (error) {
    console.error("[API] getTestRequestsByPatient error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi lấy danh sách chỉ định xét nghiệm",
    });
  }
};

// GET: Lấy chi tiết test request
const getTestRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;

    console.log(
      "[API] getTestRequestDetails called with requestId:",
      requestId
    );

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "requestId là bắt buộc",
      });
    }

    const testRequestDetails = await doctorService.getTestRequestDetails(
      requestId
    );

    res.status(200).json({
      success: true,
      data: testRequestDetails,
      message: "Lấy chi tiết chỉ định xét nghiệm thành công",
    });
  } catch (error) {
    console.error("[API] getTestRequestDetails error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi lấy chi tiết chỉ định xét nghiệm",
    });
  }
};

module.exports = {
  getDoctors,
  getAppointmentQueue,
  getAppointmentInProgress,
  getAppointmentFinshed,
  getExamHistory,
  getExamDetail,
  getCurrentExam,
  saveExamData,
  saveExamDataTemp,
  getDoctorByAccountId,
  getARVRegimens,
  getARVMedications,
  getAppointments,
  getCurrentARVRegimen,
  getLatestTestResults,
  getAvailableTests,
  getOngoingTests,
  getPrescriptionDetails,
  getDrugOfARVMedications,
  createTestRequest,
  getTestTypes,
  createIndependentTestRequest,
  getTestRequestsByPatient,
  getTestRequestDetails,
};
