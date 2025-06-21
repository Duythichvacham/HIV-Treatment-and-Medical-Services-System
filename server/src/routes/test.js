const express = require("express");
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');

const testController = require('../controllers/testController');

// PATCH /api/v1/test-requests/:id/status
router.patch('/:id/status',authenticateToken, testController.updateTestRequestExamStatus);

// GET /api/v1/lab/test-notes/:test_note_id
router.get('/:test_note_id',authenticateToken, testController.getTestNoteDetail);

// POST /api/v1/lab/test-results (nhập kết quả xét nghiệm và hoàn thành); 
router.post('/',authenticateToken, testController.createTestResultAndComplete);
module.exports = router;
const testController = require("../controllers/testController");

// PATCH /api/v1/test-requests/:id/status
router.patch("/:id/status", testController.updateTestRequestExamStatus);

// GET /api/v1/lab/test-notes/:test_note_id
router.get("/:test_note_id", testController.getTestNoteDetail);

// POST /api/v1/lab/test-results (nhập kết quả xét nghiệm và hoàn thành);
router.post("/", testController.createTestResultAndComplete);
module.exports = router;
