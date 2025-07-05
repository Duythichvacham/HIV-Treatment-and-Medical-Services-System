const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create', paymentController.createPayment);
router.get('/vnpay-return', paymentController.vnpayReturn);

module.exports = router;
