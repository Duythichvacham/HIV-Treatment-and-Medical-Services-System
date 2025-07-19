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
const createARVRegiment = async (req, res) => {
  try {
    let { name, for_group, components, is_active } = req.body;

    // Rào chắn: ép kiểu về boolean
    if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") is_active = true;
      else if (is_active.toLowerCase() === "false") is_active = false;
    }
if (is_active === 1) is_active = true;
if (is_active === 0) is_active = false;
    // Nếu sau khi xử lý mà vẫn không phải boolean → lỗi
    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "`is_active` phải là true hoặc false",
      });
    }

    const result = await arvRegimenService.createARV(
      name,
      for_group,
      components,
      is_active
    );

    res.status(201).json({
      success: true,
      data: result,
      message: "Tạo phác đồ thành công!",
    });
  } catch (error) {
    console.error("[API] createService error:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi thêm phác đồ",
    });
  }
};
const updateARVRegimen = async (req, res) => {
  try {
    const id = req.params.id; // /api/arv-regimens/:id
    const { name, for_group, components, is_active } = req.body;

    // Chặn update `is_active` nếu client cố tình gửi lên
    if (is_active !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Không được phép cập nhật trường 'is_active'",
      });
    }

    const updated = await arvRegimenService.updateARV(
      id,
      name,
      for_group,
      components
    );

    res.status(200).json({
      success: true,
      data: updated,
      message: "Cập nhật phác đồ thành công!",
    });
  } catch (error) {
    console.error("[API] updateARVRegimen error:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi cập nhật phác đồ",
    });
  }
};

const setActiveARV = async (req, res) => {
  try {
    const id = req.params.id;
    let { is_active } = req.body;

    if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") is_active = true;
      else if (is_active.toLowerCase() === "false") is_active = false;
    }
if (is_active === 1) is_active = true;
if (is_active === 0) is_active = false;
    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "`is_active` phải là true hoặc false",
      });
    }

    const updated = await arvRegimenService.setActiveARV(is_active, id);

    res.status(200).json({
      success: true,
      data: updated,
      message: "Cập nhật phác đồ thành công!",
    });
  } catch (error) {
    console.error("[API] updateARVRegimen error:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi cập nhật phác đồ",
    });
  }
};


module.exports = {
  setActiveARV,
  updateARVRegimen,
  createARVRegiment,
  getAllARVRegimens,
  getARVRegimenById,
};
