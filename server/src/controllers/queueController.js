const queueService = require("../services/queueService");

/**
 * Cấp số thứ tự cho appointment
 * POST /api/v1/queue/appointment
 */
exports.createQueueForAppointment = async (req, res) => {
  try {
    const { appointment_id, doctor_id, slot_id, queue_date } = req.body;

    if (!appointment_id) {
      return res.status(400).json({
        success: false,
        message: "appointment_id là bắt buộc",
      });
    }

    const queueInfo = await queueService.createQueueForAppointment(
      appointment_id,
      doctor_id,
      slot_id,
      queue_date ? new Date(queue_date) : undefined
    );

    res.status(201).json({
      success: true,
      message: "Cấp số thứ tự thành công",
      data: queueInfo,
    });
  } catch (error) {
    console.error("❌ Error in createQueueForAppointment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cấp số thứ tự cho appointment",
    });
  }
};

/**
 * Cấp số thứ tự cho test request
 * POST /api/v1/queue/test-request
 */
exports.createQueueForTestRequest = async (req, res) => {
  try {
    const { request_id, queue_date } = req.body;

    if (!request_id) {
      return res.status(400).json({
        success: false,
        message: "request_id là bắt buộc",
      });
    }

    const queueInfo = await queueService.createQueueForTestRequest(
      request_id,
      queue_date ? new Date(queue_date) : undefined
    );

    res.status(201).json({
      success: true,
      message: "Cấp số thứ tự thành công",
      data: queueInfo,
    });
  } catch (error) {
    console.error("❌ Error in createQueueForTestRequest:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cấp số thứ tự cho test request",
    });
  }
};

/**
 * Lấy số thứ tự cao nhất hiện tại
 * GET /api/v1/queue/current-max
 */
exports.getCurrentMaxQueueNumber = async (req, res) => {
  try {
    const { queue_type, doctor_id, slot_id, queue_date } = req.query;

    if (!queue_type) {
      return res.status(400).json({
        success: false,
        message: "queue_type là bắt buộc",
      });
    }

    const maxNumber = await queueService.getCurrentMaxQueueNumber(
      queue_type,
      doctor_id ? parseInt(doctor_id) : null,
      slot_id ? parseInt(slot_id) : null,
      queue_date ? new Date(queue_date) : new Date()
    );

    res.json({
      success: true,
      data: {
        queue_type,
        max_number: maxNumber,
        doctor_id: doctor_id ? parseInt(doctor_id) : null,
        slot_id: slot_id ? parseInt(slot_id) : null,
        queue_date: queue_date || new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("❌ Error in getCurrentMaxQueueNumber:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy số thứ tự hiện tại",
    });
  }
};

/**
 * Lấy danh sách số thứ tự theo ngày
 * GET /api/v1/queue/list
 */
exports.getQueueListByDate = async (req, res) => {
  try {
    const { queue_type, queue_date, doctor_id, slot_id } = req.query;

    if (!queue_type) {
      return res.status(400).json({
        success: false,
        message: "queue_type là bắt buộc",
      });
    }

    const queueList = await queueService.getQueueListByDate(
      queue_type,
      queue_date ? new Date(queue_date) : new Date(),
      doctor_id ? parseInt(doctor_id) : null,
      slot_id ? parseInt(slot_id) : null
    );

    res.json({
      success: true,
      data: queueList,
    });
  } catch (error) {
    console.error("❌ Error in getQueueListByDate:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách số thứ tự",
    });
  }
};

/**
 * Lấy thông tin số thứ tự theo ID
 * GET /api/v1/queue/:queue_id
 */
exports.getQueueById = async (req, res) => {
  try {
    const { queue_id } = req.params;

    if (!queue_id) {
      return res.status(400).json({
        success: false,
        message: "queue_id là bắt buộc",
      });
    }

    const queueInfo = await queueService.getQueueById(parseInt(queue_id));

    if (!queueInfo) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy số thứ tự",
      });
    }

    res.json({
      success: true,
      data: queueInfo,
    });
  } catch (error) {
    console.error("❌ Error in getQueueById:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy thông tin số thứ tự",
    });
  }
};

/**
 * Kiểm tra quyền sở hữu số thứ tự
 * POST /api/v1/queue/validate-ownership
 */
