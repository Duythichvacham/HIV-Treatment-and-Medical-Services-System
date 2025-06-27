const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const registrationController = require("../controllers/registrationController");

// GET /api/v1/registration/test-requests/pending - Lấy danh sách TestRequests chờ xử lý
router.get(
  "/test-requests/pending",
  registrationController.getPendingTestRequests
);

// PATCH /api/v1/registration/test-requests/:id/approve - Cập nhật status và thanh toán
router.patch(
  "/test-requests/:id/approve",
  registrationController.approveTestRequest
);

// GET /api/v1/registration/test-requests/statistics - Lấy thống kê
router.get("/test-requests/statistics", registrationController.getStatistics);

// GET /api/v1/registration/test-requests/payment-history - Lấy lịch sử thanh toán
router.get(
  "/test-requests/payment-history",
  registrationController.getPaymentHistory
);

module.exports = router;
