const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

// GET api/v1/doctor/appointments/queue
router.get("/queue", doctorController.getAppointmentQueue);
router.get("/in_progress", doctorController.getAppointmentInProgress);
router.get("/finished", doctorController.getAppointmentFinshed);

module.exports = router;
