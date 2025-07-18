import React, { useState, useEffect } from "react";
import { X, Calendar, User, Building, Check } from "lucide-react";

const EditShiftModal = ({
  isOpen,
  onClose,
  onUpdate,
  shift,
  doctors,
  rooms,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    doctor_id: "",
    shift_date: "",
    room_id: "",
    status: "approved", // Default status for working shifts
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens or shift changes
  useEffect(() => {
    if (isOpen && shift) {
      const shiftDate = shift.shift_date
        ? new Date(shift.shift_date).toISOString().split("T")[0]
        : "";

      setFormData({
        doctor_id: shift.doctor_id?.toString() || "",
        shift_date: shiftDate,
        room_id: shift.room_id?.toString() || "",
        status: shift.status || "approved",
      });
      setErrors({});
    }
  }, [isOpen, shift]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Chỉ validate status vì chỉ có field này được phép chỉnh sửa
    if (!formData.status) {
      newErrors.status = "Vui lòng chọn trạng thái";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onUpdate({
        // Chỉ gửi status vì các field khác không được phép chỉnh sửa
        status: formData.status,
      });

      if (result.success) {
        // Modal will be closed by parent component
      } else {
        // Handle API errors
        setErrors({ submit: result.message });
      }
    } catch {
      setErrors({ submit: "Có lỗi xảy ra khi cập nhật ca làm việc" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Get doctor name
  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.doctor_id === doctorId);
    return doctor ? doctor.full_name : "Chưa xác định";
  };

  // Get room name
  const getRoomName = (roomId) => {
    const room = rooms.find((r) => r.room_id === roomId);
    return room ? room.room_name : "Chưa xác định";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Chỉnh sửa ca làm việc
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Info Display */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Thông tin hiện tại:
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <strong>Bác sĩ:</strong> {getDoctorName(shift?.doctor_id)}
            </p>
            <p>
              <strong>Ngày:</strong>{" "}
              {shift?.shift_date
                ? new Date(shift.shift_date).toLocaleDateString("vi-VN")
                : "Chưa xác định"}
            </p>
            <p>
              <strong>Phòng:</strong> {getRoomName(shift?.room_id)}
            </p>
            <p>
              <strong>Trạng thái:</strong>
              <span
                className={`ml-1 px-2 py-0.5 rounded text-xs ${
                  shift?.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {shift?.status === "approved" ? "Đã duyệt" : "Đã hủy"}
              </span>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Doctor Selection - Read Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Bác sĩ
            </label>
            <select
              value={formData.doctor_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              disabled={true}
            >
              <option value="">Chọn bác sĩ</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctor_id} value={doctor.doctor_id}>
                  {doctor.doctor_name}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Date - Read Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Ngày làm việc
            </label>
            <input
              type="date"
              value={formData.shift_date}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              disabled={true}
            />
          </div>

          {/* Room Selection - Read Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Phòng
            </label>
            <select
              value={formData.room_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              disabled={true}
            >
              <option value="">Chọn phòng</option>
              {rooms.map((room) => (
                <option key={room.room_id} value={room.room_id}>
                  {room.room_name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Check className="w-4 h-4 inline mr-1" />
              Trạng thái ca làm việc *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.status ? "border-red-300" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            >
              <option value="approved">Đã phê duyệt</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Chỉ ca làm việc "Đã phê duyệt" mới có thể được sử dụng
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShiftModal;
