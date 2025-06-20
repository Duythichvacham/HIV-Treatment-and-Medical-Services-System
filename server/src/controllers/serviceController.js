const { getServicesByType } = require("../services/serviceService");
exports.getTestServices = async (req, res, next) => {
  try {
    const testService = await getServicesByType(req.query.type || "test");
    res.json({
      message: "Lấy danh sách dịch vụ xét nghiệm thành công",
      data: testService,
    });
  } catch (error) {
    next(error);
  }
};
