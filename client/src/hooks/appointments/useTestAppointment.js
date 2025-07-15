import { useState, useEffect } from "react";
import {
  createAppointment,
  checkExistingAppointment,
  getServices,
  createVNPayURL,
  cancelTransaction,
} from "../../services/api";
import { getCurrentDate } from "../../utils/dateUtil";
import { useAuth } from "../../contexts/AuthContext";
/**
 * Hook for handling test appointment logic
 */
export const useTestAppointment = () => {
  const { isAuthenticated } = useAuth();
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [testTypes, setTestTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
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

    // Create appointment immediately - when want to bypass payment
    await handleConfirmBooking();
  };
  // tạo hóa đơn và đặt lịch
  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await createAppointment({
        service_id: selectedTestType.service_id,
        bookingDate: selectedDate,
        serviceType: "test",
      });

      console.log("✅ CreateAppointment response:", res);

      const queueNumber =
        res?.queue_info?.queue_number || res?.queue_number || 1;

      const mappedData = {
        appointmentId: res?.appointment?.appointment_id,
        invoiceId: res?.invoice_id,
        queueNumber: queueNumber,
        serviceName: selectedTestType.name,
        room: res?.appointment?.room_name || "Phòng xét nghiệm A",
        doctorOrStaff: "Nhân viên xét nghiệm",
        date: selectedDate,
        time: "7:00 - 11:30 hoặc 13:30 - 17:00",
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
    } finally {
      setLoading(false);
    }
  };
  const handleCancelBooking = async () => {
    if (!appointmentData?.invoiceId) {
      setError("Không tìm thấy thông tin hóa đơn để hủy");
      return;
    }

    try {
      setIsConfirmOpen(false);
      setLoading(true);
      await cancelTransaction(appointmentData.invoiceId);
      console.log("✅ Transaction cancelled successfully");

      // Reset form after cancellation
      setSelectedTestType(null);
      setAppointmentData(null);
    } catch (err) {
      console.error("❌ Cancel transaction error:", err);
      setError("Lỗi khi hủy giao dịch. Vui lòng thử lại.");
      // Vẫn đóng modal ngay cả khi có lỗi
      setIsConfirmOpen(false);
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
  //     await confirmAppointmentPayment(
  //       appointmentData.appointmentId,
  //       paymentMethod
  //     );
  //     console.log(
  //       "✅ Payment confirmed for appointment:",
  //       appointmentData.appointmentId
  //     );

  //     // Reset form after successful payment
  //     setSelectedTestType(null);
  //     setReason("");

  //     return true;
  //   } catch (err) {
  //     console.error("❌ Payment confirmation error:", err);
  //     setError("Có lỗi xảy ra khi xác nhận thanh toán");
  //     return false;
  //   }
  // };

  const isBookingReady = () => {
    return selectedTestType !== null && selectedDate !== null;
  };

  return {
    // State
    selectedTestType,
    selectedDate,
    testTypes,
    loading,
    servicesLoading,
    error,
    isConfirmOpen,
    isReceiptOpen,
    appointmentData,

    // Actions
    setSelectedTestType,
    setSelectedDate,
    setError,
    setIsConfirmOpen,
    setIsReceiptOpen,
    handleBooking,
    handleConfirmBooking,
    handleVnpayPayment,
    handleCancelBooking,
    // Computed
    isBookingReady,
  };
};
