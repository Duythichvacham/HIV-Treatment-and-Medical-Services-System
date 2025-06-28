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
        a.queue_number,
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
        d.specialization AS chuyen_khoa,
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
        AND a.status IN ('completed', 'in_progress') -- Chỉ lấy các lần khám đã thực hiện
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
          a.queue_number,
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
        ORDER BY a.queue_number ASC, a.created_at ASC
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

// Lấy danh sách phác đồ ARV từ database
const getARVRegimens = async () => {
  const pool = await poolPromise;

  try {
    console.log("Getting ARV regimens from database");

    const query = `select * from ARVRegimens`;

    const result = await pool.request().query(query);
    console.log(`Found ${result.recordset.length} ARV regimens`);

    return result.recordset;
  } catch (error) {
    console.error("Error in getARVRegimens:", error);
    throw error;
  }
};

//
const getPrescriptionDetails = async () => {
  const pool = await poolPromise;
  try {
    console.log("Getting prescription details from database");
    const query = `select * from PrescriptionDetails`;
    const result = await pool.request().query(query);
    console.log(`Found ${result.recordset.length} prescription details`);
    return result.recordset;
  } catch (error) {
    console.error("Error in getPrescriptionDetails:", error);
    throw error;
  }
};
const getDrugOfARVMedications = async () => {
  const pool = await poolPromise;

  try {
    console.log("Getting ARV regimens from database");

    const query = `
      SELECT
        arv_regimen_id,
        name,
        for_group,
        components,
        LTRIM(RTRIM(value1.[value])) AS drug_1,
        LTRIM(RTRIM(value2.[value])) AS drug_2,
        LTRIM(RTRIM(value3.[value])) AS drug_3
      FROM ARVRegimens
      CROSS APPLY STRING_SPLIT(components, '+') AS value1
      OUTER APPLY (
          SELECT value AS [value]
          FROM (
              SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn, value
              FROM STRING_SPLIT(components, '+')
          ) AS temp
          WHERE rn = 2
      ) AS value2
      OUTER APPLY (
          SELECT value AS [value]
          FROM (
              SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn, value
              FROM STRING_SPLIT(components, '+')
          ) AS temp
          WHERE rn = 3
      ) AS value3
      WHERE value1.[value] = (
          SELECT TOP 1 value
          FROM STRING_SPLIT(components, '+')
      );

    `;

    const result = await pool.request().query(query);
    console.log(`Found ${result.recordset.length} ARV regimens`);

    return result.recordset;
  } catch (error) {
    console.error("Error in getARVRegimens:", error);
    throw error;
  }
};
// Lấy danh sách thuốc theo phác đồ ARV
const getARVMedications = async (regimenId) => {
  const pool = await poolPromise;

  try {
    console.log(`Getting medications for ARV regimen ID: ${regimenId}`);

    // Kiểm tra phác đồ có tồn tại không
    const checkQuery = `
      SELECT COUNT(*) AS count
      FROM ARVRegimens
      WHERE arv_regimen_id = @regimenId`;

    const checkResult = await pool
      .request()
      .input("regimenId", regimenId)
      .query(checkQuery);

    if (checkResult.recordset[0].count === 0) {
      throw new Error(`Không tìm thấy phác đồ ARV với ID: ${regimenId}`);
    }

    // Lấy thông tin thuốc từ phác đồ components
    const regimenQuery = `
      SELECT 
        ar.arv_regimen_id,
        ar.name AS regimen_name,
        ar.for_group,
        ar.components
      FROM ARVRegimens ar
      WHERE ar.arv_regimen_id = @regimenId`;

    const regimenResult = await pool
      .request()
      .input("regimenId", regimenId)
      .query(regimenQuery);

    if (regimenResult.recordset.length === 0) {
      return [];
    }

    const regimen = regimenResult.recordset[0];
    const components = regimen.components;

    // Phân tích chuỗi thành phần để tách các thuốc
    // Ví dụ: "Tenofovir 300mg + Lamivudine 300mg + Efavirenz 600mg"
    const medications = [];

    if (components) {
      // Tách các thành phần thuốc
      const drugParts = components.split("+").map((part) => part.trim());

      drugParts.forEach((drugPart, index) => {
        if (drugPart) {
          // Cải thiện regex để parse tên thuốc và liều lượng chính xác hơn
          // Matching patterns:
          // - "Tenofovir 300mg"
          // - "Lopinavir/ritonavir"
          // - "Atazanavir/ritonavir"
          // - "Zidovudine"
          const matches = drugPart.match(
            /^([^0-9]+?)(?:\s+(\d+[a-zA-Z\/]+))?$/
          );

          let drugName = drugPart;
          let dosage = "";

          if (matches) {
            drugName = matches[1].trim();
            dosage = matches[2] || "";
          } else {
            // Fallback: nếu không match được, lấy toàn bộ làm tên thuốc
            drugName = drugPart.trim();
          }

          const drug = {
            drug_name: drugName,
            dosage: dosage,
            default_quantity: regimen.for_group === "Trẻ em" ? 60 : 30,
            default_frequency:
              regimen.for_group === "Trẻ em" ? "2 lần/ngày" : "1 lần/ngày",
            default_duration: 30,
            notes: "",
            usage_instructions: `Uống ${
              regimen.for_group === "Trẻ em" ? "2 lần/ngày" : "1 lần/ngày"
            }, ${dosage ? `mỗi lần ${dosage}` : "theo chỉ định của bác sĩ"}`,
          };

          medications.push(drug);
        }
      });
    }

    // Đảm bảo luôn trả về đúng 3 thuốc (nếu không đủ, thêm placeholder)
    while (medications.length < 3) {
      medications.push({
        drug_name: `Thuốc ${medications.length + 1}`,
        dosage: "Chưa xác định",
        default_quantity: regimen.for_group === "Trẻ em" ? 60 : 30,
        default_frequency:
          regimen.for_group === "Trẻ em" ? "2 lần/ngày" : "1 lần/ngày",
        default_duration: 30,
        notes: "Thông tin thuốc chưa đầy đủ",
        usage_instructions: "Theo chỉ định của bác sĩ",
      });
    }

    // Chỉ lấy tối đa 3 thuốc
    const finalMedications = medications.slice(0, 3);

    console.log(
      `Found ${finalMedications.length} medications for regimen ${regimenId}`
    );
    return finalMedications;
  } catch (error) {
    console.error(
      `Error in getARVMedications for regimen ${regimenId}:`,
      error
    );
    throw error;
  }
};

