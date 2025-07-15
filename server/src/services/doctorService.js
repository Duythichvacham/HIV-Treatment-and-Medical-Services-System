const { poolPromise } = require("../config/db");

const getDoctorProfile = async (doctorId) => {
  const pool = await poolPromise;
  try {
    const result = await pool
      .request()
      .query(`select * from Doctors where doctor_id = ${doctorId}`);
    return result.recordset;
  } catch (error) {
    console.error("[doctorService.getTestTypes] Error:", error);
    throw error;
  }
};

const updateDoctorProfile = async (doctorId, updateData) => {
  const pool = await poolPromise;
  try {
    const result = await pool
      .request()
      .input("doctor_id", doctorId)
      .input("full_name", updateData.full_name)
      .input("email", updateData.email)
      .input("phone", updateData.phone)
      .input("image_url", updateData.image_url)
      .input("degrees", updateData.degrees)
      .input("experience_years", updateData.experience_years).query(`
        UPDATE Doctors
        SET
          full_name = @full_name,
          email = @email,
          phone = @phone,
          image_url = @image_url,
          degrees = @degrees,
          experience_years = @experience_years
        WHERE doctor_id = @doctor_id
      `);
    if (result.rowsAffected[0] === 0) {
      return null; // Không tìm thấy bác sĩ để cập nhật
    }
    // Trả về thông tin bác sĩ đã cập nhật
    return {
      doctor_id: doctorId,
      ...updateData,
    };
  } catch (error) {
    console.error("[doctorService.updateDoctorProfile] Error:", error);
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

const getTestTypes = async () => {
  const pool = await poolPromise;

  try {
    console.log("[doctorService.getTestTypes] Getting all test types");

    const result = await pool.request().query(`
      SELECT 
        s.service_id,
        s.name,
        s.service_type,
        s.description,
        s.price,
        s.is_active
      FROM Services s 
      WHERE s.service_type = 'test' 
        AND s.is_active = 1
      ORDER BY s.name
    `);

    console.log(
      "[doctorService.getTestTypes] Found test types:",
      result.recordset.length
    );
    return result.recordset;
  } catch (error) {
    console.error("[doctorService.getTestTypes] Error:", error);
    throw error;
  }
};
const createIndependentTestRequest = async (requestData) => {
  const pool = await poolPromise;
  const transaction = await pool.transaction();

  try {
    const { doctor_id, appointment_id, service_id, notes } = requestData;

    await transaction.begin();

    // 1. Tạo TestRequest chính
    const requestInsert = await transaction
      .request()
      .input("doctor_id", parseInt(doctor_id, 10))
      .input("appointment_id", parseInt(appointment_id, 10))
      .input("request_date", new Date())
      .input("status", "requested").query(`
        INSERT INTO TestRequests (doctor_id, appointment_id, request_date, status)
        OUTPUT INSERTED.request_id
        VALUES (@doctor_id, @appointment_id, @request_date, @status)
      `);

    const request_id = requestInsert.recordset[0].request_id;

    // 2. Handle service_id as either single value or array
    const serviceIds = Array.isArray(service_id) ? service_id : [service_id];

    // Insert vào TestRequestDetails
    for (const sid of serviceIds) {
      await transaction
        .request()
        .input("request_id", request_id)
        .input("service_id", parseInt(sid, 10))
        .input("notes", String(notes?.[sid.toString()] || ""))
        .input("created_at", new Date()).query(`
          INSERT INTO TestRequestDetails (request_id, service_id, notes, created_at)
          VALUES (@request_id, @service_id, @notes, @created_at)
        `);
    }

    await transaction.commit();

    return {
      request_id,
      service_ids: serviceIds,
      message: "Test request created successfully",
    };
  } catch (error) {
    await transaction.rollback();
    console.error("[doctorService.createIndependentTestRequest] Error:", error);
    throw error;
  }
};
const getCurrentTestRequest = async (appointment_id) => {
  const pool = await poolPromise;
  try {
    const request = pool.request();
    let query = `
      SELECT 
    tr.request_id,
    tr.appointment_id,
    tr.doctor_id,
    FORMAT(tr.request_date, 'yyyy-MM-dd HH:mm') as request_date,
    tr.status,
    trd.service_id,
    s.name,
    trd.notes,
    FORMAT(trd.created_at, 'yyyy-MM-dd HH:mm') as detail_created_at
FROM TestRequests tr
JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
JOIN Services s ON trd.service_id = s.service_id
WHERE tr.request_id = (
    SELECT TOP 1 request_id
    FROM TestRequests
    WHERE appointment_id = @appointment_id
    ORDER BY request_date DESC
)

    `;
    request.input("appointment_id", parseInt(appointment_id, 10));
    const result = await request.query(query);
    return result.recordset || [];
  } catch (error) {
    console.error("[getCurrentTestRequest] Error:", error);
    throw error;
  }
};

const getClinicalExamData = async (appointmentId) => {
  const pool = await poolPromise;
  try {
    const request = pool.request();
    request.input("appointmentId", parseInt(appointmentId, 10));
    const query = `
      SELECT 
        exam_id,
        appointment_id,

        -- Huyết áp: giữ nguyên
        LTRIM(RTRIM(
          SUBSTRING(vitals,
            CHARINDEX(N'Huyết áp:', vitals) + LEN(N'Huyết áp:'),
            CHARINDEX(',', vitals) - CHARINDEX(N'Huyết áp:', vitals) - LEN(N'Huyết áp:')))) AS huyet_ap,

        -- Mạch: lấy số trước dấu "/"
        LTRIM(RTRIM(
          SUBSTRING(
            SUBSTRING(vitals, CHARINDEX(N'Mạch:', vitals) + LEN(N'Mạch:'), 20),
            0,
            CHARINDEX('/', SUBSTRING(vitals, CHARINDEX(N'Mạch:', vitals) + LEN(N'Mạch:'), 20))
          )
        )) AS mach,

        -- Nhiệt độ: lấy số trước "°"
        LTRIM(RTRIM(
          SUBSTRING(
            SUBSTRING(vitals, CHARINDEX(N'Nhiệt độ:', vitals) + LEN(N'Nhiệt độ:'), 20),
            0,
            CHARINDEX(N'°', SUBSTRING(vitals, CHARINDEX(N'Nhiệt độ:', vitals) + LEN(N'Nhiệt độ:'), 20))
          )
        )) AS nhiet_do,

        weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary

      FROM ClinicalExams
      WHERE vitals LIKE N'%Huyết áp:%' AND vitals LIKE N'%Mạch:%' AND vitals LIKE N'%Nhiệt độ:%'

      AND appointment_id = @appointmentId
    `;
    const result = await request.query(query);
    return result.recordset[0] || null;
  } catch (error) {
    console.error("[getClinicalExamData] Error:", error);
    throw error;
  }
};

const getPrescriptionExamData = async (appointmentId) => {
  const pool = await poolPromise;
  try {
    const request = pool.request();
    request.input("appointmentId", parseInt(appointmentId, 10));
    const query = `
      select 
      p.prescription_id, 
      p.appointment_id,
      a.name as regimens_name, 
      a.for_group, 
      p.support_drugs,
      p.counseling_notes,
      p.follow_up_plan, 
      p.doctor_notes, 
      
      a.components 
    from Prescriptions p
    join ARVRegimens a on p.arv_regimen_id = a.arv_regimen_id
    where p.appointment_id = @appointmentId
    `;
    const result = await request.query(query);
    return result.recordset[0] || null;
  } catch (error) {
    console.error("[getPrescriptionExamData] Error:", error);
    throw error;
  }
};

const getPrescriptionDetail = async (prescriptionId) => {
  const pool = await poolPromise;
  try {
    const request = pool.request();
    request.input("prescriptionId", parseInt(prescriptionId, 10));
    const query = `
      select * from PrescriptionDetails 
      where prescription_id = @prescriptionId
    `;
    const result = await request.query(query);
    return result.recordset || [];
  } catch (error) {
    console.error("[getPrescriptionDetail] Error:", error);
    throw error;
  }
};

module.exports = {
  getDoctors,
  getDoctorsByDate,
  getClinicalExamData,
  getTestTypes, // Add missing function
  createIndependentTestRequest,
  getCurrentTestRequest,
  getPrescriptionExamData,
  getPrescriptionDetail,
  getDoctorProfile,
  updateDoctorProfile,
};
