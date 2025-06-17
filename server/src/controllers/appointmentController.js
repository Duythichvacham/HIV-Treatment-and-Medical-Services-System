const appointmentService = require('../services/appointmentService');

exports.updateStatus = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { status, doctor_id } = req.body;

    const validStatus = ['requested', 'in_progress', 'completed', 'cancelled'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!doctor_id) {
      // Cập nhật status cho Appointment
      const appointment = await appointmentService.updateAppointmentStatus(appointment_id, status);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      return res.json({ message: 'Appointment status updated', appointment });
    } else {
      // Cập nhật status cho TestRequest
      const testRequest = await appointmentService.updateTestRequestStatus(appointment_id, doctor_id, status);
      if (!testRequest) {
        return res.status(404).json({ message: 'TestRequest not found' });
      }
      return res.json({ message: 'TestRequest status updated', testRequest });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};