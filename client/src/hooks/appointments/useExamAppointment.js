import { useState, useEffect } from "react";
import {
  getDoctors,
  getSlots,
  createAppointment,
  checkExistingAppointment,
  getServices,
  createVNPayURL,
} from "../../services/api";
import { getCurrentDate } from "../../utils/dateUtil";
import { useAuth } from "../../contexts/AuthContext";
/**
 * Hook for handling doctor appointment logic
 */
export const useExamAppointment = () => {
  const { isAuthenticated } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedTime, setSelectedTime] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [serviceExamination, setServiceExamination] = useState(null);

  // Fetch examination service to get correct price
  useEffect(() => {
    const fetchService = async () => {
      try {
        const allServices = await getServices("examination");
        const serviceList = allServices.data || allServices;
        const examinationService = Array.isArray(serviceList)
          ? serviceList.find(
              (s) => s.service_type === "examination" && s.service_id === 1
            )
          : null;
        setServiceExamination(examinationService);
      } catch (err) {
        console.error("Error fetching service:", err);
      }
    };
    fetchService();
  }, []);

  // Update current date when component mounts
  useEffect(() => {
    const today = getCurrentDate();
    setSelectedDate(today);
  }, []);

  // Fetch doctors when date changes
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);
        const doctorsData = await getDoctors(selectedDate);
        setDoctors(doctorsData);
      } catch (err) {
        setError("Không thể tải danh sách bác sĩ");
        console.error("Error fetching doctors:", err);
      } finally {
        setDoctorsLoading(false);
      }
    };

    if (selectedDate) {
      fetchDoctors();
    }
  }, [selectedDate]);

  // Fetch time slots when date or doctor changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !selectedDoctor) return;

      try {
        setLoading(true);
        const slotsData = await getSlots(selectedDate, selectedDoctor.id);

        const transformedSlots = slotsData.map((slot) => {
          const formatTime = (timeStr) => {
            if (!timeStr) return "";
            if (typeof timeStr === "string" && timeStr.includes("T")) {
              const timePart = timeStr.split("T")[1];
              return timePart.substring(0, 5);
            }
            return timeStr.toString().substring(0, 5);
          };

          const startTime = formatTime(slot.start_time);
          const endTime = formatTime(slot.end_time);

          return {
            id: slot.slot_id,
            time_slot: `${startTime} - ${endTime}`,
            time: `${startTime} - ${endTime}`,
            available_slots: Number(slot.available_spots) || 0,
            available: Number(slot.available_spots) || 0,
            status:
              slot.available_spots && slot.available_spots > 0
                ? "available"
                : "full",
          };
        });
        setTimeSlots(transformedSlots);
      } catch (err) {
        setError("Không thể tải danh sách khung giờ");
        console.error("Error fetching slots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedDoctor]);

  const getExamPrice = () => {
    const basePrice = serviceExamination ? serviceExamination.price : 150000;
    return `${Number(basePrice).toLocaleString()}đ`;
  };

  const handleBooking = async () => {
    // Check authentication
    if (!isAuthenticated()) {
      alert("Vui lòng đăng nhập để đặt lịch khám!");
      window.location.href = "/login/patient";
      return;
    }

    if (!selectedDoctor || !selectedTime) {
      alert("Vui lòng chọn bác sĩ và khung giờ!");
      return;
    }

    // Check existing appointment
    try {
      setLoading(true);
      const existingCheck = await checkExistingAppointment(
        1, // serviceId (1 = Khám bệnh)
        selectedDate,
        selectedDoctor.id
      );
      if (existingCheck.hasExisting) {
        alert(
          existingCheck.message ||
            "Bạn đã có lịch khám trong ngày này. Vui lòng chọn ngày khác hoặc hủy lịch cũ trước."
        );
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Cannot check existing appointment:", err);
    }

    // Create appointment immediately - when want to bypass payment -> create function to set status of invoice
    // after validate -> create appointment and invoice
    await handleConfirmBooking();
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await createAppointment({
        doctor_id: selectedDoctor.id,
        slot_id: selectedTime.id,
        service_id: 1, // Khám bệnh
        bookingDate: selectedDate,
        serviceType: "examination",
      });

      console.log("✅ CreateAppointment response:", res);

      const queueNumber =
        res?.queue_info?.queue_number || res?.queue_number || 1;

      const mappedData = {
        appointmentId: res?.appointment?.appointment_id,
        invoiceId: res?.invoice_id,
        queueNumber: queueNumber,
        serviceName: `Khám bệnh - ${selectedDoctor.name}`,
        room: res?.appointment?.room_name || "Chưa xác định",
        doctorOrStaff: res?.appointment?.doctor_name || selectedDoctor.name,
        date: selectedDate,
        time: selectedTime.time_slot || selectedTime.time,
        fee: getExamPrice(),
        isDoctor: true,
      };

      setAppointmentData(mappedData);
      setIsConfirmOpen(true); // Show payment confirmation modal

      // Don't reset form yet - wait for payment confirmation
    } catch (err) {
      let msg = "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!";
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      setIsConfirmOpen(false);
      console.error("Error booking appointment:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleVnpayPayment = async () => {
    if (!appointmentData?.invoiceId || !appointmentData.fee) {
      setError("Thông tin hoá đơn không đầy đủ để thanh toán.");
      return;
    }

    try {
      // Chuyển đổi chuỗi tiền tệ "120.000đ" thành số 120000
      const amount = parseInt(appointmentData.fee.replace(/[^0-9]/g, ""), 10);
      if (isNaN(amount)) {
        setError("Số tiền không hợp lệ.");
        return;
      }

      const vnpayResponse = await createVNPayURL(
        appointmentData.invoiceId,
        amount
      );

      if (vnpayResponse.url) {
        // Chuyển hướng người dùng đến cổng thanh toán VNPAY
        window.location.href = vnpayResponse.url;
      } else {
        setError("Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Lỗi khi tạo yêu cầu thanh toán VNPAY.");
      console.error("VNPAY payment creation error:", err);
    }
  };
  // const handlePaymentConfirmation = async (paymentMethod = "cash") => {
  //   if (!appointmentData?.appointmentId) {
  //     setError("Không tìm thấy thông tin đặt lịch");
  //     return false;
  //   }

  //   try {
  //     setLoading(true);
  //     await confirmAppointmentPayment(
  //       appointmentData.appointmentId,
  //       paymentMethod
  //     );
  //     console.log(
  //       "✅ Payment confirmed for appointment:",
  //       appointmentData.appointmentId
  //     );

  //     // Reset form after successful payment
  //     setSelectedDoctor(null);
  //     setSelectedTime(null);
  //     setReason("");

  //     return true;
  //   } catch (err) {
  //     console.error("❌ Payment confirmation error:", err);
  //     setError("Có lỗi xảy ra khi xác nhận thanh toán");
  //     return false;
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const isBookingReady = () => {
    return selectedDoctor !== null && selectedTime !== null;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedDoctor(null);
    setSelectedTime(null);
  };

  const handleDoctorChange = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedTime(null);
  };

  return {
    // State
    selectedDoctor,
    selectedDate,
    selectedTime,
    doctors,
    timeSlots,
    loading,
    doctorsLoading,
    error,
    isConfirmOpen,
    isReceiptOpen,
    appointmentData,
    serviceExamination,

    // Actions
    setSelectedDoctor: handleDoctorChange,
    setSelectedDate: handleDateChange,
    setSelectedTime,
    setError,
    setIsConfirmOpen,
    setIsReceiptOpen,
    handleBooking,
    handleConfirmBooking,
    handleVnpayPayment,
    // Computed
    isBookingReady,
    getExamPrice,
  };
};
