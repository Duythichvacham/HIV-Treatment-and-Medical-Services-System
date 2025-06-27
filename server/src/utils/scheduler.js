const cron = require("node-cron");
const queueService = require("../services/queueService");

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

  console.log("📅 Queue scheduler initialized successfully");
  console.log("   - Daily reset: 00:00 (Vietnam time)");
  console.log("   - Daily init: 00:01 (Vietnam time)");
}

module.exports = {
  initializeScheduler,
};
