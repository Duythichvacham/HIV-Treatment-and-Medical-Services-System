import React, { useState, useEffect } from "react";
import { Clock, Users } from "lucide-react";

// Mock test types data
const mockTestTypes = [
  {
    id: 1,
    name: "HIV Test nhanh",
    description: "Xét nghiệm HIV nhanh, có kết quả trong 15 phút",
    price: "0 VND",
    duration: "15 phút",
    code: "HIV_RAPID",
  },
  {
    id: 2,
    name: "HIV Test ELISA",
    description: "Xét nghiệm HIV bằng phương pháp ELISA",
    price: "0 VND",
    duration: "30 phút",
    code: "HIV_ELISA",
  },
  {
    id: 3,
    name: "HIV Test PCR",
    description: "Xét nghiệm HIV bằng phương pháp PCR (chính xác cao)",
    price: "0 VND",
    duration: "45 phút",
    code: "HIV_PCR",
  },
  {
    id: 4,
    name: "Combo Test HIV + Syphilis",
    description: "Xét nghiệm kết hợp HIV và giang mai",
    price: "0 VND",
    duration: "30 phút",
    code: "HIV_SYPHILIS_COMBO",
  },
  {
    id: 5,
    name: "Gói xét nghiệm toàn diện",
    description: "Bao gồm HIV, Hepatitis B/C, Syphilis",
    price: "0 VND",
    duration: "60 phút",
    code: "COMPREHENSIVE_PACKAGE",
  },
];

const TestAppointment = () => {
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [selectedDate, setSelectedDate] = useState("19/06/2025");
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState("");
  const [testTypes, setTestTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    { time: "07:00-08:00", available: 2, total: 6, status: "warning" },
    { time: "08:00-09:00", available: 0, total: 6, status: "full" },
    { time: "09:00-10:00", available: 4, total: 6, status: "available" },
    { time: "10:00-11:00", available: 1, total: 6, status: "warning" },
    { time: "13:00-14:00", available: 6, total: 6, status: "available" },
    { time: "14:00-15:00", available: 3, total: 6, status: "available" },
  ];

  useEffect(() => {
    loadTestTypes();
  }, []);

  const loadTestTypes = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTestTypes(mockTestTypes);
    } catch (error) {
      console.error("Error loading test types:", error);
    } finally {
      setLoading(false);
    }
  };

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
    alert(
      "Đặt lịch xét nghiệm thành công! Bạn sẽ nhận được thông báo xác nhận qua email."
    );
  };

  const isBookingReady = () => {
    return (
      selectedTestType !== null && selectedTime !== null && reason.trim() !== ""
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {" "}
        {/* Test Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chọn loại xét nghiệm
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Lựa chọn gói xét nghiệm phù hợp với nhu cầu
          </p>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Đang tải loại xét nghiệm...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại xét nghiệm <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTestType?.id || ""}
                  onChange={(e) => {
                    const testId = parseInt(e.target.value);
                    const test = testTypes.find((t) => t.id === testId);
                    setSelectedTestType(test || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Chọn loại xét nghiệm...</option>
                  {testTypes.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name} - {test.duration} - {test.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Details Display */}
              {selectedTestType && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedTestType.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {selectedTestType.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <span>⏱️ {selectedTestType.duration}</span>
                      <span>📋 {selectedTestType.code}</span>
                    </div>
                    <span className="text-green-600 font-bold">
                      {selectedTestType.price}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Date and Time Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Chọn ngày và giờ xét nghiệm
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
              <option value="">Chọn khung giờ...</option>
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
                          Khung giờ: {selectedSlot.time}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Thời gian thực hiện:{" "}
                          {selectedTestType?.duration || "30 phút"}
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
              Lý do xét nghiệm <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Mô tả ngắn gọn lý do cần xét nghiệm..."
            />
          </div>
        </div>
      </div>

      {/* Right Column - Booking Summary */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Tóm tắt đặt lịch xét nghiệm
          </h3>

          {selectedTestType && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Loại xét nghiệm
                </label>
                <p className="font-semibold text-gray-900">
                  {selectedTestType.name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedTestType.description}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Thời gian thực hiện
                </label>
                <p className="text-sm text-gray-600">
                  {selectedTestType.duration}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Ngày xét nghiệm
                </label>
                <p className="font-semibold text-gray-900">{selectedDate}</p>
              </div>

              {selectedTime && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Giờ xét nghiệm
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

export default TestAppointment;
