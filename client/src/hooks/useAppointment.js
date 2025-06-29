import { useState, useEffect, useCallback } from "react";
import {
  getDoctors,
  getSlots,
  createAppointment,
  checkExistingAppointment,
  getServices,
  getUserAppointments,
  confirmAppointmentPayment,
  getRegistrationStatistics,
  getPendingTestRequests,
  getPaymentHistory,
  approveTestRequest,
} from "../services/api";
import { getCurrentDate } from "../utils/dateUtil";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook for handling doctor appointment logic
 */
export const useDoctorAppointment = () => {
  const { isAuthenticated } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState("");
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

    // Create appointment immediately
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
        reason: reason.trim() || "Không có ghi chú",
        serviceType: "examination",
      });

      console.log("✅ CreateAppointment response:", res);

      const queueNumber =
        res?.queue_info?.queue_number || res?.queue_number || 1;

      const mappedData = {
        appointmentId: res?.appointment?.appointment_id,
        queueNumber: queueNumber,
        serviceName: `Khám bệnh - ${selectedDoctor.name}`,
        room: res?.room || "Chưa xác định",
        doctorOrStaff: selectedDoctor.name,
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

  const handlePaymentConfirmation = async (paymentMethod = "cash") => {
    if (!appointmentData?.appointmentId) {
      setError("Không tìm thấy thông tin đặt lịch");
      return false;
    }

    try {
      setLoading(true);
      await confirmAppointmentPayment(
        appointmentData.appointmentId,
        paymentMethod
      );
      console.log(
        "✅ Payment confirmed for appointment:",
        appointmentData.appointmentId
      );

      // Reset form after successful payment
      setSelectedDoctor(null);
      setSelectedTime(null);
      setReason("");

      return true;
    } catch (err) {
      console.error("❌ Payment confirmation error:", err);
      setError("Có lỗi xảy ra khi xác nhận thanh toán");
      return false;
    } finally {
      setLoading(false);
    }
  };

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
    reason,
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
    setReason,
    setError,
    setIsConfirmOpen,
    setIsReceiptOpen,
    handleBooking,
    handleConfirmBooking,
    handlePaymentConfirmation,

    // Computed
    isBookingReady,
    getExamPrice,
  };
};

/**
 * Hook for handling consultation appointment logic
 */
