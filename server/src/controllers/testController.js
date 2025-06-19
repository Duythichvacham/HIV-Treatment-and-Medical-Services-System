const testService = require('../services/testService');

// ///api/v1/test-requests/{id}/status (PATCH, cập nhật status của TestRequests nếu service_type là "exam")
// exports.updateTestRequestExamStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const validStatus = ['requested', 'in_progress', 'completed', 'cancelled'];
//     if (!validStatus.includes(status)) {
//       return res.status(400).json({ message: 'Invalid status' });
//     }

//     const updated = await testService.updateTestRequestExamStatus(id, status);
//     if (!updated) {
//       return res.status(404).json({ message: 'TestRequest không tồn tại hoặc không phải loại "examination"' });
//     }

//     res.json({
//       message: 'Cập nhật trạng thái TestRequest thành công',
//       testRequest: updated
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// //POST, nhập kết quả xét nghiệm và hoàn thành
// exports.getTestNoteDetail = async (req, res) => {
//   try {
//     const { test_note_id } = req.params;
//     const detail = await testService.getTestNoteDetail(test_note_id);

//     if (!detail) {
//       return res.status(404).json({ message: 'Không tìm thấy phiếu xét nghiệm' });
//     }

//     res.json({
//       message: 'Lấy chi tiết phiếu xét nghiệm thành công',
//       data: detail
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// ///api/v1/lab/test-results (POST, nhập kết quả xét nghiệm và hoàn thành); 
// exports.createTestResultAndComplete = async (req, res) => {
//   try {
//     const { test_note_id, result_value, unit, reference_range, notes } = req.body;

//     if (!test_note_id || !result_value) {
//       return res.status(400).json({ message: 'Thiếu thông tin bắt buộc!' });
//     }

//     const result = await testService.createTestResultAndComplete({
//       test_note_id,
//       result_value,
//       unit,
//       reference_range,
//       notes
//     });

//     res.json({
//       message: 'Nhập kết quả xét nghiệm và hoàn thành thành công',
//       data: result
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


/// PATCH /api/v1/test-requests/:id/status
exports.updateTestRequestExamStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ['requested', 'in_progress', 'completed', 'cancelled'];
    if (!validStatus.includes(status)) {
      const err = new Error('Invalid status');
      err.statusCode = 400;
      throw err;
    }

    const updated = await testService.updateTestRequestExamStatus(id, status);
    if (!updated) {
      const err = new Error('TestRequest không tồn tại hoặc không phải loại "examination"');
      err.statusCode = 404;
      throw err;
    }

    res.json({
      message: 'Cập nhật trạng thái TestRequest thành công',
      testRequest: updated
    });
  } catch (error) {
    next(error);
  }
};

/// GET /api/v1/lab/test-notes/:test_note_id
exports.getTestNoteDetail = async (req, res, next) => {
  try {
    const { test_note_id } = req.params;
    const detail = await testService.getTestNoteDetail(test_note_id);

    if (!detail) {
      const err = new Error('Không tìm thấy phiếu xét nghiệm');
      err.statusCode = 404;
      throw err;
    }

    res.json({
      message: 'Lấy chi tiết phiếu xét nghiệm thành công',
      data: detail
    });
  } catch (error) {
    next(error);
  }
};

/// POST /api/v1/lab/test-results
exports.createTestResultAndComplete = async (req, res, next) => {
  try {
    const { test_note_id, result_value, unit, reference_range, notes } = req.body;

    if (!test_note_id || !result_value) {
      const err = new Error('Thiếu thông tin bắt buộc!');
      err.statusCode = 400;
      throw err;
    }

    const result = await testService.createTestResultAndComplete({
      test_note_id,
      result_value,
      unit,
      reference_range,
      notes
    });

    res.json({
      message: 'Nhập kết quả xét nghiệm và hoàn thành thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
