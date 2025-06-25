const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const appointmentController = require("../controllers/appointmentController");

// Đặt lịch khám mới
router.post("/", authenticateToken, appointmentController.createAppointment);

//GET, lấy bệnh nhân chờ xét nghiệm với service_type='test'
router.get("/queue", authenticateToken, appointmentController.getLabTestQueue);

//GET, lấy bệnh nhân đang xét nghiệm
router.get(
  "/in-progress",
  authenticateToken,
  appointmentController.getLabTestInProgress
);

// GET, lấy bệnh nhân hoàn thành api/v1/lab/appointments/finished
router.get(
  "/finished",
  authenticateToken,
  appointmentController.getLabTestFinished
);

// GET lấy danh sách lịch hẹn của người dùng 
router.get("/user", authenticateToken, appointmentController.getAppointmentsByPatientId);

///api/v1/appointments/{appointment_id}/status (POST, cập nhật status cho appointments)
router.post("/:appointment_id/status", authenticateToken, appointmentController.updateStatus);

// Lấy chi tiết lịch hẹn theo appointment_id
router.get(
  "/:appointment_id",
  authenticateToken,
  appointmentController.getAppointmentDetail
);

module.exports = router;
