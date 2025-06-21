const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');


router.patch('/pay/:invoiceId', bookingController.confirmPayment);
//PATCH /booking/cancel/:invoiceId – huỷ cả appointment và invoice
router.patch('/cancel/:invoiceId', bookingController.cancelBooking);
router.post('/', bookingController.createBooking);





module.exports = router;

//--------------------------------------------------------------------------------------
// ///api/v1/doctor/appointments/queue (GET, lấy bệnh nhân chờ khám với service_type='examination' hoặc 'consultation'), 
// //router.get('/queue',doctorController.getPatientWait);
// //api/v1/doctor/appointments/in-progress (GET, lấy bệnh nhân đang khám), 
// //router.get('/in-progress',doctorController.getPatientInProgress);
// // /api/v1/doctor/appointments/finished (GET, lấy bệnh nhân hoàn thành khám), 
// //router.get('/finished',doctorController.getPatientfinished);
// // /api/v1/doctor/exams/{exam_id} (GET, lấy thẻ khám - thực tế chỉ có moi thông tin cơ bản), 
// router.get('/exams/:exam_id', doctorController.getExams);
//  //api/v1/doctor/prescriptions (POST, tạo đơn thuốc), 
// router.post('/', doctorController.createPrescription);
// ///api/v1/doctor/exams/{exam_id} (PATCH, cập nhật thẻ khá	m), -- liên quan nhiều bảng - tham khảo trang demo












