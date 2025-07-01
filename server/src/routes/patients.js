const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const patientController = require("../controllers/patientController");
module.exports = router;
///patients/search?name=...&phone=... (GET, tìm kiếm bệnh nhân) - search theo Sdt - tên

//// GET lấy danh sách appointments của một patient theo patient_id
router.get(
  "/appointment-history",
  appointmentController.getAppointmentsByPatientId
);

router.get(
  "/current-arv-regimen/:patientId",
  patientController.getCurrentARVRegimen
);

router.get("/latest-tests/:patientId", patientController.getLatestTestResults);

module.exports = router;