// Lấy thông tin bác sĩ theo accountId
const getDoctorByAccountId = async (accountId) => {
  const pool = await poolPromise;
  try {
    const result = await pool.request().input("accountId", accountId).query(`
        SELECT doctor_id, full_name, email, phone, image_url
        FROM Doctors
        WHERE account_id = @accountId
      `);

    return result.recordset[0];
  } catch (error) {
    console.error("Error getting doctor by account ID:", error);
    throw error;
  }
};

// Lấy thông tin phác đồ ARV hiện tại của bệnh nhân
const getCurrentARVRegimen = async (patientId) => {
  const pool = await poolPromise;

  try {
    console.log(`Getting current ARV regimen for patient: ${patientId}`);

    const query = `
      SELECT TOP 1
        ar.name AS phac_do,
        ar.components AS thanh_phan,
        FORMAT(a.created_at, 'dd-MM-yyyy') as ngay_bat_dau,
        mh.arv_adherence AS tuan_thu,
        mh.arv_side_effects AS tac_dung_phu,
        pr.prescription_id,
        pr.doctor_notes,
        ar.arv_regimen_id
      FROM Prescriptions pr
      JOIN Appointments a ON pr.appointment_id = a.appointment_id
      JOIN Patients p ON a.patient_id = p.patient_id
      LEFT JOIN ARVRegimens ar ON pr.arv_regimen_id = ar.arv_regimen_id
      LEFT JOIN MedicalHistory mh ON p.patient_id = mh.patient_id
      WHERE p.patient_id = @patient_id
        AND pr.arv_regimen_id IS NOT NULL
      ORDER BY a.created_at DESC
    `;

    const result = await pool
      .request()
      .input("patient_id", patientId)
      .query(query);

    console.log(`Found ${result.recordset.length} ARV regimen records`);

    if (result.recordset.length > 0) {
      const arvData = result.recordset[0];
      return {
        regimen_id: arvData.arv_regimen_id,
        regimen_name: arvData.phac_do,
        components: arvData.thanh_phan,
        start_date: arvData.ngay_bat_dau,
        adherence: arvData.tuan_thu || "Chưa đánh giá",
        side_effects: arvData.tac_dung_phu || "Chưa ghi nhận",
        doctor_notes: arvData.doctor_notes,
        prescription_id: arvData.prescription_id,
      };
    } else {
      return null; // Chưa có thông tin phác đồ ARV
    }
  } catch (error) {
    console.error(`Error getting ARV regimen for patient ${patientId}:`, error);
    throw error;
  }
};

