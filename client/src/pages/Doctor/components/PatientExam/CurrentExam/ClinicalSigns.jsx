import React from "react";
import { COMMON_CLINICAL_SIGNS } from "../../../../../constants/clinicalSigns";

const ClinicalSigns = ({
  clinicalSigns,
  onUpdate,
  errors,
  readOnly = false,
}) => {
  const handleChange = (e) => {
    if (!readOnly) {
      onUpdate(e.target.value);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Dấu hiệu lâm sàng
      </h3>

      <div className="space-y-4">
        {/* Clinical Signs Text Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Triệu chứng và dấu hiệu lâm sàng
          </label>
          <textarea
            value={clinicalSigns || ""}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
            placeholder="Nhập các triệu chứng và dấu hiệu lâm sàng quan sát được..."
            readOnly={readOnly}
          />
          {errors && <p className="mt-1 text-sm text-red-600">{errors}</p>}
        </div>

        {/* Common Clinical Signs Quick Select */}
        {!readOnly && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dấu hiệu thường gặp (click để thêm nhanh)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_CLINICAL_SIGNS.map((sign) => (
                <button
                  key={sign}
                  type="button"
                  onClick={() => {
                    const currentText = clinicalSigns || "";
                    const newText = currentText
                      ? `${currentText}, ${sign}`
                      : sign;
                    onUpdate(newText);
                  }}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  + {sign}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalSigns;
