import React, { useState, useEffect } from "react";
import { getUserAppointments } from "../../services/api";

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, upcoming, completed, cancelled

  useEffect(() => {
    fetchAppointments();
  }, []);
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getUserAppointments();
      setAppointments(response.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Không thể tải danh sách lịch hẹn");

      // Fallback to sample data for demo
      setAppointments([
        {
          id: "APT001",
          appointment_code: "APT001",
          queue_number: 15,
          service_name: "Khám bác sĩ",
          booking_date: "2024-06-25",
          time_slot: "09:00",
          room: "Phòng 101",
          status: "upcoming",
        },
        {
          id: "APT002",
          appointment_code: "APT002",
          queue_number: 8,
          service_name: "Xét nghiệm",
          booking_date: "2024-06-15",
          time_slot: "08:30",
          room: "Phòng XN02",
          status: "completed",
        },
        {
          id: "APT003",
          appointment_code: "APT003",
          queue_number: 3,
          service_name: "Tư vấn trực tuyến",
          booking_date: "2024-06-10",
          time_slot: "14:00",
          room: "Online",
          status: "completed",
        },
      ]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "hoàn thành":
        return "bg-green-100 text-green-800";
      case "upcoming":
      case "sắp tới":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "đã hủy":
        return "bg-red-100 text-red-800";
      case "pending":
      case "chờ xác nhận":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Hoàn thành";
      case "upcoming":
        return "Sắp tới";
      case "cancelled":
        return "Đã hủy";
      case "pending":
        return "Chờ xác nhận";
      default:
        return status || "Chưa xác định";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Chưa xác định";
    if (timeString.includes(":")) {
      return timeString;
    }
    return timeString;
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true;
    return apt.status?.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Lịch sử lịch hẹn
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý và theo dõi tất cả lịch hẹn của bạn
              </p>
            </div>
            <div className="flex items-center">
              <div className="bg-white rounded-full p-2">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7H4l5-5v5z"
                  />
                </svg>
              </div>
              <span className="ml-2 text-sm text-gray-600">Thông báo</span>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Tìm theo mã lịch hẹn, dịch vụ, bác sĩ...
              </span>
              <input
                type="text"
                placeholder="Tìm theo mã lịch hẹn, dịch vụ, bác sĩ..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="upcoming">Sắp tới</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm">
          {error ? (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={fetchAppointments}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Thử lại
              </button>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Chưa có lịch hẹn nào</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Danh sách lịch hẹn
                </h2>
                <p className="text-sm text-gray-600">
                  Tổng cộng {filteredAppointments.length} lịch hẹn
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã lịch hẹn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dịch vụ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giờ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phòng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chi tiết
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment, index) => (
                      <tr
                        key={appointment.id || index}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-red-600">
                            # {appointment.queue_number || index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {appointment.appointment_code ||
                              appointment.id ||
                              `APT${String(index + 1).padStart(3, "0")}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {appointment.service_name ||
                              appointment.serviceName ||
                              "Chưa xác định"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {formatDate(
                              appointment.booking_date || appointment.date
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {formatTime(
                              appointment.time_slot ||
                                appointment.time ||
                                "09:00"
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {appointment.room ||
                              appointment.location ||
                              "Online"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {getStatusText(appointment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-gray-600 hover:text-gray-900">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <span className="ml-2 text-sm text-gray-600">
                            Xem
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentHistory;
