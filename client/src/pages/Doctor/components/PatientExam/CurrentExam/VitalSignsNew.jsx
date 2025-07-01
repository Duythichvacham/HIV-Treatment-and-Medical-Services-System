import React from "react";
import { Heart } from "lucide-react";

const VitalSigns = ({
  vitalSigns,
  onUpdate,
  errors = {},
  readOnly = false,
}) => {
  const handleChange = (field, value) => {
    if (readOnly) return;

    const updatedVitalSigns = {
      ...vitalSigns,
      [field]: value,
    };

    // Calculate BMI if weight and height are available
    if (field === "weight" || field === "height") {
      const weight =
        field === "weight"
          ? parseFloat(value)
          : parseFloat(updatedVitalSigns.weight);
      const height =
        field === "height"
          ? parseFloat(value)
          : parseFloat(updatedVitalSigns.height);

      if (weight && height && height > 0) {
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
        updatedVitalSigns.bmi = bmi;
      }
    }

    onUpdate(updatedVitalSigns);
  };

  // Generate vitals string for API
  const generateVitalsString = () => {
    const parts = [];
    if (vitalSigns.bloodPressure) {
      parts.push(`Huyết áp: ${vitalSigns.bloodPressure}`);
    }
    if (vitalSigns.heartRate) {
      parts.push(`Mạch: ${vitalSigns.heartRate}/phút`);
    }
    if (vitalSigns.temperature) {
      parts.push(`Nhiệt độ: ${vitalSigns.temperature}°C`);
    }
    return parts.join(", ");
  };

  // Expose vitals string to parent component
  React.useEffect(() => {
    if (onUpdate && typeof onUpdate === "function") {
      const vitalsString = generateVitalsString();
      onUpdate({
        ...vitalSigns,
        vitalsString,
      });
    }
  }, [vitalSigns.bloodPressure, vitalSigns.heartRate, vitalSigns.temperature]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-red-800 mb-4 border-b pb-2 flex items-center gap-2">
        <Heart className="w-5 h-5" />
        Sinh hiệu
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Huyết áp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Huyết áp <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={vitalSigns.bloodPressure || ""}
            onChange={(e) => handleChange("bloodPressure", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.bloodPressure ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="VD: 120/80"
            readOnly={readOnly}
          />
          {errors.bloodPressure && (
            <p className="text-red-500 text-sm mt-1">{errors.bloodPressure}</p>
          )}
        </div>

        {/* Nhịp tim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhịp tim (lần/phút) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={vitalSigns.heartRate || ""}
            onChange={(e) => handleChange("heartRate", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.heartRate ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="VD: 72"
            readOnly={readOnly}
          />
          {errors.heartRate && (
            <p className="text-red-500 text-sm mt-1">{errors.heartRate}</p>
          )}
        </div>

        {/* Nhiệt độ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhiệt độ (°C) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={vitalSigns.temperature || ""}
            onChange={(e) => handleChange("temperature", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.temperature ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="VD: 36.5"
            readOnly={readOnly}
          />
          {errors.temperature && (
            <p className="text-red-500 text-sm mt-1">{errors.temperature}</p>
          )}
        </div>

        {/* Cân nặng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cân nặng (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={vitalSigns.weight || ""}
            onChange={(e) => handleChange("weight", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.weight ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="VD: 65.5"
            readOnly={readOnly}
          />
          {errors.weight && (
            <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
          )}
        </div>

        {/* Chiều cao */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chiều cao (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={vitalSigns.height || ""}
            onChange={(e) => handleChange("height", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.height ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="VD: 170"
            readOnly={readOnly}
          />
          {errors.height && (
            <p className="text-red-500 text-sm mt-1">{errors.height}</p>
          )}
        </div>

        {/* BMI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BMI
          </label>
          <input
            type="text"
            value={vitalSigns.bmi || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            placeholder="Tự động tính"
            readOnly
          />
        </div>
      </div>

      {/* Vitals string preview */}
      {(vitalSigns.bloodPressure ||
        vitalSigns.heartRate ||
        vitalSigns.temperature) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Chuỗi sinh hiệu (sẽ lưu vào database):
          </label>
          <p className="text-sm text-blue-600">{generateVitalsString()}</p>
        </div>
      )}
    </div>
  );
};

export default VitalSigns;
