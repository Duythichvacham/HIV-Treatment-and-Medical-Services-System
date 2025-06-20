const { poolPromise } = require("../config/db");

//GET
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

module.exports = {
  getDoctors,
  getDoctorsByDate,
  getAppointmentsByStatus,
  getExamHistory,
};
