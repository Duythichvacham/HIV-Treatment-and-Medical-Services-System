const clinicalService = require("../services/clinicalService");

const saveClinicalExam = async (req, res) => {
  try {
    const { appointment_id, ...examFields } = req.body;

    const examData = [
      examFields.huyet_ap,
      examFields.mach,
      examFields.nhiet_do,
      examFields.weight,
      examFields.height,
      examFields.bmi,
      examFields.clinical_signs,
      examFields.diagnosis_primary,
      examFields.diagnosis_secondary,
    ];

    const result = await clinicalService.saveClinicalExam(
      appointment_id,
      examData
    );

    if (result) {
      res.status(201).json({
        success: true,
        message: "Khám lâm sàng đã được lưu thành công.",
      });
    }
  } catch (error) {
    console.error("[createClinicalExam] Lỗi:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lưu khám lâm sàng.",
    });
  }
};

const getClinicalExamByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId is required",
      });
    }

    const examData = await clinicalService.getClinicalExamByAppointmentId(
      appointmentId
    );

    if (!examData) {
      return res.status(404).json({
        success: false,
        message: "Clinical exam not found for this appointment",
      });
    }

    res.status(200).json({
      success: true,
      data: examData,
    });
  } catch (error) {
    console.error("[getClinicalExamByAppointmentId] Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching clinical exam data",
    });
  }
};

module.exports = {
  saveClinicalExam,
  getClinicalExamByAppointmentId,
};
