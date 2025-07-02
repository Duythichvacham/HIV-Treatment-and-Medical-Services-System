const { poolPromise } = require("../config/db");

//
const getCurrentExam = async (patientId, appointmentId = null) => {
  const pool = await poolPromise;

  try {
    console.log(
      `Getting current exam for patient: ${patientId}, appointment: ${appointmentId}`
    );

    // Query đơn giản chỉ lấy thông tin cơ bản của bệnh nhân và appointment
    let query = `
      SELECT 
        p.patient_id,
        p.full_name,
        'HIV' + RIGHT('000' + CAST(p.patient_id AS VARCHAR), 3) AS ma_bn,
        DATEDIFF(YEAR, p.dob, GETDATE()) AS age,
        p.gender,
        p.phone,
        p.address,
        p.address,
        p.dob,
        a.appointment_id,
        ROW_NUMBER() OVER (ORDER BY a.created_at ASC) AS queue_number,
        a.status,
        FORMAT(s.start_time, 'HH:mm') AS slot_time,
        FORMAT(s.start_time, 'HH:mm') + ' - ' + FORMAT(s.end_time, 'HH:mm') AS full_slot_time
      FROM Patients p
      JOIN Appointments a ON p.patient_id = a.patient_id
      JOIN Slots s ON a.slot_id = s.slot_id
      WHERE p.patient_id = @patient_id
        AND a.status IN ('requested', 'in_progress')
    `;

    const request = pool.request().input("patient_id", patientId);

    if (appointmentId) {
      query += ` AND a.appointment_id = @appointment_id`;
      request.input("appointment_id", appointmentId);
    }

    query += ` ORDER BY a.created_at DESC`;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      throw new Error(
        `Không tìm thấy thông tin bệnh nhân hoặc appointment không hợp lệ`
      );
    }

    const patientData = result.recordset[0];
    console.log(`Found patient data:`, patientData);

    // Nếu có appointmentId, lấy thêm dữ liệu khám tạm đã lưu trước đó
    let examData = null;
    if (appointmentId) {
      try {
        console.log(
          `Fetching temp exam data for appointment: ${appointmentId}`
        );

        const examResult = await pool
          .request()
          .input("appointment_id", appointmentId).query(`
            SELECT 
              ce.exam_id,
              ce.vitals,
              ce.weight,
              ce.height,
              ce.bmi,
              ce.clinical_signs,
              ce.diagnosis_primary,
              ce.diagnosis_secondary,
              pr.prescription_id,
              pr.doctor_notes,
              pr.follow_up_plan,
              pr.counseling_notes,
              pr.arv_regimen_id,
              ar.name AS arv_regimen_name,
              ar.components AS arv_components
            FROM Appointments a
            LEFT JOIN ClinicalExams ce ON a.appointment_id = ce.appointment_id
            LEFT JOIN Prescriptions pr ON a.appointment_id = pr.appointment_id
            LEFT JOIN ARVRegimens ar ON pr.arv_regimen_id = ar.arv_regimen_id
            WHERE a.appointment_id = @appointment_id
          `);

        if (examResult.recordset.length > 0) {
          examData = examResult.recordset[0];
          console.log("Found exam data:", examData);

          // Lấy chi tiết đơn thuốc nếu có
          if (examData.prescription_id) {
            const detailsResult = await pool
              .request()
              .input("prescription_id", examData.prescription_id).query(`
                SELECT 
                  pd.prescription_detail_id,
                  pd.drug_name,
                  pd.dosage,
                  pd.frequency,
                  pd.duration_days,
                  pd.usage_instructions,
                  pd.notes
                FROM PrescriptionDetails pd
                WHERE pd.prescription_id = @prescription_id
              `);

            examData.prescription_details = detailsResult.recordset || [];
          }
        }
      } catch (error) {
        console.error("Error fetching temp exam data:", error);
      }
    }

    // Kết hợp dữ liệu
    const result_data = {
      patient: patientData,
      exam_data: examData,
      appointment: {
        appointment_id: patientData.appointment_id,
        queue_number: patientData.queue_number,
        status: patientData.status,
        slot_time: patientData.slot_time,
        full_slot_time: patientData.full_slot_time,
      },
    };

    console.log("Final getCurrentExam result:", result_data);
    return result_data;
  } catch (error) {
    console.error(`Error in getCurrentExam:`, error);
    throw error;
  }
};
//

const getExamDataByAppointmentId = async (appointment_id) => {
  const pool = await poolPromise;

  // 1. ClinicalExams
  const clinicalResult = await pool
    .request()
    .input("appointment_id", appointment_id)
    .query(
      `SELECT * FROM ClinicalExams WHERE appointment_id = @appointment_id`
    );
  const clinicalExam = clinicalResult.recordset[0] || null;

  // 2. Prescriptions
  const prescriptionResult = await pool
    .request()
    .input("appointment_id", appointment_id)
    .query(
      `SELECT * FROM Prescriptions WHERE appointment_id = @appointment_id`
    );
  const prescription = prescriptionResult.recordset[0] || null;

  // 3. PrescriptionDetails
  let prescriptionDetails = [];
  if (prescription) {
    const detailResult = await pool
      .request()
      .input("prescription_id", prescription.prescription_id)
      .query(
        `SELECT * FROM PrescriptionDetails WHERE prescription_id = @prescription_id`
      );
    prescriptionDetails = detailResult.recordset;
  }

  return {
    appointment_id,
    clinical_exam: clinicalExam,
    prescription: prescription,
    prescription_details: prescriptionDetails,
  };
};

