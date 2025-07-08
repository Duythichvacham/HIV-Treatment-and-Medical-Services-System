const router = require("express").Router();
const managerController = require("../controllers/managerController");

// GET /api/v1/managers/users - Lấy danh sách người dùng
router.get("/users", managerController.getUsers);
module.exports = router;
