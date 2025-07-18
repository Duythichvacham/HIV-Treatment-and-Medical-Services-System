import React, { useState } from "react";

const AppointmentCard = ({
  appointment,
  getStatusBadge,
  formatDate,
  formatTime,
}) => {
  const statusInfo = getStatusBadge(appointment.status);
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {appointment.service_name || "Dịch vụ y tế"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {appointment.doctor_name
                  ? `Bác sĩ: ${appointment.doctor_name}`
                  : "Nhân viên y tế"}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
            >
              {statusInfo.text}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Ngày:</span>
              <p className="text-gray-900">
                {formatDate(appointment.bookingDate)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Giờ:</span>
              <p className="text-gray-900">
                {appointment.start_time && appointment.end_time
                  ? `${formatTime(appointment.start_time)} - ${formatTime(
                      appointment.end_time
                    )}`
                  : "Linh hoạt"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Số thứ tự:</span>
              <p className="text-gray-900 font-semibold">
                {appointment.queue_number || "N/A"}
              </p>
            </div>
          </div>
          {appointment.reason && (
            <div className="mt-3">
              <span className="font-medium text-gray-600">Ghi chú:</span>
              <p className="text-gray-900 text-sm mt-1">{appointment.reason}</p>
            </div>
          )}
          {appointment.room && (
            <div className="mt-2">
              <span className="font-medium text-gray-600">Phòng:</span>
              <span className="text-gray-900 ml-2">{appointment.room}</span>
            </div>
          )}
        </div>
      </div>
      {appointment.created_at && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Đặt lịch lúc: {formatDate(appointment.created_at)}{" "}
            {formatTime(appointment.created_at)}
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ml-4"
            onClick={() => setShowDetail(true)}
          >
            Chi tiết
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
