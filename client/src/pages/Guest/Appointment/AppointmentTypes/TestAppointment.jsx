import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import {
  getSlots,
  createAppointment,
  getServices,
} from "../../../../services/api";
import { getCurrentDate } from "../../../../utils/dateUtil";

const TestAppointment = () => {
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedTime, setSelectedTime] = useState(null);
  const [testTypes, setTestTypes] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug log để theo dõi selectedTestType changes
  useEffect(() => {
    console.log("🔄 selectedTestType changed:", selectedTestType);
  }, [selectedTestType]);
  // Fetch time slots when both date and test type are selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !selectedTestType) return;

      try {
        setLoading(true);
        const slotsData = await getSlots(selectedDate);
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
  }, [selectedDate, selectedTestType]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const response = await getServices("test");
        console.log("🔍 API Response:", response);

        const servicesData = response.data || response;
        console.log("🔍 Services Data:", servicesData);

        const transformedServices = servicesData.map((service) => ({
          id: service.service_id,
          name: service.name,
          description: service.description || "Không có mô tả",
          price: `${service.price.toLocaleString()} VND`,
          duration: "30 phút",
          code: service.name.toUpperCase().replace(/\s+/g, "_"),
        }));

        console.log("🔍 Transformed Services:", transformedServices);
        setTestTypes(transformedServices);
      } catch (err) {
        console.error("❌ Error fetching services:", err);
        setError("Không thể tải danh sách dịch vụ xét nghiệm");
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleBooking = async () => {
    if (!selectedTestType || !selectedTime) {
      alert("Vui lòng chọn loại xét nghiệm và khung giờ!");
      return;
    }

    try {
      setLoading(true);
      await createAppointment({
        test_type: selectedTestType.code,
        appointment_date: selectedDate,
        time_slot: selectedTime.time_slot || selectedTime.time,
        reason: reason.trim() || "Không có ghi chú",
        service_type: "test",
      });
      alert("Đặt lịch xét nghiệm thành công!");
      setSelectedTestType(null);
      setSelectedTime(null);
      setReason("");
    } catch (err) {
      let msg = 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      alert(msg);
      console.error('Error booking appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const isBookingReady = () => {
    return selectedTestType !== null && selectedTime !== null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {" "}
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* 1. Date Selection - ĐẦU TIÊN */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
                // Reset selections when date changes
                setSelectedTime(null);
              }}
              min={new Date().toISOString().split("T")[0]}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* 2. Test Type Selection - THỨ HAI */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            2. Chọn loại xét nghiệm
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Chọn dịch vụ xét nghiệm phù hợp với nhu cầu của bạn
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại xét nghiệm <span className="text-red-500">*</span>
              </label>
              {servicesLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">
                    Đang tải danh sách xét nghiệm...
                  </p>
                </div>
              ) : (
                <select
                  value={selectedTestType?.id || ""}
                  onChange={(e) => {
                    console.log(
                      "🔄 onChange triggered, value:",
                      e.target.value
                    );
                    const testId = parseInt(e.target.value);
                    console.log("🔄 Parsed testId:", testId);
                    console.log("🔄 Available testTypes:", testTypes);
                    const test = testTypes.find((t) => t.id === testId);
                    console.log("🔄 Found test:", test);
                    setSelectedTestType(test || null);
                    // Reset time selection when test type changes
                    setSelectedTime(null);
                    console.log("🔄 Set selectedTestType to:", test);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={servicesLoading || !selectedDate}
                >
                  <option value="">
                    {!selectedDate
                      ? "Vui lòng chọn ngày trước"
                      : servicesLoading
                      ? "Đang tải..."
                      : "Chọn loại xét nghiệm..."}
                  </option>
                  {testTypes.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name} - {test.duration} - {test.price}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedTestType && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedTestType.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedTestType.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {selectedTestType.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-semibold text-sm">
                      {selectedTestType.price}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Time Slot Selection - THỨ BA */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            3. Chọn khung giờ xét nghiệm
          </h2>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <label className="text-sm font-medium text-gray-700">
                Chọn khung giờ xét nghiệm{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>Không giới hạn số lượng slot</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {!selectedDate || !selectedTestType ? (
              <p className="text-gray-500 text-sm mb-4">
                Vui lòng chọn ngày và loại xét nghiệm trước
              </p>
            ) : loading ? (
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
                disabled={loading || !selectedDate || !selectedTestType}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">
                  {!selectedDate || !selectedTestType
                    ? "Vui lòng chọn ngày và loại xét nghiệm trước"
                    : "Chọn khung giờ xét nghiệm..."}
                </option>
                {timeSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.time_slot || slot.time} -
                    {slot.status === "available" ? " Có sẵn" : " Đã đầy"}
                  </option>
                ))}
              </select>
            )}

            {selectedTime && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Khung giờ xét nghiệm:{" "}
                      {selectedTime.time_slot || selectedTime.time}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Dự kiến hoàn thành:{" "}
                      {selectedTestType?.duration || "30 phút"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        selectedTime.status === "available"
                          ? "text-green-600 bg-green-50 border-green-200"
                          : "text-orange-600 bg-orange-50 border-orange-200"
                      }`}
                    >
                      {selectedTime.status === "available"
                        ? "Có sẵn"
                        : "Đã đầy"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Additional Information - OPTIONAL */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            4. Thông tin bổ sung
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do xét nghiệm / Ghi chú{" "}
              <span className="text-gray-400">(Tùy chọn)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Vui lòng mô tả lý do xét nghiệm hoặc ghi chú đặc biệt..."
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
              <span className="text-gray-600">Loại xét nghiệm:</span>
              <span className="font-medium text-right">
                {selectedTestType ? selectedTestType.name : "Chưa chọn"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian:</span>
              <span className="font-medium">
                {selectedTestType ? selectedTestType.duration : "--"}
              </span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Tổng chi phí:</span>
              <span className="text-green-600">
                {selectedTestType ? selectedTestType.price : "0 VND"}
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
            <span>🧪</span>
            <span>
              {loading
                ? "Đang đặt lịch..."
                : isBookingReady()
                ? "Đặt lịch ngay"
                : "Vui lòng chọn ngày giờ và loại xét nghiệm"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAppointment;
