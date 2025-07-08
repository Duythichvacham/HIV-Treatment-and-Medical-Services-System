const {
  getServicesByType,
  getAllServices,
} = require("../services/serviceService");

exports.getTestServices = async (req, res, next) => {
  try {
    let services;
    if (req.query.type) {
      services = await getServicesByType(req.query.type);
    } else {
      services = await getAllServices();
    }

    res.json({
      message: "Lấy danh sách dịch vụ thành công",
      data: services,
    });
  } catch (error) {
    next(error);
  }
};
