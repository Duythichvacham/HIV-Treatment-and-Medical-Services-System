const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const emailController = require('../controllers/emailController');

router.post('/login', authController.login);
router.post('/register/patient', authController.registerPatient);

router.post('/change-password', authMiddleware, authController.changePassword);

router.post('/send-otp', emailController.sendOtp);  
router.post('/verify-otp', emailController.verifyOtp);

router.post('/reset-password', authController.resetPassword);

router.post('/check-email', authController.checkEmailExists);

module.exports = router;