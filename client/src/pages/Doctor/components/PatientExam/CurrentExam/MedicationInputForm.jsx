import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const MedicationInputForm = ({
  isOpen,
  onClose,
  onSave,
  medication = null,
  isMainDrug = false, // true for ARV drugs, false for support drugs
  title = "Thông tin thuốc",
}) => {
  const [formData, setFormData] = useState({
    drug_name: "",
    dosage: "",
    frequency: "",
    duration_days: "",
    usage_instructions: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when medication prop changes
  useEffect(() => {
    if (medication) {
      setFormData({
        drug_name: medication.drug_name || "",
        dosage: medication.dosage || "",
        frequency: medication.frequency || "",
        duration_days: medication.duration_days || "",
        usage_instructions: medication.usage_instructions || "",
        notes: medication.notes || "",
      });
    } else {
      // Reset form for new medication
      setFormData({
        drug_name: "",
        dosage: "",
        frequency: "",
        duration_days: "",
        usage_instructions: "",
        notes: "",
      });
    }
    setErrors({});
  }, [medication, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate drug name (only for support drugs)
    if (!isMainDrug && !formData.drug_name.trim()) {
      newErrors.drug_name = "Tên thuốc là bắt buộc";
    }

    // Validate dosage
    if (!formData.dosage.trim()) {
      newErrors.dosage = "Liều dùng là bắt buộc";
    }

    // Validate frequency
    if (!formData.frequency.trim()) {
      newErrors.frequency = "Tần suất dùng là bắt buộc";
    }

    // Validate duration
    if (!formData.duration_days.trim()) {
      newErrors.duration_days = "Số ngày dùng là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-3">
          {/* Drug Name - only for support drugs */}
          {!isMainDrug && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên thuốc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.drug_name}
                onChange={(e) => handleInputChange("drug_name", e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.drug_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên thuốc..."
              />
              {errors.drug_name && (
                <p className="text-red-500 text-xs mt-1">{errors.drug_name}</p>
              )}
            </div>
          )}

          {/* Drug Name - readonly for main drugs */}
          {isMainDrug && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên thuốc
              </label>
              <input
                type="text"
                value={formData.drug_name}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>
          )}

          {/* Row 1: Dosage + Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liều dùng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.dosage}
                onChange={(e) => handleInputChange("dosage", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dosage ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Chọn liều dùng...</option>
                <option value="1/2 viên">1/2 viên</option>
                <option value="1 viên">1 viên</option>
                <option value="1.5 viên">1.5 viên</option>
                <option value="2 viên">2 viên</option>
                <option value="2.5 viên">2.5 viên</option>
                <option value="3 viên">3 viên</option>
                <option value="4 viên">4 viên</option>
                <option value="5 viên">5 viên</option>
              </select>
              {errors.dosage && (
                <p className="text-red-500 text-xs mt-1">{errors.dosage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lần/ngày <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => handleInputChange("frequency", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.frequency ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Chọn số lần/ngày...</option>
                <option value="1 lần/ngày">1 lần/ngày</option>
                <option value="2 lần/ngày">2 lần/ngày</option>
                <option value="3 lần/ngày">3 lần/ngày</option>
                <option value="4 lần/ngày">4 lần/ngày</option>
                <option value="Khi cần">Khi cần</option>
              </select>
              {errors.frequency && (
                <p className="text-red-500 text-xs mt-1">{errors.frequency}</p>
              )}
            </div>
          </div>

          {/* Row 2: Duration + Usage Instructions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số ngày dùng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.duration_days}
                onChange={(e) =>
                  handleInputChange("duration_days", e.target.value)
                }
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.duration_days ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="VD: 30"
                min="1"
              />
              {errors.duration_days && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.duration_days}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cách dùng
              </label>
              <input
                type="text"
                value={formData.usage_instructions}
                onChange={(e) =>
                  handleInputChange("usage_instructions", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Uống sau ăn"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi chú thêm về thuốc..."
              rows="2"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationInputForm;
