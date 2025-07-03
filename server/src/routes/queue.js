const express = require("express");
const router = express.Router();
const queueController = require("../controllers/queueController");

// Routes cho việc cấp số thứ tự
router.post("/appointment", queueController.createQueueForAppointment);
router.post("/test-request", queueController.createQueueForTestRequest);
router.post("/custom", queueController.createCustomQueueNumber);

// Routes cho việc lấy thông tin số thứ tự
router.get("/current-max", queueController.getCurrentMaxQueueNumber);
router.get("/list", queueController.getQueueListByDate);
router.get("/stats", queueController.getQueueStatsByDate);
router.get("/by-reference", queueController.getQueueByReference);
router.get("/:queue_id", queueController.getQueueById);

// Routes cho việc validate
router.post("/validate-ownership", queueController.validateQueueOwnership);

module.exports = router;
