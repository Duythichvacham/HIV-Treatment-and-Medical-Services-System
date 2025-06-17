const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const patientRouter = require('./patients');
const userRouter = require('./users');
const appointmentRouter = require('./appointments');
const testRouter = require('./test');

function route(app) {
    //POST, cập nhật status cho appointments
    app.use('/api/v1/appointments', appointmentRouter);

    ///api/v1/lab/appointments/finished||in-progress||queue
    app.use('/api/v1/lab/appointments', appointmentRouter);

    ///api/v1/test-requests/{id}/status (PATCH, cập nhật status của TestRequests nếu service_type là "examinationination")
    app.use('/api/v1/test-requests', testRouter);

    ///api/v1/lab/test-notes/{test_note_id} (GET, lấy chi tiết phiếu xét nghiệm)
    app.use('/api/v1/lab/test-notes', testRouter);
    
    ///api/v1/lab/test-results (POST, nhập kết quả xét nghiệm và hoàn thành)
    app.use('/api/v1/lab/test-results', testRouter);
}

module.exports = route;