export const useConsultAppointment = () => {
  const { isAuthenticated } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedTime, setSelectedTime] = useState(null);
  const [consultType, setConsultType] = useState("video");
  const [reason, setReason] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [serviceConsultation, setServiceConsultation] = useState(null);

  // Fetch consultation service to get correct price
  useEffect(() => {
    const fetchService = async () => {
      try {
        const allServices = await getServices("consultation");
        const serviceList = allServices.data || allServices;
        const consultationService = Array.isArray(serviceList)
          ? serviceList.find(
              (s) => s.service_type === "consultation" && s.service_id === 2
            )
          : null;
        setServiceConsultation(consultationService);
      } catch (err) {
        console.error("Error fetching service:", err);
      }
    };
    fetchService();
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

  const getConsultPrice = () => {
    const basePrice = serviceConsultation ? serviceConsultation.price : 100000;
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
        2, // serviceId (2 = Tư vấn)
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

    // Create appointment immediately
    await handleConfirmBooking();
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await createAppointment({
        doctor_id: selectedDoctor.id,
        slot_id: selectedTime.id,
        service_id: 2, // Tư vấn
        bookingDate: selectedDate,
        reason: reason.trim() || "Không có ghi chú",
        serviceType: "consultation",
        consultation_type: consultType,
      });

      console.log("✅ CreateAppointment response:", res);

      const queueNumber =
        res?.queue_info?.queue_number || res?.queue_number || 1;

      const mappedData = {
        appointmentId: res?.appointment?.appointment_id,
        queueNumber: queueNumber,
        serviceName: `Tư vấn trực tuyến - ${selectedDoctor.name}`,
        room: "Online",
        doctorOrStaff: selectedDoctor.name,
        date: selectedDate,
        time: selectedTime.time_slot || selectedTime.time,
        fee: getConsultPrice(),
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

  const handlePaymentConfirmation = async (paymentMethod = "cash") => {
    if (!appointmentData?.appointmentId) {
      setError("Không tìm thấy thông tin đặt lịch");
      return false;
    }

    try {
      setLoading(true);
      await confirmAppointmentPayment(
        appointmentData.appointmentId,
        paymentMethod
      );
      console.log(
        "✅ Payment confirmed for appointment:",
        appointmentData.appointmentId
      );

      // Reset form after successful payment
      setSelectedDoctor(null);
      setSelectedTime(null);
      setReason("");

      return true;
    } catch (err) {
      console.error("❌ Payment confirmation error:", err);
      setError("Có lỗi xảy ra khi xác nhận thanh toán");
      return false;
    } finally {
      setLoading(false);
    }
  };

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
    consultType,
    reason,
    doctors,
    timeSlots,
    loading,
    doctorsLoading,
    error,
    isConfirmOpen,
    isReceiptOpen,
    appointmentData,
    serviceConsultation,

    // Actions
    setSelectedDoctor: handleDoctorChange,
    setSelectedDate: handleDateChange,
    setSelectedTime,
    setConsultType,
    setReason,
    setError,
    setIsConfirmOpen,
    setIsReceiptOpen,
    handleBooking,
    handleConfirmBooking,
    handlePaymentConfirmation,

    // Computed
    isBookingReady,
    getConsultPrice,
  };
};

/**
 * Hook for handling test appointment logic
 */
export const useTestAppointment = () => {
  const { isAuthenticated } = useAuth();
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [testTypes, setTestTypes] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  // Fetch test services
  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        setServicesLoading(true);
        const response = await getServices("test");
        console.log("API Response:", response);

        const servicesData = response.data || response;
        console.log("Services Data:", servicesData);

        if (Array.isArray(servicesData)) {
          setTestTypes(servicesData);
          console.log("Test Services loaded:", servicesData);
        } else {
          console.error("Services data is not an array:", servicesData);
          setError("Dữ liệu dịch vụ không hợp lệ");
        }
      } catch (err) {
        console.error("Error fetching test types:", err);
        setError("Không thể tải danh sách xét nghiệm");
      } finally {
        setServicesLoading(false);
      }
    };

    fetchTestTypes();
  }, []);

  const handleBooking = async () => {
    if (!isAuthenticated()) {
      alert("Vui lòng đăng nhập để đặt lịch xét nghiệm!");
      window.location.href = "/login/patient";
      return;
    }

    if (!selectedTestType) {
      alert("Vui lòng chọn loại xét nghiệm!");
      return;
    }

    if (!selectedDate) {
      alert("Vui lòng chọn ngày xét nghiệm!");
      return;
    }

    // Check existing appointment
    try {
      const existingCheck = await checkExistingAppointment(
        selectedTestType.service_id,
        selectedDate,
        null // no doctor for test
      );
      if (existingCheck.hasExisting) {
        alert(
          existingCheck.message ||
            "Bạn đã có lịch xét nghiệm loại này trong ngày này. Vui lòng chọn ngày khác hoặc hủy lịch cũ trước."
        );
        return;
      }
    } catch (err) {
      console.warn("Cannot check existing appointment:", err);
    }

    // Create appointment immediately
    await handleConfirmBooking();
  };

  const handleConfirmBooking = async () => {
    setError(null);

    try {
      const res = await createAppointment({
        service_id: selectedTestType.service_id,
        bookingDate: selectedDate,
        reason: reason.trim() || "Không có ghi chú",
        serviceType: "test",
      });

      console.log("✅ CreateAppointment response:", res);

      const queueNumber =
        res?.queue_info?.queue_number || res?.queue_number || 1;

      const mappedData = {
        appointmentId: res?.appointment?.appointment_id,
        queueNumber: queueNumber,
        serviceName: selectedTestType.name,
        room: "Phòng xét nghiệm",
        doctorOrStaff: "Nhân viên xét nghiệm",
        date: selectedDate,
        time: "Không cần đặt giờ cụ thể",
        fee: `${Number(selectedTestType.price).toLocaleString()}đ`,
        isDoctor: false,
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
    }
  };

  const handlePaymentConfirmation = async (paymentMethod = "cash") => {
    if (!appointmentData?.appointmentId) {
      setError("Không tìm thấy thông tin đặt lịch");
      return false;
    }

    try {
      await confirmAppointmentPayment(
        appointmentData.appointmentId,
        paymentMethod
      );
      console.log(
        "✅ Payment confirmed for appointment:",
        appointmentData.appointmentId
      );

      // Reset form after successful payment
      setSelectedTestType(null);
      setReason("");

      return true;
    } catch (err) {
      console.error("❌ Payment confirmation error:", err);
      setError("Có lỗi xảy ra khi xác nhận thanh toán");
      return false;
    }
  };

  const isBookingReady = () => {
    return selectedTestType !== null && selectedDate !== null;
  };

  return {
    // State
    selectedTestType,
    selectedDate,
    testTypes,
    servicesLoading,
    reason,
    error,
    isConfirmOpen,
    isReceiptOpen,
    appointmentData,

    // Actions
    setSelectedTestType,
    setSelectedDate,
    setReason,
    setError,
    setIsConfirmOpen,
    setIsReceiptOpen,
    handleBooking,
    handleConfirmBooking,
    handlePaymentConfirmation,

    // Computed
    isBookingReady,
  };
};

