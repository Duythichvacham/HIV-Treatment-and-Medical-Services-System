const router = require("express").Router();
const managerController = require("../controllers/managerController");

// GET /api/v1/managers/users - Lấy danh sách người dùng
router.get("/users", managerController.getUsers);
//POST: api/v1/managers/service 
router.post("/service",managerController.createService);
//PATCH: api/v1/managers/service/{id}/status
router.patch("/service/:id/status" , managerController.setActive);
//POST: api/v1/managers/slot
router.post("/slot", managerController.createSlot);
module.exports = router;
