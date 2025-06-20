import React, { useState, useEffect } from "react";
import { Clock, Users, Video, MessageCircle } from "lucide-react";
import {
  getDoctors,
  getSlots,
  createAppointment,
} from "../../../../services/api";

const ConsultAppointment = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2025-06-19");
  const [selectedTime, setSelectedTime] = useState(null);
  const [consultType, setConsultType] = useState("video");
  const [reason, setReason] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [error, setError] = useState(null);

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
            total_slots: Number(slot.max_patients_per_slot) || 6,
            available: Number(slot.available_spots) || 0,
            total: Number(slot.max_patients_per_slot) || 6,
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

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "full":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status, available, total) => {
    switch (status) {
      case "available":
        return `Còn ${available}/${total} chỗ`;
      case "warning":
        return `Còn ${available}/${total} chỗ`;
      case "full":
        return "Đã đầy";
      default:
        return "Không rõ";
    }
  };

  const getConsultPrice = () => {
    if (consultType === "video") return "200.000đ";
    if (consultType === "chat") return "150.000đ";
    return "0đ";
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedTime) {
      alert("Vui lòng chọn bác sĩ và khung giờ!");
      return;
    }

    try {
      setLoading(true);
      await createAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        time_slot: selectedTime.time_slot || selectedTime.time,
        reason: reason.trim() || "Không có ghi chú",
        service_type: "consultation",
        consultation_type: consultType,
      });
      alert("Đặt lịch tư vấn thành công!");
      setSelectedDoctor(null);
      setSelectedTime(null);
      setReason("");
    } catch (err) {
      alert("Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!");
      console.error("Error booking appointment:", err);
    } finally {
      setLoading(false);
    }
  };

  const isBookingReady = () => {
    return selectedDoctor !== null && selectedTime !== null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {" "}
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* 1. Date Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            1. Chọn ngày tư vấn
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn ngày <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedDoctor(null); // Reset doctor when date changes
                setSelectedTime(null); // Reset time when date changes
              }}
              min={new Date().toISOString().split("T")[0]}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        {/* 2. Doctor Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            2. Chọn bác sĩ tư vấn
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Danh sách bác sĩ có sẵn cho tư vấn trực tuyến vào ngày đã chọn
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bác sĩ <span className="text-red-500">*</span>
              </label>
              {!selectedDate ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Vui lòng chọn ngày trước</p>
                </div>
              ) : doctorsLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Đang tải danh sách bác sĩ...</p>
                </div>
              ) : (
                <select
                  value={selectedDoctor?.id || ""}
                  onChange={(e) => {
                    const doctorId = parseInt(e.target.value);
                    const doctor = doctors.find((d) => d.id === doctorId);
                    setSelectedDoctor(doctor || null);
                    setSelectedTime(null); // Reset time when doctor changes
                  }}
                  disabled={doctorsLoading || !selectedDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">
                    {doctorsLoading ? "Đang tải..." : "Chọn bác sĩ..."}
                  </option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.degrees || "Bác sĩ"} -{" "}
                      {doctor.experience || 0} năm kinh nghiệm
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedDoctor && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {selectedDoctor.name}
                    </h4>
                    <p className="text-gray-600 text-sm mb-1">
                      {selectedDoctor.degrees || "Bác sĩ HIV/AIDS"}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600">
                          {selectedDoctor.experience || 0} năm kinh nghiệm
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-semibold text-sm">
                      {getConsultPrice()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* 3. Time Slot Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            3. Chọn khung giờ tư vấn
          </h2>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <label className="text-sm font-medium text-gray-700">
                Khung giờ có sẵn <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center text-gray-500 text-sm">
                <Users className="h-4 w-4 mr-1" />
                <span>Giới hạn số lượng bệnh nhân</span>
              </div>
            </div>

            {!selectedDate || !selectedDoctor ? (
              <p className="text-gray-500 text-sm mb-4">
                Vui lòng chọn ngày và bác sĩ trước để xem khung giờ có sẵn
              </p>
            ) : loading ? (
              <p className="text-gray-500 text-sm mb-4">
                Đang tải khung giờ...
              </p>
            ) : timeSlots.length === 0 ? (
              <p className="text-gray-500 text-sm mb-4">
                Không có khung giờ nào khả dụng cho ngày và bác sĩ đã chọn
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() =>
                      slot.status === "available" && setSelectedTime(slot)
                    }
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedTime?.id === slot.id
                        ? "border-purple-500 bg-purple-50"
                        : slot.status === "available"
                        ? "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                        : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          {slot.time_slot || slot.time}
                        </div>
                        <div className="text-sm text-gray-600">
                          30 phút tư vấn
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            slot.status
                          )}`}
                        >
                          {getStatusText(
                            slot.status,
                            slot.available,
                            slot.total
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTime && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Khung giờ tư vấn:{" "}
                      {selectedTime.time_slot || selectedTime.time}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Thời gian tư vấn: 30 phút
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        selectedTime.status
                      )}`}
                    >
                      {getStatusText(
                        selectedTime.status,
                        selectedTime.available,
                        selectedTime.total
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>{" "}
        {/* 4. Consultation Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            4. Chọn hình thức tư vấn
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setConsultType("video")}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                consultType === "video"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Video className="h-8 w-8 text-purple-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Video Call</h4>
                  <p className="text-sm text-gray-600">Tư vấn qua video</p>
                  <p className="text-sm font-semibold text-green-600">
                    200.000đ
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setConsultType("chat")}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                consultType === "chat"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Chat</h4>
                  <p className="text-sm text-gray-600">Tư vấn qua tin nhắn</p>
                  <p className="text-sm font-semibold text-green-600">
                    150.000đ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 5. Additional Information - OPTIONAL */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            5. Thông tin bổ sung
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Câu hỏi / Vấn đề cần tư vấn{" "}
              <span className="text-gray-400">(Tùy chọn)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mô tả vấn đề hoặc câu hỏi cần tư vấn..."
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
              <span className="text-gray-600">Giờ:</span>
              <span className="font-medium">
                {selectedTime
                  ? selectedTime.time_slot || selectedTime.time
                  : "Chưa chọn"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bác sĩ:</span>
              <span className="font-medium text-right">
                {selectedDoctor ? selectedDoctor.name : "Chưa chọn"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hình thức:</span>
              <span className="font-medium">
                {consultType === "video" ? "Video Call" : "Chat"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian:</span>
              <span className="font-medium">30 phút</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Tổng chi phí:</span>
              <span className="text-green-600">
                {selectedDoctor ? getConsultPrice() : "0đ"}
              </span>
            </div>
          </div>

          <button
            onClick={handleBooking}
            disabled={!isBookingReady() || loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mt-6 ${
              isBookingReady() && !loading
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span>💬</span>
            <span>
              {loading
                ? "Đang đặt lịch..."
                : isBookingReady()
                ? "Đặt lịch ngay"
                : "Vui lòng chọn ngày giờ và bác sĩ"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultAppointment;
