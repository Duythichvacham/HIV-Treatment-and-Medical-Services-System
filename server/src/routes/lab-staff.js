const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");

router.get("/", testController.getLabQueue);

// POST /api/v1/lab/test-results (nhập kết quả xét nghiệm và hoàn thành);
router.post("/test-results", testController.createTestResultAndComplete);
// GET /api/v1/lab/lab-tests(LẤY DANH SÁCH XÉT NGHIỆM)
router.get("/lab-tests", testController.getAllLabTests);
// Thêm các route cho lab queue, in-progress, done
router.get("/queue", testController.getLabQueue);
router.get("/in-progress", testController.getLabInProgress);
router.get("/finished", testController.getLabFinished);

// PATCH /api/v1/lab/test-requests/:id/status
router.patch(
  "/test-requests/:id/status",
  testController.updateTestRequestExamStatus
);

// GET /api/v1/lab/test-notes/:test_note_id
router.get("test-notes/:test_note_id", testController.getTestNoteDetail);
router.get("/current-shift", testController.getCurrentLabStaffShift);

// Thêm routes mới cho phòng và ca làm việc
router.get("/rooms", testController.getLabRooms);
router.get("/shifts", testController.getLabStaffShifts);

// POST /lab/test-notes
router.post("/test-notes", testController.createTestNote);

// GET tất cả kết quả xét nghiệm theo test_note_id
router.get(
  "/test-results/:test_note_id",
  testController.getTestResultsByTestNoteId
);
//
module.exports = router;
