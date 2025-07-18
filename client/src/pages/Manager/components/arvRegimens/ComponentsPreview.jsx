import React from "react";
import { CheckCircle, AlertCircle, Package } from "lucide-react";

const ComponentsPreview = ({ components, errors }) => {
  if (!components.trim()) return null;

  const drugs = components.split("+").map((comp, index) => {
    const trimmed = comp.trim();
    const match = trimmed.match(/^(.+?)\s+(\d+mg)$/);

    return {
      id: index,
      drugName: match ? match[1].trim() : trimmed,
      dosage: match ? match[2] : "",
      isValid: /^[A-Za-z\s]+\s+\d+mg$/.test(trimmed),
    };
  });

  const isValidFormat =
    !errors && drugs.length > 0 && drugs.every((d) => d.isValid);

  return (
    <div className="mt-3 p-3 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 flex items-center">
          <Package className="w-4 h-4 mr-1" />
          Xem trước ({drugs.length} thành phần)
        </h4>
        {isValidFormat ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">Hợp lệ</span>
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">Cần kiểm tra</span>
          </div>
        )}
      </div>

      <div className="space-y-1 max-h-32 overflow-y-auto">
        {drugs.map((drug, index) => (
          <div
            key={drug.id}
            className={`flex items-center justify-between p-2 rounded border ${
              drug.isValid
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  drug.isValid
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {index + 1}
              </span>
              <div>
                <p
                  className={`font-medium ${
                    drug.isValid ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {drug.drugName}
                </p>
                {drug.dosage && (
                  <p
                    className={`text-xs ${
                      drug.isValid ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {drug.dosage}
                  </p>
                )}
              </div>
            </div>
            {drug.isValid ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentsPreview;