//GET lịch sử khám bệnh của bệnh nhân (danh sách tổng quan)
const getExamHistory = async (patientId) => {
  const pool = await poolPromise;

  try {
    const result = await pool.request().input("patient_id", patientId).query(`
      SELECT 
        a.appointment_id,
        FORMAT(a.bookingDate, 'dd/MM/yyyy') AS ngay_kham,
        FORMAT(a.bookingDate, 'yyyy-MM-dd') AS ngay_kham_iso,
        d.full_name AS bac_si,
        'HIV/AIDS' AS chuyen_khoa,
        ce.diagnosis_primary AS chan_doan_chinh,
        ce.diagnosis_secondary AS chan_doan_phu,
        -- Trạng thái khám
        CASE 
          WHEN a.status = 'completed' THEN N'Đã hoàn thành'
          WHEN a.status = 'in_progress' THEN N'Đang khám'
          WHEN a.status = 'requested' THEN N'Chờ khám'
          ELSE N'Đã hủy'
        END AS trang_thai,
        -- Loại khám dựa trên chẩn đoán hoặc service
        CASE 
          WHEN s.name LIKE N'%định kỳ%' THEN N'Khám định kỳ'
          WHEN s.name LIKE N'%theo dõi%' THEN N'Khám theo dõi'
          WHEN s.name LIKE N'%tư vấn%' THEN N'Tư vấn'
          WHEN ce.diagnosis_primary IS NULL THEN N'Chưa khám'
          ELSE N'Tái khám'
        END AS loai_kham,
        -- Kế hoạch điều trị
        CASE 
          WHEN ar.name IS NOT NULL THEN N'Thay đổi phác đồ: ' + ar.name
          WHEN pr.arv_regimen_id IS NULL THEN N'Tiếp tục phác đồ hiện tại'
          ELSE N'Duy trì điều trị'
        END AS ke_hoach_dieu_tri,
        -- Có đơn thuốc hỗ trợ không
        CASE 
          WHEN pr.support_drugs IS NOT NULL AND pr.support_drugs != '' THEN N'Có'
          ELSE N'Không'
        END AS co_thuoc_ho_tro,
        -- Số loại thuốc được kê
        ISNULL(pd_count.so_loai_thuoc, 0) AS so_loai_thuoc,
        -- Ghi chú ngắn gọn
        CASE 
          WHEN LEN(pr.doctor_notes) > 50 THEN LEFT(pr.doctor_notes, 50) + '...'
          ELSE ISNULL(pr.doctor_notes, '')
        END AS ghi_chu_ngan,
        a.created_at
      FROM Appointments a
      JOIN Doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN ClinicalExams ce ON ce.appointment_id = a.appointment_id
      LEFT JOIN Prescriptions pr ON pr.appointment_id = a.appointment_id
      LEFT JOIN ARVRegimens ar ON pr.arv_regimen_id = ar.arv_regimen_id
      LEFT JOIN Services s ON a.service_id = s.service_id
      LEFT JOIN (
        SELECT prescription_id, COUNT(*) as so_loai_thuoc
        FROM PrescriptionDetails
        GROUP BY prescription_id
      ) pd_count ON pr.prescription_id = pd_count.prescription_id
      WHERE a.patient_id = @patient_id
        AND a.status = 'completed' -- Chỉ lấy các lần khám đã hoàn thành
        AND (s.service_type = 'examination' OR s.service_type IS NULL) -- Lấy cả service khám bệnh và những record không có service
      ORDER BY a.bookingDate DESC, a.created_at DESC;
    `);

    return result.recordset;
  } catch (error) {
    console.error("Error in getExamHistory:", error);
    throw error;
  }
};

//GET lịch sử khám bệnh cơ bản cho danh sách (chỉ thông tin cần thiết)
const getExamHistoryBasic = async (patientId) => {
  const pool = await poolPromise;

  try {
    console.log(`Getting basic exam history for patient: ${patientId}`);

    // Query đơn giản nhất
    const result = await pool.request().input("patient_id", patientId).query(`
      SELECT 
        a.appointment_id,
        a.bookingDate,
        a.status,
        d.full_name AS bac_si,
        ISNULL(ce.diagnosis_primary, 'Chưa có chẩn đoán') AS chan_doan_chinh
      FROM Appointments a
      INNER JOIN Doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN ClinicalExams ce ON ce.appointment_id = a.appointment_id
      WHERE a.patient_id = @patient_id
        AND a.status = 'completed' -- Chỉ lấy các lần khám đã hoàn thành
      ORDER BY a.bookingDate DESC;
    `);

    console.log(`Found ${result.recordset.length} exam history records`);

    // Format lại dữ liệu cho frontend
    const formattedData = result.recordset.map((row) => ({
      appointment_id: row.appointment_id,
      ngay_kham: new Date(row.bookingDate).toLocaleDateString("vi-VN"),
      gio_kham: "08:00 - 09:00",
      bac_si: row.bac_si,
      chuyen_khoa: "HIV/AIDS",
      chan_doan_chinh: row.chan_doan_chinh,
      ten_phac_do: "Chưa có phác đồ",
      trang_thai:
        row.status === "completed"
          ? "Đã hoàn thành"
          : row.status === "in_progress"
          ? "Đang khám"
          : "Chờ khám",
      loai_kham: "Tái khám",
      bookingDate: row.bookingDate,
      created_at: row.bookingDate,
    }));

    return formattedData;
  } catch (error) {
    console.error("Error in getExamHistoryBasic:", error);
    throw error;
  }
};

