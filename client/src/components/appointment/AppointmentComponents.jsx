import React from "react";

/**
 * Date Selection Component
 */
export const DateSelector = ({
  selectedDate,
  onDateChange,
  disabled = false,
  label = "Chọn ngày",
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">1. {label}</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label} <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          disabled={disabled}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
        />
      </div>
    </div>
  );
};

/**
 * Doctor Selection Component
 */
export const DoctorSelector = ({
  selectedDoctor,
  doctors,
  onDoctorChange,
  selectedDate,
  doctorsLoading,
  error,
  getPrice,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        2. Chọn bác sĩ
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Danh sách bác sĩ có sẵn vào ngày đã chọn
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
                onDoctorChange(doctor || null);
              }}
              disabled={doctorsLoading || !selectedDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">
                {doctorsLoading ? "Đang tải..." : "Chọn bác sĩ..."}
              </option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                  {doctor.degrees ? ` - ${doctor.degrees}` : ""} -{" "}
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
                  {selectedDoctor.degrees || ""}
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
                  {getPrice()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Time Slot Selection Component
 */
export const TimeSlotSelector = ({
  selectedTime,
  timeSlots,
  onTimeChange,
  selectedDate,
  selectedDoctor,
  loading,
  getStatusColor,
  getStatusText,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        3. Chọn khung giờ
      </h2>

      <div>
        <div className="flex items-center space-x-2 mb-4">
          <label className="text-sm font-medium text-gray-700">
            Khung giờ có sẵn <span className="text-red-500">*</span>
          </label>
        </div>

        {!selectedDate || !selectedDoctor ? (
          <p className="text-gray-500 text-sm mb-4">
            Vui lòng chọn ngày và bác sĩ trước để xem khung giờ có sẵn
          </p>
        ) : loading ? (
          <p className="text-gray-500 text-sm mb-4">Đang tải khung giờ...</p>
        ) : timeSlots.length === 0 ? (
          <p className="text-gray-500 text-sm mb-4">
            Không có khung giờ nào khả dụng cho ngày và bác sĩ đã chọn
          </p>
        ) : (
          <select
            value={selectedTime?.id || ""}
            onChange={(e) => {
              const slotId = parseInt(e.target.value);
              const slot = timeSlots.find((s) => s.id === slotId);
              onTimeChange(slot || null);
            }}
            disabled={loading || !selectedDoctor}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">Chọn khung giờ...</option>
            {timeSlots
              .filter((slot) => slot.status === "available")
              .map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.time_slot || slot.time} -{" "}
                  {getStatusText(slot.status, slot.available, slot.total)}
                </option>
              ))}
          </select>
        )}

        {selectedTime && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Khung giờ: {selectedTime.time_slot || selectedTime.time}
                </h4>
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
    </div>
  );
};

/**
 * Test Type Selection Component (Dropdown Version)
 */
export const TestTypeSelector = ({
  selectedTestType,
  testTypes,
  onTestTypeChange,
  servicesLoading,
  error,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        2. Chọn loại xét nghiệm
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại xét nghiệm <span className="text-red-500">*</span>
          </label>
          {servicesLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Đang tải danh sách xét nghiệm...</p>
            </div>
          ) : (
            <select
              value={selectedTestType?.service_id || ""}
              onChange={(e) => {
                const testId = parseInt(e.target.value);
                const testType = testTypes.find((t) => t.service_id === testId);
                onTestTypeChange(testType || null);
              }}
              disabled={servicesLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">
                {servicesLoading ? "Đang tải..." : "Chọn loại xét nghiệm..."}
              </option>
              {testTypes.map((testType) => (
                <option key={testType.service_id} value={testType.service_id}>
                  {testType.name} - {Number(testType.price).toLocaleString()}đ
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedTestType && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {selectedTestType.name}
                </h4>
                <p className="text-gray-600 text-sm mb-1">
                  {selectedTestType.description || "Xét nghiệm cơ bản"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-600 font-semibold text-sm">
                  {Number(selectedTestType.price).toLocaleString()}đ
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Consultation Type Selection Component
 */
export const ConsultTypeSelector = ({
  consultType,
  onConsultTypeChange,
  getPrice,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        4. Chọn hình thức tư vấn
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => onConsultTypeChange("video")}
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            consultType === "video"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 text-purple-600">📹</div>
            <div>
              <h4 className="font-semibold text-gray-900">Video Call</h4>
              <p className="text-sm text-gray-600">Tư vấn qua video</p>
              <p className="text-sm font-semibold text-green-600">
                {getPrice()}
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => onConsultTypeChange("chat")}
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            consultType === "chat"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 text-blue-600">💬</div>
            <div>
              <h4 className="font-semibold text-gray-900">Chat</h4>
              <p className="text-sm text-gray-600">Tư vấn qua tin nhắn</p>
              <p className="text-sm font-semibold text-green-600">
                {getPrice()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Booking Summary Component
 */
export const BookingSummary = ({
  selectedDate,
  selectedTime,
  selectedDoctor,
  selectedTestType,
  consultType,
  getPrice,
  isBookingReady,
  onBooking,
  loading,
  isConsultation = false,
  isTest = false,
}) => {
  return (
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

        {!isTest && (
          <div className="flex justify-between">
            <span className="text-gray-600">Giờ:</span>
            <span className="font-medium">
              {selectedTime
                ? selectedTime.time_slot || selectedTime.time
                : "Chưa chọn"}
            </span>
          </div>
        )}

        {isTest ? (
          <div className="flex justify-between">
            <span className="text-gray-600">Xét nghiệm:</span>
            <span className="font-medium text-right">
              {selectedTestType ? selectedTestType.name : "Chưa chọn"}
            </span>
          </div>
        ) : (
          <div className="flex justify-between">
            <span className="text-gray-600">Bác sĩ:</span>
            <span className="font-medium text-right">
              {selectedDoctor ? selectedDoctor.name : "Chưa chọn"}
            </span>
          </div>
        )}

        {isConsultation && (
          <div className="flex justify-between">
            <span className="text-gray-600">Hình thức:</span>
            <span className="font-medium">
              {consultType === "video" ? "Video Call" : "Chat"}
            </span>
          </div>
        )}

        <hr className="my-3" />
        <div className="flex justify-between text-lg font-semibold">
          <span>Tổng chi phí:</span>
          <span className="text-green-600">
            {selectedDoctor || selectedTestType ? getPrice() : "0đ"}
          </span>
        </div>
      </div>

      {isBookingReady() ? (
        <button
          onClick={onBooking}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mt-6 bg-gray-900 text-white hover:bg-gray-800"
        >
          <span>{isTest ? "🧪" : isConsultation ? "💬" : "👩‍⚕️"}</span>
          <span>{loading ? "Đang xử lý..." : "Đặt lịch ngay"}</span>
        </button>
      ) : (
        <button
          disabled
          className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mt-6 bg-gray-300 text-gray-500 cursor-not-allowed"
        >
          <span>{isTest ? "🧪" : isConsultation ? "💬" : "👩‍⚕️"}</span>
          <span>Vui lòng điền đầy đủ thông tin</span>
        </button>
      )}
    </div>
  );
};
