const slotService = require("../services/slotService");
// (GET, lấy danh sách slot
const getSlots = async (req, res) => {
  try {
    const slots = await slotService.getAllSlots();
    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  getSlots,
};
