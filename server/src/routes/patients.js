const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');


//GET, search bệnh nhân bằng sdt và tên
router.get('/search',patientController.getPatientByNameSdt);

// //GET, lấy bệnh nhân đang xét nghiệm
// router.get('/in-progress', appointmentContronp~ller.getLabTestInProgress);

// // GET, lấy bệnh nhân hoàn thành api/v1/lab/appointments/finished 
// router.get('/finished', appointmentController.getLabTestFinished);

// ///api/v1/appointments/{appointment_id}/status (POST, cập nhật status cho appointments)
// router.post('/:appointment_id/status', appointmentController.updateStatus);

module.exports = router;