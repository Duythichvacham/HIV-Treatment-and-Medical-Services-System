const testService = require("../services/testService");
const { getVietnamTime, formatVietnamTime, formatDateTimeWithoutTimezone } = require("../utils/dateUtil");

//${import.meta.env.VITE_API_PREFIX}/test-requests/{id}/status (PATCH, cập nhật status của TestRequests nếu service_type là "exam")
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

    // Format request_date sang giờ Việt Nam
    if (updated.request_date) {
      updated.request_date = formatVietnamTime(updated.request_date);
    }

    res.json({
      message: "Cập nhật trạng thái TestRequest thành công",
      testRequest: updated,
    });
  } catch (error) {
    next(error);
  }
};

/// GET ${import.meta.env.VITE_API_PREFIX}/lab/test-notes/:test_note_id
exports.getTestNoteDetail = async (req, res, next) => {
  try {
    const { test_note_id } = req.params;
    const detail = await testService.getTestNoteDetail(test_note_id);

    if (!detail) {
      const err = new Error("Không tìm thấy phiếu xét nghiệm");
      err.statusCode = 404;
      throw err;
    }

    // Format test_datetime sang giờ Việt Nam cho response
    if (detail && detail.test_datetime) {
      detail.test_datetime = formatDateTimeWithoutTimezone(detail.test_datetime);
    }

    res.json({
      message: "Lấy chi tiết phiếu xét nghiệm thành công",
      data: detail,
    });
  } catch (error) {
    next(error);
  }
};

/// POST ${import.meta.env.VITE_API_PREFIX}/lab/test-results
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

    // Lấy kết quả mới nhất để format created_at
    const latestResults = await testService.getTestResultsByTestNoteId(test_note_id);
    const formattedResults = latestResults.map(result => ({
      ...result,
      created_at: formatDateTimeWithoutTimezone(result.created_at)
    }));

    res.json({
      message: "Nhập kết quả xét nghiệm và hoàn thành thành công",
      data: {
        success: result,
        results: formattedResults
      },
    });
  } catch (error) {
    next(error);
  }
};

/// GET ${import.meta.env.VITE_API_PREFIX}/lab/queue
exports.getLabQueue = async (req, res, next) => {
  try {
    const { date, lab_staff_id, room_id } = req.query;
    // Sử dụng getAllLabTests với status filter
    const queue = await testService.getAllLabTests("requested", date, lab_staff_id, room_id);
    res.json({
      message: "Lấy danh sách bệnh nhân chờ xét nghiệm thành công",
      data: queue,
    });
  } catch (error) {
    next(error);
  }
};

/// GET ${import.meta.env.VITE_API_PREFIX}/lab/in-progress
exports.getLabInProgress = async (req, res, next) => {
  try {
    const { date, lab_staff_id, room_id } = req.query;
    // Sử dụng getAllLabTests với status filter
    const inProgress = await testService.getAllLabTests("in_progress", date, lab_staff_id, room_id);
    
    // Format bookTime sang giờ Việt Nam
    const formattedInProgress = inProgress.map(record => ({
      ...record,
      bookTime: formatDateTimeWithoutTimezone(record.bookTime)
    }));
    
    res.json({
      message: "Lấy danh sách bệnh nhân đang xét nghiệm thành công",
      data: formattedInProgress,
    });
  } catch (error) {
    next(error);
  }
};

