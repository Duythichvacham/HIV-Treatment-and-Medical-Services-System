const { poolPromise, sql } = require("../config/db");

//(PATCH, cập nhật status của TestRequests nếu service_type là "examination")
exports.updateTestRequestExamStatus = async (request_id, status) => {
  const pool = await poolPromise;
  // Kiểm tra service_type là 'examination' hoặc 'test' thông qua TestRequestDetails
  const check = await pool.request().input("request_id", request_id).query(`
      SELECT s.service_type
      FROM Services s
      JOIN TestRequestDetails trd ON s.service_id = trd.service_id
      JOIN TestRequests tr ON trd.request_id = tr.request_id
      WHERE tr.request_id = @request_id
    `);

  if (
    !check.recordset.length ||
    (check.recordset[0].service_type !== "examination" &&
      check.recordset[0].service_type !== "test")
  ) {
    return null; // Không phải loại 'examination' hoặc 'test' hoặc không tồn tại
  }

  // Cập nhật status
  const result = await pool
    .request()
    .input("request_id", request_id)
    .input("status", status).query(`
      UPDATE TestRequests
      SET status = @status
      WHERE request_id = @request_id;
      SELECT * FROM TestRequests WHERE request_id = @request_id;
    `);

  return result.recordset[0];
};

//(GET, lấy chi tiết phiếu xét nghiệm)
exports.getTestNoteDetail = async (test_note_id) => {
  const pool = await poolPromise;
  const result = await pool.request().input("test_note_id", test_note_id)
    .query(`
      SELECT 
        tn.test_note_id,
        tn.request_id,
        tn.appointment_id,
        tn.created_by_id,
        tn.test_datetime, -- thời gian trả kết quả
        tn.notes,
        tr.status AS test_request_status,
        COALESCE(p1.full_name, p2.full_name) AS patient_name,
        COALESCE(p1.gender, p2.gender) AS gender,
        COALESCE(p1.dob, p2.dob) AS dob,
        COALESCE(p1.address, p2.address) AS address,
        a.status AS appointment_status,
        COALESCE(tt.name, tt2.name) AS test_type_name,
        COALESCE(s.name, s2.name) AS service_name,
        COALESCE(s.service_id, s2.service_id) AS service_id,
        CASE 
          WHEN tn.request_id IS NOT NULL THEN 'doctor_request'
          ELSE 'self_booking'
        END AS source,
        CASE WHEN tn.request_id IS NOT NULL THEN d.full_name ELSE NULL END AS doctor_name,
        COALESCE('HIV' + RIGHT('000' + CAST(p1.patient_id AS VARCHAR), 3), 'HIV' + RIGHT('000' + CAST(p2.patient_id AS VARCHAR), 3)) AS patient_code,
        COALESCE(a.room_id, a2.room_id) AS room_id,
        rm.room_name
      FROM TestNotes tn
      LEFT JOIN TestRequests tr ON tn.request_id = tr.request_id
      LEFT JOIN Doctors d ON tr.doctor_id = d.doctor_id
      LEFT JOIN Appointments a ON tn.appointment_id = a.appointment_id
      LEFT JOIN Patients p1 ON a.patient_id = p1.patient_id
      LEFT JOIN Appointments a2 ON tr.appointment_id = a2.appointment_id
      LEFT JOIN Patients p2 ON a2.patient_id = p2.patient_id
      LEFT JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
      LEFT JOIN Services s ON trd.service_id = s.service_id
      LEFT JOIN ServicesTestTypes stt ON s.service_id = stt.service_id
      LEFT JOIN TestTypes tt ON stt.test_type_id = tt.test_type_id
      LEFT JOIN Services s2 ON a.service_id = s2.service_id
      LEFT JOIN ServicesTestTypes stt2 ON s2.service_id = stt2.service_id
      LEFT JOIN TestTypes tt2 ON stt2.test_type_id = tt2.test_type_id
      LEFT JOIN Rooms rm ON COALESCE(a.room_id, a2.room_id) = rm.room_id
      WHERE tn.test_note_id = @test_note_id;
    `);
  const detail = result.recordset[0];
  if (detail) {
    if (detail.source === "self_booking") {
      detail.doctor_name = null;
    }
    // Nếu là TestRequest, lấy danh sách test_types
    if (detail.source === "doctor_request" && detail.request_id) {
      const testTypesRes = await pool.request()
        .input("request_id", detail.request_id)
        .query(`
          SELECT DISTINCT tt.test_type_id, tt.name, tt.unit, tt.normal_range
          FROM TestRequestDetails trd
          JOIN ServicesTestTypes stt ON trd.service_id = stt.service_id
          JOIN TestTypes tt ON stt.test_type_id = tt.test_type_id
          WHERE trd.request_id = @request_id
        `);
      detail.test_types = testTypesRes.recordset;
      // Lấy danh sách tên dịch vụ
      const servicesRes = await pool.request()
        .input("request_id", detail.request_id)
        .query(`
          SELECT DISTINCT s.name
          FROM TestRequestDetails trd
          JOIN Services s ON trd.service_id = s.service_id
          WHERE trd.request_id = @request_id
        `);
      detail.service_names = servicesRes.recordset.map(r => r.name);
    }
  }
  return detail;
};

