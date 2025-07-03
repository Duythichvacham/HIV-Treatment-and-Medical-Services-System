const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authenticateToken = require("../middleware/authMiddleware");

// Test route first
router.get("/test", (req, res) => {
  res.json({ message: "Booking route works" });
});

// PATCH /booking/pay/:invoiceId – xác nhận thanh toán
router.patch("/pay/:invoiceId", bookingController.confirmPayment);

// PATCH /booking/cancel/:invoiceId – huỷ cả appointment và invoice
router.patch("/cancel/:invoiceId", bookingController.cancelBooking);

// POST /booking – tạo appointment + invoice
router.post("/", bookingController.createBooking);

module.exports = router;