// Lấy kết quả xét nghiệm gần nhất của bệnh nhân (4 loại chính: Sàng lọc, Khẳng định, CD4, Viral Load)
const getLatestTestResults = async (patientId) => {
  const pool = await poolPromise;

  try {
    console.log(`Getting latest test results for patient: ${patientId}`);

    const query = `
      SELECT 
        tt.name as test_name,
        ISNULL(latest_tr.result_value, '') AS result_value,
        ISNULL(latest_tr.unit, '') AS unit,
        ISNULL(CONVERT(VARCHAR, latest_tr.finished_at, 120), '') AS test_date,
        ISNULL(latest_tr.notes, '') AS notes
      FROM TestTypes tt
      OUTER APPLY (
          SELECT TOP 1 
              tr.result_value, 
              tr.unit, 
              tr.finished_at, 
              tn.notes
          FROM Appointments a
          JOIN TestNotes tn ON a.appointment_id = tn.appointment_id
          JOIN TestResults tr ON tr.test_note_id = tn.test_note_id
          WHERE 
              a.patient_id = @patient_id AND 
              tr.test_type_id = tt.test_type_id
          ORDER BY tr.finished_at DESC
      ) AS latest_tr
    `;

    const result = await pool
      .request()
      .input("patient_id", patientId)
      .query(query);

    console.log(`Found ${result.recordset.length} test results`);

    const testResults = {
      sang_loc: null,
      khang_dinh: null,
      cd4: null,
      viral_load: null,
    };

    result.recordset.forEach((test) => {
      const testData = {
        result_value: test.result_value,
        unit: test.unit,
        notes: test.notes,
        test_date: test.test_date,
      };

      switch (test.test_name) {
        case "Sàng lọc":
          testResults.sang_loc = {
            ...testData,
            test_name: "Sàng lọc HIV",
          };
          break;
        case "Khẳng định":
          testResults.khang_dinh = {
            ...testData,
            test_name: "Khẳng định HIV",
          };
          break;
        case "CD4":
          testResults.cd4 = {
            ...testData,
            test_name: "Số lượng CD4",
          };
          break;
        case "HIV Viral Load":
          testResults.viral_load = {
            ...testData,
            test_name: "Tải lượng virus",
          };
          break;
      }
    });

    return testResults;
  } catch (error) {
    console.error(
      `Error getting test results for patient ${patientId}:`,
      error
    );
    return null;
  }
};

