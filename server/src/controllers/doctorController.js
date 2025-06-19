const doctorService = require("../services/doctorService");

// GET: Lấy danh sách lịch hẹn đang chờ khám hoặc tư vấn
exports.getAppointmentQueue = async (req, res) => {
  try {
    // const doctor_id = req.user.doctor_id;
    const doctor_id = 1;
    const queue = await doctorService.getAppointmentsByStatus(
      doctor_id,
      "requested"
    );
    // const queue = await doctorService.test(1);
    res.status(200).json({
      message: "Lấy danh sách lịch hẹn chờ của bác sĩ thành công",
      data: queue,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET lấy danh sách bệnh nhân đang khám
exports.getAppointmentInProgress = async (req, res) => {
  try {
    const in_progress = await doctorService.getAppointmentsByStatus(
      doctorId,
      "in_progress"
    );
    res.status(200).json({
      message: "Lấy danh sách bệnh nhân đang khám thành công",
      data: in_progress,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET lấy danh sách bệnh nhân hoàn thành khám
exports.getAppointmentFinshed = async (req, res) => {
  try {
    const finished = await doctorService.getAppointmentsByStatus(
      doctorId,
      "completed"
    );
    res.status(200).json({
      message: "Lấy danh sách bệnh nhân hoàn thành khám thành công",
      data: finished,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
