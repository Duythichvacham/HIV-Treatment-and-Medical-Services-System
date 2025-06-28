const cron = require("node-cron");
const queueService = require("../services/queueService");
const appointmentService = require("../services/appointmentService");
const { poolPromise } = require("../config/db");

/**
 * Tự động cancel các appointments chưa hoàn thành vào cuối ngày
 */
async function autoCancelPendingAppointments() {
  try {
    console.log("🔄 Starting auto-cancel pending appointments...");
    const pool = await poolPromise;

    // Lấy danh sách appointments chưa hoàn thành trong ngày hiện tại
    const result = await pool.request().query(`
      SELECT a.appointment_id, a.patient_id, s.name as service_name, 
             p.full_name as patient_name, a.status, a.bookingDate
      FROM Appointments a
      JOIN Services s ON a.service_id = s.service_id
      JOIN Patients p ON a.patient_id = p.patient_id
      WHERE CONVERT(date, a.bookingDate) = CONVERT(date, GETDATE())
        AND a.status IN ('requested', 'in_progress')
    `);

    const pendingAppointments = result.recordset;

    if (pendingAppointments.length === 0) {
      console.log("✅ No pending appointments to cancel");
      return;
    }

    // Cancel từng appointment
    for (const appointment of pendingAppointments) {
      await appointmentService.updateAppointmentStatus(
        appointment.appointment_id,
        "cancelled"
      );

      console.log(
        `📋 Cancelled appointment ${appointment.appointment_id} for ${appointment.patient_name} (${appointment.service_name})`
      );
    }

    // Cancel các TestRequests liên quan
    await pool.request().query(`
      UPDATE tr
      SET tr.status = 'cancelled'
      FROM TestRequests tr
      JOIN Appointments a ON tr.appointment_id = a.appointment_id
      WHERE CONVERT(date, a.bookingDate) = CONVERT(date, GETDATE())
        AND tr.status IN ('requested', 'in_progress')
    `);

    console.log(
      `✅ Auto-cancelled ${pendingAppointments.length} pending appointments`
    );

    // Log thống kê
    console.log("📊 End-of-day appointment statistics:");
    console.log(`   - Cancelled appointments: ${pendingAppointments.length}`);
  } catch (error) {
    console.error("❌ Error during auto-cancel pending appointments:", error);
  }
}

/**
 * Khởi tạo tất cả scheduled jobs
 */
function initializeScheduler() {
  // Chạy lúc 00:00 mỗi ngày để reset queue numbers
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        console.log("🔄 Starting daily queue reset...");
        await queueService.resetAllQueues();
        console.log("✅ Daily queue reset completed successfully");
      } catch (error) {
        console.error("❌ Error during daily queue reset:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh", // Set timezone cho Vietnam
    }
  );

  // Chạy lúc 00:01 mỗi ngày để khởi tạo queues cho ngày mới
  cron.schedule(
    "1 0 * * *",
    async () => {
      try {
        console.log("🔄 Initializing daily queues...");
        await queueService.initializeDailyQueues();
        console.log("✅ Daily queues initialized successfully");
      } catch (error) {
        console.error("❌ Error initializing daily queues:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  // Chạy lúc 17:00 mỗi ngày để tự động cancel các appointments chưa hoàn thành
  cron.schedule(
    "0 17 * * *",
    async () => {
      try {
        await autoCancelPendingAppointments();
      } catch (error) {
        console.error("❌ Error during scheduled auto-cancel:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  console.log("📅 Queue scheduler initialized successfully");
  console.log("   - Daily reset: 00:00 (Vietnam time)");
  console.log("   - Daily init: 00:01 (Vietnam time)");
  console.log("   - Auto-cancel pending: 17:00 (Vietnam time)");
}

module.exports = {
  initializeScheduler,
  autoCancelPendingAppointments, // Export để có thể gọi manual
};
