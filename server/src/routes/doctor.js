const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');





//--------------------------------------------------------------------------------------
///api/v1/doctor/appointments/queue (GET, lấy bệnh nhân chờ khám với service_type='examination' hoặc 'consultation'), 
//router.get('/queue',doctorController.getPatientWait);
//api/v1/doctor/appointments/in-progress (GET, lấy bệnh nhân đang khám), 
//router.get('/in-progress',doctorController.getPatientInProgress);
// /api/v1/doctor/appointments/finished (GET, lấy bệnh nhân hoàn thành khám), 
//router.get('/finished',doctorController.getPatientfinished);
// /api/v1/doctor/exams/{exam_id} (GET, lấy thẻ khám - thực tế chỉ có moi thông tin cơ bản), 
router.get('/exams/:exam_id', doctorController.getExams);
 //api/v1/doctor/prescriptions (POST, tạo đơn thuốc), 
router.post('/', doctorController.createPrescription);
///api/v1/doctor/exams/{exam_id} (PATCH, cập nhật thẻ khá	m), -- liên quan nhiều bảng - tham khảo trang demo
router.patch('/doctor/exams/:examID', doctorController.updateExam);











// GET api/v1/doctor/appointments/queue
router.get("/queue/:doctorId", doctorController.getAppointmentQueue);
router.get("/in_progress/:doctorId", doctorController.getAppointmentInProgress);
router.get("/finished/:doctorId", doctorController.getAppointmentFinshed);

// GET, lấy danh sách bác sĩ
router.get("/", doctorController.getDoctors);

//GET, lấy danh sách lịch sử khám bệnh của bệnh nhân
router.get("/exam-history/:patientId", doctorController.getExamHistory);
router.get("/currrent-exam/:patientId", doctorController.getCurrentExam);

module.exports = router;