//POST, nhập kết quả xét nghiệm và hoàn thành
exports.createTestResultAndComplete = async ({
  test_note_id,
  test_type_id,
  result_value,
  unit,
  reference_range,
  notes,
}) => {
  const pool = await poolPromise;

  // Nếu có notes và test_note_id, update notes vào TestNotes
  if (notes && test_note_id) {
    await pool
      .request()
      .input("test_note_id", test_note_id)
      .input("notes", notes)
      .query(
        "UPDATE TestNotes SET notes = @notes WHERE test_note_id = @test_note_id"
      );
  }

  // Nếu có test_type_id và result_value KHÔNG phải object, chỉ lưu 1 chỉ số
  if (test_type_id && typeof result_value !== "object") {
    // Kiểm tra đã có kết quả chưa
    const existingResult = await pool
      .request()
      .input("test_note_id", test_note_id)
      .input("test_type_id", test_type_id)
      .query(
        "SELECT result_id FROM TestResults WHERE test_note_id = @test_note_id AND test_type_id = @test_type_id"
      );
    let result;
    if (existingResult.recordset.length > 0) {
      // UPDATE
      const update = await pool
        .request()
        .input("test_note_id", test_note_id)
        .input("test_type_id", test_type_id)
        .input("result_value", result_value)
        .input("unit", unit)
        .input("reference_range", reference_range)
        .query(
          "UPDATE TestResults SET result_value = @result_value, unit = @unit, reference_range = @reference_range, created_at = GETDATE() OUTPUT INSERTED.* WHERE test_note_id = @test_note_id AND test_type_id = @test_type_id"
        );
      result = update.recordset[0];
    } else {
      // INSERT - Sử dụng GETDATE() vì SQL Server đã là giờ Việt Nam
      const insert = await pool
        .request()
        .input("test_note_id", test_note_id)
        .input("test_type_id", test_type_id)
        .input("result_value", result_value)
        .input("unit", unit)
        .input("reference_range", reference_range)
        .query(
          "INSERT INTO TestResults (test_note_id, test_type_id, result_value, unit, reference_range, created_at) OUTPUT INSERTED.* VALUES (@test_note_id, @test_type_id, @result_value, @unit, @reference_range, GETDATE())"
        );
      result = insert.recordset[0];
    }
  }

  // 1. Lấy appointment_id và request_id từ test_note_id
  const testNoteRes = await pool
    .request()
    .input("test_note_id", test_note_id)
    .query(
      "SELECT appointment_id, request_id FROM TestNotes WHERE test_note_id = @test_note_id"
    );
  let appointment_id = testNoteRes.recordset[0]?.appointment_id;
  const request_id = testNoteRes.recordset[0]?.request_id;
  // Nếu không có appointment_id, lấy từ TestRequests (nếu có request_id)
  if (!appointment_id && request_id) {
    const reqRes = await pool
      .request()
      .input("request_id", request_id)
      .query("SELECT appointment_id FROM TestRequests WHERE request_id = @request_id");
    appointment_id = reqRes.recordset[0]?.appointment_id;
  }
  if (!appointment_id) {
    throw new Error("Không tìm thấy appointment_id cho test_note_id này");
  }

  // Phân biệt doctor_request và self_booking
  if (request_id) {
    // doctor_request: lấy test_type_id từ TestRequestDetails
    const testTypeRes = await pool.request()
      .input("request_id", request_id)
      .query(`
        SELECT DISTINCT stt.test_type_id
        FROM TestRequestDetails trd
        JOIN ServicesTestTypes stt ON trd.service_id = stt.service_id
        WHERE trd.request_id = @request_id
      `);
    const testTypeIds = testTypeRes.recordset.map(r => r.test_type_id);
    // Đếm số lượng kết quả đã nhập cho request_id này
    const countResult = await pool.request()
      .input("request_id", request_id)
      .query(`
        SELECT COUNT(DISTINCT tr.test_type_id) AS count
        FROM TestResults tr
        JOIN TestNotes tn ON tr.test_note_id = tn.test_note_id
        WHERE tn.request_id = @request_id
      `);
    const resultCount = countResult.recordset[0]?.count || 0;
    if (resultCount === testTypeIds.length) {
      await pool.request()
        .input("request_id", request_id)
        .query("UPDATE TestRequests SET status = 'completed' WHERE request_id = @request_id");
    }
  } else {
    // self_booking: lấy test_type_id từ service_id của Appointment
    const appRes = await pool
      .request()
      .input("appointment_id", appointment_id)
      .query(
        "SELECT service_id FROM Appointments WHERE appointment_id = @appointment_id"
      );
    const service_id = appRes.recordset[0]?.service_id;
    if (!service_id) {
      throw new Error("Không tìm thấy service_id cho appointment_id này");
    }
    const sttRes = await pool
      .request()
      .input("service_id", service_id)
      .query(
        "SELECT test_type_id FROM ServicesTestTypes WHERE service_id = @service_id"
      );
    const testTypeIds = sttRes.recordset.map((r) => r.test_type_id);
    // Đếm số lượng kết quả đã nhập cho appointment_id này
    const countResult = await pool
      .request()
      .input("appointment_id", appointment_id)
      .query(`
        SELECT COUNT(DISTINCT tr.test_type_id) AS count 
        FROM TestResults tr
        JOIN TestNotes tn ON tr.test_note_id = tn.test_note_id
        WHERE tn.appointment_id = @appointment_id
      `);
    const resultCount = countResult.recordset[0]?.count || 0;
    if (resultCount === testTypeIds.length) {
      // Chỉ update status của Appointments, không update TestRequests
      await pool.request()
        .input("appointment_id", appointment_id)
        .query(
          "UPDATE Appointments SET status = 'completed' WHERE appointment_id = @appointment_id"
        );
    }
  }

  // Debug toàn bộ TestResults và TestNotes liên quan test_note_id
  const allResults = await pool
    .request()
    .input("test_note_id", test_note_id)
    .query("SELECT * FROM TestResults WHERE test_note_id = @test_note_id");
  const testNote = await pool
    .request()
    .input("test_note_id", test_note_id)
    .query("SELECT * FROM TestNotes WHERE test_note_id = @test_note_id");

  return true;
};

