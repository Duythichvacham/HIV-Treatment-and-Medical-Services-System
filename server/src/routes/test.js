const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

const testController = require("../controllers/testController");

router.get("/", authenticateToken, testController.getLabQueue);

// POST /api/v1/lab/test-results (nhập kết quả xét nghiệm và hoàn thành);
router.post("/test-results", authenticateToken, testController.createTestResultAndComplete);
// GET /api/v1/lab/lab-tests(LẤY DANH SÁCH XÉT NGHIỆM)
router.get('/lab-tests', authenticateToken, testController.getAllLabTests);
// Thêm các route cho lab queue, in-progress, done
router.get("/queue", authenticateToken, testController.getLabQueue);
router.get("/in-progress", authenticateToken, testController.getLabInProgress);
router.get("/done", authenticateToken, testController.getLabDone);

// PATCH /api/v1/test-requests/:id/status
router.patch("/:id/status",authenticateToken,testController.updateTestRequestExamStatus);

// GET /api/v1/lab/test-notes/:test_note_id
router.get("/current-shift", authenticateToken, testController.getCurrentLabStaffShift);
router.get("/:test_note_id",authenticateToken,testController.getTestNoteDetail);

// Thêm routes mới cho phòng và ca làm việc
router.get("/rooms", authenticateToken, testController.getLabRooms);
router.get("/shifts", authenticateToken, testController.getLabStaffShifts);

// POST /lab/test-notes
router.post("/test-notes", authenticateToken, testController.createTestNote);

// GET tất cả kết quả xét nghiệm theo test_note_id
router.get('/test-results/:test_note_id', authenticateToken, testController.getTestResultsByTestNoteId);

module.exports = router;