// Get available tests
const getAvailableTests = async () => {
  const pool = await poolPromise;

  try {
    console.log("Getting available tests");

    const result = await pool.request().query(`
      SELECT 
        service_id,
        service_name as name,
        description,
        unit_price as price,
        service_type as type
      FROM Services 
      WHERE service_type IN ('test', 'lab', 'examination')
        AND status = 'active'
      ORDER BY service_name
    `);

    // Nếu không có dữ liệu thực, trả về dữ liệu mẫu
    if (result.recordset.length === 0) {
      return [
        {
          service_id: 1,
          name: "Xét nghiệm máu tổng quát",
          description: "Đếm tế bào máu, hemoglobin, hematocrit",
          price: 150000,
          type: "test",
        },
        {
          service_id: 2,
          name: "Xét nghiệm CD4",
          description: "Đếm số lượng tế bào CD4",
          price: 350000,
          type: "test",
        },
        {
          service_id: 3,
          name: "Tải lượng virus HIV",
          description: "Đo lường RNA virus HIV trong máu",
          price: 800000,
          type: "test",
        },
        {
          service_id: 4,
          name: "Xét nghiệm chức năng gan",
          description: "AST, ALT, Bilirubin",
          price: 200000,
          type: "test",
        },
        {
          service_id: 5,
          name: "Xét nghiệm chức năng thận",
          description: "Creatinine, BUN",
          price: 180000,
          type: "test",
        },
      ];
    }

    return result.recordset;
  } catch (error) {
    console.error("Error getting available tests:", error);
    throw error;
  }
};

// Get ongoing tests for a patient
const getOngoingTests = async (patientId) => {
  const pool = await poolPromise;

  try {
    console.log(`Getting ongoing tests for patient: ${patientId}`);

    const result = await pool.request().input("patient_id", patientId).query(`
        SELECT 
          tr.test_request_id,
          tr.service_id,
          s.service_name as test_name,
          tr.status,
          tr.requested_date,
          tr.notes
        FROM TestRequests tr
        JOIN Services s ON tr.service_id = s.service_id
        WHERE tr.patient_id = @patient_id
          AND tr.status IN ('pending', 'in_progress')
        ORDER BY tr.requested_date DESC
      `);

    return result.recordset || [];
  } catch (error) {
    console.error(
      `Error getting ongoing tests for patient ${patientId}:`,
      error
    );
    throw error;
  }
};

// Create test request với nhiều services
const createTestRequest = async (testRequestData) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    const { doctor_id, patient_id, appointment_id, service_ids, notes } =
      testRequestData;

    console.log("createTestRequest - Input data:", testRequestData);

    await transaction.begin();

    // 1. Tạo TestRequest chính
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

    const requestId = insertTestRequestResult.recordset[0].request_id;
    console.log("Created TestRequest with ID:", requestId);

    // 2. Thêm chi tiết các services vào TestRequestDetails
    for (const serviceId of service_ids) {
      await transaction
        .request()
        .input("request_id", requestId)
        .input("service_id", serviceId)
        .input("notes", notes || "").query(`
          INSERT INTO TestRequestDetails (request_id, service_id, notes)
          VALUES (@request_id, @service_id, @notes)
        `);
    }

    await transaction.commit();

    // 3. Lấy thông tin chi tiết của test request vừa tạo
    const detailResult = await pool.request().input("request_id", requestId)
      .query(`
        SELECT 
          tr.request_id,
          tr.patient_id,
          tr.doctor_id,
          tr.appointment_id,
          tr.request_date,
          tr.status,
          COUNT(trd.service_id) as service_count,
          STRING_AGG(s.name, ', ') as service_names
        FROM TestRequests tr
        LEFT JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
        LEFT JOIN Services s ON trd.service_id = s.service_id
        WHERE tr.request_id = @request_id
        GROUP BY tr.request_id, tr.doctor_id, tr.patient_id, tr.appointment_id, tr.request_date, tr.status
      `);

    console.log("createTestRequest successful:", detailResult.recordset[0]);
    return detailResult.recordset[0];
  } catch (error) {
    await transaction.rollback();
    console.error("Error in createTestRequest:", error);
    throw error;
  }
};

// Service methods for test types and independent test requests

