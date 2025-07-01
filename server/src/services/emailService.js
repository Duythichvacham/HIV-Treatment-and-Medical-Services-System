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

async function sendTestResultEmail(to, subject, content) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: content,
  };
  await transporter.sendMail(mailOptions);
}

async function sendAppointmentEmail(to, subject, content) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: content,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail, sendTestResultEmail, sendAppointmentEmail };