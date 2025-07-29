const {
  sendOTPEmail,
  sendTestResultEmail,
} = require("../services/emailService");
const { verifiedEmails, otpStore } = require("../utils/otpStore");
const {
  getTestNoteDetail,
  getTestResultsByTestNoteId,
} = require("../services/testService");
const { poolPromise } = require("../config/db");
const { sendAppointmentEmail } = require("../services/emailService");
const {
  getTomorrowAppointmentsGroupedByPatient,
} = require("../services/appointmentService");

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
  console.log("OTP stored:", otpStore[email]); // Log giá trị lưu trữ
  console.log("email + otp: ", email.expires, otp);
  await sendOTPEmail(email, otp);
  res.json({ message: "OTP sent" });
};

exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  console.log("email + otp: ", email, otp);
  console.log("record email: ", record);
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res
      .status(400)
      .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
  }
  delete otpStore[email];
  verifiedEmails[email] = Date.now() + 10 * 60 * 1000; // Cho phép đăng ký/đổi mật khẩu trong 10 phút
  console.log("Set verifiedEmails:", email, verifiedEmails[email]);
  res.json({ message: "OTP verified" });
};

exports.sendTestResult = async (req, res) => {
  try {
    const { test_note_id } = req.body;
    console.log("Received test_note_id:", test_note_id);
    if (!test_note_id) {
      return res.status(400).json({ message: "Thiếu test_note_id" });
    }

    // 1. Lấy chi tiết phiếu xét nghiệm (TestNote)
    const testNote = await getTestNoteDetail(test_note_id);
    if (!testNote) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy phiếu xét nghiệm." });
    }

    // 2. Lấy email bệnh nhân từ appointment_id
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("appointment_id", testNote.appointment_id).query(`
        SELECT p.email, p.full_name
        FROM Appointments a
        JOIN Patients p ON a.patient_id = p.patient_id
        WHERE a.appointment_id = @appointment_id
      `);
    if (!result.recordset.length) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy email bệnh nhân." });
    }
    const { email, full_name } = result.recordset[0];

    // 3. Lấy danh sách kết quả xét nghiệm (TestResults)
    const testResults = await getTestResultsByTestNoteId(test_note_id);

    // 4. Soạn nội dung email
    let content = `Xin chào ${full_name},\n\nKết quả xét nghiệm của bạn:\n`;
    testResults.forEach((r) => {
      content += `- ${r.test_type_name}: ${r.result_value} ${
        r.unit || ""
      } (Chỉ số tham chiếu: ${r.reference_range || "N/A"})\n`;
    });
    content += testNote.notes
      ? `\nGhi chú của phòng xét nghiệm: ${testNote.notes}\n`
      : "";
    content += `\nTrân trọng,\nPhòng khám`;

    // 5. Gửi email
    const subject = "Kết quả xét nghiệm của bạn";
    await sendTestResultEmail(email, subject, content);

    res.json({ message: "Đã gửi kết quả xét nghiệm qua email." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi gửi email: " + err.message });
  }
};

exports.sendReminderEmail = async function (patient) {
  const bookingDate = new Date(patient.appointments[0].bookingDate);
  const formattedDate = bookingDate.toLocaleDateString("vi-VN");

  let content = `Xin chào ${patient.full_name},\n\nBạn có các lịch hẹn vào ngày mai (${formattedDate}) như sau:\n`;

  for (const appt of patient.appointments) {
    console.log(
      "appointment_id:",
      appt.appointment_id,
      "slot_id:",
      appt.slot_id,
      "start_time:",
      appt.start_time,
      "end_time:",
      appt.end_time
    );
    content += `- Dịch vụ: ${appt.service_name}\n`;
    // Nếu là lịch khám bác sĩ (service_id 1,2) thì hiện thời gian theo slot
    if ([1, 2].includes(appt.service_id)) {
      if (appt.doctor_name) content += `  + Bác sĩ: ${appt.doctor_name}\n`;
      if (appt.start_time && appt.end_time) {
        const formatTime = (t) => {
          if (!t) return "";
          const d = new Date(t);
          const h = d.getUTCHours().toString().padStart(2, "0");
          const m = d.getUTCMinutes().toString().padStart(2, "0");
          return `${h}:${m}`;
        };
        content += `  + Thời gian: ${formatTime(
          appt.start_time
        )} - ${formatTime(appt.end_time)}\n`;
      } else {
        content += `  + Thời gian: Sẽ được thông báo sau\n`;
      }
    }
    // Lịch xét nghiệm (service_id 3,4,5) không hiện thời gian
    if (appt.room_name) content += `  + Phòng: ${appt.room_name}\n`;
    if (appt.notes) content += `  + Ghi chú: ${appt.notes}\n`;
    content += `-----------------------------\n`;
  }
  content += `\nVui lòng đến đúng giờ. Nếu có thắc mắc, liên hệ phòng khám.\n\nTrân trọng,\nPhòng khám`;

  const subject = "Nhắc lịch hẹn khám/xét nghiệm ngày mai";
  await sendAppointmentEmail(patient.email, subject, content);
};

exports.sendAllReminders = async (req, res) => {
  try {
    const patients = await getTomorrowAppointmentsGroupedByPatient();
    let count = 0;
    for (const patient of patients) {
      await exports.sendReminderEmail(patient);
      count++;
    }
    console.log(`✅ Đã gửi nhắc lịch cho ${count} bệnh nhân.`);
    res.json({ message: `Đã gửi nhắc lịch cho ${count} bệnh nhân!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
