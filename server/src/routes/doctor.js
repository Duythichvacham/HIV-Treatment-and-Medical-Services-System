const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const authenticateToken = require("../middlewares/authMiddleware");

// Lấy danh sách lịch hẹn của bác sĩ với các bộ lọc
router.get(
  "/appointments",
  authenticateToken,
  doctorController.getAppointments
);

// GET, lấy danh sách bác sĩ
router.get("/", doctorController.getDoctors);
router.get("/by-account/:accountId", doctorController.getDoctorByAccountId);

// GET, lấy kết quả xét nghiệm gần nhất của bệnh nhân
router.get(
  "/latest-tests/:patientId",
  authenticateToken,
  doctorController.getLatestTestResults
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
// router.post(
//   "/exams/:appointmentId",
//   authenticateToken,
//   doctorController.saveClinicalExam
// );
router.get(
  "/exams/clinical/:appointmentId",
  authenticateToken,
  doctorController.getClinicalExamData
);
router.get(
  "/exams/prescription/:appointmentId",
  authenticateToken,
  doctorController.getPrescriptionExamData
);

router.get(
  "/prescription/detail/:prescriptionId",
  authenticateToken,
  doctorController.getPrescriptionDetail
);

module.exports = router;
