const express = require("express");
const router = express.Router();

require("dotenv").config(); // load biến môi trường từ file .env
const authRouter = require("./auth");
const patientRouter = require("./patients");
const userRouter = require("./users");
const bookingRouter = require("./booking");
const authenticateToken = require('../middleware/authMiddleware');

const appointmentRouter = require("./appointments");
const testRouter = require("./test");
const doctorRouter = require("./doctor");
const slotRouter = require("./slot");

const serviceRouter = require("./service");


// thằng nào fix mà xóa cái gì nữa t đấm vô mỏ nhé :v

// mấy thằng này sẽ đẩy qua app.js để gọi sau - tiền tố thì sẽ lấy trong file .env

function route(app) {
  //POST, cập nhật status cho appointments
  app.use("/api/v1/appointments", appointmentRouter);

  ///api/v1/lab/appointments/finished||in-progress||queue
  app.use("/api/v1/lab/appointments", appointmentRouter);

  ///api/v1/test-requests/{id}/status (PATCH, cập nhật status của TestRequests nếu service_type là "examinationination")
  app.use("/api/v1/test-requests", testRouter);

  ///api/v1/lab/test-notes/{test_note_id} (GET, lấy chi tiết phiếu xét nghiệm)
  app.use("/api/v1/lab/test-notes", testRouter);

  ///api/v1/lab/test-results (POST, nhập kết quả xét nghiệm và hoàn thành)
  app.use("/api/v1/lab", testRouter);

  ///api/v1/doctor/appointments/finished||in-progress||queue
  app.use("/api/v1/doctor/appointments", doctorRouter);

  ///api/patient/:patientId/exam-history||current-exam
  app.use("/api/v1/doctor/patient", doctorRouter);

  //POST, cập nhật status cho appointments
  app.use(`${process.env.API_PREFIX}/appointments`, appointmentRouter);

  ///api/v1/lab/appointments/finished||in-progress||queue
  app.use(`${process.env.API_PREFIX}/lab/appointments`, appointmentRouter);

  ///api/v1/test-requests/{id}/status (PATCH, cập nhật status của TestRequests nếu service_type là "examinationination")
  app.use(`${process.env.API_PREFIX}/test-requests`, testRouter);

  ///api/v1/lab/test-notes/{test_note_id} (GET, lấy chi tiết phiếu xét nghiệm)
  app.use(`${process.env.API_PREFIX}/lab/test-notes`, testRouter);

  ///api/v1/lab/test-results (POST, nhập kết quả xét nghiệm và hoàn thành)
  app.use(`${process.env.API_PREFIX}/lab/test-results`, testRouter);
  //GET, lấy danh sách bác sĩ
  app.use("/api/public/doctors", doctorRouter);
  //GET, lấy danh sách dịch vụ public
  app.use("/api/public/services", serviceRouter);
  //  GET, lấy slots theo lịch làm việc từng bác sĩ
  app.use("/api/public/slots", slotRouter);

  
//     /api/v1/patients/search?name=...&phone=... (GET, tìm kiếm bệnh nhân) - search theo Sdt - tên
app.use('/api/v1/patients' ,patientRouter );


// /api/v1/doctor/appointments/queue (GET, lấy bệnh nhân chờ khám với service_type='examination' hoặc 'consultation')
//app.use('/api/v1/doctor/appointments',doctorRouter);

//api/v1/doctor/appointments/in-progress (GET, lấy bệnh nhân đang khám), 
//app.use('/api/v1/doctor/appointments',doctorRouter);

// /api/v1/doctor/appointments/finished (GET, lấy bệnh nhân hoàn thành khám), 
//app.use('/api/v1/doctor/appointments',doctorRouter);

// /api/v1/doctor/exams/{exam_id} (GET, lấy thẻ khám - thực tế chỉ có moi thông tin cơ bản), 
app.use('/api/v1/doctor' , doctorRouter);
// /api/v1/doctor/exams/{exam_id} (PATCH, cập nhật thẻ khám), -- liên quan nhiều bảng - tham khảo trang demo
app.use('/api/v1/' , doctorRouter);

// /api/v1/doctor/prescriptions (POST, tạo đơn thuốc), 
app.use('/api/v1/doctor/prescriptions' , doctorRouter);

//PATCH /booking/pay/:invoiceId – xác nhận thanh toán
app.use('/booking',bookingRouter);
//PATCH /booking/cancel/:invoiceId – huỷ cả appointment và invoice
app.use('/booking',bookingRouter);


//POST login
  app.use("/api/auth", authRouter);

//POST /booking – tạo appointment + invoice
app.use('/booking' ,bookingRouter);
//GET /appointments – lấy danh sách lịch hẹn của người dùng
app.use('/appointments' , authenticateToken,appointmentRouter);
app.use("/api/v1/lab", testRouter);
// app.use("/api/v1/lab", testRouter);
// app.use("/api/v1/lab", testRouter);

app.use('/api/v1/lab/appointments/test', testRouter);
}





module.exports = route;