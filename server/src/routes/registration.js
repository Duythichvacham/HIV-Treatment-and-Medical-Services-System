const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const registrationController = require("../controllers/registrationController");

// GET /api/v1/test-requests/pending - Lấy danh sách TestRequests chờ xử lý
router.get("/pending", registrationController.getPendingTestRequests);

// PATCH /api/v1/test-requests/:id/approve - Cập nhật status và thanh toán
router.patch("/:id/approve", registrationController.approveTestRequest);

// GET /api/v1/test-requests/statistics - Lấy thống kê
router.get("/statistics", registrationController.getStatistics);

// GET /api/v1/test-requests/payment-history - Lấy lịch sử thanh toán
router.get("/payment-history", registrationController.getPaymentHistory);

module.exports = router;
