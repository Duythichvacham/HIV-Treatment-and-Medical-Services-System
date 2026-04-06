const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");

// GET VITE_API_API_PREFIX/registration/test-requests/pending - Lấy danh sách TestRequests chờ xử lý
router.get(
  "/test-requests/pending",
  registrationController.getPendingTestRequests
);

// PATCH VITE_API_API_PREFIX/registration/test-requests/:id/approve - Cập nhật status và thanh toán
router.patch(
  "/test-requests/:id/approve",
  registrationController.approveTestRequest
);

// GET VITE_API_API_PREFIX/registration/test-requests/statistics - Lấy thống kê
router.get("/test-requests/statistics", registrationController.getStatistics);

// GET VITE_API_API_PREFIX/registration/test-requests/payment-history - Lấy lịch sử thanh toán
router.get(
  "/test-requests/payment-history",
  registrationController.getPaymentHistory
);

module.exports = router;
