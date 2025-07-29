const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const serviceController = require("../controllers/serviceController");
const slotController = require("../controllers/slotController");
const emailController = require("../controllers/emailController");

//GET lấy danh sách bác sĩ
router.get("/doctors", doctorController.getDoctors);
// GET, lấy danh sách dịch vụ theo type
router.get("/services", serviceController.getServices);
// GET, lấy danh sách slot theo doctor_id
router.get("/slots", slotController.getSlots);

router.post("/send-reminder", emailController.sendAllReminders);

module.exports = router;
