const appointmentService = require("../services/appointmentService");
const testRequestService = require("../services/testRequestService");
const labstaffService = require("../services/labstaffService");

const getTestRequests = async (req, res) => {
  try {
    const { bookingDate } = req.query;
    const testRequests = await testRequestService.getTestRequests(bookingDate);
    res.status(200).json(testRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching test requests", error });
  }
};

const getAppointments = async (req, res) => {
  try {
    let lab_staff_id = req.user.lab_staff_id;
    let service_type = "test";

    const { status, bookingDate, slot_id, patient_id } = req.query;

    const appointments = await appointmentService.getAppointments(
      null, // Không có doctorId vì là lab
      status,
      bookingDate,
      slot_id,
      patient_id,
      service_type
    );
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error });
  }
};

const saveTestResults = async (req, res) => {
  try {
    const {
      request_id,
      appointment_id,
      created_by_id,
      test_datetime,
      notes,
      test_results,
    } = req.body;

    // Validate input
    if (
      !appointment_id ||
      !created_by_id ||
      !test_datetime ||
      !test_results ||
      !Array.isArray(test_results)
    ) {
      return res
        .status(400)
        .json({ message: "Thiếu hoặc sai định dạng dữ liệu đầu vào" });
    }

    // if (
    //   test_results.some(
    //     (result) => !result.test_type_id || !result.result_value
    //   )
    // ) {
    //   return res.status(400).json({
    //     message: "Test results phải chứa test_type_id và result_value",
    //   });
    // }

    const result = await labstaffService.saveTestResults({
      request_id: request_id || null,
      appointment_id,
      created_by_id,
      test_datetime,
      notes: notes || null,
      test_results,
    });

    res
      .status(201)
      .json({ message: "Lưu kết quả xét nghiệm thành công", data: result });
  } catch (error) {
    console.error("Error in saveTestResults:", error);
    res.status(500).json({
      message: "Lỗi khi lưu kết quả xét nghiệm",
      error: error.message,
    });
  }
};

module.exports = {
  getAppointments,
  getTestRequests,
  saveTestResults,
};
