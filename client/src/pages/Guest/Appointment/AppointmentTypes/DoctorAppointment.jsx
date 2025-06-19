import React, { useState, useEffect } from "react";
import { Clock, Users } from "lucide-react";
import {
  getDoctors,
  getSlots,
  createAppointment,
} from "../../../../services/api";

const DoctorAppointment = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2025-06-19"); // Ngày hiện tại
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Fetch doctors when date changes
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // Truyền selectedDate để chỉ lấy doctors có working shift trong ngày đó
        const doctorsData = await getDoctors(selectedDate);
        setDoctors(doctorsData);
      } catch (err) {
        setError("Không thể tải danh sách bác sĩ");
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchDoctors();
    }
  }, [selectedDate]); // Thêm selectedDate vào dependency  // Fetch time slots when date or doctor changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !selectedDoctor) return;

      try {
        setLoading(true); // Truyền date và doctor_id để lấy slots có sẵn
        const slotsData = await getSlots(selectedDate, selectedDoctor.id);

        // Sử dụng data từ API thay vì mock
        const transformedSlots = slotsData.map((slot) => {
          // Đơn giản hóa format time - chỉ lấy phần time từ ISO string
          const formatTime = (timeStr) => {
            if (!timeStr) return "";
            // Nếu timeStr là ISO date string, extract chỉ time part
            if (typeof timeStr === "string" && timeStr.includes("T")) {
              const timePart = timeStr.split("T")[1];
              return timePart.substring(0, 5); // HH:MM
            }
            // Fallback cho các format khác
            return timeStr.toString().substring(0, 5);
          };

          const startTime = formatTime(slot.start_time);
          const endTime = formatTime(slot.end_time);
          const transformedSlot = {
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

          return transformedSlot;
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
  }, [selectedDate, selectedDoctor]); // Thêm selectedDoctor vào dependency

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

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Còn chỗ";
      case "warning":
        return "Sắp đầy";
      case "full":
        return "Hết chỗ";
      default:
        return "";
    }
  };
  const handleBooking = async () => {
    if (!selectedDoctor || !selectedTime || !reason.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      await createAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        time_slot: selectedTime.time_slot || selectedTime.time,
        reason: reason.trim(),
        service_type: "doctor_consultation",
      });
      alert("Đặt lịch khám bác sĩ thành công!");
      // Reset form
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
    return (
      selectedDoctor !== null && selectedTime !== null && reason.trim() !== ""
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {" "}
        {/* Doctor Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chọn bác sĩ
          </h2>{" "}
          <p className="text-gray-500 text-sm mb-6">Danh sách bác sĩ có sẵn</p>
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
              <select
                value={selectedDoctor?.id || ""}
                onChange={(e) => {
                  const doctorId = parseInt(e.target.value);
                  const doctor = doctors.find((d) => d.id === doctorId);
                  setSelectedDoctor(doctor || null);
                }}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">
                  {loading ? "Đang tải..." : "Chọn bác sĩ..."}
                </option>{" "}
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.degrees || "Bác sĩ"} -{" "}
                    {doctor.experience || 0} năm kinh nghiệm
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Details Display */}
            {selectedDoctor && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {selectedDoctor.name}
                    </h4>
                    <p className="text-gray-600 text-sm mb-1">
                      {selectedDoctor.degrees || "Bác sĩ HIV/AIDS"}
                    </p>{" "}
                    <p className="text-gray-500 text-sm">
                      {selectedDoctor.experience || 0} năm kinh nghiệm
                    </p>{" "}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">
                      {selectedDoctor.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedDoctor.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Date and Time Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Chọn ngày và giờ khám
          </h2>{" "}
          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn ngày
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>{" "}
          {/* Time Selection */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <label className="text-sm font-medium text-gray-700">
                Chọn khung giờ khám <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>Khung giờ khám bệnh</span>
              </div>
            </div>{" "}
            {loading ? (
              <p className="text-gray-500 text-sm mb-4">
                Đang tải khung giờ...
              </p>
            ) : (
              <select
                value={selectedTime?.id || ""}
                onChange={(e) => {
                  const slotId = parseInt(e.target.value);
                  const slot = timeSlots.find((s) => s.id === slotId);
                  setSelectedTime(slot || null);
                }}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Chọn khung giờ khám...</option>{" "}
                {timeSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.time_slot || slot.time} - {getStatusText(slot.status)}
                  </option>
                ))}
              </select>
            )}{" "}
            {/* Time Slot Details Display */}
            {selectedTime && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Khung giờ khám:{" "}
                      {selectedTime.time_slot || selectedTime.time}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Thời gian khám dự kiến: 30 phút
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      <Users className="h-4 w-4 text-gray-500" />{" "}
                      <span className="text-sm text-gray-600">
                        {selectedTime.available_slots ||
                          selectedTime.available ||
                          0}
                        /{selectedTime.total_slots || selectedTime.total || 6}{" "}
                        slot
                      </span>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedTime.status
                      )}`}
                    >
                      {getStatusText(selectedTime.status)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thông tin bổ sung
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do khám <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Mô tả ngắn gọn triệu chứng hoặc lý do cần khám..."
            />
          </div>
        </div>
      </div>

      {/* Right Column - Booking Summary */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Tóm tắt đặt lịch khám
          </h3>
          {selectedDoctor && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Bác sĩ
                </label>
                <p className="font-semibold text-gray-900">
                  {selectedDoctor.name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedDoctor.specialty}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Ngày khám
                </label>
                <p className="font-semibold text-gray-900">{selectedDate}</p>
              </div>{" "}
              {selectedTime && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Giờ khám
                  </label>
                  <p className="font-semibold text-gray-900">
                    {selectedTime.time_slot || selectedTime.time}
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-medium text-gray-700">Phí khám:</span>
                <span className="text-lg font-bold text-green-600">
                  {selectedDoctor.price}
                </span>
              </div>
            </div>
          )}{" "}
          <button
            onClick={handleBooking}
            disabled={!isBookingReady() || loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              isBookingReady() && !loading
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span>📅</span>
            <span>
              {loading
                ? "Đang đặt lịch..."
                : isBookingReady()
                ? "Đặt lịch ngay"
                : "Vui lòng điền đầy đủ thông tin"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointment;
