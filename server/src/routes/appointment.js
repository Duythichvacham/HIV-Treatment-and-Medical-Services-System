const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Kiểm tra lịch hẹn đã tồn tại (phải đặt trước các route có params)
router.get("/check-existing", appointmentController.checkExistingAppointment);

// Manual cancel tất cả pending appointments trong ngày (cho admin/manager)
router.post("/cancel-pending", appointmentController.cancelPendingAppointments);

// Đặt lịch khám mới
router.post("/", appointmentController.createAppointment);

// Confirm payment for appointment
router.post(
  "/:appointmentId/confirm-payment",
  appointmentController.confirmPayment
);

// GET lấy danh sách lịch hẹn của người dùng
// router.get("/", appointmentController.getAppointments);
///api/v1/appointments/{appointment_id}/status (POST, cập nhật status cho appointments)
router.post("/:appointment_id/status", appointmentController.updateStatus);

// Lấy chi tiết lịch hẹn theo appointment_id
router.get("/:appointment_id", appointmentController.getAppointmentDetail);

module.exports = router;
/** 
 * đám này dự tính sẽ xóa hoặc có thay đổi
//GET, lấy bệnh nhân chờ xét nghiệm với service_type='test'
router.get("/queue", appointmentController.getLabTestQueue);

//GET, lấy bệnh nhân đang xét nghiệm
router.get("/in-progress", appointmentController.getLabTestInProgress);

// GET, lấy bệnh nhân hoàn thành api/v1/lab/appointments/finished
router.get("/finished", appointmentController.getLabTestFinished);
*/
