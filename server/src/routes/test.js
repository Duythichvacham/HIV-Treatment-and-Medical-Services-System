const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

const testController = require("../controllers/testController");
// Thêm các route cho lab queue, in-progress, done
router.get("/lab/queue", authenticateToken, testController.getLabQueue);
router.get("/lab/in-progress", authenticateToken, testController.getLabInProgress);
router.get("/lab/done", authenticateToken, testController.getLabDone);

// PATCH /api/v1/test-requests/:id/status
router.patch(
  "/:id/status",
  authenticateToken,
  testController.updateTestRequestExamStatus
);

// GET /api/v1/lab/test-notes/:test_note_id
router.get(
  "/:test_note_id",
  authenticateToken,
  testController.getTestNoteDetail
);

// POST /api/v1/lab/test-results (nhập kết quả xét nghiệm và hoàn thành);
router.post("/", authenticateToken, testController.createTestResultAndComplete);
router.get("/", authenticateToken, testController.getLabQueue);

// GET /api/v1/lab/lab-tests(LẤY DANH SÁCH XÉT NGHIỆM)
router.get('/lab-tests', authenticateToken, testController.getAllLabTests);

module.exports = router;