const getTestTypes = async () => {
  const pool = await poolPromise;

  try {
    console.log(
      "[doctorService.getTestTypes] Getting all test types with services"
    );

    const query = `
      SELECT DISTINCT
        tt.test_type_id,
        tt.name as test_type_name,
        tt.service_type,
        tt.unit,
        tt.normal_range,
        tt.result_type,
        s.service_id,
        s.name as service_name,
        s.price,
        s.description as service_description,
        s.is_active
      FROM TestTypes tt
      JOIN ServicesTestTypes stt ON tt.test_type_id = stt.test_type_id
      JOIN Services s ON stt.service_id = s.service_id
      WHERE s.is_active = 1 AND s.service_type = 'test'
      ORDER BY tt.name, s.name
    `;

    const result = await pool.request().query(query);

    // Group by test_type_id
    const groupedResults = {};
    result.recordset.forEach((row) => {
      if (!groupedResults[row.test_type_id]) {
        groupedResults[row.test_type_id] = {
          test_type_id: row.test_type_id,
          test_type_name: row.test_type_name,
          service_type: row.service_type,
          unit: row.unit,
          normal_range: row.normal_range,
          result_type: row.result_type,
          services: [],
        };
      }

      groupedResults[row.test_type_id].services.push({
        service_id: row.service_id,
        service_name: row.service_name,
        price: row.price,
        description: row.service_description,
        is_active: row.is_active,
      });
    });

    return Object.values(groupedResults);
  } catch (error) {
    console.error("[doctorService.getTestTypes] Error:", error);
    throw error;
  }
};

const createIndependentTestRequest = async ({
  doctor_id,
  appointment_id,
  service_id,
  notes,
}) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    console.log(
      "[doctorService.createIndependentTestRequest] Creating test request:",
      {
        doctor_id,
        appointment_id,
        service_id,
        notes,
      }
    );

    await transaction.begin();

    // 1. Create TestRequest (theo schema thực tế)
    const testRequestQuery = `
      INSERT INTO TestRequests (
        doctor_id, 
        appointment_id,
        request_date, 
        status
      )
      OUTPUT INSERTED.request_id
      VALUES (@doctor_id, @appointment_id, GETDATE(), 'requested')
    `;

    const testRequestResult = await transaction
      .request()
      .input("doctor_id", doctor_id)
      .input("appointment_id", appointment_id)
      .query(testRequestQuery);

    const request_id = testRequestResult.recordset[0].request_id;

    // 2. Create TestRequestDetails (theo schema thực tế)
    const detailQuery = `
      INSERT INTO TestRequestDetails (
        request_id,
        service_id,
        notes
      )
      VALUES (@request_id, @service_id, @notes)
    `;

    await transaction
      .request()
      .input("request_id", request_id)
      .input("service_id", service_id)
      .input("notes", notes || "")
      .query(detailQuery);

    await transaction.commit();

    // 3. Get created test request with details (theo schema thực tế)
    const resultQuery = `
      SELECT 
        tr.request_id,
        tr.doctor_id,
        tr.appointment_id,
        tr.request_date,
        tr.status,
        trd.detail_id,
        trd.service_id,
        trd.notes,
        s.name as service_name,
        s.price,
        s.service_type,
        a.patient_id
      FROM TestRequests tr
      JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
      JOIN Services s ON trd.service_id = s.service_id
      JOIN Appointments a ON tr.appointment_id = a.appointment_id
      WHERE tr.request_id = @request_id
    `;

    const finalResult = await pool
      .request()
      .input("request_id", request_id)
      .query(resultQuery);

    return finalResult.recordset[0];
  } catch (error) {
    await transaction.rollback();
    console.error("[doctorService.createIndependentTestRequest] Error:", error);
    throw error;
  }
};

