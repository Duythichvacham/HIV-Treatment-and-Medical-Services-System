const { poolPromise } = require("../config/db");

//Get: lấy danh sách bệnh nhân queued/in_progress/finished cho bác sĩ
const getAppointmentsByStatus = async (doctor_id, status) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("doctorId", doctor_id)
    .input("status", status).query(`
      SELECT 
        p.full_name, p.gender, p.phone, 
        a.status, a.queue_number, 
        sv.name, sv.service_type, sv.description AS service_description, sv.price,
        tt.name AS name_test_type, 
        r.room_name, r.room_type, 
        sl.start_time, sl.end_time
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Services sv ON sv.appointment_id = a.appointment_id
      JOIN Doctors d ON d.doctor_id = a.doctor_id
      JOIN Rooms r ON a.room_id = r.room_id
      JOIN Slots sl ON sl.slot_id = a.slot_id
      LEFT JOIN TestTypes tt ON tt.test_type_id = sv.test_type_id
      WHERE sv.service_type IN ('examination', 'consultation')
        AND a.status = @status
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

module.exports = { getDoctors, getDoctorsByDate, getAppointmentsByStatus };
