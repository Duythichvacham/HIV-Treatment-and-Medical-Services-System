import React, { useState } from "react";
import { X, Calendar, User, Building } from "lucide-react";

const CreateShiftModal = ({
  isOpen,
  onClose,
  onCreate,
  doctors,
  rooms,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    doctor_id: "",
    shift_date: "",
    room_id: "",
    status: "approved", //
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        doctor_id: "",
        shift_date: "",
        room_id: "",
        status: "approved",
      });
      setErrors({});
    }
  }, [isOpen, doctors]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctor_id) {
      newErrors.doctor_id = "Vui lòng chọn bác sĩ";
    }

    if (!formData.shift_date) {
      newErrors.shift_date = "Vui lòng chọn ngày làm việc";
    } else {
      // Check if date is in the past
      const selectedDate = new Date(formData.shift_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.shift_date = "Không thể chọn ngày trong quá khứ";
      }
    }

    if (!formData.room_id) {
      newErrors.room_id = "Vui lòng chọn phòng";
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
      const result = await onCreate({
        doctor_id: parseInt(formData.doctor_id),
        shift_date: formData.shift_date,
        room_id: parseInt(formData.room_id),
        status: formData.status,
      });

      if (result.success) {
        // Form will be reset by useEffect when modal closes
        // Success notification can be handled by parent component
      } else {
        // Handle API errors
        setErrors({ submit: result.message });
      }
    } catch {
      setErrors({ submit: "Có lỗi xảy ra khi tạo ca làm việc" });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Thêm ca làm việc mới
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Bác sĩ *
            </label>
            <select
              value={formData.doctor_id}
              onChange={(e) => handleChange("doctor_id", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.doctor_id ? "border-red-300" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            >
              <option value="">Chọn bác sĩ</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctor_id} value={doctor.doctor_id}>
                  {doctor.name ||
                    doctor.full_name ||
                    doctor.doctor_name ||
                    `Doctor ${doctor.doctor_id}`}
                </option>
              ))}
            </select>
            {errors.doctor_id && (
              <p className="mt-1 text-sm text-red-600">{errors.doctor_id}</p>
            )}
          </div>

          {/* Shift Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Ngày làm việc *
            </label>
            <input
              type="date"
              value={formData.shift_date}
              onChange={(e) => handleChange("shift_date", e.target.value)}
              min={new Date().toISOString().split("T")[0]} // Prevent past dates
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.shift_date ? "border-red-300" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
            {errors.shift_date && (
              <p className="mt-1 text-sm text-red-600">{errors.shift_date}</p>
            )}
          </div>

          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Phòng *
            </label>
            <select
              value={formData.room_id}
              onChange={(e) => handleChange("room_id", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.room_id ? "border-red-300" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            >
              <option value="">Chọn phòng</option>
              {rooms.map((room) => (
                <option key={room.room_id} value={room.room_id}>
                  {room.room_name}
                </option>
              ))}
            </select>
            {errors.room_id && (
              <p className="mt-1 text-sm text-red-600">{errors.room_id}</p>
            )}
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
              {isSubmitting ? "Đang tạo..." : "Tạo ca làm việc"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShiftModal;
