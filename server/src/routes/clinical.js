const express = require("express");
const router = express.Router();
const clinicalController = require("../controllers/clinicalController");
const authMiddleware = require("../middlewares/authMiddleware");

// POST /api/v1/clinical-exams - Create/Update clinical exam
router.post(
  "/clinical-exams",
  authMiddleware,
  clinicalController.saveClinicalExam
);

module.exports = router;
