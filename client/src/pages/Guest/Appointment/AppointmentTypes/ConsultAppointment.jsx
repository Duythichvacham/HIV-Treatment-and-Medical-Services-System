import React, { useState } from "react";
import { Clock, Users } from "lucide-react";

const ConsultAppointment = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("19/06/2025");
  const [selectedTime, setSelectedTime] = useState(null);
  const [consultType, setConsultType] = useState("video"); // video hoặc chat
  const [reason, setReason] = useState("");

  const doctors = [
    {
      id: 1,
      name: "BS.CKI Nguyễn Văn An",
      specialty: "Chuyên gia HIV/AIDS",
      experience: "18 năm kinh nghiệm",
      rating: 4.9,
      price: "0 VND",
    },
    {
      id: 2,
      name: "BS Trần Thị Bình",
      specialty: "Tư vấn tâm lý HIV",
      experience: "12 năm kinh nghiệm",
      rating: 4.8,
      price: "0 VND",
    },
    {
      id: 3,
      name: "BS Lê Văn Cường",
      specialty: "Xét nghiệm & Chẩn đoán",
      experience: "15 năm kinh nghiệm",
      rating: 4.7,
      price: "0 VND",
    },
  ];

  const timeSlots = [
    { time: "07:00-08:00", available: 2, total: 6, status: "warning" },
    { time: "08:00-09:00", available: 0, total: 6, status: "full" },
    { time: "09:00-10:00", available: 4, total: 6, status: "available" },
    { time: "10:00-11:00", available: 1, total: 6, status: "warning" },
    { time: "13:00-14:00", available: 6, total: 6, status: "available" },
    { time: "14:00-15:00", available: 3, total: 6, status: "available" },
  ];

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

  const handleBooking = () => {
    alert("Đặt lịch tư vấn thành công!");
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
            Chọn bác sĩ tư vấn
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Chọn bác sĩ bạn muốn tư vấn
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bác sĩ tư vấn <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDoctor?.id || ""}
                onChange={(e) => {
                  const doctorId = parseInt(e.target.value);
                  const doctor = doctors.find((d) => d.id === doctorId);
                  setSelectedDoctor(doctor || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Chọn bác sĩ tư vấn...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty} - ⭐ {doctor.rating}
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
                      {selectedDoctor.specialty}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {selectedDoctor.experience}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-medium text-sm">
                        {selectedDoctor.rating}
                      </span>
                    </div>
                    <p className="text-green-600 font-semibold text-sm">
                      {selectedDoctor.price}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Consultation Type */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hình thức tư vấn
          </h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="video"
                type="radio"
                name="consultType"
                value="video"
                checked={consultType === "video"}
                onChange={() => setConsultType("video")}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="video" className="ml-2 text-gray-700">
                Tư vấn video
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="chat"
                type="radio"
                name="consultType"
                value="chat"
                checked={consultType === "chat"}
                onChange={() => setConsultType("chat")}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="chat" className="ml-2 text-gray-700">
                Tư vấn chat
              </label>
            </div>
          </div>
        </div>
        {/* Date and Time Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Chọn ngày và giờ tư vấn
          </h2>
          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn ngày
            </label>
            <input
              type="date"
              value="2025-06-19"
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>{" "}
          {/* Time Selection */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <label className="text-sm font-medium text-gray-700">
                Chọn khung giờ <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>Mỗi khung giờ có tối đa 6 slot</span>
              </div>
            </div>

            <select
              value={selectedTime || ""}
              onChange={(e) => setSelectedTime(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Chọn khung giờ tư vấn...</option>
              {timeSlots.map((slot, index) => (
                <option
                  key={index}
                  value={slot.time}
                  disabled={slot.status === "full"}
                >
                  {slot.time} - {slot.available}/{slot.total} slot -{" "}
                  {getStatusText(slot.status)}
                </option>
              ))}
            </select>

            {/* Time Slot Details Display */}
            {selectedTime && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {(() => {
                  const selectedSlot = timeSlots.find(
                    (slot) => slot.time === selectedTime
                  );
                  return selectedSlot ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Khung giờ tư vấn: {selectedSlot.time}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Hình thức: Tư vấn{" "}
                          {consultType === "video" ? "video" : "chat"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {selectedSlot.available}/{selectedSlot.total} slot
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                            selectedSlot.status
                          )}`}
                        >
                          {getStatusText(selectedSlot.status)}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })()}
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
              Lý do tư vấn <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Mô tả ngắn gọn vấn đề bạn muốn tư vấn..."
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-blue-600" />
              <span className="ml-2 text-sm text-gray-700">
                Ẩn danh (Không hiển thị tên thật)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Right Column - Booking Summary */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Tóm tắt lịch tư vấn
          </h3>

          {selectedDoctor && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Hình thức
                </label>
                <p className="font-semibold text-gray-900">
                  Tư vấn {consultType === "video" ? "video" : "chat"}
                </p>
              </div>

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
                  Ngày tư vấn
                </label>
                <p className="font-semibold text-gray-900">{selectedDate}</p>
              </div>

              {selectedTime && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Giờ tư vấn
                  </label>
                  <p className="font-semibold text-gray-900">{selectedTime}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-medium text-gray-700">Chi phí:</span>
                <span className="text-lg font-bold text-green-600">
                  Miễn phí
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={!isBookingReady()}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              isBookingReady()
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span>📅</span>
            <span>
              {isBookingReady()
                ? "Đặt lịch ngay"
                : "Vui lòng điền đầy đủ thông tin"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultAppointment;
