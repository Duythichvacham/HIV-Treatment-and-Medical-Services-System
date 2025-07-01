const { sendOTPEmail, sendTestResultEmail } = require('../services/emailService');
const { verifiedEmails, otpStore } = require('../utils/otpStore');
const { getTestNoteDetail, getTestResultsByTestNoteId } = require('../services/testService');
const { poolPromise } = require('../config/db');
const { sendAppointmentEmail } = require('../services/emailService');
const { getTomorrowAppointments } = require('../services/appointmentService');


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
  console.log('Set verifiedEmails:', email, verifiedEmails[email]);
  res.json({ message: 'OTP verified' });
};

exports.sendTestResult = async (req, res) => {
  try {
    const { test_note_id } = req.body;

    // 1. Lấy chi tiết phiếu xét nghiệm (TestNote)
    const testNote = await getTestNoteDetail(test_note_id);
    if (!testNote) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu xét nghiệm.' });
    }

    // 2. Lấy email bệnh nhân từ appointment_id
    const pool = await poolPromise;
    const result = await pool.request()
      .input('appointment_id', testNote.appointment_id)
      .query(`
        SELECT p.email, p.full_name
        FROM Appointments a
        JOIN Patients p ON a.patient_id = p.patient_id
        WHERE a.appointment_id = @appointment_id
      `);
    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Không tìm thấy email bệnh nhân.' });
    }
    const { email, full_name } = result.recordset[0];

    // 3. Lấy danh sách kết quả xét nghiệm (TestResults)
    const testResults = await getTestResultsByTestNoteId(test_note_id);

    // 4. Soạn nội dung email
    let content = `Xin chào ${full_name},\n\nKết quả xét nghiệm của bạn:\n`;
    testResults.forEach(r => {
      content += `- ${r.test_type_name}: ${r.result_value} ${r.unit || ''} (Chỉ số tham chiếu: ${r.reference_range || 'N/A'})\n`;
    });
    content += testNote.notes ? `\nGhi chú của phòng xét nghiệm: ${testNote.notes}\n` : '';
    content += `\nTrân trọng,\nPhòng khám`;

    // 5. Gửi email
    const subject = 'Kết quả xét nghiệm của bạn';
    await sendTestResultEmail(email, subject, content);

    res.json({ message: 'Đã gửi kết quả xét nghiệm qua email.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi gửi email: ' + err.message });
  }
};

exports.sendReminderEmail = async function (appt) {
  let content = `Xin chào ${appt.full_name},\n\n`;
  content += `Bạn có lịch hẹn vào ngày mai với thông tin sau:\n`;
  content += `- Dịch vụ: ${appt.service_name}\n`;
  if (appt.doctor_name) content += `- Bác sĩ: ${appt.doctor_name}\n`;
  content += `- Thời gian: ${new Date(appt.appointment_datetime).toLocaleString('vi-VN')}\n`;
  if (appt.room_name) content += `- Phòng: ${appt.room_name}\n`;
  if (appt.notes) content += `- Ghi chú: ${appt.notes}\n`;
  content += `\nVui lòng đến đúng giờ. Nếu có thắc mắc, liên hệ phòng khám.\n\nTrân trọng,\nPhòng khám`;

  const subject = 'Nhắc lịch hẹn khám bệnh ngày mai';
  await sendAppointmentEmail(appt.email, subject, content);
}

exports.sendAllReminders = async (req, res) => {
  try {
    const appointments = await getTomorrowAppointments();
    let count = 0;
    for (const appt of appointments) {
      exports.sendReminderEmail(appt);
      count++;
    }
    res.json({ message: `Đã gửi nhắc lịch cho ${count} bệnh nhân!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};