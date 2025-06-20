const router = require("express").Router();
const serviceController = require("../controllers/serviceController");
// GET lấy danh sách dịch vụ xét nghiệm
router.get("/", serviceController.getTestServices);

module.exports = router;
