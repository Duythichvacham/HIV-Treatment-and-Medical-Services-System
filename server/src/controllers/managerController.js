const userService = require("../services/userService");
const serviceService = require("../services/serviceService");
const slotService = require("../services/slots/slotService");
const roomService = require("../services/roomService");
const doctorService = require("../services/doctorService");
const workingShiftService = require("../services/workingShiftService");
const invoiceService = require("../services/invoiceService");

const getRevenue = async (req, res) => {
  try {
    const { status, group } = req.query;
    const revenue = await invoiceService.getRevenue(status, group);
    res.status(200).json({
      success: true,
      data: revenue,
      message: "Lấy doanh thu thành công",
    });
  } catch (error) {
    console.error("[API] getRevenue error:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy doanh thu",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    console.log("[MANAGER] getUsers called");
    console.log("[MANAGER] User from middleware:", req.user);

    const users = await userService.getUsers();
    console.log("[MANAGER] Users fetched:", users?.length || 0);

    return res.status(200).json({
      message: "Users fetched successfully",
      data: users || [],
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getAllServices = async (req, res) => {
  try {
    const services = await serviceService.getAllServicesForManager();
    if (!services || services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ nào",
      });
    }

    res.status(200).json({
      success: true,
      data: services,
      message: "Lấy danh sách dịch vụ thành công",
    });
  } catch (error) {
    console.error("[API] getAllServices error:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy danh sách dịch vụ",
    });
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

const getAllWorkingShift = async (req, res) => {
  try {
    const listWork = await workingShiftService.getAllWorkingShiftDB();

    return res.status(200).json({
      message: "list working !",
      data: listWork || [],
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createShift = async (req, res) => {
  try {
    let {
      doctor_id,
      lab_staff_id,
      registration_staff_id,
      shift_date,
      room_id,
    } = req.body;
    const account_id = req.user.userId;
    // Ép kiểu is_active
    // if (typeof is_active === "string") {
    //   if (is_active.toLowerCase() === "true") is_active = true;
    //   else if (is_active.toLowerCase() === "false") is_active = false;
    // }

    // if (typeof is_active !== "boolean") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "`is_active` phải là true hoặc false",
    //   });
    // }

    const result = await workingShiftService.createShift({
      account_id,
      doctor_id,
      lab_staff_id,
      registration_staff_id,
      shift_date,
      room_id,
      status: "approved", // Default status instead of is_active
    });

    res.status(201).json({
      success: true,
      data: result,
      message: "Tạo ca làm việc thành công!",
    });
  } catch (error) {
    console.error("[API] createShift error:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi thêm ca làm việc",
    });
  }
};

const updateShift = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      doctor_id,
      lab_staff_id,
      registration_staff_id,
      shift_date,
      room_id,
      status,
    } = req.body;

    const updated = await workingShiftService.updateShift(id, {
      doctor_id,
      lab_staff_id,
      registration_staff_id,
      shift_date,
      room_id,
      status,
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: "Cập nhật ca làm việc thành công!",
    });
  } catch (error) {
    console.error("[API] updateShift error:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi cập nhật ca làm việc",
    });
  }
};

// const setActiveShift = async (req, res) => {
//   try {
//     const id = req.params.id;
//     let { is_active } = req.body;

//     if (typeof is_active === "string") {
//       if (is_active.toLowerCase() === "true") is_active = true;
//       else if (is_active.toLowerCase() === "false") is_active = false;
//     }

//     if (typeof is_active !== "boolean") {
//       return res.status(400).json({
//         success: false,
//         message: "`is_active` phải là true hoặc false",
//       });
//     }

//     const updated = await workingShiftService.setActiveShift(id, is_active);

//     res.status(200).json({
//       success: true,
//       data: updated,
//       message: "Cập nhật trạng thái ca làm việc thành công!",
//     });
//   } catch (error) {
//     console.error("[API] setActiveShift error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Có lỗi xảy ra khi cập nhật trạng thái ca làm việc",
//     });
//   }
// };
// lấy ds room cho working shift
const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await roomService.getAvailableRooms();
    if (!rooms || rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng nào",
      });
    }

    res.status(200).json({
      success: true,
      rooms,
      message: "Lấy danh sách phòng thành công",
    });
  } catch (error) {
    console.error("[API] getAvailableRooms error:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy danh sách phòng",
    });
  }
};
const getDoctorsForDropdown = async (req, res) => {
  try {
    const doctors = await doctorService.getDoctorsForDropdown();
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bác sĩ nào",
      });
    }

    res.status(200).json({
      success: true,
      data: doctors,
      message: "Lấy danh sách bác sĩ thành công",
    });
  } catch (error) {
    console.error("[API] getDoctorsForDropdown error:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy danh sách bác sĩ",
    });
  }
};
module.exports = {
  getAllWorkingShift,
  createShift,
  updateShift,
  getUsers,
  createService,
  setActive,
  createSlot,
  getAllServices,
  getAvailableRooms,
  getDoctorsForDropdown,
  getRevenue,
};
