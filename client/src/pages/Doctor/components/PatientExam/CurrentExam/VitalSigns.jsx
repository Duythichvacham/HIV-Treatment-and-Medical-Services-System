import React from "react";
import {
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  TrendingUp,
} from "lucide-react";
import { formatBMI, getBMIStatus } from "../../../utils/formatters";

const VitalSigns = ({
  vitalSigns,
  onUpdate,
  errors = {},
  readOnly = false,
}) => {
  const vitalFields = [
    {
      key: "heartRate",
      label: "Nhịp tim",
      icon: Heart,
      unit: "bpm",
      placeholder: "72",
      type: "number",
      min: 30,
      max: 200,
    },
    {
      key: "bloodPressure",
      label: "Huyết áp",
      icon: Activity,
      unit: "mmHg",
      placeholder: "120/80",
      type: "text",
      pattern: "\\d{2,3}/\\d{2,3}",
    },
    {
      key: "temperature",
      label: "Nhiệt độ",
      icon: Thermometer,
      unit: "°C",
      placeholder: "36.5",
      type: "number",
      step: "0.1",
      min: 35,
      max: 42,
    },
    {
      key: "weight",
      label: "Cân nặng",
      icon: Weight,
      unit: "kg",
      placeholder: "65.5",
      type: "number",
      step: "0.1",
      min: 10,
      max: 200,
    },
    {
      key: "height",
      label: "Chiều cao",
      icon: Ruler,
      unit: "cm",
      placeholder: "170",
      type: "number",
      min: 50,
      max: 250,
    },
  ];

  const calculatedBMI = formatBMI(vitalSigns.weight, vitalSigns.height);
  const bmiStatus = getBMIStatus(calculatedBMI);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-red-500" />
        Sinh hiệu
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vitalFields.map((field) => {
          const IconComponent = field.icon;
          const hasError = errors[field.key];

          return (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-gray-400" />
                {field.label}
              </label>

              <div className="relative">
                <input
                  type={field.type}
                  value={vitalSigns[field.key] || ""}
                  onChange={(e) => onUpdate(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  pattern={field.pattern}
                  readOnly={readOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    hasError
                      ? "border-red-500 bg-red-50"
                      : readOnly
                      ? "bg-gray-50"
                      : ""
                  }`}
                />
                {field.unit && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    {field.unit}
                  </span>
                )}
              </div>

              {hasError && <p className="text-sm text-red-600">{hasError}</p>}
            </div>
          );
        })}

        {/* BMI Display */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            BMI
          </label>

          <div className="relative">
            <input
              type="text"
              value={calculatedBMI || ""}
              readOnly
              placeholder="Tự động tính"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              kg/m²
            </span>
          </div>

          {bmiStatus && (
            <p className={`text-sm font-medium ${bmiStatus.color}`}>
              {bmiStatus.status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VitalSigns;