const getTestRequestsByPatient = async (patientId) => {
  const pool = await poolPromise;

  try {
    console.log(
      "[doctorService.getTestRequestsByPatient] Getting test requests for patient:",
      patientId
    );

    // Sửa query theo schema thực tế
    const query = `
      SELECT 
        tr.request_id,
        tr.doctor_id,
        tr.appointment_id,
        tr.request_date,
        tr.status,
        trd.detail_id,
        trd.service_id,
        trd.notes,
        s.name as service_name,
        s.price,
        s.service_type,
        d.full_name as doctor_name,
        a.patient_id
      FROM TestRequests tr
      JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
      JOIN Services s ON trd.service_id = s.service_id
      JOIN Appointments a ON tr.appointment_id = a.appointment_id
      JOIN Doctors d ON tr.doctor_id = d.doctor_id
      WHERE a.patient_id = @patient_id
      ORDER BY tr.request_date DESC, tr.request_id DESC
    `;

    const result = await pool
      .request()
      .input("patient_id", patientId)
      .query(query);

    // Group by request_id (sửa theo schema thực tế)
    const groupedResults = {};
    result.recordset.forEach((row) => {
      if (!groupedResults[row.request_id]) {
        groupedResults[row.request_id] = {
          request_id: row.request_id,
          patient_id: row.patient_id,
          doctor_id: row.doctor_id,
          doctor_name: row.doctor_name,
          appointment_id: row.appointment_id,
          request_date: row.request_date,
          status: row.status,
          details: [],
        };
      }

      groupedResults[row.request_id].details.push({
        detail_id: row.detail_id,
        service_id: row.service_id,
        service_name: row.service_name,
        service_type: row.service_type,
        price: row.price,
        notes: row.notes,
      });
    });

    return Object.values(groupedResults);
  } catch (error) {
    console.error("[doctorService.getTestRequestsByPatient] Error:", error);
    throw error;
  }
};

const getTestRequestDetails = async (requestId) => {
  const pool = await poolPromise;

  try {
    console.log(
      "[doctorService.getTestRequestDetails] Getting test request details:",
      requestId
    );

    // Sửa query theo schema thực tế
    const query = `
      SELECT 
        tr.request_id,
        tr.doctor_id,
        tr.appointment_id,
        tr.request_date,
        tr.status,
        a.patient_id,
        p.full_name as patient_name,
        'HIV' + RIGHT('000' + CAST(p.patient_id AS VARCHAR), 3) AS patient_code,
        d.full_name as doctor_name,
        trd.detail_id,
        trd.service_id,
        trd.notes,
        s.name as service_name,
        s.price,
        s.service_type
      FROM TestRequests tr
      JOIN TestRequestDetails trd ON tr.request_id = trd.request_id
      JOIN Services s ON trd.service_id = s.service_id
      JOIN Appointments a ON tr.appointment_id = a.appointment_id
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Doctors d ON tr.doctor_id = d.doctor_id
      WHERE tr.request_id = @request_id
      ORDER BY trd.created_at DESC
    `;

    const result = await pool
      .request()
      .input("request_id", requestId)
      .query(query);

    if (result.recordset.length === 0) {
      throw new Error("Test request not found");
    }

    // Sửa theo schema thực tế
    const testRequest = {
      request_id: result.recordset[0].request_id,
      patient_id: result.recordset[0].patient_id,
      patient_name: result.recordset[0].patient_name,
      patient_code: result.recordset[0].patient_code,
      doctor_id: result.recordset[0].doctor_id,
      doctor_name: result.recordset[0].doctor_name,
      appointment_id: result.recordset[0].appointment_id,
      request_date: result.recordset[0].request_date,
      status: result.recordset[0].status,
      details: [],
    };

    // Group details (đơn giản hóa theo schema thực tế)
    const detailsMap = {};

    result.recordset.forEach((row) => {
      // Details
      if (!detailsMap[row.detail_id]) {
        detailsMap[row.detail_id] = {
          detail_id: row.detail_id,
          service_id: row.service_id,
          service_name: row.service_name,
          service_type: row.service_type,
          price: row.price,
          notes: row.notes,
        };
      }
    });

    testRequest.details = Object.values(detailsMap);

    return testRequest;
  } catch (error) {
    console.error("[doctorService.getTestRequestDetails] Error:", error);
    throw error;
  }
};

module.exports = {
  getDoctors,
  getDoctorsByDate,
  getAppointmentsByStatus,
  getExamHistory,
  getExamDetail,
  getCurrentExam,
  saveExamData,
  getARVRegimens,
  getARVMedications,
  getDoctorByAccountId,
  getCurrentARVRegimen,
  getLatestTestResults,
  getAvailableTests,
  getOngoingTests,
  getPrescriptionDetails,
  getDrugOfARVMedications,
  createTestRequest,
  getTestTypes,
  createIndependentTestRequest,
  getTestRequestsByPatient,
  getTestRequestDetails,
  getExamHistoryBasic,
};
