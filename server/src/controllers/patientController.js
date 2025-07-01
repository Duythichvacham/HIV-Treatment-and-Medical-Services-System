const patientService = require("../services/patientService");

const getCurrentARVRegimen = async (req, res) => {
  const patientId = req.params.patientId;

  try {
    const regimen = await patientService.getCurrentARVRegimen(patientId);
    if (!regimen) {
      return res.status(404).json({ message: "ARV regimen not found" });
    }
    res.status(200).json({
      success: true,
      message: "Current ARV regimen fetched successfully",
      data: regimen,
    });
  } catch (error) {
    console.error("Error fetching current ARV regimen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getLatestTestResults = async (req, res) => {
  const patientId = req.params.patientId;

  try {
    const results = await patientService.getLatestTestResults(patientId);
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "No test results found" });
    }
    res.status(200).json({
      success: true,
      message: "Latest test results fetched successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error fetching latest test results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getCurrentARVRegimen,
  getLatestTestResults,
};
