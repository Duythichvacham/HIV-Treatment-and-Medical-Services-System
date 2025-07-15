const doctorService = require("../services/doctorService");
const appointmentService = require("../services/appointmentService");
// const doctor_id = 1;

const getAppointments = async (req, res) => {
  try {
    // Lấy account_id từ JWT token (support cả account_id và userId)
    const accountId = req.user.account_id || req.user.userId;

    // Lấy doctor_id trực tiếp từ token hoặc query từ DB
    let doctorId = req.user.doctor_id;
    const { status, bookingDate, slot_id, patient_id } = req.query;
    // Thực hiện query dựa trên các tham số
    const appointments = await appointmentService.getAppointments(
      doctorId,
      status,
      bookingDate,
      slot_id,
      patient_id
    );

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

const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const updateData = req.body;
    if (!doctorId || !updateData) {
      return res.status(400).json({
        success: false,
        message: "doctorId and updateData are required",
      });
    }
    const updatedDoctor = await doctorService.updateDoctorProfile(
      doctorId,
      updateData
    );
    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }
    res.status(200).json({
      success: true,
      data: updatedDoctor,
      message: "Doctor profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "doctorId is required",
      });
    }
    const doctorProfile = await doctorService.getDoctorProfile(doctorId);
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }
    res.status(200).json({
      success: true,
      data: doctorProfile,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// (GET, lấy danh sách bác sĩ - có thể filter theo ngày)
const getDoctors = async (req, res) => {
  try {
    const { date } = req.query;

    let doctors;
    if (date) {
      // Lấy doctors có ca làm việc trong ngày được chỉ định
      doctors = await doctorService.getDoctorsByDate(date);
    } else {
      // Lấy tất cả doctors
      doctors = await doctorService.getDoctors();
    }

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Internal server error" });
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

// POST: Tạo test request cho bệnh nhân
const createTestRequest = async (req, res) => {
  try {
    const { appointment_id, service_id, notes } = req.body;

    // Get doctor_id from token
    let doctor_id = req.user.doctor_id;
    console.log(doctor_id);

    const result = await doctorService.createIndependentTestRequest({
      doctor_id,
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
    console.error("[API] createTestRequest error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi tạo chỉ định xét nghiệm",
    });
  }
};

// GET: Lấy test request hiện tại của bệnh nhân
const getCurrentTestRequest = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId là bắt buộc",
      });
    }

    const rawData = await doctorService.getCurrentTestRequest(appointmentId);

    if (!rawData || rawData.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không tìm thấy chỉ định xét nghiệm cho cuộc hẹn này",
      });
    }

    // Gom nhóm dữ liệu: phần chung + danh sách services
    const {
      request_id,
      appointment_id,
      doctor_id,
      request_date,
      status,
      detail_created_at,
    } = rawData[0];

    const services = rawData.map((item) => ({
      service_id: item.service_id,
      name: item.name,
      notes: item.notes,
    }));

    const formatted = {
      request_id,
      appointment_id,
      doctor_id,
      request_date,
      status,
      detail_created_at,
      services,
    };

    res.status(200).json({
      success: true,
      data: formatted,
      message: "Lấy chỉ định xét nghiệm thành công",
    });
  } catch (error) {
    console.error("[API] getCurrentTestRequest error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi lấy chỉ định xét nghiệm",
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
const getClinicalExamData = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId là bắt buộc",
      });
    }

    const clinicalExamData = await doctorService.getClinicalExamData(
      appointmentId
    );

    if (!clinicalExamData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu khám lâm sàng cho cuộc hẹn này",
      });
    }

    res.status(200).json({
      success: true,
      data: clinicalExamData,
      message: "Lấy dữ liệu khám lâm sàng thành công",
    });
  } catch (error) {
    console.error("[API] getClinicalExamData error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi lấy dữ liệu khám lâm sàng",
    });
  }
};

const getPrescriptionExamData = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId là bắt buộc",
      });
    }

    const prescriptionExamData = await doctorService.getPrescriptionExamData(
      appointmentId
    );

    res.status(200).json({
      success: true,
      data: prescriptionExamData,
      message: "Lấy dữ liệu đơn thuốc thành công",
    });
  } catch (error) {
    console.error("[API] getPrescriptionExamData error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi lấy dữ liệu đơn thuốc",
    });
  }
};

const getPrescriptionDetail = async (req, res) => {
  try {
    const prescriptionId = req.params.prescriptionId;
    if (!prescriptionId) {
      return res.status(400).json({
        success: false,
        message: "prescriptionId là bắt buộc",
      });
    }

    const prescriptionDetail = await doctorService.getPrescriptionDetail(
      prescriptionId
    );

    if (!prescriptionDetail) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chi tiết đơn thuốc",
      });
    }

    res.status(200).json({
      success: true,
      data: prescriptionDetail,
      message: "Lấy chi tiết đơn thuốc thành công",
    });
  } catch (error) {
    console.error("[API] getPrescriptionDetail error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Có lỗi xảy ra khi lấy chi tiết đơn thuốc",
    });
  }
};

// Export all functions

module.exports = {
  getDoctors,
  getDoctorByAccountId,
  getAppointments,
  getLatestTestResults,
  getPrescriptionDetails,
  createTestRequest,
  getTestTypes,
  createIndependentTestRequest,
  getTestRequestsByPatient,
  getTestRequestDetails,
  getCurrentTestRequest,
  getClinicalExamData,
  getPrescriptionExamData,
  getPrescriptionDetail,
  getDoctorProfile,
  updateDoctorProfile,
};
