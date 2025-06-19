const express = require("express");
const router = express.Router();
require("dotenv").config(); // load biến môi trường từ file .env
const authRouter = require("./auth");
const patientRouter = require("./patients");
const userRouter = require("./users");
const appointmentRouter = require("./appointments");
const testRouter = require("./test");
const doctorRouter = require("./doctor");
const slotRouter = require("./slot");
// mấy thằng này sẽ đẩy qua app.js để gọi sau - tiền tố thì sẽ lấy trong file .env
function route(app) {
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
  app.use("/api/public/slots", slotRouter);
}

module.exports = route;
