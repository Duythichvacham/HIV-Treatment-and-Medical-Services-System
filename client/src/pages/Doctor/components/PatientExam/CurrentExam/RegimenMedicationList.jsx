import React from "react";
import { Pill, AlertTriangle } from "lucide-react";
import MedicationCard from "./MedicationCard";

const RegimenMedicationList = ({
  regimenInfo,
  medications,
  readOnly = false,
  onUpdateMedication,
}) => {
  console.log("RegimenMedicationList render:", {
    regimenInfo,
    medications,
    medicationsLength: medications?.length || 0,
  });

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Pill className="w-4 h-4 text-blue-600" />
        <h4 className="font-medium text-blue-800">
          {regimenInfo.name} - {regimenInfo.for_group}
        </h4>
      </div>

      {regimenInfo.components && (
        <p className="text-xs text-blue-600 mb-3">
          <span className="font-medium">Thành phần:</span>{" "}
          {regimenInfo.components}
        </p>
      )}

      {/* Medication Details */}
      {medications.length > 0 && (
        <div className="border-t border-blue-200 pt-3 mt-3">
          <h5 className="text-sm font-medium text-blue-800 mb-3">
            Chi tiết thuốc trong phác đồ
          </h5>

          {/* Table container */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-4 gap-4 py-3 px-4 bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-200">
              <div>Tên thuốc</div>
              <div>Số lượng</div>
              <div>Tần suất</div>
              <div>Thời gian</div>
            </div>

            {/* Medication rows */}
            <div className="divide-y divide-gray-200">
              {medications.map((medication, index) => (
                <MedicationCard
                  key={index}
                  medication={medication}
                  index={index}
                  readOnly={readOnly}
                  onUpdateMedication={onUpdateMedication}
                />
              ))}
            </div>
          </div>

          {medications.length < 3 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Phác đồ chưa đầy đủ thông tin 3 loại thuốc. Vui lòng liên hệ bộ
              phận dược để cập nhật.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegimenMedicationList;
