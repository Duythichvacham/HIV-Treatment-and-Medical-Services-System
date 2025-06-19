const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

// GET api/v1/doctor/appointments/queue
router.get("/queue", doctorController.getAppointmentQueue);
router.get("/in_progress", doctorController.getAppointmentInProgress);
router.get("/finished", doctorController.getAppointmentFinshed);

// GET, lấy danh sách bác sĩ
router.get("/", doctorController.getDoctors);

module.exports = router;
