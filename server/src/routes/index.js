const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const patientRouter = require('./patients');
const userRouter = require('./users');
const appointmentRouter = require('./appointments');

function route(app) {
    app.use('/auths', authRouter);
    app.use('/users', userRouter);
    app.use('/patients', patientRouter);
    app.use('/api/v1/appointments', appointmentRouter);
}

module.exports = route;