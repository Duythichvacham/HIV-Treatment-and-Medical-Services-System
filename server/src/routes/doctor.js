const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const authenticateToken = require("../middlewares/authMiddleware");

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

// GET, lấy kết quả xét nghiệm gần nhất của bệnh nhân
router.get(
  "/latest-tests/:patientId",
  authenticateToken,
  doctorController.getLatestTestResults
);

// POST, lưu dữ liệu khám bệnh (chẩn đoán, kế hoạch điều trị, etc.)
// router.post(
//   "/save-exam-data",
//   authenticateToken,
//   doctorController.saveExamData
// );

// POST, lưu tạm dữ liệu khám bệnh (không validate, cho phép thiếu thông tin)
router.post(
  "/save-exam-data-temp",
  authenticateToken,
  doctorController.saveExamDataTemp
);

// POST, hoàn thành khám bệnh (validate đầy đủ, set status completed)
router.post("/complete-exam", authenticateToken, doctorController.completeExam);

// GET, lấy dữ liệu khám đã lưu tạm để tiếp tục khám
// router.get(
//   "/exam-data/:appointmentId",
//   authenticateToken,
//   doctorController.getExamData
// );

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

// GET, lấy danh sách test requests hiện tại của bên
router.get(
  "/current-test-request/:appointmentId",
  authenticateToken,
  doctorController.getCurrentTestRequest
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
router.post(
  "/exams/:appointmentId",
  authenticateToken,
  doctorController.saveClinicalExam
);
router.get(
  "/exams/:appointmentId",
  authenticateToken,
  doctorController.getClinicalExam
);

module.exports = router;
