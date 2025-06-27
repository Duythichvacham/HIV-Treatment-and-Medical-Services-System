const { poolPromise } = require("../config/db");

//
const getCurrentExam = async (patientId, appointmentId = null) => {
  const pool = await poolPromise;
  let query = `
    SELECT 
      p.full_name AS ho_ten,
      'HIV' + RIGHT('000' + CAST(p.patient_id AS VARCHAR), 3) AS ma_bn,
      DATEDIFF(YEAR, p.dob, GETDATE()) AS tuoi,
      p.gender,
      s.start_time AS gio_hen,
      a.appointment_id
    INTO #PatientInfo
    FROM Patients p
    JOIN Appointments a ON p.patient_id = a.patient_id
    JOIN Slots s ON a.slot_id = s.slot_id
    WHERE p.patient_id = @patient_id
      ${appointmentId ? "AND a.appointment_id = @appointment_id" : ""}
    ORDER BY a.created_at DESC;

    -- Lấy thông tin điều trị ARV hiện tại (có thể không có)
    SELECT TOP 1
        ar.name AS phac_do,
        a.created_at AS ngay_bat_dau,
        mh.arv_adherence AS tuan_thu,
        mh.arv_side_effects AS tac_dung_phu
    INTO #ARVInfo
    FROM Appointments a
    LEFT JOIN Prescriptions pr ON pr.appointment_id = a.appointment_id
    LEFT JOIN ARVRegimens ar ON pr.arv_regimen_id = ar.arv_regimen_id
    LEFT JOIN Patients p ON a.patient_id = p.patient_id
    LEFT JOIN MedicalHistory mh ON p.patient_id = mh.patient_id
    WHERE p.patient_id = @patient_id
    ORDER BY a.created_at DESC;
    IF NOT EXISTS (SELECT 1 FROM #ARVInfo)
    BEGIN
      SELECT 
        CAST(NULL AS NVARCHAR(255)) AS phac_do,
        CAST(NULL AS DATETIME) AS ngay_bat_dau,
        CAST(NULL AS NVARCHAR(255)) AS tuan_thu,
        CAST(NULL AS NVARCHAR(255)) AS tac_dung_phu
      INTO #ARVInfo
      WHERE 1=0
    END

    -- Lấy kết quả xét nghiệm gần nhất (có thể không có)
    SELECT TOP 1
        tr.test_note_id,
        tn.test_datetime,
        tr.result_value,
        tr.notes,
        tt.name AS test_type
    INTO #LatestTests
    FROM TestResults tr
    LEFT JOIN TestNotes tn ON tr.test_note_id = tn.test_note_id
    LEFT JOIN Appointments a ON tn.appointment_id = a.appointment_id
    LEFT JOIN TestRequests r ON tn.request_id = r.request_id
    LEFT JOIN Services s ON r.service_id = s.service_id AND s.test_type_id IS NOT NULL
    LEFT JOIN TestTypes tt ON s.test_type_id = tt.test_type_id
    WHERE a.patient_id = @patient_id
    ORDER BY tn.test_datetime DESC;
    IF NOT EXISTS (SELECT 1 FROM #LatestTests)
    BEGIN
      SELECT 
        CAST(NULL AS INT) AS test_note_id,
        CAST(NULL AS DATETIME) AS test_datetime,
        CAST(NULL AS NVARCHAR(255)) AS result_value,
        CAST(NULL AS NVARCHAR(255)) AS notes,
        CAST(NULL AS NVARCHAR(255)) AS test_type
      INTO #LatestTests
      WHERE 1=0
    END

    -- Pivot kết quả xét nghiệm (có thể không có)
    SELECT 
        MAX(CASE WHEN tt.name = N'HIV Viral Load' THEN tr.result_value + ' ' + ISNULL(tr.unit, '') END) AS viral_load,
        MAX(CASE WHEN tt.name = 'CD4' THEN tr.result_value + ' ' + ISNULL(tr.unit, '') END) AS cd4,
        MAX(CASE WHEN tt.name = N'Sàng lọc' THEN tr.notes END) AS sang_loc,
        MAX(CASE WHEN tt.name = N'Khẳng định' THEN tr.notes END) AS khang_dinh
    INTO #XetNghiemGanNhat
    FROM TestResults tr
    LEFT JOIN TestNotes tn ON tr.test_note_id = tn.test_note_id
    LEFT JOIN Appointments a ON tn.appointment_id = a.appointment_id
    LEFT JOIN TestRequests r ON tn.request_id = r.request_id
    LEFT JOIN Services s ON r.service_id = s.service_id
    LEFT JOIN ServicesTestTypes stt ON s.service_id = stt.service_id
    LEFT JOIN TestTypes tt ON stt.test_type_id = tt.test_type_id
    WHERE a.patient_id = @patient_id
    GROUP BY tn.test_datetime
    ORDER BY tn.test_datetime DESC;
    IF NOT EXISTS (SELECT 1 FROM #XetNghiemGanNhat)
    BEGIN
      SELECT 
        CAST(NULL AS NVARCHAR(255)) AS viral_load,
        CAST(NULL AS NVARCHAR(255)) AS cd4,
        CAST(NULL AS NVARCHAR(255)) AS sang_loc,
        CAST(NULL AS NVARCHAR(255)) AS khang_dinh
      INTO #XetNghiemGanNhat
      WHERE 1=0
    END

    -- Hiển thị tổng hợp tất cả
    SELECT 
        pi.ho_ten,
        pi.ma_bn,
        pi.tuoi,
        pi.gender,
        pi.gio_hen,
        pi.appointment_id,
        ai.phac_do,
        FORMAT(ai.ngay_bat_dau, 'yyyy-MM-dd') AS ngay_bat_dau,
        ai.tuan_thu,
        ai.tac_dung_phu,
        xn.viral_load,
        xn.cd4,
        xn.sang_loc,
        xn.khang_dinh
    FROM #PatientInfo pi
    LEFT JOIN #ARVInfo ai ON 1 = 1
    LEFT JOIN #XetNghiemGanNhat xn ON 1 = 1;

    -- Cleanup
    DROP TABLE #PatientInfo;
    DROP TABLE #ARVInfo;
    DROP TABLE #LatestTests;
    DROP TABLE #XetNghiemGanNhat;`;

  const request = pool.request().input("patient_id", patientId);
  if (appointmentId) request.input("appointment_id", appointmentId);

  const result = await request.query(query);
  return result.recordset;
};
//

