const { getTomorrowAppointments } = require("../services/appointmentService");
const { sendReminderEmail } = require("../controllers/emailController");

async function sendRemindersForTomorrow() {
  const appointments = await getTomorrowAppointments();
  console.log("Appointments to send reminder:", appointments);
  for (const appt of appointments) {
    try {
      await sendReminderEmail(appt);
      console.log(`Đã gửi nhắc lịch cho ${appt.email}`);
    } catch (err) {
      console.error(`Lỗi gửi email cho ${appt.email}:`, err.message);
    }
  }
}

module.exports = { sendRemindersForTomorrow };
