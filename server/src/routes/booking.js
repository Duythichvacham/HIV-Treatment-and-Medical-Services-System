const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
// PATCH /booking/cancel/:invoiceId – huỷ cả appointment và invoice
router.patch("/cancel/:invoiceId", bookingController.cancelBooking);

// POST /booking – tạo appointment + invoice
router.post("/", bookingController.createBooking);

module.exports = router;
