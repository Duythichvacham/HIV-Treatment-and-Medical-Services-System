const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create_payment_url', paymentController.createPaymentUrl);
router.get('/vnpay_return', paymentController.handleReturn);
router.get('/vnpay_ipn', paymentController.handleIPN);
module.exports = router;
