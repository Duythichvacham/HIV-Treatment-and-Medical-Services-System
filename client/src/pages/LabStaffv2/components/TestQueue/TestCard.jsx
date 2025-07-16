import React from "react";
import { formatDateVietnamese } from "../../../../utils/dateUtil";

const TestCard = ({ test, index, statusType, onClick }) => {
  const patientIdDisplay = test.patientId
    ? `${test.patientId.toString().padStart(3, "0")}`
    : "N/A";

  return (
    <div
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          #{index} - {test.name}
        </h4>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            statusType === "requested"
              ? "bg-orange-100 text-orange-800"
              : statusType === "in_progress"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {statusType === "requested"
            ? "Chờ xử lý"
            : statusType === "in_progress"
            ? "Đang xử lý"
            : "Hoàn thành"}
        </span>
      </div>
      <p className="text-sm text-gray-600">Mã bệnh nhân: {patientIdDisplay}</p>
      <p className="text-sm text-gray-600">
        Dịch vụ: {test.serviceNames.join(", ")}
      </p>
      <p className="text-sm text-gray-600">
        Ngày đặt: {formatDateVietnamese(test.timeBookingDate)}
      </p>
      <p className="text-sm text-gray-600">
        Nguồn:{" "}
        {test.source === "doctor_request" ? "Bác sĩ chỉ định" : "Tự đăng ký"}
      </p>
    </div>
  );
};

export default TestCard;
