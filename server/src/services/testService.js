const { poolPromise } = require("../config/db");

//(PATCH, cập nhật status của TestRequests nếu service_type là "examination")
exports.updateTestRequestExamStatus = async (request_id, status) => {
  const pool = await poolPromise;
  // Kiểm tra service_type là 'examination' hoặc 'test'
  const check = await pool.request().input("request_id", request_id).query(`
      SELECT s.service_type
      FROM Services s
      JOIN TestRequests tr ON s.service_id = tr.service_id
      WHERE tr.request_id = @request_id
    `);

  if (
    !check.recordset.length ||
    (check.recordset[0].service_type !== "examination" && check.recordset[0].service_type !== "test")
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
  tn.test_datetime,
  tn.notes, -- Lấy notes từ TestNotes
  tr.status AS test_request_status,
  p.full_name AS patient_name,
  a.status AS appointment_status,
  s.name AS service_name
FROM TestNotes tn
LEFT JOIN TestRequests tr ON tn.request_id = tr.request_id
LEFT JOIN Appointments a ON tn.appointment_id = a.appointment_id
LEFT JOIN Patients p ON a.patient_id = p.patient_id
LEFT JOIN Services s ON tr.service_id = s.service_id
WHERE tn.test_note_id = @test_note_id
    `);

  return result.recordset[0];
};

//POST, nhập kết quả xét nghiệm và hoàn thành
exports.createTestResultAndComplete = async ({
  test_note_id,
  result_value,
  unit,
  reference_range
}) => {
  const pool = await poolPromise;

  // 1. Lấy test_type_id và thông tin test type từ service liên quan
  const testTypeResult = await pool
    .request()
    .input("test_note_id", test_note_id)
    .query(`
      SELECT TOP 1 stt.test_type_id, tt.name as test_type_name, tt.unit as test_type_unit, tt.normal_range as test_type_normal_range
      FROM TestNotes tn
      LEFT JOIN TestRequests tr ON tn.request_id = tr.request_id
      LEFT JOIN Appointments a ON tn.appointment_id = a.appointment_id
      LEFT JOIN Services s ON (tr.service_id = s.service_id OR a.service_id = s.service_id)
      LEFT JOIN ServicesTestTypes stt ON s.service_id = stt.service_id
      LEFT JOIN TestTypes tt ON stt.test_type_id = tt.test_type_id
      WHERE tn.test_note_id = @test_note_id
      AND stt.test_type_id IS NOT NULL
    `);

  const testTypeInfo = testTypeResult.recordset[0];
  
  if (!testTypeInfo?.test_type_id) {
    throw new Error('Không thể xác định loại xét nghiệm cho kết quả này');
  }

  // 2. Thêm kết quả xét nghiệm mới với test_type_id
  const insertResult = await pool
    .request()
    .input("test_note_id", test_note_id)
    .input("test_type_id", testTypeInfo.test_type_id)
    .input("result_value", result_value)
    .input("unit", unit)
    .input("reference_range", reference_range)
    .query(`
      INSERT INTO TestResults (test_note_id, test_type_id, result_value, unit, reference_range)
      VALUES (@test_note_id, @test_type_id, @result_value, @unit, @reference_range);
      SELECT * FROM TestResults WHERE result_id = SCOPE_IDENTITY();
    `);

  // 3. Cập nhật trạng thái phiếu xét nghiệm (nếu muốn)
  await pool.request().input("test_note_id", test_note_id).query(`
      UPDATE tr
      SET tr.status = 'completed'
      FROM TestRequests tr
      JOIN TestNotes tn ON tr.request_id = tn.request_id
      WHERE tn.test_note_id = @test_note_id
    `);

  // 4. Lấy notes từ TestNotes
  const testNote = await pool.request()
    .input("test_note_id", test_note_id)
    .query("SELECT notes FROM TestNotes WHERE test_note_id = @test_note_id");

  return {
    ...insertResult.recordset[0],
    test_type_name: testTypeInfo.test_type_name,
    test_type_unit: testTypeInfo.test_type_unit,
    test_type_normal_range: testTypeInfo.test_type_normal_range,
    notes: testNote.recordset[0]?.notes || null
  };
};

// Lấy danh sách mẫu CHỜ xét nghiệm (không join slot, chỉ lọc theo ngày và trạng thái)
exports.getLabQueue = async (date) => {
  const pool = await poolPromise;
  console.log('[DEBUG][getLabQueue] called with date:', date);
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
        a.queue_number AS stt,
        p.patient_id,
        NULL AS appointment_id
    FROM TestRequests tr
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON tr.service_id = s.service_id
    LEFT JOIN Doctors d ON tr.doctor_id = d.doctor_id
    JOIN Invoices i ON tr.request_id = i.request_id AND i.status = 'paid'
    WHERE tr.status = 'requested'`;
  if (date) {
    query += ` AND CONVERT(date, tr.request_date) = @date`;
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
        a.queue_number AS stt,
        p.patient_id,
        a.appointment_id
    FROM Appointments a
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON a.service_id = s.service_id
    JOIN Invoices i ON a.appointment_id = i.appointment_id AND i.status = 'paid'
    WHERE a.status = 'requested' AND a.doctor_id IS NULL AND s.service_type = 'test'`;
  if (date) {
    query += ` AND CONVERT(date, a.bookingDate) = @date`;
  }
  query += `
    ORDER BY bookTime ASC`;
  console.log('[DEBUG][getLabQueue] SQL Query:', query);
  const request = pool.request();
  if (date) request.input('date', date);
  const result = await request.query(query);
  console.log('[DEBUG][getLabQueue] result:', result.recordset);
  return result.recordset;
};

// Lấy danh sách mẫu ĐANG xét nghiệm (không join slot, chỉ lọc theo ngày và trạng thái)
exports.getLabInProgress = async (date) => {
  const pool = await poolPromise;
  console.log('[DEBUG][getLabInProgress] called with date:', date);
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
        a.queue_number AS stt,
        p.patient_id,
        NULL AS appointment_id
    FROM TestRequests tr
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON tr.service_id = s.service_id
    LEFT JOIN Doctors d ON tr.doctor_id = d.doctor_id
    JOIN Invoices i ON tr.request_id = i.request_id AND i.status = 'paid'
    WHERE tr.status = 'in_progress'`;
  if (date) {
    query += ` AND CONVERT(date, tr.request_date) = @date`;
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
        a.queue_number AS stt,
        p.patient_id,
        a.appointment_id
    FROM Appointments a
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON a.service_id = s.service_id
    JOIN Invoices i ON a.appointment_id = i.appointment_id AND i.status = 'paid'
    WHERE a.status = 'in_progress' AND a.doctor_id IS NULL AND s.service_type = 'test'`;
  if (date) {
    query += ` AND CONVERT(date, a.bookingDate) = @date`;
  }
  query += `
    ORDER BY bookTime ASC`;
  console.log('[DEBUG][getLabInProgress] SQL Query:', query);
  const request = pool.request();
  if (date) request.input('date', date);
  const result = await request.query(query);
  console.log('[DEBUG][getLabInProgress] result:', result.recordset);
  return result.recordset;
};

// Lấy danh sách mẫu ĐÃ HOÀN THÀNH (không join slot, chỉ lọc theo ngày và trạng thái)
exports.getLabDone = async (date) => {
  const pool = await poolPromise;
  console.log('[DEBUG][getLabDone] called with date:', date);
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
        a.queue_number AS stt,
        p.patient_id,
        NULL AS appointment_id
    FROM TestRequests tr
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON tr.service_id = s.service_id
    LEFT JOIN Doctors d ON tr.doctor_id = d.doctor_id
    JOIN Invoices i ON tr.request_id = i.request_id AND i.status = 'paid'
    WHERE tr.status = 'completed'`;
  if (date) {
    query += ` AND CONVERT(date, tr.request_date) = @date`;
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
        a.queue_number AS stt,
        p.patient_id,
        a.appointment_id
    FROM Appointments a
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON a.service_id = s.service_id
    JOIN Invoices i ON a.appointment_id = i.appointment_id AND i.status = 'paid'
    WHERE a.status = 'completed' AND a.doctor_id IS NULL AND s.service_type = 'test'`;
  if (date) {
    query += ` AND CONVERT(date, a.bookingDate) = @date`;
  }
  query += `
    ORDER BY bookTime ASC`;
  console.log('[DEBUG][getLabDone] SQL Query:', query);
  const request = pool.request();
  if (date) request.input('date', date);
  const result = await request.query(query);
  console.log('[DEBUG][getLabDone] result:', result.recordset);
  return result.recordset;
};

// lấy danh sách tất cả mẫu xét nghiệm
exports.getAllLabTests = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT 
      a.appointment_id,
      a.status,
      a.created_at,
      a.doctor_id,
      d.full_name AS doctor_name,
      p.full_name AS patient_name,
      s.name AS service_name
    FROM Appointments a
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON a.service_id = s.service_id
    LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
    WHERE s.service_type = 'test'
    ORDER BY a.created_at DESC
  `);
  return result.recordset;
};

exports.getTestResultsByTestNoteId = async (test_note_id) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("test_note_id", test_note_id)
    .query(`
      SELECT tr.result_id, tr.result_value, tr.unit, tr.reference_range, tr.created_at, tt.name AS test_type_name
      FROM TestResults tr
      JOIN TestTypes tt ON tr.test_type_id = tt.test_type_id
      WHERE tr.test_note_id = @test_note_id
      ORDER BY tr.result_id ASC
    `);
  return result.recordset;
};