const { sendOTPEmail } = require('../services/emailService');
const { verifiedEmails, otpStore } = require('../utils/otpStore');


exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
  await sendOTPEmail(email, otp);
  res.json({ message: 'OTP sent' });
};

exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
  }
  delete otpStore[email];
  verifiedEmails[email] = Date.now() + 10 * 60 * 1000; // Cho phép đăng ký/đổi mật khẩu trong 10 phút
  res.json({ message: 'OTP verified' });
};