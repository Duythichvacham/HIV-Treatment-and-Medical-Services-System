const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
module.exports = router;
///patients/search?name=...&phone=... (GET, tìm kiếm bệnh nhân) - search theo Sdt - tên

//// GET lấy danh sách appointments của một patient theo patient_id
router.get(
  "/appointment-history",
  appointmentController.getAppointmentsByPatientId
);
