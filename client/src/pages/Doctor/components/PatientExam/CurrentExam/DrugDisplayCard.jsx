import React from "react";
import { Pill, Edit3, X } from "lucide-react";

const DrugDisplayCard = ({
  drug,
  index,
  onEdit,
  onRemove,
  type = "main", // "main" or "support"
  configured = false,
  readOnly = false,
}) => {
  const isMainDrug = type === "main";
  const bgColor = isMainDrug ? "bg-blue-50" : "bg-green-50";
  const borderColor = isMainDrug ? "border-blue-200" : "border-green-200";
  const iconColor = isMainDrug ? "text-blue-600" : "text-green-600";
  const iconBgColor = isMainDrug ? "bg-blue-100" : "bg-green-100";
  const buttonColor = isMainDrug
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-green-600 hover:bg-green-700";

  return (
    <div
      className={`flex items-center justify-between p-3 ${bgColor} rounded-lg border ${borderColor}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 ${iconBgColor} rounded-full flex items-center justify-center`}
        >
          <Pill className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <h6 className="font-medium text-gray-900">{drug.drug_name}</h6>
          {configured && (
            <p className="text-xs text-green-600">
              ✓ Đã cấu hình: {drug.dosage} - {drug.frequency} -{" "}
              {drug.duration_days} ngày
            </p>
          )}
          {!configured && isMainDrug && (
            <p className="text-xs text-gray-500">Chưa cấu hình</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!readOnly && (
          <button
            onClick={() => onEdit(drug, index)}
            className={`flex items-center gap-1 px-2 py-1 text-xs text-white rounded transition-colors ${buttonColor} disabled:opacity-50`}
          >
            <Edit3 className="w-3 h-3" />
            {configured ? "Chỉnh sửa" : "Cấu hình"}
          </button>
        )}

        {!readOnly && !isMainDrug && onRemove && (
          <button
            onClick={() => onRemove(index)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <X className="w-3 h-3" />
            Xóa
          </button>
        )}
      </div>
    </div>
  );
};

export default DrugDisplayCard;
