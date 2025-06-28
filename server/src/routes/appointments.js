const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const authenticateToken = require("../middleware/authMiddleware");

// Kiểm tra lịch hẹn đã tồn tại (phải đặt trước các route có params)
router.get("/check-existing", authenticateToken, appointmentController.checkExistingAppointment);

// Manual cancel tất cả pending appointments trong ngày (cho admin/manager)
router.post("/cancel-pending", appointmentController.cancelPendingAppointments);

// Đặt lịch khám mới
router.post("/", authenticateToken, appointmentController.createAppointment);

// GET lấy danh sách lịch hẹn của người dùng
// router.get("/", appointmentController.getAppointments);
///api/v1/appointments/{appointment_id}/status (PATCH, cập nhật status cho appointments)
router.patch("/:appointment_id/status", authenticateToken, appointmentController.updateStatus);

// Lấy chi tiết lịch hẹn theo appointment_id
router.get("/:appointment_id", authenticateToken, appointmentController.getAppointmentDetail);

// Lấy invoice của appointment
router.get("/:appointment_id/invoice", authenticateToken, appointmentController.getAppointmentInvoice);

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
