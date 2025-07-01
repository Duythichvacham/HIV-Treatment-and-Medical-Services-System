const { poolPromise } = require("../../config/db");

// Import các module đã tách
const queueValidationService = require("./queueValidationService");
const queueNumberService = require("./queueNumberService");
const queueRepositoryService = require("./queueRepositoryService");

/**
 * Tạo bản ghi mới trong QueueNumbers và cấp số thứ tự - Orchestrator function
 * @param {Object} params - Queue parameters
 * @returns {Promise<Object>} Thông tin số thứ tự được cấp
 */
const createQueueNumber = async ({
  queue_type,
  appointment_id = null,
  request_id = null,
  doctor_id = null,
  slot_id = null,
  queue_date = new Date(),
}) => {
  // Validate tham số đầu vào
  queueValidationService.validateQueueParams(
    queue_type,
    appointment_id,
    request_id
  );
  queueValidationService.validateDoctorSlotParams(
    queue_type,
    doctor_id,
    slot_id
  );

  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // Format date
    const formattedDate = queueNumberService.formatQueueDate(queue_date);

    // Validate duplicate
    await queueValidationService.validateDuplicateQueue(transaction, {
      queue_type,
      doctor_id,
      slot_id,
      appointment_id,
      request_id,
      formattedDate,
    });

    // Đảm bảo doctor_id và slot_id là NULL cho test
    if (queue_type === "test") {
      doctor_id = null;
      slot_id = null;
    }

    // Lấy số thứ tự tiếp theo
    const nextNumber = await queueNumberService.getNextQueueNumber(
      transaction,
      queue_type,
      doctor_id,
      slot_id,
      formattedDate
    );

    // Xác định max_number
    const maxNumber = queueNumberService.getMaxNumber(queue_type);

    // Prepare và execute insert
    const request = transaction.request();
    queueNumberService.prepareInputParameters(request, {
      appointment_id,
      request_id,
      slot_id,
      doctor_id,
      queue_type,
      nextNumber,
      formattedDate,
      maxNumber,
    });

    const newQueueId = await queueNumberService.executeInsertQueue(request);

    await transaction.commit();

    // Trả về thông tin số thứ tự vừa tạo
    return {
      queue_id: newQueueId,
      queue_number: nextNumber,
      queue_type,
      queue_date: formattedDate,
      appointment_id,
      request_id,
      doctor_id,
      slot_id,
      max_number: maxNumber,
    };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("❌ Error rolling back transaction:", rollbackError);
    }
    console.error("❌ Error creating queue number:", error);
    throw error;
  }
};

/**
 * Cấp số thứ tự cho Appointment (khám bệnh) - Orchestrator function
 * @param {number} appointment_id - ID của appointment
 * @param {number} doctor_id - ID bác sĩ
 * @param {number} slot_id - ID slot
 * @param {Date} queue_date - Ngày khám (mặc định lấy từ appointment.bookingDate)
 * @returns {Promise<Object>} Thông tin số thứ tự được cấp
 */
const createQueueForAppointment = async (
  appointment_id,
  doctor_id,
  slot_id,
  queue_date = new Date()
) => {
  try {
    // Lấy thông tin appointment
    const { bookingDate, service_type } =
      await queueRepositoryService.getAppointmentInfo(appointment_id);

    // Sử dụng bookingDate làm queue_date nếu không truyền vào
    const finalQueueDate = queue_date || new Date(bookingDate);

    // Xác định queue_type dựa trên service_type
    let queue_type;
    if (service_type === "examination") {
      queue_type = "examination";
    } else if (service_type === "test") {
      queue_type = "test";
      // Với test từ appointment, doctor_id và slot_id = null
      doctor_id = null;
      slot_id = null;
    } else if (service_type === "consultation") {
      queue_type = "consultation";
    } else {
      // Mặc định là examination nếu không xác định được
      queue_type = "examination";
    }

    return await createQueueNumber({
      queue_type,
      appointment_id,
      request_id: null,
      doctor_id,
      slot_id,
      queue_date: finalQueueDate,
    });
  } catch (error) {
    console.error("❌ Error creating queue for appointment:", error);
    throw error;
  }
};

/**
 * Cấp số thứ tự cho TestRequest (xét nghiệm) - Orchestrator function
 * @param {number} request_id - ID của test request
 * @param {Date} queue_date - Ngày xét nghiệm (mặc định lấy từ request.request_date)
 * @returns {Promise<Object>} Thông tin số thứ tự được cấp
 */
const createQueueForTestRequest = async (
  request_id,
  queue_date = new Date()
) => {
  try {
    // Lấy thông tin test request
    const { request_date } = await queueRepositoryService.getTestRequestInfo(
      request_id
    );

    // Sử dụng request_date làm queue_date nếu không truyền vào
    const finalQueueDate = queue_date || new Date(request_date);

    // Test luôn có doctor_id và slot_id = null, queue_type = 'test'
    return await createQueueNumber({
      queue_type: "test",
      appointment_id: null,
      request_id,
      doctor_id: null,
      slot_id: null,
      queue_date: finalQueueDate,
    });
  } catch (error) {
    console.error("❌ Error creating queue for test request:", error);
    throw error;
  }
};

// Delegate các functions còn lại đến repository service
const getQueueListByDate = async (
  queue_type,
  queue_date = new Date(),
  doctor_id = null,
  slot_id = null
) => {
  const formattedDate = queueNumberService.formatQueueDate(queue_date);
  return await queueRepositoryService.getQueueListByDate(
    queue_type,
    formattedDate,
    doctor_id,
    slot_id
  );
};

const getQueueById = async (queue_id) => {
  return await queueRepositoryService.getQueueById(queue_id);
};

const validateQueueOwnership = async (
  queue_id,
  appointment_id = null,
  request_id = null
) => {
  return await queueRepositoryService.validateQueueOwnership(
    queue_id,
    appointment_id,
    request_id
  );
};

const getQueueStatsByDate = async (queue_date = new Date()) => {
  const formattedDate = queueNumberService.formatQueueDate(queue_date);
  return await queueRepositoryService.getQueueStatsByDate(formattedDate);
};

const getCurrentQueueNumber = async (
  queue_type,
  doctor_id = null,
  slot_id = null,
  queue_date = new Date()
) => {
  const formattedDate = queueNumberService.formatQueueDate(queue_date);
  return await queueRepositoryService.getCurrentQueueNumber(
    queue_type,
    formattedDate,
    doctor_id,
    slot_id
  );
};

const getNextQueueNumber = async (
  queue_type,
  doctor_id = null,
  slot_id = null,
  queue_date = new Date()
) => {
  const currentNumber = await getCurrentQueueNumber(
    queue_type,
    doctor_id,
    slot_id,
    queue_date
  );
  return currentNumber + 1;
};

module.exports = {
  createQueueNumber,
  createQueueForAppointment,
  createQueueForTestRequest,
  getQueueListByDate,
  getQueueById,
  validateQueueOwnership,
  getQueueStatsByDate,
  getCurrentQueueNumber,
  getNextQueueNumber,
  // Export các service modules cho testing hoặc sử dụng riêng lẻ
  validationService: queueValidationService,
  numberService: queueNumberService,
  repositoryService: queueRepositoryService,
};
