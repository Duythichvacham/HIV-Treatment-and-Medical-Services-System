const slotService = require("../services/slots/slotService");

const getFullTimeSlots = async (req, res) => {
  try {
    const slots = await slotService.getFullTimeSlots();
    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error("Error fetching full time slots:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// (GET, lấy danh sách slot có sẵn - filter theo doctor và date)
const getSlots = async (req, res) => {
  try {
    const { doctor_id, date } = req.query;

    let slots;
    if (doctor_id && date) {
      // Lấy slots có sẵn cho doctor trong ngày được chỉ định
      slots = await slotService.getAvailableSlots(doctor_id, date);
    } else {
      // Lấy tất cả slots (fallback cho compatibility)
      slots = await slotService.getAllSlots();
    }

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
  getFullTimeSlots,
};
