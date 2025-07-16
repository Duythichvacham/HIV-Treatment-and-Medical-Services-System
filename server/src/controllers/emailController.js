const { sendOtp, sendTestResult, sendAllReminders } = require('../services/emailService');
const { verifiedEmails, otpStore } = require('../utils/otpStore');

// Gửi OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = await sendOtp(email);
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
  res.json({ message: 'OTP sent' });
};

exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
  }
  delete otpStore[email];
  verifiedEmails[email] = Date.now() + 10 * 60 * 1000;
  res.json({ message: 'OTP verified' });
};

// Gửi kết quả xét nghiệm
exports.sendTestResult = async (req, res) => {
  try {
    const { test_note_id } = req.body;
    await sendTestResult(test_note_id);
    res.json({ message: 'Đã gửi kết quả xét nghiệm qua email.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi gửi email: ' + err.message });
  }
};

// Gửi nhắc lịch cho tất cả bệnh nhân
exports.sendAllReminders = async (req, res) => {
  try {
    const count = await sendAllReminders();
    res.json({ message: `Đã gửi nhắc lịch cho ${count} bệnh nhân!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};