/// GET ${import.meta.env.VITE_API_PREFIX}/lab/finished
// exports.getLabFinished = async (req, res, next) => {
//   try {
//     const { date, lab_staff_id, room_id } = req.query;
//     // Gọi service mới chỉ lấy bệnh nhân đã hoàn thành xét nghiệm, đã có trường results
//     const finished = await testService.getLabTestFinished(date, lab_staff_id, room_id);
//     
//     // Format các trường thời gian sang giờ Việt Nam
//     const formattedFinished = finished.map(record => ({
//       ...record,
//       bookTime: formatVietnamTime(record.bookTime),
//       results: record.results.map(result => ({
//         ...result,
//         created_at: formatVietnamTime(result.created_at)
//       }))
//     }));
//     
//     res.json({
//       message: "Lấy danh sách bệnh nhân đã hoàn thành xét nghiệm thành công",
//       data: formattedFinished,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// GET ${import.meta.env.VITE_API_PREFIX}/lab/lab-tests
exports.getAllLabTests = async (req, res, next) => {
  try {
    const { status, date, lab_staff_id, room_id } = req.query;
    const tests = await testService.getAllLabTests(
      status,
      date,
      lab_staff_id,
      room_id
    );

    // Gắn trường assigned_by và format bookTime
    let data = tests.map((item) => {
      const formattedBookTime = formatDateTimeWithoutTimezone(item.bookTime);
      return {
        ...item,
        assigned_by: item.doctor
          ? `Bác sĩ ${item.doctor} chỉ định`
          : "Đăng ký xét nghiệm",
        bookTime: formattedBookTime
      };
    });

    // Nếu status là 'completed', format thêm results
    if (status === 'completed') {
      data = data.map(record => ({
        ...record,
        results: record.results ? record.results.map(result => ({
          ...result,
          created_at: formatDateTimeWithoutTimezone(result.created_at)
        })) : []
      }));
    }

    res.json({
      message: "Lấy danh sách xét nghiệm thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET ${import.meta.env.VITE_API_PREFIX}/lab/rooms
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

// GET ${import.meta.env.VITE_API_PREFIX}/lab/shifts
exports.getLabStaffShifts = async (req, res, next) => {
  try {
    const { date, lab_staff_id } = req.query;
    const shifts = await testService.getLabStaffShifts(date, lab_staff_id);
    
    // Format created_at sang giờ Việt Nam
    const formattedShifts = shifts.map(shift => ({
      ...shift,
      created_at: formatVietnamTime(shift.created_at)
    }));
    
    res.json({
      message: "Lấy danh sách ca làm việc thành công",
      data: formattedShifts,
    });
  } catch (error) {
    next(error);
  }
};

// GET ${import.meta.env.VITE_API_PREFIX}/lab/current-shift
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
    const { request_id, appointment_id, created_by_id, test_datetime } = req.body;
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
    // Kiểm tra trùng cho request_id (không kiểm tra status)
    if (request_id) {
      const check = await pool.request()
        .input('request_id', request_id)
        .query(`
          SELECT TOP 1 * FROM TestNotes
          WHERE request_id = @request_id
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
      // Nếu frontend gửi ISO string, chuyển về giờ Việt Nam
      const utcDate = new Date(test_datetime);
      // Chuyển về giờ Việt Nam (UTC+7)
      noteDatetime = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
    } else {
      // Tạo thời gian hiện tại theo giờ Việt Nam
      const now = new Date();
      noteDatetime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    }
    
    const note = await testService.createTestNote({
      request_id,
      appointment_id,
      created_by_id,
      test_datetime: noteDatetime,
    });
    
    // Format test_datetime sang giờ Việt Nam cho response
    if (note && note.test_datetime) {
      note.test_datetime = formatDateTimeWithoutTimezone(note.test_datetime);
    }
    
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
    
    // Format test_datetime sang giờ Việt Nam
    const formattedNotes = notes.map(note => ({
      ...note,
      test_datetime: formatDateTimeWithoutTimezone(note.test_datetime)
    }));
    
    res.json({ message: "Lấy danh sách phiếu xét nghiệm theo appointment thành công", data: formattedNotes });
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
    
    // Format test_datetime sang giờ Việt Nam
    if (result && result.test_datetime) {
      result.test_datetime = formatDateTimeWithoutTimezone(result.test_datetime);
    }
    
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
    
    // Format test_datetime sang giờ Việt Nam
    if (result && result.test_datetime) {
      result.test_datetime = formatDateTimeWithoutTimezone(result.test_datetime);
    }
    
    res.json({ message: "Cập nhật thời gian bắt đầu xét nghiệm thành công", data: result });
  } catch (error) {
    next(error);
  }
};


exports.getLatestTestResultsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const pid = Number(patientId);
    const result = await testService.getLatestTestResultsForPatient(pid);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.createBulkTestResults = async (req, res, next) => {
  try {
    const { test_note_id, results, notes } = req.body;
    await testService.createBulkTestResults({ test_note_id, results, notes });
    res.json({ success: true, message: 'Lưu kết quả thành công!' });
  } catch (err) {
    next(err);
  }
};

exports.getTestRequestsByStatus = async (req, res, next) => {
  try {
    const { status } = req.query; // status: queue, in-progress, finished
    const statusMap = {
      queue: "requested",
      "in-progress": "in_progress",
      finished: "completed",
    };
    const dbStatus = statusMap[status];
    if (!dbStatus) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const testRequests = await testService.getTestRequestsByStatus(dbStatus);
    return res.status(200).json({ testRequests });
  } catch (error) {
    next(error);
  }
};