const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

// GET api/v1/doctor/appointments/queue/:doctorId
router.get(
  "/appointments/queue/:doctorId",
  doctorController.getAppointmentQueue
);
router.get(
  "/appointments/in_progress/:doctorId",
  doctorController.getAppointmentInProgress
);
router.get(
  "/appointments/finished/:doctorId",
  doctorController.getAppointmentFinshed
);

// GET, lấy danh sách bác sĩ
router.get("/", doctorController.getDoctors);
router.get("/by-account/:accountId", doctorController.getDoctorByAccountId);

//GET, lấy danh sách lịch sử khám bệnh của bệnh nhân
router.get("/exam-history/:patientId", doctorController.getExamHistory);
router.get("/current-exam/:patientId", doctorController.getCurrentExam);

// GET, lấy danh sách phác đồ ARV và thuốc tương ứng
router.get("/arv-regimens", doctorController.getARVRegimens);
router.get("/arv-medications/:regimenId", doctorController.getARVMedications);

// POST, lưu dữ liệu khám bệnh (chẩn đoán, kế hoạch điều trị, etc.)
router.post("/save-exam-data", doctorController.saveExamData);

// POST, lưu tạm dữ liệu khám bệnh (không yêu cầu validation chặt chẽ)
router.post("/save-exam-data-temp", doctorController.saveExamDataTemp);

module.exports = router;
