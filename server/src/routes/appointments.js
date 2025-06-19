const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

//GET, lấy bệnh nhân chờ xét nghiệm với service_type='test'
router.get("/queue", appointmentController.getLabTestQueue);

//GET, lấy bệnh nhân đang xét nghiệm
router.get("/in-progress", appointmentController.getLabTestInProgress);

// GET, lấy bệnh nhân hoàn thành api/v1/lab/appointments/finished
router.get("/finished", appointmentController.getLabTestFinished);

///api/v1/appointments/{appointment_id}/status (POST, cập nhật status cho appointments)
router.post("/:appointment_id/status", appointmentController.updateStatus);

module.exports = router;
