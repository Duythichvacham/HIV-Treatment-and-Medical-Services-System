const registrationService = require("../services/registrationService");

// GET /api/v1/test-requests/pending - Lấy danh sách TestRequests chờ xử lý
exports.getPendingTestRequests = async (req, res, next) => {
  try {
    const pendingRequests = await registrationService.getPendingTestRequests();
    res.json({
      message: "Lấy danh sách đơn xét nghiệm chờ xử lý thành công",
      data: pendingRequests,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/test-requests/:id/approve - Cập nhật status và thanh toán
exports.approveTestRequest = async (req, res, next) => {
  try {
    const { id } = req.params; // appointment_id
    const result = await registrationService.approveTestRequest(id);

    res.json({
      message: "Đã thu tiền và cập nhật đơn xét nghiệm thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/test-requests/statistics - Lấy thống kê
exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await registrationService.getRegistrationStatistics();
    res.json({
      message: "Lấy thống kê thành công",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/test-requests/payment-history - Lấy lịch sử thanh toán
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const history = await registrationService.getPaymentHistory(
      parseInt(limit)
    );
    res.json({
      message: "Lấy lịch sử thanh toán thành công",
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
