import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { verifyVnpayReturn } from "../../services/api";
import AppointmentSuccessModal from "../../components/appointment/AppointmentSuccessModal";

const PaymentResult = () => {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState("processing"); // processing, success, failed
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  // const [transactionData, setTransactionData] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  useEffect(() => {
    const queryString = location.search.substring(1); // lấy phần query string từ URL sau dấu ?
    // const params = new URLSearchParams(queryString); // api có sẵn trong js để làm việc với queryString, cho phép duyệt qua từng cặp key-value
    //Muốn chuyển đổi lại về query String thì toString() là được.
    // const invoiceId = params.get("vnp_TxnRef"); // lấy giá trị của vnp_TxnRef từ query string

    if (queryString.toString()) {
      verifyVnpayReturn(queryString)
        .then((res) => {
          // Giả sử API trả về { code: '00', message: 'Success', data: {...} }
          if (res.code === "00") {
            setPaymentStatus("success");
            setMessage("Thanh toán thành công!");
            const mappedData = {
              queueNumber: res.appointmentData?.queue_number || null,
              serviceName: res.appointmentData?.service_name || "Chưa xác định",
              room: res.appointmentData?.room_name || "Chưa xác định",
              doctorOrStaff: res.appointmentData?.doctor_name
                ? "Doctor"
                : "Staff",
              date: res.appointmentData?.bookingDate || "Chưa xác định",
              time:
                res.appointmentData?.start_time -
                  res.appointmentData?.end_time ||
                "7:00 - 11:30 hoặc 13:30 - 17:00",
              fee: res.appointmentData?.fee || "0đ",
              isDoctor: res.appointmentData?.doctor_name ? true : false,
            };
            setAppointmentData(mappedData || null);
            setIsReceiptOpen(true);
            // setTransactionData(res.data);
          } else {
            setPaymentStatus("failed");
            setMessage(res.message || "Thanh toán thất bại. Vui lòng thử lại.");
            // setTransactionData(res.data);
          }
        })
        .catch((err) => {
          setPaymentStatus("failed");
          setMessage("Có lỗi xảy ra khi xác thực thanh toán.");
          console.error(err);
        });
    } else {
      setPaymentStatus("failed");
      setMessage("Không tìm thấy thông tin giao dịch.");
    }
  }, [location]);

  const renderStatusIcon = () => {
    if (paymentStatus === "success") {
      return <div className="text-green-500 text-6xl mb-4">✓</div>;
    }
    if (paymentStatus === "failed") {
      return <div className="text-red-500 text-6xl mb-4">✕</div>;
    }
    return (
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {renderStatusIcon()}
        <h1
          className={`text-2xl font-bold mb-4 ${
            paymentStatus === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </h1>
        <AppointmentSuccessModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          appointmentData={appointmentData}
        />
        <Link
          to="/appointment-history"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Xem lịch sử đặt lịch
        </Link>
      </div>
    </div>
  );
};

export default PaymentResult;
