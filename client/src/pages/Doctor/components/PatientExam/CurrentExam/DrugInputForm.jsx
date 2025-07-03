import React, { useState } from "react";
import { Trash2 } from "lucide-react";

const DrugInputForm = ({
  drug,
  onChange,
  onRemove,
  readOnly = false,
  showRemove = true,
  allowEditName = true,
}) => {
  const [drugData, setDrugData] = useState({
    drug_name: drug?.drug_name || "",
    dosage: drug?.dosage || "",
    frequency: drug?.frequency || "",
    duration_days: drug?.duration_days || "",
    usage_instructions: drug?.usage_instructions || "",
    notes: drug?.notes || "",
  });

  const handleChange = (field, value) => {
    const updatedData = { ...drugData, [field]: value };
    setDrugData(updatedData);
    onChange(updatedData);
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-4">
        <h5 className="font-medium text-gray-800">Thông tin thuốc</h5>
        {showRemove && onRemove && !readOnly && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Tên thuốc */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên thuốc <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={drugData.drug_name}
            onChange={(e) => handleChange("drug_name", e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !allowEditName || readOnly ? "bg-gray-100" : ""
            }`}
            readOnly={!allowEditName || readOnly}
            placeholder="Nhập tên thuốc"
          />
        </div>

        {/* Liều lượng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Liều lượng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={drugData.dosage}
            onChange={(e) => handleChange("dosage", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={readOnly}
            placeholder="VD: 300mg"
          />
        </div>

        {/* Tần suất */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tần suất sử dụng <span className="text-red-500">*</span>
          </label>
          <select
            value={drugData.frequency}
            onChange={(e) => handleChange("frequency", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={readOnly}
          >
            <option value="">Chọn tần suất</option>
            <option value="1 lần/ngày">1 lần/ngày</option>
            <option value="2 lần/ngày">2 lần/ngày</option>
            <option value="3 lần/ngày">3 lần/ngày</option>
            <option value="4 lần/ngày">4 lần/ngày</option>
          </select>
        </div>

        {/* Thời gian */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thời gian (ngày) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={drugData.duration_days}
            onChange={(e) =>
              handleChange("duration_days", parseInt(e.target.value) || "")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={readOnly}
            placeholder="VD: 30"
            min="1"
          />
        </div>

        {/* Hướng dẫn sử dụng */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hướng dẫn sử dụng
          </label>
          <input
            type="text"
            value={drugData.usage_instructions}
            onChange={(e) => handleChange("usage_instructions", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={readOnly}
            placeholder="VD: Uống sau ăn"
          />
        </div>

        {/* Ghi chú */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú
          </label>
          <textarea
            value={drugData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={readOnly}
            placeholder="Ghi chú thêm"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};

export default DrugInputForm;
