const { poolPromise } = require("../config/db");

//(PATCH, cập nhật status của TestRequests nếu service_type là "examination")
exports.updateTestRequestExamStatus = async (request_id, status) => {
  const pool = await poolPromise;
  // Kiểm tra service_type là 'examination'
  const check = await pool.request().input("request_id", request_id).query(`
      SELECT s.service_type
      FROM Services s
      JOIN TestRequests tr ON s.service_id = tr.service_id
      WHERE tr.request_id = @request_id
    `);

  if (
    !check.recordset.length ||
    check.recordset[0].service_type !== "examination"
  ) {
    return null; // Không phải loại 'exam' hoặc không tồn tại
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
        tr.status AS test_request_status,
        p.full_name AS patient_name,
        a.status AS appointment_status,
        tt.name AS test_type_name,
        s.name AS service_name,
        tr.notes AS test_request_notes      FROM TestNotes tn
      LEFT JOIN TestRequests tr ON tn.request_id = tr.request_id
      LEFT JOIN Appointments a ON tn.appointment_id = a.appointment_id
      LEFT JOIN Patients p ON a.patient_id = p.patient_id
      LEFT JOIN Services s ON tr.service_id = s.service_id
      LEFT JOIN TestTypes tt ON s.test_type_id = tt.test_type_id
      WHERE tn.test_note_id = @test_note_id
    `);

  return result.recordset[0];
};

//POST, nhập kết quả xét nghiệm và hoàn thành
exports.createTestResultAndComplete = async ({
  test_note_id,
  result_value,
  unit,
  reference_range,
  notes,
}) => {
  const pool = await poolPromise;

  // 1. Thêm kết quả xét nghiệm mới
  const insertResult = await pool
    .request()
    .input("test_note_id", test_note_id)
    .input("result_value", result_value)
    .input("unit", unit)
    .input("reference_range", reference_range)
    .input("notes", notes).query(`
      INSERT INTO TestResults (test_note_id, result_value, unit, reference_range, notes)
      VALUES (@test_note_id, @result_value, @unit, @reference_range, @notes);
      SELECT * FROM TestResults WHERE result_id = SCOPE_IDENTITY();
    `);

  // 2. Cập nhật trạng thái phiếu xét nghiệm (nếu muốn)
  // Ví dụ: cập nhật status của TestRequests liên quan thành 'completed'
  await pool.request().input("test_note_id", test_note_id).query(`
      UPDATE tr
      SET tr.status = 'completed'
      FROM TestRequests tr
      JOIN TestNotes tn ON tr.request_id = tn.request_id
      WHERE tn.test_note_id = @test_note_id
    `);

  return insertResult.recordset[0];
};

// Lấy danh sách mẫu CHỜ xét nghiệm
exports.getLabQueue = async (date) => {
  const pool = await poolPromise;
  let query = `
    SELECT tr.request_id AS id, s.service_type AS type, s.name AS type_name, p.full_name AS patient_name, DATEDIFF(YEAR, p.dob, GETDATE()) AS age, 
           CASE WHEN p.gender = 'male' THEN N'Nam' WHEN p.gender = 'female' THEN N'Nữ' ELSE N'Khác' END AS gender,
           tr.request_date AS bookTime,
           d.full_name AS doctor, tr.status, a.queue_number AS stt, p.patient_id
    FROM TestRequests tr
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON tr.service_id = s.service_id
    LEFT JOIN Doctors d ON tr.doctor_id = d.doctor_id
    WHERE tr.status = 'requested'`;
  if (date) {
    query += ` AND CONVERT(date, tr.request_date) = @date`;
  }
  query += ` ORDER BY tr.request_date ASC`;
  const request = pool.request();
  if (date) request.input('date', date);
  const result = await request.query(query);
  return result.recordset;
};

// Lấy danh sách mẫu ĐANG xét nghiệm
exports.getLabInProgress = async (date) => {
  const pool = await poolPromise;
  let query = `
    SELECT tr.request_id AS id, s.service_type AS type, s.name AS type_name, p.full_name AS patient_name, DATEDIFF(YEAR, p.dob, GETDATE()) AS age, 
           CASE WHEN p.gender = 'male' THEN N'Nam' WHEN p.gender = 'female' THEN N'Nữ' ELSE N'Khác' END AS gender,
           tr.request_date AS bookTime,
           d.full_name AS doctor, tr.status, a.queue_number AS stt, p.patient_id
    FROM TestRequests tr
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON tr.service_id = s.service_id
    LEFT JOIN Doctors d ON tr.doctor_id = d.doctor_id
    WHERE tr.status = 'in_progress'`;
  if (date) {
    query += ` AND CONVERT(date, tr.request_date) = @date`;
  }
  query += ` ORDER BY tr.request_date ASC`;
  const request = pool.request();
  if (date) request.input('date', date);
  const result = await request.query(query);
  return result.recordset;
};

// Lấy danh sách mẫu ĐÃ HOÀN THÀNH
exports.getLabDone = async (date) => {
  const pool = await poolPromise;
  let query = `
    SELECT tr.request_id AS id, s.service_type AS type, s.name AS type_name, p.full_name AS patient_name, DATEDIFF(YEAR, p.dob, GETDATE()) AS age, 
           CASE WHEN p.gender = 'male' THEN N'Nam' WHEN p.gender = 'female' THEN N'Nữ' ELSE N'Khác' END AS gender,
           tr.request_date AS bookTime,
           d.full_name AS doctor, tr.status, a.queue_number AS stt, p.patient_id
    FROM TestRequests tr
    JOIN Appointments a ON tr.appointment_id = a.appointment_id
    JOIN Patients p ON a.patient_id = p.patient_id
    JOIN Services s ON tr.service_id = s.service_id
    LEFT JOIN Doctors d ON tr.doctor_id = d.doctor_id
    WHERE tr.status = 'completed'`;
  if (date) {
    query += ` AND CONVERT(date, tr.request_date) = @date`;
  }
  query += ` ORDER BY tr.request_date DESC`;
  const request = pool.request();
  if (date) request.input('date', date);
  const result = await request.query(query);
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