exports.validateQueueOwnership = async (req, res) => {
  try {
    const { queue_id, appointment_id, request_id } = req.body;

    if (!queue_id) {
      return res.status(400).json({
        success: false,
        message: "queue_id là bắt buộc",
      });
    }

    if (!appointment_id && !request_id) {
      return res.status(400).json({
        success: false,
        message: "Cần có ít nhất appointment_id hoặc request_id",
      });
    }

    const isValid = await queueService.validateQueueOwnership(
      parseInt(queue_id),
      appointment_id ? parseInt(appointment_id) : null,
      request_id ? parseInt(request_id) : null
    );

    res.json({
      success: true,
      data: {
        is_valid: isValid,
        queue_id: parseInt(queue_id),
        appointment_id: appointment_id ? parseInt(appointment_id) : null,
        request_id: request_id ? parseInt(request_id) : null,
      },
    });
  } catch (error) {
    console.error("❌ Error in validateQueueOwnership:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi kiểm tra quyền sở hữu số thứ tự",
    });
  }
};

/**
 * Lấy thống kê số thứ tự theo ngày
 * GET /api/v1/queue/stats
 */
exports.getQueueStatsByDate = async (req, res) => {
  try {
    const { queue_date } = req.query;

    const stats = await queueService.getQueueStatsByDate(
      queue_date ? new Date(queue_date) : new Date()
    );

    res.json({
      success: true,
      data: {
        date: queue_date || new Date().toISOString().split("T")[0],
        stats,
      },
    });
  } catch (error) {
    console.error("❌ Error in getQueueStatsByDate:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy thống kê số thứ tự",
    });
  }
};

/**
 * Tạo số thứ tự tùy chỉnh (để testing hoặc trường hợp đặc biệt)
 * POST /api/v1/queue/custom
 */
exports.createCustomQueueNumber = async (req, res) => {
  try {
    const {
      queue_type,
      appointment_id,
      request_id,
      doctor_id,
      slot_id,
      queue_date,
    } = req.body;

    if (!queue_type) {
      return res.status(400).json({
        success: false,
        message: "queue_type là bắt buộc",
      });
    }

    // Validation logic cho các trường hợp khác nhau
    if (queue_type === "examination" && (!doctor_id || !slot_id)) {
      return res.status(400).json({
        success: false,
        message: "examination requires doctor_id and slot_id",
      });
    }

    if (queue_type === "test" && (doctor_id || slot_id)) {
      return res.status(400).json({
        success: false,
        message: "test không được có doctor_id hoặc slot_id",
      });
    }

    const queueInfo = await queueService.createQueueNumber({
      queue_type,
      appointment_id: appointment_id || null,
      request_id: request_id || null,
      doctor_id: doctor_id || null,
      slot_id: slot_id || null,
      queue_date: queue_date ? new Date(queue_date) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Tạo số thứ tự tùy chỉnh thành công",
      data: queueInfo,
    });
  } catch (error) {
    console.error("❌ Error in createCustomQueueNumber:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tạo số thứ tự tùy chỉnh",
    });
  }
};

/**
 * Lấy số thứ tự theo appointment_id hoặc request_id
 * GET /api/v1/queue/by-reference
 */
exports.getQueueByReference = async (req, res) => {
  try {
    const { appointment_id, request_id, queue_date } = req.query;

    if (!appointment_id && !request_id) {
      return res.status(400).json({
        success: false,
        message: "Cần có ít nhất appointment_id hoặc request_id",
      });
    }

    const pool = await require("../config/db").poolPromise;
    const formattedDate = queue_date
      ? new Date(queue_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    let query = `
      SELECT 
        qn.*,
        d.full_name as doctor_name,
        s.start_time,
        s.end_time
      FROM QueueNumbers qn
      LEFT JOIN Doctors d ON qn.doctor_id = d.doctor_id
      LEFT JOIN Slots s ON qn.slot_id = s.slot_id
      WHERE qn.queue_date = @queue_date
    `;

    const request = pool.request().input("queue_date", formattedDate);

    if (appointment_id) {
      query += ` AND qn.appointment_id = @appointment_id`;
      request.input("appointment_id", parseInt(appointment_id));
    }

    if (request_id) {
      query += ` AND qn.request_id = @request_id`;
      request.input("request_id", parseInt(request_id));
    }

    query += ` ORDER BY qn.current_number DESC`;

    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("❌ Error in getQueueByReference:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy thông tin số thứ tự",
    });
  }
};