// Lấy danh sách bệnh nhân đang xét nghiệm

// - Sử dụng QueueNumbers table thay vì ROW_NUMBER()
exports.getAllLabTests = async (
  status = null,
  date = null,
  lab_staff_id = null,
  room_id = null
) => {
  const pool = await poolPromise;

  // Nếu có lab_staff_id nhưng không có room_id, tự động lấy room_id từ WorkingShifts
  if (lab_staff_id && !room_id) {
    const shiftResult = await pool
      .request()
      .input("lab_staff_id", lab_staff_id)
      .input("date", date).query(`
        SELECT room_id 
        FROM WorkingShifts 
        WHERE lab_staff_id = @lab_staff_id 
          AND shift_date = @date 
          AND status = 'approved'
      `);

    if (shiftResult.recordset.length > 0) {
      room_id = shiftResult.recordset[0].room_id;
    }
  }

  let query = `
    -- 1. Xét nghiệm do bác sĩ chỉ định (TestRequests)
    SELECT 
        'doctor_request' AS source,
        tr.request_id AS id,
        s.service_type AS type,
        s.name AS type_name,
        p.full_name AS patient_name,
        DATEDIFF(YEAR, p.dob, GETDATE()) AS age,
        CASE WHEN p.gender = 'male' THEN N'Nam' WHEN p.gender = 'female' THEN N'Nữ' ELSE N'Khác' END AS gender,
        tr.request_date AS bookTime,
        d.full_name AS doctor,
        tr.status,
        qn.current_number AS queue_number,
        p.patient_id,
        tr.appointment_id AS appointment_id,
        tr.room_id,
        r.room_name,
        ws.shift_id,
        ws.shift_date,
        tn.test_note_id,
        -- CD4 gần nhất
        (SELECT TOP 1 result_value FROM TestResults tr2
          JOIN TestNotes tn2 ON tr2.test_note_id = tn2.test_note_id
          JOIN Appointments a2 ON tn2.appointment_id = a2.appointment_id
          WHERE a2.patient_id = p.patient_id AND tr2.test_type_id = 1
          ORDER BY tr2.created_at DESC) AS latest_cd4,
        -- Viral Load gần nhất
        (SELECT TOP 1 result_value FROM TestResults tr3
          JOIN TestNotes tn3 ON tr3.test_note_id = tn3.test_note_id
          JOIN Appointments a3 ON tn3.appointment_id = a3.appointment_id
          WHERE a3.patient_id = p.patient_id AND tr3.test_type_id = 2
          ORDER BY tr3.created_at DESC) AS latest_viral_load
    FROM TestRequests tr
    JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON trd.service_id = s.service_id
    LEFT JOIN Doctors d ON tr.doctor_id = d.doctor_id
    JOIN Invoices i ON tr.request_id = i.request_id AND i.status = 'paid'
    LEFT JOIN Rooms r ON tr.room_id = r.room_id
    LEFT JOIN WorkingShifts ws ON tr.room_id = ws.room_id
      AND CONVERT(date, tr.request_date) = ws.shift_date
    LEFT JOIN TestNotes tn ON tn.request_id = tr.request_id
    LEFT JOIN QueueNumbers qn ON qn.request_id = tr.request_id 
      AND qn.queue_type = 'test' 
      AND qn.queue_date = CONVERT(date, tr.request_date)
    WHERE 1=1`;

  if (status) {
    query += ` AND tr.status = @status`;
  }
  if (date) {
    query += ` AND CONVERT(date, tr.request_date) = @date`;
  }
  if (room_id) {
    query += ` AND tr.room_id = @room_id`;
  }

  query += `
    UNION ALL
    -- 2. Xét nghiệm tự đặt (Appointments)
    SELECT 
        'self_booking' AS source,
        NULL AS id,
        s.service_type AS type,
        s.name AS type_name,
        p.full_name AS patient_name,
        DATEDIFF(YEAR, p.dob, GETDATE()) AS age,
        CASE WHEN p.gender = 'male' THEN N'Nam' WHEN p.gender = 'female' THEN N'Nữ' ELSE N'Khác' END AS gender,
        a.created_at AS bookTime,
        NULL AS doctor,
        a.status,
        qn.current_number AS queue_number,
        p.patient_id,
        a.appointment_id,
        a.room_id,
        r.room_name,
        ws.shift_id,
        ws.shift_date,
        tn.test_note_id,
        -- CD4 gần nhất
        (SELECT TOP 1 result_value FROM TestResults tr2
          JOIN TestNotes tn2 ON tr2.test_note_id = tn2.test_note_id
          JOIN Appointments a2 ON tn2.appointment_id = a2.appointment_id
          WHERE a2.patient_id = p.patient_id AND tr2.test_type_id = 1
          ORDER BY tr2.created_at DESC) AS latest_cd4,
        -- Viral Load gần nhất
        (SELECT TOP 1 result_value FROM TestResults tr3
          JOIN TestNotes tn3 ON tr3.test_note_id = tn3.test_note_id
          JOIN Appointments a3 ON tn3.appointment_id = a3.appointment_id
          WHERE a3.patient_id = p.patient_id AND tr3.test_type_id = 2
          ORDER BY tr3.created_at DESC) AS latest_viral_load
    FROM Appointments a
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON a.service_id = s.service_id
    JOIN Invoices i ON a.appointment_id = i.appointment_id AND i.status = 'paid'
    LEFT JOIN Rooms r ON a.room_id = r.room_id
    LEFT JOIN WorkingShifts ws ON a.room_id = ws.room_id
      AND CONVERT(date, a.bookingDate) = ws.shift_date
    LEFT JOIN TestNotes tn ON tn.appointment_id = a.appointment_id
    LEFT JOIN QueueNumbers qn ON qn.appointment_id = a.appointment_id 
      AND qn.queue_type = 'test' 
      AND qn.queue_date = CONVERT(date, a.bookingDate)
    WHERE a.doctor_id IS NULL AND s.service_type = 'test'`;

  if (status) {
    query += ` AND a.status = @status`;
  }
  if (date) {
    query += ` AND CONVERT(date, a.bookingDate) = @date`;
  }
  if (room_id) {
    query += ` AND a.room_id = @room_id`;
  }

  query += `
    ORDER BY bookTime ASC`;

  const request = pool.request();
  if (status) request.input("status", status);
  if (date) request.input("date", date);
  if (room_id) request.input("room_id", room_id);
  const result = await request.query(query);
  const records = result.recordset;

  // Nếu status là 'completed', lấy thêm test results
  if (status === 'completed') {
    const testNoteIds = records.map(r => r.test_note_id).filter(Boolean);
    let resultsByNoteId = {};

    if (testNoteIds.length > 0) {
      const resultsQuery = `
        SELECT tr.test_note_id, tr.result_id, tr.test_type_id, tt.name AS test_type_name, 
               tr.result_value, tr.unit, tr.reference_range, tr.created_at
        FROM TestResults tr
        JOIN TestTypes tt ON tr.test_type_id = tt.test_type_id
        WHERE tr.test_note_id IN (${testNoteIds.join(",")})
        ORDER BY tr.test_note_id, tr.result_id ASC
      `;
      const resultsRes = await pool.request().query(resultsQuery);
      for (const row of resultsRes.recordset) {
        if (!resultsByNoteId[row.test_note_id])
          resultsByNoteId[row.test_note_id] = [];
        resultsByNoteId[row.test_note_id].push(row);
      }
    }

    // Gắn results vào từng bản ghi
    const recordsWithResults = records.map((r) => ({
      ...r,
      results: r.test_note_id ? resultsByNoteId[r.test_note_id] || [] : [],
    }));

    return recordsWithResults;
  }

  return records;
};

