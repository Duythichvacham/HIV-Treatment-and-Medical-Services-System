const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");
const testService = require("../services/testService");
const emailController = require("../controllers/emailController");


router.get("/", testController.getLabQueue);

// POST /api/v1/lab/test-results (nhập kết quả xét nghiệm và hoàn thành);
router.post("/test-results", testController.createTestResultAndComplete);
// GET /api/v1/lab/lab-tests(LẤY DANH SÁCH XÉT NGHIỆM)
router.get("/lab-tests", testController.getAllLabTests);
// Thêm các route cho lab queue, in-progress, done
router.get("/queue", testController.getLabQueue);
router.get("/in-progress", testController.getLabInProgress);

// GET /api/v1/lab/test-notes/:test_note_id
router.get("/test-notes/:test_note_id", testController.getTestNoteDetail);

// GET /api/v1/lab/rooms
router.get("/rooms", testController.getLabRooms);

// GET /api/v1/lab/shifts
router.get("/shifts", testController.getLabStaffShifts);

// GET /api/v1/lab/current-shift
router.get("/current-shift", testController.getCurrentLabStaffShift);

// PATCH /api/v1/test-requests/:id/status
router.patch("/test-requests/:id/status", testController.updateTestRequestExamStatus);

// POST /api/v1/lab/test-notes
router.post("/test-notes", testController.createTestNote);

// GET /api/v1/lab/test-results/:test_note_id
router.get("/test-results/:test_note_id", testController.getTestResultsByTestNoteId);

// GET /api/v1/lab/test-notes/appointment/:appointment_id
router.get("/test-notes/appointment/:appointment_id", testController.getTestNotesByAppointment);

// PATCH /api/v1/lab/test-notes/:test_note_id/notes
router.patch("/test-notes/:test_note_id/notes", testController.updateTestNoteNotes);

// PATCH /api/v1/lab/test-notes/:test_note_id/datetime
router.patch("/test-notes/:test_note_id/datetime", testController.updateTestNoteDatetime);

// API lấy kết quả CD4/VL mới nhất theo patient_id
router.get('/test-latest-results/:patientId', testController.getLatestTestResultsForPatient);

router.post('/send-test-result', emailController.sendTestResult);

router.post('/send-reminder', emailController.sendAllReminders);

router.post('/test-results/bulk', testController.createBulkTestResults);

module.exports = router;