//GET chi tiết một lần khám cụ thể
const getExamDetail = async (patientId, appointmentId) => {
  const pool = await poolPromise;

  try {
    console.log(
      `[getExamDetail] Starting for patient ${patientId}, appointment ${appointmentId}`
    );

    // Test query đơn giản nhất trước
    const basicInfoResult = await pool
      .request()
      .input("patient_id", patientId)
      .input("appointment_id", appointmentId).query(`
        SELECT 
          a.appointment_id,
          FORMAT(a.bookingDate, 'dd/MM/yyyy') AS ngay_kham,
          '08:00 - 09:00' AS gio_kham,
          a.status AS trang_thai_hen,
          a.appointment_id AS so_thu_tu,
          d.full_name AS bac_si,
          'HIV/AIDS' AS chuyen_khoa,
          d.phone AS sdt_bac_si,
          ISNULL(s.name, 'Khám tổng quát') AS dich_vu,
          ISNULL(s.price, 0) AS gia_dich_vu,
          'Phòng khám 1' AS phong_kham,
          'Khám bệnh' AS loai_phong
        FROM Appointments a
        JOIN Doctors d ON a.doctor_id = d.doctor_id
        LEFT JOIN Services s ON a.service_id = s.service_id
        WHERE a.patient_id = @patient_id 
          AND a.appointment_id = @appointment_id
      `);

    if (basicInfoResult.recordset.length === 0) {
      return null;
    }

    const basicInfo = basicInfoResult.recordset[0];

    // 2. Lấy thông tin khám lâm sàng
    const clinicalResult = await pool
      .request()
      .input("appointment_id", appointmentId).query(`
        SELECT 
          ce.vitals AS sinh_hieu,
          ce.weight AS can_nang,
          ce.height AS chieu_cao,
          ce.bmi,
          ce.clinical_signs AS dau_hieu_lam_sang,
          ce.diagnosis_primary AS chan_doan_chinh,
          ce.diagnosis_secondary AS chan_doan_phu
        FROM ClinicalExams ce
        WHERE ce.appointment_id = @appointment_id
      `);

    // 3. Lấy thông tin đơn thuốc
    const prescriptionResult = await pool
      .request()
      .input("appointment_id", appointmentId).query(`
        SELECT 
          pr.prescription_id,
          pr.arv_regimen_id,
          ar.name AS ten_phac_do,
          ar.components AS thanh_phan_phac_do,
          ar.for_group AS doi_tuong_phac_do,
          pr.support_drugs AS thuoc_ho_tro,
          pr.counseling_notes AS loi_khuyen_tu_van,
          pr.follow_up_plan AS ke_hoach_tai_kham,
          pr.doctor_notes AS ghi_chu_bac_si
        FROM Prescriptions pr
        LEFT JOIN ARVRegimens ar ON pr.arv_regimen_id = ar.arv_regimen_id
        WHERE pr.appointment_id = @appointment_id
      `);

    // Tạm thời chỉ trả về thông tin cơ bản + clinical + prescription
    const examDetail = {
      thong_tin_co_ban: basicInfo,
      thong_tin_kham_lam_sang: clinicalResult.recordset[0] || null,
      thong_tin_don_thuoc: prescriptionResult.recordset[0] || null,
      chi_tiet_thuoc: { thuoc_arv: [], thuoc_ho_tro: [], tong_so_loai: 0 },
      ket_qua_xet_nghiem: [],
      tom_tat: {
        co_kham_lam_sang: clinicalResult.recordset.length > 0,
        co_don_thuoc: prescriptionResult.recordset.length > 0,
        co_thuoc_arv: false,
        co_thuoc_ho_tro: false,
        co_xet_nghiem: false,
      },
    };

    return examDetail;
  } catch (error) {
    console.error("Error in getExamDetail:", error);
    throw error;
  }
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
      doctor_id,
      patient_id,
      // ClinicalExams fields
      vitals,
      weight,
      height,
      bmi,
      clinical_signs,
      diagnosis_primary,
      diagnosis_secondary,

      // Prescriptions fields
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes,

      // PrescriptionDetails
      prescription_details,

      // Test requests
      test_requests,

      is_temporary,
      is_completed,
    } = examData;

    console.log("saveExamData - Input data:", examData);

    // Đảm bảo các giá trị text là chuỗi rỗng thay vì null nếu không có dữ liệu
    const sanitizedVitals = vitals || "";
    const sanitizedClinicalSigns = clinical_signs || "";
    const sanitizedDiagnosisPrimary = diagnosis_primary || "";
    const sanitizedDiagnosisSecondary = diagnosis_secondary || "";
    const sanitizedSupportDrugs = support_drugs || "";
    const sanitizedCounselingNotes = counseling_notes || "";
    const sanitizedFollowUpPlan = follow_up_plan || "";
    const sanitizedDoctorNotes = doctor_notes || "";

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
        .input("vitals", sanitizedVitals)
        .input("weight", weight !== undefined && weight !== null ? weight : 0)
        .input("height", height !== undefined && height !== null ? height : 0)
        .input("bmi", bmi !== undefined && bmi !== null ? bmi : 0)
        .input("clinical_signs", sanitizedClinicalSigns)
        .input("diagnosis_primary", sanitizedDiagnosisPrimary)
        .input("diagnosis_secondary", sanitizedDiagnosisSecondary).query(`
          UPDATE ClinicalExams SET
            vitals = @vitals,
            weight = @weight,
            height = @height,
            bmi = @bmi,
            clinical_signs = @clinical_signs,
            diagnosis_primary = @diagnosis_primary,
            diagnosis_secondary = @diagnosis_secondary
          WHERE appointment_id = @appointment_id
        `);
      console.log("Updated existing ClinicalExam with ID:", examId);
    } else {
      // Insert new record
      const clinicalExamResult = await transaction
        .request()
        .input("appointment_id", appointment_id)
        .input("vitals", sanitizedVitals)
        .input("weight", weight !== undefined && weight !== null ? weight : 0)
        .input("height", height !== undefined && height !== null ? height : 0)
        .input("bmi", bmi !== undefined && bmi !== null ? bmi : 0)
        .input("clinical_signs", sanitizedClinicalSigns)
        .input("diagnosis_primary", sanitizedDiagnosisPrimary)
        .input("diagnosis_secondary", sanitizedDiagnosisSecondary).query(`
          INSERT INTO ClinicalExams 
          (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary)
          OUTPUT INSERTED.exam_id
          VALUES (@appointment_id, @vitals, @weight, @height, @bmi, @clinical_signs, @diagnosis_primary, @diagnosis_secondary)
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
        .input("arv_regimen_id", arv_regimen_id || null)
        .input("support_drugs", sanitizedSupportDrugs)
        .input("counseling_notes", sanitizedCounselingNotes)
        .input("follow_up_plan", sanitizedFollowUpPlan)
        .input("doctor_notes", sanitizedDoctorNotes).query(`
          UPDATE Prescriptions SET
            arv_regimen_id = @arv_regimen_id,
            support_drugs = @support_drugs,
            counseling_notes = @counseling_notes,
            follow_up_plan = @follow_up_plan,
            doctor_notes = @doctor_notes
          WHERE appointment_id = @appointment_id
        `);
      console.log("Updated existing Prescription with ID:", prescriptionId);
    } else {
      // Insert new record
      const prescriptionResult = await transaction
        .request()
        .input("appointment_id", appointment_id)
        .input("arv_regimen_id", arv_regimen_id || null)
        .input("support_drugs", sanitizedSupportDrugs)
        .input("counseling_notes", sanitizedCounselingNotes)
        .input("follow_up_plan", sanitizedFollowUpPlan)
        .input("doctor_notes", sanitizedDoctorNotes).query(`
          INSERT INTO Prescriptions 
          (appointment_id, arv_regimen_id, support_drugs, counseling_notes, follow_up_plan, doctor_notes)
          OUTPUT INSERTED.prescription_id
          VALUES (@appointment_id, @arv_regimen_id, @support_drugs, @counseling_notes, @follow_up_plan, @doctor_notes)
        `);
      prescriptionId = prescriptionResult.recordset[0].prescription_id;
      console.log("Inserted new Prescription with ID:", prescriptionId);
    }

    // 3. Nếu có chi tiết đơn thuốc, lưu vào PrescriptionDetails
    if (
      prescription_details &&
      prescription_details.length > 0 &&
      prescriptionId
    ) {
      console.log("Saving prescription details:", prescription_details);

      // Xóa các chi tiết cũ nếu có
      await transaction
        .request()
        .input("prescription_id", prescriptionId)
        .query(
          `DELETE FROM PrescriptionDetails WHERE prescription_id = @prescription_id`
        );

      // Thêm chi tiết mới
      for (const detail of prescription_details) {
        await transaction
          .request()
          .input("prescription_id", prescriptionId)
          .input("drug_name", detail.drug_name || "")
          .input("dosage", detail.dosage || "")
          .input("frequency", detail.frequency || "")
          .input("duration_days", parseInt(detail.duration_days) || 30)
          .input("usage_instructions", detail.usage_instructions || "")
          .input("notes", detail.notes || "").query(`
            INSERT INTO PrescriptionDetails 
            (prescription_id, drug_name, dosage, frequency, duration_days, usage_instructions, notes)
            VALUES 
            (@prescription_id, @drug_name, @dosage, @frequency, @duration_days, @usage_instructions, @notes)
          `);
      }

      console.log(
        `Inserted ${prescription_details.length} prescription details`
      );
    }

    // 4. Xử lý test requests (chỉ khi hoàn thành khám và có test requests)
    let testRequestId = null;
    if (
      (is_completed || !is_temporary) &&
      test_requests &&
      test_requests.length > 0
    ) {
      console.log(
        `Creating test request with ${test_requests.length} services`
      );

      // Tạo TestRequest chính
      const insertTestRequestResult = await transaction
        .request()
        .input("doctor_id", doctor_id)
        .input("patient_id", patient_id)
        .input("appointment_id", appointment_id)
        .input("request_date", new Date())
        .input("status", "requested").query(`
          INSERT INTO TestRequests (doctor_id, patient_id, appointment_id, request_date, status)
          OUTPUT INSERTED.request_id
          VALUES (@doctor_id, @patient_id, @appointment_id, @request_date, @status)
        `);

      testRequestId = insertTestRequestResult.recordset[0].request_id;
      console.log("Created TestRequest with ID:", testRequestId);

      // Thêm chi tiết các services vào TestRequestDetails
      for (const serviceId of test_requests) {
        await transaction
          .request()
          .input("request_id", testRequestId)
          .input("service_id", serviceId)
          .input("notes", "Chỉ định từ bác sĩ").query(`
            INSERT INTO TestRequestDetails (request_id, service_id, notes)
            VALUES (@request_id, @service_id, @notes)
          `);
      }

      console.log(`Inserted ${test_requests.length} test request details`);
    }

    // 5. Cập nhật trạng thái cuộc hẹn
    const finalStatus =
      is_completed || !is_temporary ? "completed" : "in_progress";

    await transaction
      .request()
      .input("appointment_id", appointment_id)
      .input("status", finalStatus).query(`
        UPDATE Appointments 
        SET status = @status 
        WHERE appointment_id = @appointment_id
      `);

    console.log(`Updated appointment status to ${finalStatus}`);

    await transaction.commit();

    return {
      exam_id: examId,
      prescription_id: prescriptionId,
      test_request_id: testRequestId,
      prescription_details_count: prescription_details
        ? prescription_details.length
        : 0,
      test_requests_count: test_requests ? test_requests.length : 0,
      message:
        is_completed || !is_temporary
          ? "Hoàn thành khám bệnh thành công"
          : "Lưu tạm dữ liệu khám bệnh thành công",
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in saveExamData:", error);
    throw error;
  }
};

// Save exam data temporarily (Lưu tạm)
const saveExamDataTemp = async (examData) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    const {
      appointment_id,
      vital_signs,
      weight,
      height,
      bmi,
      clinical_signs,
      diagnosis_primary,
      diagnosis_secondary,
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes,
      follow_up_date,
      is_completed,
    } = examData;

    console.log(
      "[doctorService.saveExamDataTemp] Saving temp exam data:",
      examData
    );

    // 1. Save/Update ClinicalExams
    await transaction
      .request()
      .input("appointment_id", appointment_id)
      .input("vitals", vital_signs)
      .input("weight", weight)
      .input("height", height)
      .input("bmi", bmi)
      .input("clinical_signs", clinical_signs)
      .input("diagnosis_primary", diagnosis_primary)
      .input("diagnosis_secondary", diagnosis_secondary).query(`
        MERGE ClinicalExams AS target
        USING (VALUES (@appointment_id, @vitals, @weight, @height, @bmi, @clinical_signs, @diagnosis_primary, @diagnosis_secondary)) 
        AS source (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary)
        ON target.appointment_id = source.appointment_id
        WHEN MATCHED THEN 
          UPDATE SET 
            vitals = source.vitals,
            weight = source.weight,
            height = source.height,
            bmi = source.bmi,
            clinical_signs = source.clinical_signs,
            diagnosis_primary = source.diagnosis_primary,
            diagnosis_secondary = source.diagnosis_secondary
        WHEN NOT MATCHED THEN 
          INSERT (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary)
          VALUES (source.appointment_id, source.vitals, source.weight, source.height, source.bmi, source.clinical_signs, source.diagnosis_primary, source.diagnosis_secondary);
      `);

    // 2. Save/Update Prescriptions
    if (arv_regimen_id || counseling_notes || follow_up_plan || doctor_notes) {
      await transaction
        .request()
        .input("appointment_id", appointment_id)
        .input("arv_regimen_id", arv_regimen_id)
        .input("counseling_notes", counseling_notes)
        .input("follow_up_plan", follow_up_plan)
        .input("doctor_notes", doctor_notes)
        .input("follow_up_date", follow_up_date).query(`
          MERGE Prescriptions AS target
          USING (VALUES (@appointment_id, @arv_regimen_id, @counseling_notes, @follow_up_plan, @doctor_notes, @follow_up_date)) 
          AS source (appointment_id, arv_regimen_id, counseling_notes, follow_up_plan, doctor_notes, follow_up_date)
          ON target.appointment_id = source.appointment_id
          WHEN MATCHED THEN 
            UPDATE SET 
              arv_regimen_id = source.arv_regimen_id,
              counseling_notes = source.counseling_notes,
              follow_up_plan = source.follow_up_plan,
              doctor_notes = source.doctor_notes,
              follow_up_date = source.follow_up_date
          WHEN NOT MATCHED THEN 
            INSERT (appointment_id, arv_regimen_id, counseling_notes, follow_up_plan, doctor_notes, follow_up_date)
            VALUES (source.appointment_id, source.arv_regimen_id, source.counseling_notes, source.follow_up_plan, source.doctor_notes, source.follow_up_date);
        `);
    }

    // 3. Save/Update PrescriptionDetails (support drugs)
    if (support_drugs && support_drugs.length > 0) {
      // First delete existing support drugs for this appointment
      await transaction.request().input("appointment_id", appointment_id)
        .query(`
          DELETE pd FROM PrescriptionDetails pd
          INNER JOIN Prescriptions p ON pd.prescription_id = p.prescription_id
          WHERE p.appointment_id = @appointment_id
        `);

      // Get prescription_id
      const prescriptionResult = await transaction
        .request()
        .input("appointment_id", appointment_id)
        .query(
          "SELECT prescription_id FROM Prescriptions WHERE appointment_id = @appointment_id"
        );

      if (prescriptionResult.recordset.length > 0) {
        const prescription_id = prescriptionResult.recordset[0].prescription_id;

        // Insert new support drugs
        for (const drug of support_drugs) {
          await transaction
            .request()
            .input("prescription_id", prescription_id)
            .input("drug_name", drug.drug_name || "")
            .input("dosage", drug.dosage || "")
            .input("frequency", drug.frequency || "")
            .input("duration_days", drug.duration_days || null)
            .input("usage_instructions", drug.usage_instructions || "")
            .input("notes", drug.notes || "").query(`
              INSERT INTO PrescriptionDetails (prescription_id, drug_name, dosage, frequency, duration_days, usage_instructions, notes)
              VALUES (@prescription_id, @drug_name, @dosage, @frequency, @duration_days, @usage_instructions, @notes)
            `);
        }
      }
    }

    // 4. Keep appointment status as in_progress for temp save (không thay đổi status)
    console.log(
      "[doctorService.saveExamDataTemp] Keeping appointment status as in_progress"
    );

    await transaction.commit();

    return {
      appointment_id,
      message: "Exam data saved temporarily",
      is_completed: false,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("[doctorService.saveExamDataTemp] Error:", error);
    throw error;
  }
};

// Complete exam (Hoàn thành khám)
const completeExam = async (examData) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    const {
      appointment_id,
      vital_signs,
      weight,
      height,
      bmi,
      clinical_signs,
      diagnosis_primary,
      diagnosis_secondary,
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes,
      follow_up_date,
      is_completed,
    } = examData;

    console.log("[doctorService.completeExam] Completing exam:", examData);

    // 1. Save/Update ClinicalExams
    await transaction
      .request()
      .input("appointment_id", appointment_id)
      .input("vitals", vital_signs)
      .input("weight", weight)
      .input("height", height)
      .input("bmi", bmi)
      .input("clinical_signs", clinical_signs)
      .input("diagnosis_primary", diagnosis_primary)
      .input("diagnosis_secondary", diagnosis_secondary).query(`
        MERGE ClinicalExams AS target
        USING (VALUES (@appointment_id, @vitals, @weight, @height, @bmi, @clinical_signs, @diagnosis_primary, @diagnosis_secondary, GETDATE())) 
        AS source (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary, created_at)
        ON target.appointment_id = source.appointment_id
        WHEN MATCHED THEN 
          UPDATE SET 
            vitals = source.vitals,
            weight = source.weight,
            height = source.height,
            bmi = source.bmi,
            clinical_signs = source.clinical_signs,
            diagnosis_primary = source.diagnosis_primary,
            diagnosis_secondary = source.diagnosis_secondary,
            updated_at = GETDATE()
        WHEN NOT MATCHED THEN 
          INSERT (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary, created_at)
          VALUES (source.appointment_id, source.vitals, source.weight, source.height, source.bmi, source.clinical_signs, source.diagnosis_primary, source.diagnosis_secondary, source.created_at);
      `);

    // 2. Save/Update Prescriptions
    await transaction
      .request()
      .input("appointment_id", appointment_id)
      .input("arv_regimen_id", arv_regimen_id)
      .input("counseling_notes", counseling_notes)
      .input("follow_up_plan", follow_up_plan)
      .input("doctor_notes", doctor_notes)
      .input("follow_up_date", follow_up_date).query(`
        MERGE Prescriptions AS target
        USING (VALUES (@appointment_id, @arv_regimen_id, @counseling_notes, @follow_up_plan, @doctor_notes, @follow_up_date, GETDATE())) 
        AS source (appointment_id, arv_regimen_id, counseling_notes, follow_up_plan, doctor_notes, follow_up_date, created_at)
        ON target.appointment_id = source.appointment_id
        WHEN MATCHED THEN 
          UPDATE SET 
            arv_regimen_id = source.arv_regimen_id,
            counseling_notes = source.counseling_notes,
            follow_up_plan = source.follow_up_plan,
            doctor_notes = source.doctor_notes,
            follow_up_date = source.follow_up_date,
            updated_at = GETDATE()
        WHEN NOT MATCHED THEN 
          INSERT (appointment_id, arv_regimen_id, counseling_notes, follow_up_plan, doctor_notes, follow_up_date, created_at)
          VALUES (source.appointment_id, source.arv_regimen_id, source.counseling_notes, source.follow_up_plan, source.doctor_notes, source.follow_up_date, source.created_at);
      `);

    // 3. Save/Update PrescriptionDetails (support drugs)
    if (support_drugs && support_drugs.length > 0) {
      // First delete existing support drugs for this appointment
      await transaction.request().input("appointment_id", appointment_id)
        .query(`
          DELETE pd FROM PrescriptionDetails pd
          INNER JOIN Prescriptions p ON pd.prescription_id = p.prescription_id
          WHERE p.appointment_id = @appointment_id
        `);

      // Get prescription_id
      const prescriptionResult = await transaction
        .request()
        .input("appointment_id", appointment_id)
        .query(
          "SELECT prescription_id FROM Prescriptions WHERE appointment_id = @appointment_id"
        );

      if (prescriptionResult.recordset.length > 0) {
        const prescription_id = prescriptionResult.recordset[0].prescription_id;

        // Insert new support drugs
        for (const drug of support_drugs) {
          await transaction
            .request()
            .input("prescription_id", prescription_id)
            .input("drug_name", drug.drug_name || "")
            .input("dosage", drug.dosage || "")
            .input("frequency", drug.frequency || "")
            .input("duration_days", drug.duration_days || null)
            .input("usage_instructions", drug.usage_instructions || "")
            .input("notes", drug.notes || "").query(`
              INSERT INTO PrescriptionDetails (prescription_id, drug_name, dosage, frequency, duration_days, usage_instructions, notes)
              VALUES (@prescription_id, @drug_name, @dosage, @frequency, @duration_days, @usage_instructions, @notes)
            `);
        }
      }
    }

    // 4. Update appointment status to completed (hoàn thành khám)
    await transaction.request().input("appointment_id", appointment_id).query(`
        UPDATE Appointments 
        SET status = 'completed'
        WHERE appointment_id = @appointment_id
      `);

    console.log(
      "[doctorService.completeExam] Appointment status updated to completed"
    );

    await transaction.commit();

    return {
      appointment_id,
      message: "Exam completed successfully",
      is_completed: true,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("[doctorService.completeExam] Error:", error);
    throw error;
  }
};

// Get saved exam data for continuation (Lấy dữ liệu đã lưu tạm để tiếp tục khám)
const getExamData = async (appointmentId) => {
  const pool = await poolPromise;

  try {
    console.log(
      "[doctorService.getExamData] Getting exam data for appointment:",
      appointmentId
    );

    const result = await pool.request().input("appointment_id", appointmentId)
      .query(`
        SELECT 
          -- Clinical Exam data
          ce.vitals,
          ce.weight,
          ce.height,
          ce.bmi,
          ce.clinical_signs,
          ce.diagnosis_primary,
          ce.diagnosis_secondary,
          
          -- Prescription data
          pr.arv_regimen_id,
          pr.counseling_notes,
          pr.follow_up_plan,
          pr.doctor_notes,
          pr.follow_up_date,
          pr.prescription_id,
          
          -- Prescription details (support drugs)
          pd.detail_id,
          pd.drug_name,
          pd.dosage,
          pd.frequency,
          pd.duration_days,
          pd.usage_instructions,
          pd.notes as drug_notes
          
        FROM Appointments a
        LEFT JOIN ClinicalExams ce ON a.appointment_id = ce.appointment_id
        LEFT JOIN Prescriptions pr ON a.appointment_id = pr.appointment_id
        LEFT JOIN PrescriptionDetails pd ON pr.prescription_id = pd.prescription_id
        WHERE a.appointment_id = @appointment_id
      `);

    if (result.recordset.length === 0) {
      return null; // No data found
    }

    const firstRow = result.recordset[0];

    // Parse vitals string to object
    const parseVitals = (vitalsString) => {
      if (!vitalsString || vitalsString === "Chưa có thông tin") {
        return {
          blood_pressure: "",
          pulse: "",
          temperature: "",
        };
      }

      const vitals = {
        blood_pressure: "",
        pulse: "",
        temperature: "",
      };

      // Parse string như "Huyết áp: 120/80, Mạch: 72/phút, Nhiệt độ: 36.5°C"
      const bloodPressureMatch = vitalsString.match(/Huyết áp:\s*([^,]+)/);
      const heartRateMatch = vitalsString.match(/Mạch:\s*(\d+)/);
      const temperatureMatch = vitalsString.match(/Nhiệt độ:\s*([\d.]+)/);

      if (bloodPressureMatch)
        vitals.blood_pressure = bloodPressureMatch[1].trim();
      if (heartRateMatch) vitals.pulse = heartRateMatch[1];
      if (temperatureMatch) vitals.temperature = temperatureMatch[1];

      return vitals;
    };

    // Group prescription details
    const prescriptionDetails = [];
    const detailsMap = new Map();

    result.recordset.forEach((row) => {
      if (row.detail_id && !detailsMap.has(row.detail_id)) {
        detailsMap.set(row.detail_id, {
          detail_id: row.detail_id,
          drug_name: row.drug_name,
          dosage: row.dosage,
          frequency: row.frequency,
          duration_days: row.duration_days,
          usage_instructions: row.usage_instructions,
          notes: row.drug_notes,
        });
        prescriptionDetails.push(detailsMap.get(row.detail_id));
      }
    });

    const examData = {
      clinical_exam: {
        weight: firstRow.weight,
        height: firstRow.height,
        bmi: firstRow.bmi,
        clinical_signs: firstRow.clinical_signs,
        diagnosis_primary: firstRow.diagnosis_primary,
        diagnosis_secondary: firstRow.diagnosis_secondary,
      },
      vitals_parsed: parseVitals(firstRow.vitals),
      prescription: {
        arv_regimen_id: firstRow.arv_regimen_id,
        counseling_notes: firstRow.counseling_notes,
        follow_up_plan: firstRow.follow_up_plan,
        doctor_notes: firstRow.doctor_notes,
        follow_up_date: firstRow.follow_up_date,
      },
      prescription_details: prescriptionDetails,
    };

    console.log("[doctorService.getExamData] Parsed exam data:", examData);
    return examData;
  } catch (error) {
    console.error("[doctorService.getExamData] Error:", error);
    throw error;
  }
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
const saveClinicalExam = async (params) => {
  const {
    appointmentId,
    vitals,
    weight,
    height,
    bmi,
    clinical_signs,
    diagnosis_primary,
    diagnosis_secondary,
    arv_regimen_id,
    regimen_drugs = [],
    support_drugs = [],
    support_drug_details = [],
    counseling_notes,
    follow_up_plan,
    doctor_notes,
  } = params;

  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // 1. Lưu ClinicalExams
    await transaction
      .request()
      .input("appointment_id", appointmentId)
      .input("vitals", vitals || "")
      .input("weight", weight)
      .input("height", height)
      .input("bmi", bmi)
      .input("clinical_signs", clinical_signs || "")
      .input("diagnosis_primary", diagnosis_primary || "")
      .input("diagnosis_secondary", diagnosis_secondary || "").query(`
        IF EXISTS (SELECT 1 FROM ClinicalExams WHERE appointment_id = @appointment_id)
          UPDATE ClinicalExams
          SET vitals = @vitals, weight = @weight, height = @height, bmi = @bmi,
              clinical_signs = @clinical_signs, diagnosis_primary = @diagnosis_primary,
              diagnosis_secondary = @diagnosis_secondary
          WHERE appointment_id = @appointment_id
        ELSE
          INSERT INTO ClinicalExams (appointment_id, vitals, weight, height, bmi, clinical_signs, diagnosis_primary, diagnosis_secondary)
          VALUES (@appointment_id, @vitals, @weight, @height, @bmi, @clinical_signs, @diagnosis_primary, @diagnosis_secondary)
      `);

    // 2. Lưu Prescriptions
    const supportDrugsStr = Array.isArray(support_drugs)
      ? support_drugs.join(", ")
      : support_drugs || "";

    await transaction
      .request()
      .input("appointment_id", appointmentId)
      .input("arv_regimen_id", arv_regimen_id || null)
      .input("support_drugs", supportDrugsStr)
      .input("counseling_notes", counseling_notes || "")
      .input("follow_up_plan", follow_up_plan || "")
      .input("doctor_notes", doctor_notes || "").query(`
        IF EXISTS (SELECT 1 FROM Prescriptions WHERE appointment_id = @appointment_id)
          UPDATE Prescriptions
          SET arv_regimen_id = @arv_regimen_id,
              support_drugs = @support_drugs,
              counseling_notes = @counseling_notes,
              follow_up_plan = @follow_up_plan,
              doctor_notes = @doctor_notes
          WHERE appointment_id = @appointment_id
        ELSE
          INSERT INTO Prescriptions (appointment_id, arv_regimen_id, support_drugs, counseling_notes, follow_up_plan, doctor_notes)
          VALUES (@appointment_id, @arv_regimen_id, @support_drugs, @counseling_notes, @follow_up_plan, @doctor_notes)
      `);

    // 3. Lấy prescription_id
    const { recordset } = await transaction
      .request()
      .input("appointment_id", appointmentId)
      .query(
        `SELECT prescription_id FROM Prescriptions WHERE appointment_id = @appointment_id`
      );

    const prescription_id = recordset[0]?.prescription_id;

    if (prescription_id) {
      // 4. Xoá cũ
      await transaction
        .request()
        .input("prescription_id", prescription_id)
        .query(
          `DELETE FROM PrescriptionDetails WHERE prescription_id = @prescription_id`
        );

      // 5. Gộp thuốc từ cả regimen + support
      const allDrugs = [
        ...(regimen_drugs || []),
        ...(support_drug_details || []),
      ];

      for (const drug of allDrugs) {
        await transaction
          .request()
          .input("prescription_id", prescription_id)
          .input("drug_name", drug.drug_name || "")
          .input("dosage", drug.dosage || "")
          .input("frequency", drug.frequency || "")
          .input("duration_days", drug.duration_days || 0)
          .input("usage_instructions", drug.usage_instructions || "")
          .input("notes", drug.notes || "").query(`
            INSERT INTO PrescriptionDetails (prescription_id, drug_name, dosage, frequency, duration_days, usage_instructions, notes)
            VALUES (@prescription_id, @drug_name, @dosage, @frequency, @duration_days, @usage_instructions, @notes)
          `);
      }
    }

    await transaction.commit();
    return { success: true, message: "Đã lưu thông tin khám thành công" };
  } catch (error) {
    await transaction.rollback();
    console.error("[saveClinicalExam error]:", error);
    throw error;
  }
};

const getSavedClinicalExam = async (appointmentId) => {
  const pool = await poolPromise;

  // Bắt đầu query dữ liệu
  const clinicalExam = await pool
    .request()
    .input("appointment_id", appointmentId)
    .query(
      `SELECT * FROM ClinicalExams WHERE appointment_id = @appointment_id`
    );

  const prescription = await pool
    .request()
    .input("appointment_id", appointmentId)
    .query(
      `SELECT * FROM Prescriptions WHERE appointment_id = @appointment_id`
    );

  const prescriptionId = prescription.recordset[0]?.prescription_id;

  const prescriptionDetails = prescriptionId
    ? await pool
        .request()
        .input("prescription_id", prescriptionId)
        .query(
          `SELECT * FROM PrescriptionDetails WHERE prescription_id = @prescription_id`
        )
    : { recordset: [] };

  return {
    clinicalExam: clinicalExam.recordset[0] || null,
    prescription: prescription.recordset[0] || null,
    prescriptionDetails: prescriptionDetails.recordset || [],
  };
};

module.exports = {
  getDoctors,
  getDoctorsByDate,
  getAppointmentsByStatus,
  getExamHistory,
  getExamDetail,
  getCurrentExam,
  saveExamData,
  saveExamDataTemp, // Thêm method mới
  completeExam, // Thêm method mới
  getExamData, // Thêm method mới
  getExamHistoryBasic,
  getExamDataByAppointmentId,
  getTestTypes, // Add missing function
  createIndependentTestRequest,
  getCurrentTestRequest,
  saveClinicalExam,
  getSavedClinicalExam,
};
