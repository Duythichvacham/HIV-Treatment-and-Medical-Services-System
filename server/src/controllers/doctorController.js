const doctorService = require("../services/doctorService");

// GET: Lấy danh sách lịch hẹn đang chờ khám hoặc tư vấn
const getAppointmentQueue = async (req, res) => {
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
const getAppointmentInProgress = async (req, res) => {
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
const getAppointmentFinshed = async (req, res) => {
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
// (GET, lấy danh sách bác sĩ - có thể filter theo ngày)
const getDoctors = async (req, res) => {
  try {
    const { date } = req.query;
    console.log("getDoctors called with date:", date);

    let doctors;
    if (date) {
      // Lấy doctors có ca làm việc trong ngày được chỉ định
      console.log("Fetching doctors by date:", date);
      doctors = await doctorService.getDoctorsByDate(date);
    } else {
      // Lấy tất cả doctors
      console.log("Fetching all doctors");
      doctors = await doctorService.getDoctors();
    }

    console.log("Found doctors:", doctors.length);
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
  getAppointmentQueue,
  getAppointmentInProgress,
  getAppointmentFinshed,
};
