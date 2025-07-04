const arvRegimenService = require("../services/arvRegimenService");

const getAllARVRegimens = async (req, res) => {
  try {
    const regimens = await arvRegimenService.getAllARVRegimens();
    res.status(200).json({
      success: true,
      message: "ARV regimens fetched successfully",
      data: regimens,
    });
  } catch (error) {
    console.error("Error fetching ARV regimens:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getARVRegimenById = async (req, res) => {
  const regimenId = req.params.id;
  try {
    const regimen = await arvRegimenService.getARVRegimenById(regimenId);
    if (!regimen) {
      return res.status(404).json({ message: "ARV regimen not found" });
    }
    res.status(200).json({
      success: true,
      message: "ARV regimen fetched successfully",
      data: regimen,
    });
  } catch (error) {
    console.error("Error fetching ARV regimen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllARVRegimens,
  getARVRegimenById,
};
