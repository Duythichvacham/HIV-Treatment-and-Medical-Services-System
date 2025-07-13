const userService = require("../services/userService");
const serviceService = require("../services/serviceService");
const slotService = require("../services/slots/slotService");
const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    return res.status(200).json({
      message: "Users fetched successfully",
      data: users || [],
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const createService = async (req, res) => {
  try {
    const { name, service_type, description, price } = req.body;

    // Kiểm tra tên đã tồn tại hay chưa
    const checkName = await serviceService.checkNameService(name);

    if (!checkName) {
      return res.status(400).json({
        success: false,
        message: "Dịch vụ này đã tồn tại!",
      });
    }

    const result = await serviceService.createServiceDB(
      name,
      service_type,
      description,
      price
    );

    res.status(201).json({
      success: true,
      data: result,
      message: "Tạo dịch vụ thành công !",
    });
  } catch (error) {
    console.error("[API] createService error:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi thêm dịch vụ",
    });
  }
};

const setActive = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const is_active = req.body.is_active;
    if (typeof is_active !== "boolean") {
      return res
        .status(400)
        .json({ message: "Giá trị is_active phải là true hoặc false" });
    }
    const updated = await serviceService.setActiveService(
      parseInt(serviceId),
      is_active
    );
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
    }

    return res.status(200).json({
      success: true,
      message: is_active
        ? "Mở lại dịch vụ thành công"
        : "Ẩn dịch vụ thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái cho service ! " + error.message,
    });
  }
};

const createSlot = async (req, res) => {
  try {
    const { start_time, end_time } = req.body;

    // Gọi hàm kiểm tra thời gian đã tồn tại hay chưa
    const checkTime = await slotService.checkTimeSlot(start_time, end_time);

    if (checkTime.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Thời gian làm việc này đã tồn tại!",
      });
    }

    // Nếu không trùng thì tạo mới
    const result = await slotService.createSlotDB(start_time, end_time);

    res.status(201).json({
      success: true,
      data: result,
      message: "Tạo thành công!",
    });
  } catch (error) {
    console.error("[API] createSlot error:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi thêm slot!",
    });
  }
};

module.exports = {
  getUsers,
  createService,
  setActive,
  createSlot,
};
