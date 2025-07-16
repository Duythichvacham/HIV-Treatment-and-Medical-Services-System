// server/src/services/emailBusinessService.js
const { sendOTPEmail, sendTestResultEmail, sendAppointmentEmail } = require('../utils/emailSender');
const { getTestNoteDetail, getTestResultsByTestNoteId } = require('./testService');
const { poolPromise } = require('../config/db');
const { getTomorrowAppointmentsGroupedByPatient } = require('../services/appointmentService');

// Gửi OTP
async function sendOtp(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await sendOTPEmail(email, otp);
  return otp;
}

// Gửi kết quả xét nghiệm
async function sendTestResult(test_note_id) {
  const testNote = await getTestNoteDetail(test_note_id);
  if (!testNote) throw new Error('Không tìm thấy phiếu xét nghiệm.');

  const pool = await poolPromise;
  const result = await pool.request()
    .input('appointment_id', testNote.appointment_id)
    .query(`
      SELECT p.email, p.full_name
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      WHERE a.appointment_id = @appointment_id
    `);
  if (!result.recordset.length) throw new Error('Không tìm thấy email bệnh nhân.');
  const { email, full_name } = result.recordset[0];

  const testResults = await getTestResultsByTestNoteId(test_note_id);

  let content = `Xin chào ${full_name},\n\nKết quả xét nghiệm của bạn:\n`;
  testResults.forEach(r => {
    content += `- ${r.test_type_name}: ${r.result_value} ${r.unit || ''} (Chỉ số tham chiếu: ${r.reference_range || 'N/A'})\n`;
  });
  content += testNote.notes ? `\nGhi chú của phòng xét nghiệm: ${testNote.notes}\n` : '';
  content += `\nTrân trọng,\nPhòng khám`;

  const subject = 'Kết quả xét nghiệm của bạn';
  await sendTestResultEmail(email, subject, content);
}

// Gửi nhắc lịch cho 1 bệnh nhân
async function sendReminderEmail(patient) {
  let content = `Xin chào ${patient.full_name},\n\nBạn có các lịch hẹn vào ngày mai như sau:\n`;
  for (const appt of patient.appointments) {
    content += `- Dịch vụ: ${appt.service_name}\n`;
    if ([1, 2].includes(appt.service_id)) {
      if (appt.doctor_name) content += `  + Bác sĩ: ${appt.doctor_name}\n`;
      if (appt.start_time && appt.end_time) {
        const formatTime = t => {
          if (!t) return '';
          const d = new Date(t);
          const h = d.getUTCHours().toString().padStart(2, '0');
          const m = d.getUTCMinutes().toString().padStart(2, '0');
          return `${h}:${m}`;
        };
        content += `  + Thời gian: ${formatTime(appt.start_time)} - ${formatTime(appt.end_time)}\n`;
      } else {
        content += `  + Thời gian: Sẽ được thông báo sau\n`;
      }
    }
    if (appt.room_name) content += `  + Phòng: ${appt.room_name}\n`;
    if (appt.notes) content += `  + Ghi chú: ${appt.notes}\n`;
    content += `-----------------------------\n`;
  }
  content += `\nVui lòng đến đúng giờ. Nếu có thắc mắc, liên hệ phòng khám.\n\nTrân trọng,\nPhòng khám`;

  const subject = 'Nhắc lịch hẹn khám/xét nghiệm ngày mai';
  await sendAppointmentEmail(patient.email, subject, content);
}

// Gửi nhắc lịch cho tất cả bệnh nhân có lịch ngày mai
async function sendAllReminders() {
  const patients = await getTomorrowAppointmentsGroupedByPatient();
  for (const patient of patients) {
    await sendReminderEmail(patient);
  }
  return patients.length;
}

module.exports = {
  sendOtp,
  sendTestResult,
  sendReminderEmail,
  sendAllReminders,
};