//GET lịch sử khám bệnh của bệnh nhân
const getExamHistory = async (patientId) => {
  const pool = await poolPromise;
  const result = await pool.request().input("patient_id", patientId)
    .query(`SELECT 
    CONVERT(DATE, a.created_at) AS ngay_kham,
    d.full_name AS bac_si,
    ce.diagnosis_primary AS chan_doan,
    -- Mô tả đơn thuốc lấy doctor_notes hoặc mô phỏng từ tên phác đồ
    CASE 
        WHEN ar.name IS NOT NULL THEN N'Tiếp tục ' + ar.name
        ELSE ISNULL(pr.doctor_notes, N'Duy trì điều trị hiện tại')
    END AS don_thuoc,
    -- Gợi ý hardcode loại khám
    CASE 
        WHEN ce.diagnosis_primary LIKE N'%định kỳ%' THEN N'Khám định kỳ'
        WHEN ce.diagnosis_primary LIKE N'%theo dõi%' THEN N'Khám theo dõi'
        ELSE N'Tái khám'
    END AS loai_kham
    FROM Appointments a
    JOIN Doctors d ON a.doctor_id = d.doctor_id
    JOIN ClinicalExams ce ON ce.appointment_id = a.appointment_id
    LEFT JOIN Prescriptions pr ON pr.appointment_id = a.appointment_id
    LEFT JOIN ARVRegimens ar ON pr.arv_regimen_id = ar.arv_regimen_id
    WHERE a.patient_id = @patient_id
    ORDER BY a.created_at DESC;`);
  return result.recordset;
};

