import React from "react";
import { useAppointmentHistory } from "../../hooks/appointments/useAppointmentHistory";
// Thêm vào đầu file:
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";
import TableHeader from "../../components/common/TableHeader";
import AppointmentCard from "./AppointmentCard";
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
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.appointment_id}
              appointment={appointment}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;
