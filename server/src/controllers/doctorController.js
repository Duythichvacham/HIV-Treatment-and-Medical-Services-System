const doctorService = require("../services/doctorService");
// (GET, lấy danh sách bác sĩ)
const getDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getDoctors();
    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  getDoctors,
};
