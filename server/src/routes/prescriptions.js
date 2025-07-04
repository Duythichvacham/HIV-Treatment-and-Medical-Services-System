const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescriptionController");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/prescriptions - Create/Update prescription
router.post("/", prescriptionController.savePrescription);

router.get("/:appointmentId", prescriptionController.getPrescriptionExamData);

module.exports = router;
