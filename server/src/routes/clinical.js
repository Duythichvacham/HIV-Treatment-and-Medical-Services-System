const express = require("express");
const router = express.Router();
const clinicalController = require("../controllers/clinicalController");
const authMiddleware = require("../middlewares/authMiddleware");

// POST ${import.meta.env.VITE_API_PREFIX}/clinical-exams - Create/Update clinical exam
router.post(
  "/clinical-exams",
  authMiddleware,
  clinicalController.saveClinicalExam
);

// GET ${import.meta.env.VITE_API_PREFIX}/clinical-exams/:appointmentId - Get clinical exam data by appointment ID
router.get(
  "/clinical-exams/:appointmentId",
  authMiddleware,
  clinicalController.getClinicalExamByAppointmentId
);

module.exports = router;