// Lấy danh sách phòng xét nghiệm
exports.getLabRooms = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT 
      room_id,
      room_name,
      room_type
    FROM Rooms 
    WHERE room_type = N'Xét nghiệm'
    ORDER BY room_name
  `);
  return result.recordset;
};

// Lấy danh sách ca làm việc của lab staff theo ngày
exports.getLabStaffShifts = async (date, lab_staff_id = null) => {
  const pool = await poolPromise;
  let query = `
    SELECT 
      ws.shift_id,
      ws.shift_date,
      ws.room_id,
      r.room_name,
      ws.lab_staff_id,
      a.username AS lab_staff_username,
      ws.status,
      ws.created_at
    FROM WorkingShifts ws
    JOIN Rooms r ON ws.room_id = r.room_id
    JOIN Accounts a ON ws.lab_staff_id = a.account_id
    WHERE ws.lab_staff_id IS NOT NULL
    AND r.room_type = N'Xét nghiệm'`;

  if (date) {
    query += ` AND ws.shift_date = @date`;
  }
  if (lab_staff_id) {
    query += ` AND ws.lab_staff_id = @lab_staff_id`;
  }

  query += ` ORDER BY ws.shift_date DESC, r.room_name`;

  const request = pool.request();
  if (date) request.input("date", date);
  if (lab_staff_id) request.input("lab_staff_id", lab_staff_id);

  const result = await request.query(query);
  return result.recordset;
};

// Lấy thông tin ca làm việc hiện tại của lab staff
exports.getCurrentLabStaffShift = async (lab_staff_id, date = null) => {
  const pool = await poolPromise;
  const currentDate = date || new Date().toISOString().slice(0, 10);

  const result = await pool
    .request()
    .input("lab_staff_id", lab_staff_id)
    .input("date", currentDate).query(`
    SELECT 
        ws.shift_id,
        ws.shift_date,
        ws.room_id,
        r.room_name,
        ws.lab_staff_id,
        a.username AS lab_staff_username,
        ws.status
      FROM WorkingShifts ws
      JOIN Rooms r ON ws.room_id = r.room_id
      JOIN Accounts a ON ws.lab_staff_id = a.account_id
      WHERE ws.lab_staff_id = @lab_staff_id
      AND ws.shift_date = @date
      AND ws.status = 'approved'
      AND r.room_type = N'Xét nghiệm'
    `);

  return result.recordset[0] || null;
};

exports.createTestNote = async ({
  request_id,
  appointment_id,
  created_by_id,
  test_datetime,
}) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("request_id", sql.Int, request_id)
    .input("appointment_id", sql.Int, appointment_id)
    .input("created_by_id", sql.Int, created_by_id)
    .input("test_datetime", sql.DateTime, test_datetime).query(`
      INSERT INTO TestNotes (request_id, appointment_id, created_by_id, test_datetime)
      OUTPUT INSERTED.*
      VALUES (@request_id, @appointment_id, @created_by_id, @test_datetime)
    `);
  return result.recordset[0];
};

exports.getTestResultsByTestNoteId = async (test_note_id) => {
  const pool = await poolPromise;
  const result = await pool.request().input("test_note_id", test_note_id)
    .query(`
      SELECT 
        tr.result_id, 
        tr.test_type_id,
        tt.name AS test_type_name,
        tr.result_value, 
        tr.unit, 
        tt.normal_range AS reference_range, 
        tr.created_at
      FROM TestResults tr
      JOIN TestTypes tt ON tr.test_type_id = tt.test_type_id
      WHERE tr.test_note_id = @test_note_id
      ORDER BY tr.result_id ASC
    `);
  return result.recordset;
};

// Cập nhật trạng thái phiếu xét nghiệm và thời gian bắt đầu (test_datetime)
exports.updateTestNoteStatus = async (test_note_id, status) => {
  const pool = await poolPromise;
  // Nếu chuyển sang in_progress thì cập nhật test_datetime
  if (status === "in_progress") {
    await pool
      .request()
      .input("test_note_id", test_note_id)
      .query(
        "UPDATE TestNotes SET test_datetime = GETDATE() WHERE test_note_id = @test_note_id"
      );
  }
  // KHÔNG update status nếu không có cột status trong TestNotes
};

exports.getTestNotesByAppointment = async (appointment_id) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("appointment_id", appointment_id)
    .query(
      "SELECT * FROM TestNotes WHERE appointment_id = @appointment_id ORDER BY test_datetime DESC"
    );
  return result.recordset;
};

exports.updateTestNoteNotes = async (test_note_id, notes) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("test_note_id", sql.Int, test_note_id)
    .input("notes", sql.NVarChar, notes).query(`
      UPDATE TestNotes 
      SET notes = @notes 
      WHERE test_note_id = @test_note_id;
      
      SELECT * FROM TestNotes WHERE test_note_id = @test_note_id;
    `);

  return result.recordset[0];
};

exports.updateTestNoteDatetime = async (test_note_id, test_datetime) => {
  const pool = await poolPromise;
  await pool
    .request()
    .input("test_note_id", test_note_id)
    .input("test_datetime", test_datetime)
    .query(
      "UPDATE TestNotes SET test_datetime = @test_datetime WHERE test_note_id = @test_note_id"
    );
  return { test_note_id, test_datetime };
};

// Test function to check latest CD4 and Viral Load for debugging
exports.getLatestTestResultsForPatient = async (patientId) => {
  const pool = await poolPromise;
  const query = `
    SELECT 
      p.patient_id,
      p.full_name,
      (SELECT TOP 1 result_value FROM TestResults tr2
        JOIN TestNotes tn2 ON tr2.test_note_id = tn2.test_note_id
        JOIN Appointments a2 ON tn2.appointment_id = a2.appointment_id
        WHERE a2.patient_id = p.patient_id AND tr2.test_type_id = 1
        ORDER BY tr2.created_at DESC) AS latest_cd4,
      (SELECT TOP 1 result_value FROM TestResults tr3
        JOIN TestNotes tn3 ON tr3.test_note_id = tn3.test_note_id
        JOIN Appointments a3 ON tn3.appointment_id = a3.appointment_id
        WHERE a3.patient_id = p.patient_id AND tr3.test_type_id = 2
        ORDER BY tr3.created_at DESC) AS latest_viral_load,
      (SELECT STRING_AGG(CONCAT(tr4.result_value, ' (', tr4.created_at, ')'), ', ') 
       FROM TestResults tr4
       JOIN TestNotes tn4 ON tr4.test_note_id = tn4.test_note_id
       JOIN Appointments a4 ON tn4.appointment_id = a4.appointment_id
       WHERE a4.patient_id = p.patient_id AND tr4.test_type_id = 1
      ) AS all_cd4_results,
      (SELECT STRING_AGG(CONCAT(tr5.result_value, ' (', tr5.created_at, ')'), ', ')
       FROM TestResults tr5
       JOIN TestNotes tn5 ON tr5.test_note_id = tn5.test_note_id
       JOIN Appointments a5 ON tn5.appointment_id = a5.appointment_id
       WHERE a5.patient_id = p.patient_id AND tr5.test_type_id = 2
      ) AS all_viral_load_results
    FROM Patients p
    WHERE p.patient_id = @patient_id
  `;

  const result = await pool.request()
    .input("patient_id", sql.Int, patientId)
    .query(query);

  return result.recordset[0];
};

// Simple test function to get all test results for a patient
exports.getAllTestResultsForPatient = async (patientId) => {
  const pool = await poolPromise;
  const query = `
    SELECT 
      tr.result_id,
      tr.test_type_id,
      tt.name AS test_type_name,
      tr.result_value,
      tr.unit,
      tr.created_at,
      tn.test_note_id,
      a.appointment_id,
      p.patient_id,
      p.full_name
    FROM TestResults tr
    JOIN TestNotes tn ON tr.test_note_id = tn.test_note_id
    JOIN Appointments a ON tn.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN TestTypes tt ON tr.test_type_id = tt.test_type_id
    WHERE p.patient_id = @patient_id
    AND tr.test_type_id IN (1, 2) -- CD4 and Viral Load only
    ORDER BY tr.created_at DESC
  `;

  const result = await pool.request()
    .input("patient_id", patientId)
    .query(query);

  return result.recordset;
};

exports.createBulkTestResults = async ({ test_note_id, results, notes }) => {
  const pool = await poolPromise;
  // Cập nhật notes nếu có
  if (notes && test_note_id) {
    await pool.request()
      .input('test_note_id', test_note_id)
      .input('notes', notes)
      .query('UPDATE TestNotes SET notes = @notes WHERE test_note_id = @test_note_id');
  }
  // Lưu từng kết quả
  for (const r of results) {
    await exports.createTestResultAndComplete({
      test_note_id,
      test_type_id: r.test_type_id,
      result_value: r.result_value,
      unit: r.unit,
      reference_range: r.reference_range,
      notes: null
    });
  }
};

exports.getTestRequestsByStatus = async (status) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("status", status)
    .query(`
      SELECT
        tr.*,
        a.patient_id,
        p.full_name,
        p.dob,
        p.gender,
        p.phone
      FROM TestRequests tr
      JOIN Appointments a ON tr.appointment_id = a.appointment_id
      JOIN Patients p ON a.patient_id = p.patient_id
      WHERE tr.status = @status
    `);
  return result.recordset;
};
