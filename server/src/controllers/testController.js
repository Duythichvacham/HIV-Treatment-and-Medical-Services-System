const testService = require("../services/testService");

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

    const validStatus = ["requested", "in_progress", "completed", "cancelled"];
    if (!validStatus.includes(status)) {
      const err = new Error("Invalid status");
      err.statusCode = 400;
      throw err;
    }

    const updated = await testService.updateTestRequestExamStatus(id, status);
    if (!updated) {
      const err = new Error(
        'TestRequest không tồn tại hoặc không phải loại "examination"'
      );
      err.statusCode = 404;
      throw err;
    }

    res.json({
      message: "Cập nhật trạng thái TestRequest thành công",
      testRequest: updated,
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
      const err = new Error("Không tìm thấy phiếu xét nghiệm");
      err.statusCode = 404;
      throw err;
    }

    res.json({
      message: "Lấy chi tiết phiếu xét nghiệm thành công",
      data: detail,
    });
  } catch (error) {
    next(error);
  }
};

/// POST /api/v1/lab/test-results
exports.createTestResultAndComplete = async (req, res, next) => {
  try {
    const {
      test_note_id,
      test_type_id,
      result_value,
      unit,
      reference_range,
      notes,
    } = req.body;

    if (!test_note_id || !result_value) {
      const err = new Error("Thiếu thông tin bắt buộc!");
      err.statusCode = 400;
      throw err;
    }

    const result = await testService.createTestResultAndComplete({
      test_note_id,
      test_type_id,
      result_value,
      unit,
      reference_range,
      notes,
    });

    res.json({
      message: "Nhập kết quả xét nghiệm và hoàn thành thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/// GET /api/v1/lab/queue
exports.getLabQueue = async (req, res, next) => {
  try {
    const { date, lab_staff_id, room_id } = req.query;
    // Gọi service mới chỉ lấy queue xét nghiệm
    const queue = await testService.getLabTestQueue(date, lab_staff_id, room_id);
    res.json({
      message: "Lấy danh sách bệnh nhân chờ xét nghiệm thành công",
      data: queue,
    });
  } catch (error) {
    next(error);
  }
};

/// GET /api/v1/lab/in-progress
exports.getLabInProgress = async (req, res, next) => {
  try {
    const { date, lab_staff_id, room_id } = req.query;
    // Gọi service mới chỉ lấy bệnh nhân đang xét nghiệm
    const inProgress = await testService.getLabTestInProgress(date, lab_staff_id, room_id);
    res.json({
      message: "Lấy danh sách bệnh nhân đang xét nghiệm thành công",
      data: inProgress,
    });
  } catch (error) {
    next(error);
  }
};

/// GET /api/v1/lab/done
exports.getLabFinished = async (req, res, next) => {
  try {
    const { date, lab_staff_id, room_id } = req.query;
    // Gọi service mới chỉ lấy bệnh nhân đã hoàn thành xét nghiệm
    const finished = await testService.getLabTestFinished(date, lab_staff_id, room_id);
    res.json({
      message: "Lấy danh sách bệnh nhân đã hoàn thành xét nghiệm thành công",
      data: finished,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/lab/lab-tests
exports.getAllLabTests = async (req, res, next) => {
  try {
    const { status, date, lab_staff_id, room_id } = req.query;
    const tests = await testService.getAllLabTests(
      status,
      date,
      lab_staff_id,
      room_id
    );

    // Gắn trường assigned_by
    const data = tests.map((item) => ({
      ...item,
      assigned_by: item.doctor
        ? `Bác sĩ ${item.doctor} chỉ định`
        : "Đăng ký xét nghiệm",
    }));

    res.json({
      message: "Lấy danh sách xét nghiệm thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/lab/rooms
exports.getLabRooms = async (req, res, next) => {
  try {
    const rooms = await testService.getLabRooms();
    res.json({
      message: "Lấy danh sách phòng xét nghiệm thành công",
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/lab/shifts
exports.getLabStaffShifts = async (req, res, next) => {
  try {
    const { date, lab_staff_id } = req.query;
    const shifts = await testService.getLabStaffShifts(date, lab_staff_id);
    res.json({
      message: "Lấy danh sách ca làm việc thành công",
      data: shifts,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/lab/current-shift
exports.getCurrentLabStaffShift = async (req, res, next) => {
  try {
    const { lab_staff_id, date } = req.query;
    if (!lab_staff_id) {
      const err = new Error("lab_staff_id là bắt buộc");
      err.statusCode = 400;
      throw err;
    }

    const shift = await testService.getCurrentLabStaffShift(
      parseInt(lab_staff_id, 10),
      date
    );
    res.json({
      message: "Lấy thông tin ca làm việc hiện tại thành công",
      data: shift,
    });
  } catch (error) {
    next(error);
  }
};

exports.createTestNote = async (req, res, next) => {
  try {
    const { test_request_id, appointment_id, created_by_id, test_datetime } = req.body;
    const { poolPromise } = require('../config/db');
    const pool = await poolPromise;

    // Kiểm tra trùng cho appointment_id (không kiểm tra status)
    if (appointment_id) {
      const check = await pool.request()
        .input('appointment_id', appointment_id)
        .query(`
          SELECT TOP 1 * FROM TestNotes
          WHERE appointment_id = @appointment_id
        `);
      if (check.recordset.length > 0) {
        return res.status(200).json({
          message: "Đã có phiếu xét nghiệm cho appointment này",
          data: check.recordset[0]
        });
      }
    }
    // Kiểm tra trùng cho test_request_id (không kiểm tra status)
    if (test_request_id) {
      const check = await pool.request()
        .input('test_request_id', test_request_id)
        .query(`
          SELECT TOP 1 * FROM TestNotes
          WHERE test_request_id = @test_request_id
        `);
      if (check.recordset.length > 0) {
        return res.status(200).json({
          message: "Đã có phiếu xét nghiệm cho test request này",
          data: check.recordset[0]
        });
      }
    }
    
    // Sử dụng test_datetime từ frontend hoặc tạo mới nếu không có
    // Chuyển đổi về giờ Việt Nam trước khi lưu
    let noteDatetime;
    if (test_datetime) {
      noteDatetime = new Date(test_datetime);
    } else {
      // Tạo thời gian hiện tại theo giờ Việt Nam
      const now = new Date();
      const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
      noteDatetime = vietnamTime;
    }
    
    const note = await testService.createTestNote({
      test_request_id,
      appointment_id,
      created_by_id,
      test_datetime: noteDatetime,
    });
    
    console.log('DEBUG: Đã tạo TestNote:', note);
    res.json({ message: "Tạo phiếu xét nghiệm thành công", data: note });
  } catch (error) {
    next(error);
  }
};

exports.getTestResultsByTestNoteId = async (req, res, next) => {
  try {
    const { test_note_id } = req.params;
    const results = await testService.getTestResultsByTestNoteId(test_note_id);
    res.json({ message: "Lấy kết quả xét nghiệm thành công", data: results });
  } catch (error) {
    next(error);
  }
};

exports.getTestNotesByAppointment = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const notes = await testService.getTestNotesByAppointment(appointment_id);
    res.json({ message: "Lấy danh sách phiếu xét nghiệm theo appointment thành công", data: notes });
  } catch (error) {
    next(error);
  }
};

exports.updateTestNoteNotes = async (req, res, next) => {
  try {
    const { test_note_id } = req.params;
    const { notes } = req.body;
    
    if (!test_note_id) {
      return res.status(400).json({ message: "Thiếu test_note_id" });
    }
    
    const result = await testService.updateTestNoteNotes(test_note_id, notes);
    res.json({ 
      message: "Cập nhật ghi chú phiếu xét nghiệm thành công", 
      data: result 
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTestNoteDatetime = async (req, res, next) => {
  try {
    const { test_note_id } = req.params;
    const { test_datetime } = req.body;
    const result = await require('../services/testService').updateTestNoteDatetime(test_note_id, test_datetime);
    res.json({ message: "Cập nhật thời gian bắt đầu xét nghiệm thành công", data: result });
  } catch (error) {
    next(error);
  }
};
