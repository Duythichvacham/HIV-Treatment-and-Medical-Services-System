const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescriptionController");
const authMiddleware = require("../middlewares/authMiddleware");

// POST /api/prescriptions - Create/Update prescription
router.post(
  "/prescriptions",
  authMiddleware,
  prescriptionController.savePrescription
);

// POST /api/prescription-details - Create/Update prescription details
router.post(
  "/prescription-details",
  authMiddleware,
  prescriptionController.savePrescriptionDetails
);

module.exports = router;
