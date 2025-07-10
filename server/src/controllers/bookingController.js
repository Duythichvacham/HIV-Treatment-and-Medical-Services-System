const appointmentService = require("../services/appointmentService");

exports.cancelBooking = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId; // Lấy từ URL

    const updatedData = await appointmentService.cancelBooking(invoiceId);

    res.json({
      message: updatedData.message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const accountId = req.user.userId;

    // Sử dụng function có sẵn thay vì query trực tiếp
    const patientId = await appointmentService.getPatientIdByAccountId(
      accountId
    );

    // Gọi service để tạo booking
    const bookingResult = await appointmentService.createBooking({
      ...req.body,
      patientId,
    });

    res.status(201).json(bookingResult);
  } catch (error) {
    if (error.message === "PATIENT_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy bệnh nhân tương ứng với tài khoản này",
      });
    }
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};
