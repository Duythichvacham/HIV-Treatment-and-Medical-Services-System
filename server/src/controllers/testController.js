const testService = require('../services/testService');

///api/v1/test-requests/{id}/status (PATCH, cập nhật status của TestRequests nếu service_type là "exam")
exports.updateTestRequestExamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ['requested', 'in_progress', 'completed', 'cancelled'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await testService.updateTestRequestExamStatus(id, status);
    if (!updated) {
      return res.status(404).json({ message: 'TestRequest không tồn tại hoặc không phải loại \"exam\"' });
    }

    res.json({
      message: 'Cập nhật trạng thái TestRequest thành công',
      testRequest: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//POST, nhập kết quả xét nghiệm và hoàn thành
exports.getTestNoteDetail = async (req, res) => {
  try {
    const { test_note_id } = req.params;
    const detail = await testService.getTestNoteDetail(test_note_id);

    if (!detail) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu xét nghiệm' });
    }

    res.json({
      message: 'Lấy chi tiết phiếu xét nghiệm thành công',
      data: detail
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

///api/v1/lab/test-results (POST, nhập kết quả xét nghiệm và hoàn thành); 
exports.createTestResultAndComplete = async (req, res) => {
  try {
    const { test_note_id, result_value, unit, reference_range, notes } = req.body;

    if (!test_note_id || !result_value) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc!' });
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
    res.status(500).json({ message: error.message });
  }
};