//Get: lấy danh sách bệnh nhân queued/in_progress/finished cho bác sĩ theo ngày
const getAppointmentsByStatus = async (doctor_id, status, date = null) => {
  const pool = await poolPromise;
  console.log(
    "getAppointmentsByStatus called with doctor_id:",
    doctor_id,
    "status:",
    status,
    "date:",
    date
  );

  try {
    const request = pool
      .request()
      .input("doctorId", parseInt(doctor_id, 10))
      .input("status", status);

    let dateFilter = "";
    if (date) {
      request.input("date", date);
      dateFilter = "AND CAST(a.bookingDate AS DATE) = @date";
    } else {
      // Mặc định lấy appointments hôm nay
      dateFilter = "AND CAST(a.bookingDate AS DATE) = CAST(GETDATE() AS DATE)";
    }

    const result = await request.query(`
        SELECT 
          a.appointment_id,
          p.patient_id,
          p.full_name,
          p.gender,
          DATEDIFF(YEAR, p.dob, GETDATE()) AS age,
          p.phone,
          a.status,
          ROW_NUMBER() OVER (ORDER BY a.created_at ASC) AS queue_number,
          a.created_at AS booking_time,
          a.bookingDate,
          sl.start_time,
          sl.end_time,
          r.room_name,
          r.room_type,
          s.name AS service_name
        FROM Appointments a
        JOIN Patients p ON a.patient_id = p.patient_id
        JOIN Slots sl ON a.slot_id = sl.slot_id
        JOIN Rooms r ON a.room_id = r.room_id
        LEFT JOIN Services s ON a.service_id = s.service_id
        WHERE a.doctor_id = @doctorId 
        AND a.status = @status
        ${dateFilter}
        ORDER BY a.created_at ASC
      `);

    console.log(
      "Query result:",
      result.recordset?.length || 0,
      "appointments found for date:",
      date || "today"
    );
    return result.recordset || [];
  } catch (error) {
    console.error("Error in getAppointmentsByStatus:", error);
    throw error;
  }
};

