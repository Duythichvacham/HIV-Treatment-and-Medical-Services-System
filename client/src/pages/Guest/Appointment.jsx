import React, { useState } from "react";
import { User, FileText, MessageCircle, Clock, Users } from "lucide-react";

const Appointment = () => {
  const [activeTab, setActiveTab] = useState("doctor");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("19/06/2025");
  const [selectedTime, setSelectedTime] = useState(null);
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

  const tabs = [
    { id: "doctor", label: "Đặt lịch khám bác sĩ", icon: User },
    { id: "test", label: "Đặt lịch xét nghiệm", icon: FileText },
    { id: "consult", label: "Đặt lịch tư vấn", icon: MessageCircle },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt lịch khám và xét nghiệm
          </h1>
          <p className="text-gray-600">
            Đặt lịch khám bác sĩ, thực hiện xét nghiệm hoặc tư vấn trực tuyến
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm border-b-2 ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600 bg-purple-50"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Doctor List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Chọn bác sĩ
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Danh sách bác sĩ có sẵn
              </p>

              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedDoctor?.id === doctor.id
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {doctor.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-1">
                          {doctor.specialty}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {doctor.experience}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-yellow-400">★</span>
                          <span className="font-medium text-sm">
                            {doctor.rating}
                          </span>
                        </div>
                        <p className="text-blue-600 font-semibold text-sm">
                          {doctor.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Chọn ngày và giờ khám
              </h2>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn ngày
                </label>
                <input
                  type="date"
                  value="2025-06-19"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Time Selection */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Chọn khung giờ khám
                  </label>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Mỗi khung giờ có tối đa 6 slot khám</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        slot.status !== "full" && setSelectedTime(slot.time)
                      }
                      disabled={slot.status === "full"}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        selectedTime === slot.time
                          ? "border-purple-500 bg-purple-50"
                          : `border-gray-200 hover:border-gray-300 ${getStatusColor(
                              slot.status
                            )}`
                      } ${
                        slot.status === "full"
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      }`}
                    >
                      <div className="font-semibold text-sm mb-2">
                        {slot.time}
                      </div>
                      <div className="flex items-center justify-center space-x-1 text-xs mb-2">
                        <Users className="h-3 w-3" />
                        <span>
                          {slot.available}/{slot.total}
                        </span>
                      </div>
                      <div
                        className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                          slot.status
                        )}`}
                      >
                        {getStatusText(slot.status)}
                      </div>
                    </button>
                  ))}
                </div>
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
                    <p className="font-semibold text-gray-900">
                      {selectedDate}
                    </p>
                  </div>

                  {selectedTime && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Giờ khám
                      </label>
                      <p className="font-semibold text-gray-900">
                        {selectedTime}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-medium text-gray-700">Phí khám:</span>
                    <span className="text-lg font-bold text-green-600">
                      Miễn phí
                    </span>
                  </div>
                </div>
              )}

              <button className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2">
                <span>$</span>
                <span>Đăng nhập để đặt lịch</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
