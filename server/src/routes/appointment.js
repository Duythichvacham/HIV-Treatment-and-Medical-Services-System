const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Kiểm tra lịch hẹn đã tồn tại (phải đặt trước các route có params)
router.get("/check-existing", appointmentController.checkExistingAppointment);

// Manual cancel tất cả pending appointments trong ngày (cho admin/manager)
router.patch(
  "/cancel-pending",
  appointmentController.cancelPendingAppointments
);

// Đặt lịch khám mới
router.post("/", appointmentController.createAppointment);
// GET lấy danh sách lịch hẹn của người dùng
// router.get("/", appointmentController.getAppointments);
router.patch("/:appointment_id/status", appointmentController.updateStatus);

// Lấy chi tiết lịch hẹn theo appointment_id
router.get("/:appointment_id", appointmentController.getAppointmentDetail);

module.exports = router;
