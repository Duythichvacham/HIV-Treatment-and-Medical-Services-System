const { poolPromise } = require("../config/db");

//
const getCurrentExam = async (patientId) => {
  const pool = await poolPromise;
  const result = await pool.request().input("patient_id", patientId).query(`
    
    SELECT 
    p.full_name AS ho_ten,
    'HIV' + RIGHT('000' + CAST(p.patient_id AS VARCHAR), 3) AS ma_bn,
    DATEDIFF(YEAR, p.dob, GETDATE()) AS tuoi,
    p.gender,
	s.start_time AS gio_hen
INTO #PatientInfo
FROM Patients p
JOIN Appointments a ON p.patient_id = a.patient_id
JOIN Slots s ON a.slot_id = s.slot_id
WHERE p.patient_id = @patient_id
ORDER BY a.created_at DESC;

-- Lấy thông tin điều trị ARV hiện tại
SELECT TOP 1
    ar.name AS phac_do,
    a.created_at AS ngay_bat_dau,
    mh.arv_adherence AS tuan_thu,
    mh.arv_side_effects AS tac_dung_phu
INTO #ARVInfo
FROM Prescriptions pr
JOIN Appointments a ON pr.appointment_id = a.appointment_id
JOIN Patients p ON a.patient_id = p.patient_id
LEFT JOIN ARVRegimens ar ON pr.arv_regimen_id = ar.arv_regimen_id
LEFT JOIN MedicalHistory mh ON p.patient_id = mh.patient_id
WHERE p.patient_id = @patient_id
ORDER BY a.created_at DESC;

-- Lấy kết quả xét nghiệm gần nhất
SELECT TOP 1
    tr.test_note_id,
    tn.test_datetime,
    tr.result_value,
    tr.notes,
    tt.name AS test_type
INTO #LatestTests
FROM TestResults tr
JOIN TestNotes tn ON tr.test_note_id = tn.test_note_id
JOIN Appointments a ON tn.appointment_id = a.appointment_id
JOIN TestRequests r ON tn.request_id = r.request_id
JOIN Services s ON s.request_id = r.request_id AND s.test_type_id IS NOT NULL
JOIN TestTypes tt ON s.test_type_id = tt.test_type_id
WHERE a.patient_id = @patient_id
ORDER BY tn.test_datetime DESC;

-- Pivot kết quả xét nghiệm (viral load, CD4, sàng lọc, khẳng định)
SELECT 
    MAX(CASE WHEN tt.name = N'Tải lượng virus' THEN result_value + ' ' + ISNULL(tr.unit, '') END) AS viral_load,
    MAX(CASE WHEN tt.name = 'CD4' THEN result_value + ' ' + ISNULL(tr.unit, '') END) AS cd4,
    MAX(CASE WHEN tt.name = N'Sàng lọc' THEN tr.notes END) AS sang_loc,
    MAX(CASE WHEN tt.name = N'Khẳng định' THEN tr.notes END) AS khang_dinh
INTO #XetNghiemGanNhat
FROM TestResults tr
JOIN TestNotes tn ON tr.test_note_id = tn.test_note_id
JOIN Appointments a ON tn.appointment_id = a.appointment_id
JOIN TestRequests r ON tn.request_id = r.request_id
JOIN Services s ON s.request_id = r.request_id AND s.test_type_id IS NOT NULL
JOIN TestTypes tt ON s.test_type_id = tt.test_type_id
WHERE a.patient_id = @patient_id
GROUP BY tn.test_datetime
ORDER BY tn.test_datetime DESC;

-- Hiển thị tổng hợp tất cả
SELECT 
    pi.ho_ten,
    pi.ma_bn,
    pi.tuoi,
    pi.gender,
    pi.gio_hen,
    ai.phac_do,
    FORMAT(ai.ngay_bat_dau, 'yyyy-MM-dd') AS ngay_bat_dau,
    ai.tuan_thu,
    ai.tac_dung_phu,
    xn.viral_load,
    xn.cd4,
    xn.sang_loc,
    xn.khang_dinh
FROM #PatientInfo pi
JOIN #ARVInfo ai ON 1 = 1
JOIN #XetNghiemGanNhat xn ON 1 = 1;

-- Cleanup
DROP TABLE #PatientInfo;
DROP TABLE #ARVInfo;
DROP TABLE #LatestTests;
DROP TABLE #XetNghiemGanNhat;`);
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

//Get: lấy danh sách bệnh nhân queued/in_progress/finished cho bác sĩ
const getAppointmentsByStatus = async (doctor_id, status) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("doctorId", parseInt(doctor_id, 10))
    .input("status", status).query(`
      SELECT 
        a.appointment_id,
        p.patient_id,
        p.full_name,
        p.gender,
        DATEDIFF(YEAR, p.dob, GETDATE()) AS age,
        p.phone,
        a.status,
        a.queue_number,
        a.created_at AS booking_time,
        sl.start_time,
        sl.end_time,
        r.room_name,
        r.room_type,
        ar.name AS arv_regimen,
        mh.arv_adherence,
        -- CD4 result
        (
          SELECT TOP 1 tr.result_value
          FROM TestNotes tn
          JOIN TestResults tr ON tn.test_note_id = tr.test_note_id
          JOIN Services sv2 ON tn.appointment_id = sv2.appointment_id
          JOIN TestTypes tt ON sv2.test_type_id = tt.test_type_id
          WHERE tn.appointment_id = a.appointment_id AND tt.name = N'CD4'
          ORDER BY tn.test_datetime DESC
        ) AS cd4,
        -- Viral Load result
        (
          SELECT TOP 1 tr.result_value
          FROM TestNotes tn
          JOIN TestResults tr ON tn.test_note_id = tr.test_note_id
          JOIN Services sv2 ON tn.appointment_id = sv2.appointment_id
          JOIN TestTypes tt ON sv2.test_type_id = tt.test_type_id
          WHERE tn.appointment_id = a.appointment_id AND tt.name = N'Tải lượng virus'
          ORDER BY tn.test_datetime DESC
        ) AS viral_load
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Doctors d ON d.doctor_id = a.doctor_id
      JOIN Rooms r ON a.room_id = r.room_id
      JOIN Slots sl ON a.slot_id = sl.slot_id
      LEFT JOIN Prescriptions pr ON pr.appointment_id = a.appointment_id
      LEFT JOIN ARVRegimens ar ON pr.arv_regimen_id = ar.arv_regimen_id
      LEFT JOIN MedicalHistory mh ON mh.patient_id = p.patient_id
      WHERE a.status = @status
        AND d.doctor_id = @doctorId
      ORDER BY sl.start_time ASC, a.queue_number ASC
    `);
  return result.recordset;
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
//------------------------------------------------------------------
// Lấy danh sách bệnh nhân đang xét nghiệm (status = 'in_progress')
const getListWait = async () => {
  const pool = await poolPromise;
  const result = await pool.request()   
    .query(`
SELECT TOP (1000) [service_id]
      ,[request_id]
      ,[appointment_id]
      ,[name]
      ,[service_type]
      ,[description]
      ,[price]
      ,[test_type_id]
      ,[is_active]
  FROM [HIV_HEATH_CARE].[dbo].[Services]
  WHERE [service_type] like 'examination' or [service_type] like 'consultation'

    `);
  return result.recordset;
};

const getListInprogress = async () => {
  const pool = await poolPromise;
  const result = await pool.request()   
    .query(`
 SELECT 
    a.appointment_id,
    a.patient_id,
    p.full_name AS patient_name,
    a.doctor_id,
    d.full_name AS doctor_name,
    a.status,
    a.created_at
FROM Appointments a
JOIN Patients p ON a.patient_id = p.patient_id
JOIN Doctors d ON a.doctor_id = d.doctor_id
WHERE a.status = 'in_progress';

    `);
  return result.recordset;
};


const getListFinish= async () => {
  const pool = await poolPromise;
  const result = await pool.request()   
    .query(`
 SELECT 
    a.appointment_id,
    a.patient_id,
    p.full_name AS patient_name,
    a.doctor_id,
    d.full_name AS doctor_name,
    a.status,
    a.created_at
FROM Appointments a
JOIN Patients p ON a.patient_id = p.patient_id
JOIN Doctors d ON a.doctor_id = d.doctor_id
WHERE a.status = 'completed'
  AND a.doctor_id IS NOT NULL;


    `);
  return result.recordset;
};




const createPrescription = async ( {
  appointment_id,
  arv_regimen_id,
  support_drugs,
  counseling_notes,
  follow_up_plan,
  doctor_notes
} ) => {
 

  const pool = await poolPromise;
  const result = await pool.request()
    .input('appointment_id' ,  appointment_id)
    .input('arv_regimen_id',  arv_regimen_id)
    .input('support_drugs', support_drugs )
    .input('counseling_notes',  counseling_notes )
    .input('follow_up_plan', follow_up_plan)
    .input('doctor_notes',  doctor_notes )
    .query(`
      INSERT INTO Prescriptions (
        appointment_id, arv_regimen_id, support_drugs,
        counseling_notes, follow_up_plan, doctor_notes
      )
      OUTPUT INSERTED.*
      VALUES (
        @appointment_id, @arv_regimen_id, @support_drugs,
        @counseling_notes, @follow_up_plan, @doctor_notes
      );
    `);

  return result.recordset[0]; // đơn thuốc vừa tạo
};




//module.exports = { getDoctors, getDoctorsByDate };

module.exports = {
 
  createPrescription,
  
  getDoctors,
  getDoctorsByDate,
  getAppointmentsByStatus,
  getExamHistory,
  getCurrentExam,

};

