const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

// GET api/v1/doctor/appointments/queue
router.get("/queue/:doctorId", doctorController.getAppointmentQueue);
router.get("/in_progress/:doctorId", doctorController.getAppointmentInProgress);
router.get("/finished/:doctorId", doctorController.getAppointmentFinshed);

// GET, lấy danh sách bác sĩ
router.get("/", doctorController.getDoctors);

//GET, lấy danh sách lịch sử khám bệnh của bệnh nhân
router.get("/exam-history/:patientId", doctorController.getExamHistory);

module.exports = router;
