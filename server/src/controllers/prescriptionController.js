const prescriptionService = require("../services/prescriptionService");

const savePrescription = async (req, res) => {
  try {
    const {
      appointment_id,
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes,
    } = req.body;

    // Validate required fields
    if (!appointment_id) {
      return res.status(400).json({
        success: false,
        message: "appointment_id is required",
      });
    }

    const result = await prescriptionService.savePrescription({
      appointment_id,
      arv_regimen_id,
      support_drugs,
      counseling_notes,
      follow_up_plan,
      doctor_notes,
    });

    res.status(200).json({
      success: true,
      message: "Prescription saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving prescription:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const savePrescriptionDetails = async (req, res) => {
  try {
    const { arv_regimen_id, drug } = req.body;

    // Validate required fields
    if (!arv_regimen_id || !drug || !Array.isArray(drug)) {
      return res.status(400).json({
        success: false,
        message: "arv_regimen_id and drug array are required",
      });
    }

    const result = await prescriptionService.savePrescriptionDetails({
      arv_regimen_id,
      drug,
    });

    res.status(200).json({
      success: true,
      message: "Prescription details saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving prescription details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  savePrescription,
  savePrescriptionDetails,
};
