require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTPEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Mã xác thực OTP',
    text: `Mã OTP của bạn là: ${otp}. Có hiệu lực trong 5 phút.`,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail };