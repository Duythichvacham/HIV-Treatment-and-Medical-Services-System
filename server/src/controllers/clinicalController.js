const clinicalService = require("../services/clinicalService");

const saveClinicalExam = async (req, res) => {
  try {
    const {
      appointment_id,
      vitals,
      weight,
      height,
      bmi,
      clinical_signs,
      diagnosis_primary,
      diagnosis_secondary,
      action,
    } = req.body;

    // Validate required fields
    if (!appointment_id) {
      return res.status(400).json({
        success: false,
        message: "appointment_id is required",
      });
    }

    // If action is "complete", validate all required fields
    if (action === "complete") {
      if (
        !vitals ||
        !weight ||
        !height ||
        !clinical_signs ||
        !diagnosis_primary
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required for completing exam",
        });
      }
    }

    const result = await clinicalService.saveClinicalExam({
      appointment_id,
      vitals,
      weight,
      height,
      bmi,
      clinical_signs,
      diagnosis_primary,
      diagnosis_secondary,
      action,
    });

    res.status(200).json({
      success: true,
      message:
        action === "complete"
          ? "Clinical exam completed successfully"
          : "Clinical exam saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving clinical exam:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  saveClinicalExam,
};
