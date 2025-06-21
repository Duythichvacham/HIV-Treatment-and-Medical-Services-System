const doctorService = require("../services/doctorService");

// (GET, lấy danh sách bác sĩ - có thể filter theo ngày)
exports.getDoctors = async (req, res) => {
  try {
    const { date } = req.query;
    console.log("getDoctors called with date:", date);

    let doctors;
    if (date) {
      // Lấy doctors có ca làm việc trong ngày được chỉ định
      console.log("Fetching doctors by date:", date);
      doctors = await doctorService.getDoctorsByDate(date);
    } else {
      // Lấy tất cả doctors
      console.log("Fetching all doctors");
      doctors = await doctorService.getDoctors();
    }

    console.log("Found doctors:", doctors.length);
    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET, lấy bệnh nhân đã hoàn thành xét nghiệm với service_type='test'
exports.getPatientWait = async (req, res) => {
  try {
    const listWait = await doctorService.getListWait();
    res.json({
      message: 'Lấy danh sách bệnh nhân đang chờ khám ',
      data: listWait
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// /api/v1/doctor/appointments/in-progress (GET, lấy bệnh nhân đang khám)
exports.getPatientInProgress = async (req, res) => {
try {
  const listInPro = await doctorService.getListInprogress();

 
  if (!listInPro || listInPro.length === 0) {
    return res.status(404).json({
      message: 'Không có bệnh nhân nào đang khám!'
    });
  }

  res.status(200).json({
    message: 'Lấy danh sách bệnh nhân đang khám',
    data: listInPro
  });
} catch (error) {
  res.status(500).json({ message: error.message });
}
};


// /api/v1/doctor/appointments/finished (GET, lấy bệnh nhân hoàn thành khám), 
exports.getPatientfinished = async (req, res) => {
try {
  const listFinish = await doctorService.getListFinish();

 
  if (!listFinish || listFinish.length === 0) {
    return res.status(404).json({
      message: 'Không có bệnh nhân nào hoàn thành!'
    });
  }

  res.status(200).json({
    message: 'Lấy danh sách bệnh nhân hoàn thành khám',
    data: listFinish
  });
} catch (error) {
  res.status(500).json({ message: error.message });
}
};


//GET, lấy thông tin cơ bản thẻ khám bệnh
exports.getExams = async (req, res) => {
try {
  const { exam_id} = req.params;

  if (!exam_id) {
    return res.status(400).json({
      message: 'ID không khả dụng !',
    });
  }

  const list = await doctorService.getExams(exam_id);

  if (list.length === 0) {
    return res.status(404).json({
      message: 'Không tìm thấy bệnh nhân nào phù hợp.',
    });
  }

  res.json({
    message: 'Tìm kiếm bệnh nhân thành công',
    data: list,
  });
} catch (error) {
  res.status(500).json({ message: error.message });
}
};

exports.createPrescription = async (req, res) => {
try {
  const {
    appointment_id,
    arv_regimen_id,
    support_drugs,
    counseling_notes,
    follow_up_plan,
    doctor_notes
  } = req.body;

  if (!appointment_id) {
    return res.status(400).json({ message: "Thiếu appointment_id!" });
  }

  const result = await doctorService.createPrescription({
    appointment_id,
    arv_regimen_id,
    support_drugs,
    counseling_notes,
    follow_up_plan,
    doctor_notes
  });

  res.status(201).json({
    message: "Tạo đơn thuốc thành công",
    data: result
  });
} catch (error) {
  res.status(500).json({ message: error.message });
}
};

//api/v1/doctor/exams/{exam_id} (PATCH, cập nhật thẻ khá	m), -- liên quan nhiều bảng - tham khảo trang demo
// ======== CONTROLLER: controllers/doctorController.js ========


exports.updateExam = async (req, res) => {
try {
  const examID = req.params.examID; // Lấy từ URL
  const {
    appointment_id,
    vitals,
    weight,
    height,
    bmi,
    clinical_signs,
    diagnosis_primary,
    diagnosis_secondary,
    exam_date,
    full_name,
    gender,
    dob
  } = req.body;

  const updatedData = await doctorService.updateExam({
    exam_id: examID,
    appointment_id,
    vitals,
    weight,
    height,
    bmi,
    clinical_signs,
    diagnosis_primary,
    diagnosis_secondary,
    exam_date,
    full_name,
    gender,
    dob
  });

  res.json({
    message: 'Cập nhật thẻ khám thành công',
    data: updatedData
  });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Lỗi server: ' + error.message });
}
};



