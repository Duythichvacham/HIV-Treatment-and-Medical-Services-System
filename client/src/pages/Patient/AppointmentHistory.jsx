import React from "react";
import { useAppointmentHistory } from "../../hooks/appointments/useAppointmentHistory";
// Thêm vào đầu file:
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";
import TableHeader from "../../components/common/TableHeader";
const AppointmentHistory = () => {
  const {
    // State
    loading,
    error,
    filter,

    // Actions
    setFilter,
    fetchAppointments,

    // Computed
    getFilteredAppointments,
    getStatusBadge,
    formatDate,
    formatTime,
  } = useAppointmentHistory();

  const filteredAppointments = getFilteredAppointments();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <LoadingSpinner message="Đang tải lịch sử khám bệnh..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorAlert message={error} onRetry={fetchAppointments} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <TableHeader
          title="Lịch sử khám bệnh"
          subtitle="Xem tất cả các lịch hẹn và kết quả khám bệnh của bạn"
        />
      </div>

      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Tất cả" },
            { key: "requested", label: "Chờ xác nhận" },
            { key: "confirmed", label: "Đã xác nhận" },
            { key: "in_progress", label: "Đang thực hiện" },
            { key: "completed", label: "Hoàn thành" },
            { key: "cancelled", label: "Đã hủy" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          title="Không có lịch hẹn nào"
          description={
            filter === "all"
              ? "Bạn chưa có lịch hẹn nào."
              : "Không có lịch hẹn nào với trạng thái này."
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const statusInfo = getStatusBadge(appointment.status);

            return (
              <div
                key={appointment.appointment_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
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
                            ? `${formatTime(
                                appointment.start_time
                              )} - ${formatTime(appointment.end_time)}`
                            : "Linh hoạt"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Số thứ tự:
                        </span>
                        <p className="text-gray-900 font-semibold">
                          {appointment.queue_number || "N/A"}
                        </p>
                      </div>
                    </div>

                    {appointment.reason && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-600">
                          Ghi chú:
                        </span>
                        <p className="text-gray-900 text-sm mt-1">
                          {appointment.reason}
                        </p>
                      </div>
                    )}

                    {appointment.room && (
                      <div className="mt-2">
                        <span className="font-medium text-gray-600">
                          Phòng:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {appointment.room}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {appointment.created_at && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Đặt lịch lúc: {formatDate(appointment.created_at)}{" "}
                      {formatTime(appointment.created_at)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;
