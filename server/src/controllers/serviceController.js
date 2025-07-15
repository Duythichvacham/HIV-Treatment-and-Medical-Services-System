const { getServicesByType } = require("../services/serviceService");

exports.getServices = async (req, res, next) => {
  try {
    const services = await getServicesByType(req.query.type);
    res.json({
      message: "Lấy danh sách dịch vụ thành công",
      data: services,
    });
  } catch (error) {
    next(error);
  }
};
