  const express = require('express');
  const router = express.Router();
  const appointmentController = require('../controllers/appointmentController');

  router.post('/:appointment_id/status', appointmentController.updateStatus);

  module.exports = router;