const router = require("express").Router();
const managerController = require("../controllers/managerController");

// GET /api/v1/managers/users - Lấy danh sách người dùng
router.get("/users", managerController.getUsers);
// GET /api/v1/managers/services - Lấy danh sách dịch vụ
router.get("/service", managerController.getAllServices);
//POST: api/v1/managers/service
router.post("/service", managerController.createService);
//PATCH: api/v1/managers/service/{id}/status
router.patch("/service/:id/status", managerController.setActive);
//POST: api/v1/managers/slot
router.post("/slot", managerController.createSlot);
//GET : api/v1/managers/working-shift
router.get("/working-shift" , managerController.getAllWorkingShift);
//POST : api/v1/managers/working-shift
router.post("/working-shift", managerController.createShift);

//PATCH: api/v1/managers/working-shift/update/:id
router.patch("/working-shift/update/:id", managerController.updateShift);

//PATCH: api/v1/managers/working-shift/active/:id
router.patch("/working-shift/active/:id", managerController.setActiveShift);
module.exports = router;