// (GET, lấy danh sách bác sĩ)
const getDoctors = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT 
        d.doctor_id,
        d.full_name,
        d.email,
        d.phone,
        d.image_url,
        d.degrees,
        d.experience_years,
        d.created_at,
        a.username
      FROM Doctors d INNER JOIN Accounts a ON d.account_id = a.account_id
      WHERE a.status = 'active'
      ORDER BY d.experience_years DESC, d.created_at DESC
    `);
  // Format dữ liệu cho front :V
  const formatted = result.recordset.map((doctor) => ({
    id: doctor.doctor_id,
    name: doctor.full_name,
    email: doctor.email,
    phone: doctor.phone,
    avatar: doctor.image_url,
    degrees: doctor.degrees,
    experience: doctor.experience_years,
    joinedAt: new Date(doctor.created_at).toLocaleDateString("vi-VN"), // hoặc dùng thư viện dayjs nếu muốn
    username: doctor.username,
  }));
  return formatted;
};

// (GET, lấy danh sách bác sĩ theo ngày có WorkingShifts)
const getDoctorsByDate = async (date) => {
  const pool = await poolPromise;

  // Sử dụng approach khác để tránh lỗi với TEXT column
  const result = await pool.request().input("date", date).query(`
      SELECT 
        d.doctor_id,
        d.full_name,
        d.email, 
        d.phone,
        d.image_url,
        d.degrees,
        d.experience_years,
        d.created_at,
        a.username
      FROM Doctors d 
      INNER JOIN Accounts a ON d.account_id = a.account_id
      WHERE a.status = 'active'
        AND d.doctor_id IN (
          SELECT DISTINCT ws.doctor_id 
          FROM WorkingShifts ws 
          WHERE ws.shift_date = @date AND ws.status = 'approved'
        )
      ORDER BY d.experience_years DESC, d.created_at DESC
    `);

  // Format dữ liệu cho front
  const formatted = result.recordset.map((doctor) => ({
    id: doctor.doctor_id,
    name: doctor.full_name,
    email: doctor.email,
    phone: doctor.phone,
    avatar: doctor.image_url,
    degrees: doctor.degrees,
    experience: doctor.experience_years,
    joinedAt: new Date(doctor.created_at).toLocaleDateString("vi-VN"),
    username: doctor.username,
  }));
  return formatted;
};

// Lưu dữ liệu khám bệnh vào database
const saveExamData = async (examData) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    const {
      appointment_id,
      diagnosis,
      treatment_plan,
      note,
      reExamDate,
      vitals,
      weight,
      height,
      clinical_signs,
    } = examData;

    console.log("saveExamData - Input data:", examData);

    // 1. Kiểm tra và lưu vào ClinicalExams (update nếu đã có, insert nếu chưa có)
    const existingExamResult = await transaction
      .request()
      .input("appointment_id", appointment_id)
      .query(
        `SELECT exam_id FROM ClinicalExams WHERE appointment_id = @appointment_id`
      );

    let examId;
    if (existingExamResult.recordset.length > 0) {
      // Update existing record
      examId = existingExamResult.recordset[0].exam_id;
      await transaction
        .request()
        .input("appointment_id", appointment_id)
        .input("vitals", vitals || null)
        .input("weight", weight || null)
        .input("height", height || null)
        .input(
          "bmi",
          weight && height
            ? (weight / Math.pow(height / 100, 2)).toFixed(2)
            : null
        )
        .input("clinical_signs", clinical_signs || null)
        .input("diagnosis_primary", diagnosis).query(`
          UPDATE ClinicalExams SET
            vitals = @vitals,
            weight = @weight,
            height = @height,
            bmi = @bmi,
            clinical_signs = @clinical_signs,
            diagnosis_primary = @diagnosis_primary
          WHERE appointment_id = @appointment_id
        `);
      console.log("Updated existing ClinicalExam with ID:", examId);
    } else {
      // Insert new record
      const clinicalExamResult = await transaction
        .request()
        .input("appointment_id", appointment_id)
        .input("vitals", vitals || null)
        .input("weight", weight || null)
        .input("height", height || null)
        .input(
          "bmi",
          weight && height
            ? (weight / Math.pow(height / 100, 2)).toFixed(2)
            : null
        )
        .input("clinical_signs", clinical_signs || null)
        .input("diagnosis_primary", diagnosis).query(`
          INSERT INTO ClinicalExams 
          (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary)
          OUTPUT INSERTED.exam_id
          VALUES (@appointment_id, @vitals, @weight, @height, @bmi, @clinical_signs, @diagnosis_primary)
        `);
      examId = clinicalExamResult.recordset[0].exam_id;
      console.log("Inserted new ClinicalExam with ID:", examId);
    }

    // 2. Kiểm tra và lưu vào Prescriptions (update nếu đã có, insert nếu chưa có)
    const existingPrescriptionResult = await transaction
      .request()
      .input("appointment_id", appointment_id)
      .query(
        `SELECT prescription_id FROM Prescriptions WHERE appointment_id = @appointment_id`
      );

    let prescriptionId;
    if (existingPrescriptionResult.recordset.length > 0) {
      // Update existing record
      prescriptionId = existingPrescriptionResult.recordset[0].prescription_id;
      await transaction
        .request()
        .input("appointment_id", appointment_id)
        .input("doctor_notes", note || null)
        .input("follow_up_plan", treatment_plan || null)
        .input(
          "counseling_notes",
          reExamDate ? `Tái khám ngày: ${reExamDate}` : null
        ).query(`
          UPDATE Prescriptions SET
            doctor_notes = @doctor_notes,
            follow_up_plan = @follow_up_plan,
            counseling_notes = @counseling_notes
          WHERE appointment_id = @appointment_id
        `);
      console.log("Updated existing Prescription with ID:", prescriptionId);
    } else {
      // Insert new record
      const prescriptionResult = await transaction
        .request()
        .input("appointment_id", appointment_id)
        .input("doctor_notes", note || null)
        .input("follow_up_plan", treatment_plan || null)
        .input(
          "counseling_notes",
          reExamDate ? `Tái khám ngày: ${reExamDate}` : null
        ).query(`
          INSERT INTO Prescriptions 
          (appointment_id, doctor_notes, follow_up_plan, counseling_notes)
          OUTPUT INSERTED.prescription_id
          VALUES (@appointment_id, @doctor_notes, @follow_up_plan, @counseling_notes)
        `);
      prescriptionId = prescriptionResult.recordset[0].prescription_id;
      console.log("Inserted new Prescription with ID:", prescriptionId);
    }

    await transaction.commit();

    return {
      exam_id: examId,
      prescription_id: prescriptionId,
      message: "Lưu dữ liệu khám bệnh thành công",
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in saveExamData:", error);
    throw error;
  }
};

module.exports = {
  getDoctors,
  getDoctorsByDate,
  getAppointmentsByStatus,
  getExamHistory,
  getCurrentExam,
  saveExamData,
};
