const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

// GET, lấy danh sách bác sĩ
router.get("/", doctorController.getDoctors);
