const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");
const testService = require("../services/testService");
const emailController = require("../controllers/emailController");
const testControllerV2 = require("../controllers/testControllerV2");

router.get("/appointments/test", testControllerV2.getAppointments);
router.get("/appointments/test-request", testControllerV2.getTestRequests);
router.post("/test/results", testControllerV2.saveTestResults);
router.get("/test/results", testControllerV2.getTestResults);

router.get("/", testController.getLabQueue);

// POST VITE_API_API_PREFIX/lab/test-results (nhập kết quả xét nghiệm và hoàn thành);
router.post("/test-results", testController.createTestResultAndComplete);
// GET VITE_API_API_PREFIX/lab/lab-tests(LẤY DANH SÁCH XÉT NGHIỆM)
router.get("/lab-tests", testController.getAllLabTests);
// Thêm các route cho lab queue, in-progress, done
router.get("/queue", testController.getLabQueue);
router.get("/in-progress", testController.getLabInProgress);

// GET VITE_API_API_PREFIX/lab/test-notes/:test_note_id
router.get("/test-notes/:test_note_id", testController.getTestNoteDetail);

// GET VITE_API_API_PREFIX/lab/rooms
router.get("/rooms", testController.getLabRooms);

// GET VITE_API_API_PREFIX/lab/shifts
router.get("/shifts", testController.getLabStaffShifts);

// GET VITE_API_API_PREFIX/lab/current-shift
router.get("/current-shift", testController.getCurrentLabStaffShift);

// PATCH VITE_API_API_PREFIX/test-requests/:id/status
router.patch(
  "/test-requests/:id/status",
  testController.updateTestRequestExamStatus
);

// POST VITE_API_API_PREFIX/lab/test-notes
router.post("/test-notes", testController.createTestNote);

// GET VITE_API_API_PREFIX/lab/test-results/:test_note_id
router.get(
  "/test-results/:test_note_id",
  testController.getTestResultsByTestNoteId
);

// GET VITE_API_API_PREFIX/lab/test-notes/appointment/:appointment_id
router.get(
  "/test-notes/appointment/:appointment_id",
  testController.getTestNotesByAppointment
);

// PATCH VITE_API_API_PREFIX/lab/test-notes/:test_note_id/notes
router.patch(
  "/test-notes/:test_note_id/notes",
  testController.updateTestNoteNotes
);

// PATCH VITE_API_API_PREFIX/lab/test-notes/:test_note_id/datetime
router.patch(
  "/test-notes/:test_note_id/datetime",
  testController.updateTestNoteDatetime
);

// API lấy kết quả CD4/VL mới nhất theo patient_id
router.get(
  "/test-latest-results/:patientId",
  testController.getLatestTestResultsForPatient
);

router.post("/send-test-result", emailController.sendTestResult);

router.post("/test-results/bulk", testController.createBulkTestResults);

// Lấy danh sách test requests theo status
router.get("/test-requests", testController.getTestRequestsByStatus);

module.exports = router;
