import React from "react";
import { Stethoscope, AlertTriangle } from "lucide-react";

const Diagnosis = ({ diagnosis, onUpdate, errors = {}, readOnly = false }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Stethoscope className="w-5 h-5 text-green-500" />
        Chẩn đoán
      </h3>

      <div className="space-y-4">
        {/* Primary Diagnosis */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
            <span className="text-red-500">*</span>
            Chẩn đoán chính
          </label>
          <textarea
            value={diagnosis.primary || ""}
            onChange={(e) => onUpdate("primary", e.target.value)}
            placeholder="Nhập chẩn đoán chính..."
            rows={3}
            readOnly={readOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.primary
                ? "border-red-500 bg-red-50"
                : readOnly
                ? "bg-gray-50"
                : ""
            }`}
          />
          {errors.primary && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4" />
              {errors.primary}
            </div>
          )}
        </div>

        {/* Secondary Diagnosis */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Chẩn đoán phụ
          </label>
          <textarea
            value={diagnosis.secondary || ""}
            onChange={(e) => onUpdate("secondary", e.target.value)}
            placeholder="Nhập chẩn đoán phụ (nếu có)..."
            rows={3}
            readOnly={readOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.secondary
                ? "border-red-500 bg-red-50"
                : readOnly
                ? "bg-gray-50"
                : ""
            }`}
          />
          {errors.secondary && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4" />
              {errors.secondary}
            </div>
          )}
        </div>
      </div>

      {/* Diagnosis Guidelines */}
      {!readOnly && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            Hướng dẫn chẩn đoán
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Chẩn đoán chính là bắt buộc để hoàn thành khám</li>
            <li>• Sử dụng mã ICD-10 khi có thể</li>
            <li>• Chẩn đoán phụ cho các bệnh lý kèm theo</li>
            <li>• Ghi rõ mức độ nghiêm trọng và tiến triển</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Diagnosis;
