const queueService = require("../queues/queueService");

/**
 * Cấp số thứ tự cho danh sách TestRequests
 * @param {Array} testRequests - Danh sách test requests
 * @param {number} roomId - ID phòng được gán
 * @returns {Promise<Object>} Kết quả cấp số thứ tự
 */
const createQueueForRequests = async (testRequests, roomId) => {
  const queueResults = [];
  const queueErrors = [];

  for (const testRequest of testRequests) {
    try {
      // Cấp số thứ tự cho TestRequest (loại test)
      const queueInfo = await queueService.createQueueForTestRequest(
        testRequest.request_id
      );

      queueResults.push({
        request_id: testRequest.request_id,
        queue_info: queueInfo,
      });

      console.log(
        `✅ Đã cấp số thứ tự ${queueInfo.queue_number} cho TestRequest ${testRequest.request_id} - Room ${roomId}`
      );
    } catch (queueError) {
      // Log lỗi nhưng không fail toàn bộ process
      console.error(
        `❌ Lỗi khi cấp số thứ tự cho TestRequest ${testRequest.request_id}:`,
        queueError.message
      );

      queueErrors.push({
        request_id: testRequest.request_id,
        error: queueError.message,
      });
    }
  }

  return {
    success: queueResults.length > 0,
    results: queueResults,
    errors: queueErrors.length > 0 ? queueErrors : null,
    summary: {
      total: testRequests.length,
      successful: queueResults.length,
      failed: queueErrors.length,
    },
  };
};

/**
 * Cấp số thứ tự cho một TestRequest đơn lẻ
 * @param {number} requestId - ID của test request
 * @returns {Promise<Object>} Thông tin queue được tạo
 */
const createSingleQueue = async (requestId) => {
  try {
    const queueInfo = await queueService.createQueueForTestRequest(requestId);

    console.log(
      `✅ Đã cấp số thứ tự ${queueInfo.queue_number} cho TestRequest ${requestId}`
    );

    return {
      success: true,
      queue_info: queueInfo,
    };
  } catch (error) {
    console.error(
      `❌ Lỗi khi cấp số thứ tự cho TestRequest ${requestId}:`,
      error.message
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Kiểm tra xem TestRequest đã có queue chưa
 * @param {number} requestId - ID của test request
 * @returns {Promise<boolean>} True nếu đã có queue
 */
const hasExistingQueue = async (requestId) => {
  try {
    // Gọi đến queueService để kiểm tra
    // Tạm thời return false, có thể implement sau
    return false;
  } catch (error) {
    console.error(
      `Lỗi kiểm tra queue cho TestRequest ${requestId}:`,
      error.message
    );
    return false;
  }
};

/**
 * Hủy queue cho TestRequest
 * @param {number} requestId - ID của test request
 * @returns {Promise<boolean>} Kết quả hủy queue
 */
const cancelQueue = async (requestId) => {
  try {
    // Implement logic hủy queue nếu cần
    console.log(`Hủy queue cho TestRequest ${requestId}`);
    return true;
  } catch (error) {
    console.error(`Lỗi hủy queue cho TestRequest ${requestId}:`, error.message);
    return false;
  }
};

module.exports = {
  createQueueForRequests,
  createSingleQueue,
  hasExistingQueue,
  cancelQueue,
};
