const prescriptionService = require("../services/prescriptionService");

const savePrescription = async (req, res) => {
  try {
    console.log("[savePrescription] Request body:", req.body);

    const {
      appointment_id,
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes,
      prescription_detail, // Thêm prescription_detail từ frontend
    } = req.body;

    console.log("[savePrescription] Destructured data:", {
      appointment_id,
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes,
      prescription_detail,
    });

    // Validate required fields
    if (!appointment_id) {
      return res.status(400).json({
        success: false,
        message: "appointment_id is required",
      });
    }

    // arv_regimen_id có thể null nếu tiếp tục phác đồ hiện tại
    if (arv_regimen_id !== undefined && arv_regimen_id !== null) {
      console.log("[savePrescription] Using ARV regimen ID:", arv_regimen_id);
    } else {
      console.log(
        "[savePrescription] No ARV regimen change (continuing current regimen)"
      );
    }

    const result = await prescriptionService.savePrescription(
      appointment_id,
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes,
      prescription_detail // Thêm prescription_detail
    );

    if (result) {
      res.status(200).json({
        success: true,
        message: "Prescription saved successfully",
        data: result,
      });
    }
  } catch (error) {
    console.error("Error saving prescription:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getPrescriptionExamData = async (req, res) => {
  const { appointmentId } = req.params;
  try {
    console.log("[getPrescriptionExamData] Appointment ID:", appointmentId);
    const prescriptionData = await prescriptionService.getPrescriptionExamData(
      appointmentId
    );

    if (!prescriptionData) {
      return res.status(404).json({
        success: false,
        message: "No prescription data found for this appointment",
      });
    }

    res.status(200).json({
      success: true,
      data: prescriptionData,
    });
  } catch (error) {
    console.error("Error fetching prescription exam data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  savePrescription,
  getPrescriptionExamData,
};
