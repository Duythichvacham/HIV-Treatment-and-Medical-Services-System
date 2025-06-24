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
      a.appointment_id,
      a.queue_number
    INTO #PatientInfo
    FROM Patients p
    JOIN Appointments a ON p.patient_id = a.patient_id
    JOIN Slots s ON a.slot_id = s.slot_id
    WHERE p.patient_id = @patient_id
      AND a.status IN ('requested', 'in_progress')
  `;
  if (appointmentId) {
    query += ` AND a.appointment_id = @appointment_id`;
  }
  query += ` ORDER BY a.created_at DESC; 

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
JOIN Services s ON r.service_id = s.service_id AND s.test_type_id IS NOT NULL
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
JOIN Services s ON r.service_id = s.service_id AND s.test_type_id IS NOT NULL
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
    pi.appointment_id,
    pi.queue_number,
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
DROP TABLE #XetNghiemGanNhat;`;
  const request = pool.request().input("patient_id", patientId);
  if (appointmentId) request.input("appointment_id", appointmentId);

  const result = await request.query(query);

  // Nếu có appointmentId, lấy thêm dữ liệu khám tạm đã lưu trước đó
  let examData = result.recordset;

  if (appointmentId) {
    try {
      console.log(`Fetching temp exam data for appointment: ${appointmentId}`);

      // Lấy dữ liệu khám bệnh tạm (ClinicalExams)
      const examRequest = pool.request().input("appointment_id", appointmentId);

      const examResult = await examRequest.query(`
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

      console.log(`Found ${examResult.recordset.length} exam records`);

      if (examResult.recordset.length > 0) {
        const tempExamData = examResult.recordset[0];

        // Đảm bảo dữ liệu không rỗng
        if (tempExamData.exam_id || tempExamData.prescription_id) {
          console.log("Temporary exam data found:", tempExamData);

          // Lấy chi tiết đơn thuốc nếu có
          if (tempExamData.prescription_id) {
            console.log(
              `Fetching prescription details for prescription: ${tempExamData.prescription_id}`
            );

            const detailsRequest = pool
              .request()
              .input("prescription_id", tempExamData.prescription_id);

            const detailsResult = await detailsRequest.query(`
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

            console.log(
              `Found ${detailsResult.recordset.length} prescription details`
            );

            if (detailsResult.recordset.length > 0) {
              tempExamData.prescription_details = detailsResult.recordset;
            } else {
              tempExamData.prescription_details = [];
            }
          }

          // Đảm bảo không có trường nào là null
          tempExamData.diagnosis_primary = tempExamData.diagnosis_primary || "";
          tempExamData.diagnosis_secondary =
            tempExamData.diagnosis_secondary || "";
          tempExamData.clinical_signs = tempExamData.clinical_signs || "";
          tempExamData.vitals = tempExamData.vitals || "";
          tempExamData.weight = tempExamData.weight || 0;
          tempExamData.height = tempExamData.height || 0;
          tempExamData.bmi = tempExamData.bmi || 0;
          tempExamData.doctor_notes = tempExamData.doctor_notes || "";
          tempExamData.follow_up_plan = tempExamData.follow_up_plan || "";

          // Gộp dữ liệu vào recordset
          examData = examData.map((record) => ({
            ...record,
            exam_data: tempExamData,
          }));

          console.log("Final exam data with temporary data:", examData);
        } else {
          console.log("Temporary exam record found but data is empty");
        }
      } else {
        console.log("No temporary exam data found for this appointment");
      }
    } catch (error) {
      console.error("Error fetching temporary exam data:", error);
      console.error("Error stack:", error.stack);
    }
  }

  return examData;
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
      diagnosis,
      diagnosis_secondary,
      treatment_plan,
      note,
      reExamDate,
      vitals,
      weight,
      height,
      clinical_signs,
      arv_regimen_id,
      prescription_details,
      is_temporary,
    } = examData;

    console.log("saveExamData - Input data:", examData);

    // Đảm bảo các giá trị text là chuỗi rỗng thay vì null nếu không có dữ liệu
    const sanitizedDiagnosis = diagnosis || "";
    const sanitizedDiagnosisSecondary = diagnosis_secondary || "";
    const sanitizedTreatmentPlan = treatment_plan || "";
    const sanitizedNote = note || "";
    const sanitizedVitals = vitals || "";
    const sanitizedClinicalSigns = clinical_signs || "";

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
        .input(
          "bmi",
          weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(2) : 0
        )
        .input("clinical_signs", sanitizedClinicalSigns)
        .input("diagnosis_primary", sanitizedDiagnosis)
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
        .input(
          "bmi",
          weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(2) : 0
        )
        .input("clinical_signs", sanitizedClinicalSigns)
        .input("diagnosis_primary", sanitizedDiagnosis)
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
        .input("doctor_notes", sanitizedNote)
        .input("follow_up_plan", sanitizedTreatmentPlan)
        .input("arv_regimen_id", arv_regimen_id || null)
        .input(
          "counseling_notes",
          reExamDate ? `Tái khám ngày: ${reExamDate}` : ""
        ).query(`
          UPDATE Prescriptions SET
            doctor_notes = @doctor_notes,
            follow_up_plan = @follow_up_plan,
            counseling_notes = @counseling_notes,
            arv_regimen_id = @arv_regimen_id
          WHERE appointment_id = @appointment_id
        `);
      console.log("Updated existing Prescription with ID:", prescriptionId);
    } else {
      // Insert new record
      const prescriptionResult = await transaction
        .request()
        .input("appointment_id", appointment_id)
        .input("doctor_notes", sanitizedNote)
        .input("follow_up_plan", sanitizedTreatmentPlan)
        .input("arv_regimen_id", arv_regimen_id || null)
        .input(
          "counseling_notes",
          reExamDate ? `Tái khám ngày: ${reExamDate}` : ""
        ).query(`
          INSERT INTO Prescriptions 
          (appointment_id, doctor_notes, follow_up_plan, counseling_notes, arv_regimen_id)
          OUTPUT INSERTED.prescription_id
          VALUES (@appointment_id, @doctor_notes, @follow_up_plan, @counseling_notes, @arv_regimen_id)
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
        ); // Thêm chi tiết mới
      for (const detail of prescription_details) {
        await transaction
          .request()
          .input("prescription_id", prescriptionId)
          .input("drug_name", detail.drug_name || "")
          .input("dosage", detail.dosage || "")
          .input("frequency", detail.frequency || "")
          .input("duration_days", parseInt(detail.duration_days) || 30)
          .input(
            "usage_instructions",
            detail.usage_instructions || "Uống thuốc đúng giờ, đủ liều"
          )
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

    // 4. Cập nhật trạng thái cuộc hẹn nếu là lưu hoàn chỉnh (không phải lưu tạm)
    if (!is_temporary) {
      await transaction
        .request()
        .input("appointment_id", appointment_id)
        .query(
          `UPDATE Appointments SET status = 'completed' WHERE appointment_id = @appointment_id`
        );

      console.log("Updated appointment status to completed");
    } else {
      await transaction
        .request()
        .input("appointment_id", appointment_id)
        .query(
          `UPDATE Appointments SET status = 'in_progress' WHERE appointment_id = @appointment_id AND status = 'requested'`
        );

      console.log(
        "Updated appointment status to in_progress if it was requested"
      );
    }
    await transaction.commit();

    return {
      exam_id: examId,
      prescription_id: prescriptionId,
      message: is_temporary
        ? "Lưu tạm dữ liệu khám bệnh thành công"
        : "Hoàn thành khám bệnh thành công",
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

    const query = `
      SELECT 
        arv_regimen_id,
        name,
        for_group,
        components
      FROM ARVRegimens
      ORDER BY arv_regimen_id`;

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

    // Lấy thông tin thuốc từ bảng PrescriptionDetails hoặc từ phác đồ components
    // Trong database mẫu, chưa có bảng riêng cho thuốc của từng phác đồ
    // Nên ta sẽ phân tích chuỗi components và trả về danh sách thuốc

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
      const drugParts = components.split("+").map((part) => part.trim());

      drugParts.forEach((drugPart) => {
        // Phân tích thông tin thuốc từ chuỗi
        const matches = drugPart.match(/(.+?)\s+(\d+[a-zA-Z]+)?/);

        if (matches) {
          const drug = {
            drug_name: matches[1].trim(),
            dosage: matches[2] || "",
            default_quantity: regimen.for_group === "Trẻ em" ? 60 : 30,
            default_frequency:
              regimen.for_group === "Trẻ em" ? "2 lần/ngày" : "1 lần/ngày",
            default_duration: 30,
            notes: "",
          };

          medications.push(drug);
        }
      });
    }

    return medications;
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

module.exports = {
  getDoctors,
  getDoctorsByDate,
  getAppointmentsByStatus,
  getExamHistory,
  getCurrentExam,
  saveExamData,
  getARVRegimens,
  getARVMedications,
  getDoctorByAccountId,
};
