const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slotController");
// GET, lấy danh sách slot theo doctor_id
router.get("/", slotController.getSlots);
