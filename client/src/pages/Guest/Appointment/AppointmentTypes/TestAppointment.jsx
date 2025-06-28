import React, { useState, useEffect } from "react";
import {
  createAppointment,
  getServices,
  checkExistingAppointment,
} from "../../../../services/api";
import { getCurrentDate } from "../../../../utils/dateUtil";
import AppointmentConfirmModal from "../../../../components/common/AppointmentConfirmModal";
import AppointmentSuccessModal from "../../../../components/common/AppointmentSuccessModal";
import { useAuth } from "../../../../contexts/AuthContext";

const TestAppointment = () => {
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
        const response = await getServices();
        console.log("API Response:", response);

        // Handle both direct array and data.data structure
        const servicesData = response.data || response;
        console.log("Services Data:", servicesData);

        if (Array.isArray(servicesData)) {
          // Filter only test services
          const testServices = servicesData.filter(
            (service) =>
              service.service_type === "test" ||
              service.category === "test" ||
              service.name.toLowerCase().includes("xét nghiệm") ||
              service.name.toLowerCase().includes("test")
          );
          console.log("Filtered Test Services:", testServices);
          setTestTypes(testServices);
        } else {
          console.error("Services data is not an array:", servicesData);
          setError("Dữ liệu dịch vụ không hợp lệ");
        }
      } catch (err) {
        setError("Không thể tải danh sách xét nghiệm");
        console.error("Error fetching test types:", err);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchTestTypes();
  }, []);
  const handleBooking = async () => {
    // Kiểm tra authentication trước
    if (!isAuthenticated()) {
      alert("Vui lòng đăng nhập để đặt lịch khám!");
      window.location.href = "/login/patient";
      return;
    }

    if (!selectedTestType || !selectedDate) {
      alert("Vui lòng chọn loại xét nghiệm và ngày!");
      return;
    }

    // Check existing appointment
    try {
      const existingCheck = await checkExistingAppointment(
        selectedTestType.service_id, // serviceId
        selectedDate, // bookingDate
        null // doctorId (null for test)
      );
      if (existingCheck.hasExisting) {
        alert(
          existingCheck.message ||
            "Bạn đã có lịch xét nghiệm này chưa hoàn thành. Vui lòng hoàn thành trước khi đặt lại."
        );
        return;
      }
    } catch (err) {
      console.warn("Cannot check existing appointment:", err);
      // Continue anyway if check fails
    }

    setAppointmentData({
      serviceName: selectedTestType.name,
      date: selectedDate,
      time: "Trong giờ làm việc",
      fee: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(selectedTestType.price || 0),
      isDoctor: false,
      room: "Phòng xét nghiệm",
      doctorOrStaff: "Nhân viên xét nghiệm",
    });
    setIsConfirmOpen(true);
  };
  const handleConfirmBooking = async () => {
    try {
      const requestData = {
        service_id: selectedTestType.service_id || selectedTestType.id, // Fix: use service_id
        bookingDate: selectedDate,
        reason: reason.trim() || "Xét nghiệm định kỳ",
        serviceType: "service",
      };

      console.log("Sending request data:", requestData);
      console.log("Selected test type:", selectedTestType);

      const res = await createAppointment(requestData);

      const appointment_id =
        res?.appointment?.appointment_id || res?.appointment_id;

      // Lấy chi tiết appointment
      const token = localStorage.getItem("token");
      const detailRes = await fetch(`/api/v1/appointments/${appointment_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const detail = await detailRes.json();

      const mappedData = {
        queueNumber: detail.data?.queue_number,
        serviceName: detail.data?.service_name || selectedTestType.name,
        room: "Phòng xét nghiệm",
        doctorOrStaff: detail.data?.staff_name || "Nhân viên xét nghiệm",
        date: detail.data?.bookingDate
          ? detail.data.bookingDate.slice(0, 10)
          : selectedDate,
        time: "Trong giờ làm việc",
        fee: new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(selectedTestType.price || 0),
        isDoctor: false,
      };

      setAppointmentData(mappedData);
      setIsConfirmOpen(false);
      setIsReceiptOpen(true);

      // Reset form
      setSelectedTestType(null);
      setReason("");
    } catch (err) {
      let msg = "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!";
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      alert(msg);
      setIsConfirmOpen(false);
      console.error("Error booking test appointment:", err);
    }
  };

  const isBookingReady = () => {
    return selectedTestType !== null && selectedDate !== null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* 1. Date Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            1. Chọn ngày xét nghiệm
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn ngày <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
              }}
              min={new Date().toISOString().split("T")[0]}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* 2. Test Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            2. Chọn loại xét nghiệm
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Loại xét nghiệm <span className="text-red-500">*</span>
            </label>
            {servicesLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  Đang tải danh sách xét nghiệm...
                </p>
              </div>
            ) : testTypes.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Không có dịch vụ xét nghiệm nào</p>
              </div>
            ) : (
              <select
                value={
                  selectedTestType?.service_id || selectedTestType?.id || ""
                }
                onChange={(e) => {
                  const testId = parseInt(e.target.value);
                  const test = testTypes.find(
                    (t) => (t.service_id || t.id) === testId
                  );
                  setSelectedTestType(test || null);
                }}
                disabled={servicesLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Chọn loại xét nghiệm...</option>
                {testTypes.map((test) => (
                  <option
                    key={test.service_id || test.id}
                    value={test.service_id || test.id}
                  >
                    {test.name} -{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(test.price || 0)}
                  </option>
                ))}
              </select>
            )}{" "}
            {selectedTestType && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {selectedTestType.name}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {selectedTestType.description ||
                        "Dịch vụ xét nghiệm chuyên nghiệp"}
                    </p>{" "}
                    <div className="text-sm text-gray-500">
                      {selectedTestType.duration ||
                        "Thời gian sẽ được thông báo"}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-semibold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(selectedTestType.price || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Additional Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            3. Thông tin bổ sung
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú / Yêu cầu đặc biệt{" "}
              <span className="text-gray-400">(Tùy chọn)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ghi chú về tình trạng sức khỏe hoặc yêu cầu đặc biệt..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Right Column - Summary */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tóm tắt đặt lịch
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày:</span>
              <span className="font-medium">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("vi-VN")
                  : "Chưa chọn"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loại xét nghiệm:</span>
              <span className="font-medium text-right">
                {selectedTestType ? selectedTestType.name : "Chưa chọn"}
              </span>
            </div>{" "}
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian:</span>
              <span className="font-medium">
                {selectedTestType?.duration || "Sẽ thông báo"}
              </span>
            </div>{" "}
            <div className="flex justify-between">
              <span className="text-gray-600">Địa điểm:</span>
              <span className="font-medium">
                {appointmentData?.room || "Sẽ thông báo"}
              </span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Tổng chi phí:</span>
              <span className="text-green-600">
                {selectedTestType
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(selectedTestType.price || 0)
                  : "0đ"}
              </span>
            </div>
          </div>{" "}
          {isBookingReady() ? (
            <button
              onClick={handleBooking}
              className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mt-6 bg-gray-900 text-white hover:bg-gray-800"
            >
              <span>🧪</span>
              <span>Đặt lịch ngay</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mt-6 bg-gray-300 text-gray-500 cursor-not-allowed"
            >
              <span>🧪</span>
              <span>Vui lòng chọn ngày và loại xét nghiệm</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <AppointmentConfirmModal
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmBooking}
        data={appointmentData}
      />

      <AppointmentSuccessModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        appointmentData={appointmentData}
      />
    </div>
  );
};

export default TestAppointment;
