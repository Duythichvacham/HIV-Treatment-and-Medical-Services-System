const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const authenticateToken = require("../middleware/authMiddleware");

// // GET api/v1/doctor/appointments/queue/:doctorId
// router.get(
//   "/appointments/queue/:doctorId",
//   doctorController.getAppointmentQueue
// );
// router.get(
//   "/appointments/in_progress/:doctorId",
//   doctorController.getAppointmentInProgress
// );
// router.get(
//   "/appointments/finished/:doctorId",
//   doctorController.getAppointmentFinshed
// );

// Lấy danh sách lịch hẹn của bác sĩ với các bộ lọc
router.get(
  "/appointments",
  authenticateToken,
  doctorController.getAppointments
);

// GET, lấy danh sách bác sĩ
router.get("/", doctorController.getDoctors);
router.get("/by-account/:accountId", doctorController.getDoctorByAccountId);

//GET, lấy danh sách lịch sử khám bệnh của bệnh nhân
router.get(
  "/exam-history/:patientId",
  authenticateToken,
  doctorController.getExamHistory
);

//GET, lấy chi tiết một lần khám cụ thể
router.get(
  "/exam-detail/:patientId/:appointmentId",
  authenticateToken,
  doctorController.getExamDetail
);

router.get(
  "/current-exam/:patientId",
  authenticateToken,
  doctorController.getCurrentExam
);

// GET, lấy danh sách phác đồ ARV và thuốc tương ứng
router.get("/arv-regimens", authenticateToken, doctorController.getARVRegimens);

// GET, lấy danh sách thuốc ARV theo phác đồ
router.get(
  "/arv-medications/:regimenId",
  authenticateToken,
  doctorController.getARVMedications
);

// GET, lấy danh sách thuốc ARV có sẵn
router.get(
  "/arv-medications",
  authenticateToken,
  doctorController.getDrugOfARVMedications
);

// GET, lấy thông tin phác đồ ARV hiện tại của bệnh nhân
router.get(
  "/current-arv/:patientId",
  authenticateToken,
  doctorController.getCurrentARVRegimen
);

// GET, lấy kết quả xét nghiệm gần nhất của bệnh nhân
router.get(
  "/latest-tests/:patientId",
  authenticateToken,
  doctorController.getLatestTestResults
);

// POST, lưu dữ liệu khám bệnh (chẩn đoán, kế hoạch điều trị, etc.)
router.post(
  "/save-exam-data",
  authenticateToken,
  doctorController.saveExamData
);

// POST, lưu tạm dữ liệu khám bệnh (không yêu cầu validation chặt chẽ)
router.post(
  "/save-exam-data-temp",
  authenticateToken,
  doctorController.saveExamDataTemp
);

// GET, lấy danh sách test có sẵn
router.get(
  "/available-tests",
  authenticateToken,
  doctorController.getAvailableTests
);

// GET, lấy danh sách test đang thực hiện của bệnh nhân
router.get(
  "/ongoing-tests/:patientId",
  authenticateToken,
  doctorController.getOngoingTests
);

// POST, tạo test request cho bệnh nhân
router.post(
  "/test-requests",
  authenticateToken,
  doctorController.createTestRequest
);

// POST, tạo test request mới (độc lập)
router.post(
  "/independent-test-requests",
  authenticateToken,
  doctorController.createIndependentTestRequest
);

// GET, lấy danh sách test đang thực hiện của bệnh nhân
router.get(
  "/prescriptionDetails",
  authenticateToken,
  doctorController.getPrescriptionDetails
);

// GET, lấy danh sách test types (4 loại chính)
router.get("/test-types", authenticateToken, doctorController.getTestTypes);

// GET, lấy danh sách test requests của bệnh nhân
router.get(
  "/test-requests/:patientId",
  authenticateToken,
  doctorController.getTestRequestsByPatient
);

// GET, lấy chi tiết test request
router.get(
  "/test-request-details/:requestId",
  authenticateToken,
  doctorController.getTestRequestDetails
);

module.exports = router;
