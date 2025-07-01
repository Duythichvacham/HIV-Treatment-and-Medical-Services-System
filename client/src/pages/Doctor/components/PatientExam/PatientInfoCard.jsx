import React from "react";

const PatientInfoCard = ({ patientData, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">Chưa chọn bệnh nhân</p>
      </div>
    );
  }

  const { basicInfo, currentAppointment } = patientData;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Thông tin cơ bản */}
      <div>
        <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b pb-2">
          Thông tin bệnh nhân
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Họ tên:</span>
            <p className="font-medium">
              {basicInfo?.full_name || "Chưa có thông tin"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Mã BN:</span>
            <p className="font-medium text-blue-600">
              {basicInfo?.code || "N/A"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Tuổi/Giới:</span>
            <p className="font-medium">
              {basicInfo?.age || "N/A"} tuổi -{" "}
              {basicInfo?.gender === "male"
                ? "Nam"
                : basicInfo?.gender === "female"
                ? "Nữ"
                : "N/A"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Giờ hẹn:</span>
            <p className="font-medium text-green-600">
              {currentAppointment?.full_slot_time ||
                currentAppointment?.slot_time ||
                "Chưa xác định"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">SĐT:</span>
            <p className="font-medium">
              {basicInfo?.phone || "Chưa có thông tin"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Địa chỉ:</span>
            <p className="font-medium text-sm">
              {basicInfo?.address || "Chưa có thông tin"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;