/**
 * Hook for handling appointment history logic
 */
export const useAppointmentHistory = () => {
  const { isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);

      console.log("🔄 Fetching appointments...");

      if (!isAuthenticated()) {
        alert("Vui lòng đăng nhập để xem lịch sử!");
        window.location.href = "/login/patient";
        return;
      }

      const response = await getUserAppointments();
      console.log("✅ API Response received:", response);

      const appointmentsData =
        response.listAppointments ||
        response.listAppointment ||
        response.appointments ||
        response.data ||
        response ||
        [];

      console.log("📋 Appointments data:", appointmentsData);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching appointments:", err);
      setError("Không thể tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getFilteredAppointments = () => {
    if (filter === "all") return appointments;
    return appointments.filter((apt) => apt.status === filter);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      requested: {
        text: "Chờ xác nhận",
        color: "bg-yellow-100 text-yellow-800",
      },
      confirmed: { text: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
      in_progress: {
        text: "Đang thực hiện",
        color: "bg-purple-100 text-purple-800",
      },
      completed: { text: "Hoàn thành", color: "bg-green-100 text-green-800" },
      cancelled: { text: "Đã hủy", color: "bg-red-100 text-red-800" },
    };

    const statusInfo = statusMap[status] || {
      text: status,
      color: "bg-gray-100 text-gray-800",
    };
    return statusInfo;
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    try {
      if (timeStr.includes("T")) {
        return timeStr.split("T")[1].substring(0, 5);
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  return {
    // State
    appointments,
    loading,
    error,
    filter,

    // Actions
    setFilter,
    fetchAppointments,

    // Computed
    getFilteredAppointments,
    getStatusBadge,
    formatDate,
    formatTime,
  };
};

/**
 * Hook for handling registration staff logic
 */
export const useRegistrationStaff = () => {
  const [testRequests, setTestRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [stats, setStats] = useState({
    pending_requests: 0,
    today_revenue: 0,
    processed_today: 0,
  });
  const [activeTab, setActiveTab] = useState("process");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data when component mounts and when tab changes
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Always fetch statistics
      const statsResponse = await getRegistrationStatistics();
      setStats(statsResponse.data);

      if (activeTab === "process") {
        // Fetch pending test requests
        console.log("Fetching pending test requests...");
        const pendingResponse = await getPendingTestRequests();
        console.log("Pending response:", pendingResponse);

        const requestsData = Array.isArray(pendingResponse.data)
          ? pendingResponse.data
          : [];
        setTestRequests(requestsData);
        console.log("Set testRequests to:", requestsData);
      } else if (activeTab === "history") {
        // Fetch payment history
        console.log("Fetching payment history...");
        const historyResponse = await getPaymentHistory();
        console.log("History response:", historyResponse);

        const historyData = Array.isArray(historyResponse.data)
          ? historyResponse.data
          : [];
        setCompletedRequests(historyData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProcessPayment = async (requestIndex, paymentMethod = "cash") => {
    const request = testRequests[requestIndex];

    try {
      setLoading(true);
      await approveTestRequest(request.appointment_id, paymentMethod);

      // Update UI
      setTestRequests((prev) =>
        prev.filter((_, index) => index !== requestIndex)
      );
      setStats((prev) => ({
        ...prev,
        pending_requests: prev.pending_requests - 1,
        processed_today: prev.processed_today + 1,
      }));

      console.log("✅ Test request approved successfully");
    } catch (err) {
      console.error("❌ Error approving test request:", err);
      setError("Không thể xử lý thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (activeTab === "process") {
      return testRequests.filter(
        (request) =>
          request.patient_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return completedRequests.filter(
        (request) =>
          request.patient_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("vi-VN");
  };

  return {
    // State
    testRequests,
    completedRequests,
    stats,
    activeTab,
    searchTerm,
    loading,
    error,

    // Actions
    setActiveTab,
    setSearchTerm,
    setError,
    fetchData,
    handleProcessPayment,

    // Computed
    getFilteredRequests,
    formatCurrency,
    formatDateTime,
  };
};
