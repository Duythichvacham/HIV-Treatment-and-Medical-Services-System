import React, { useState, useEffect } from "react";
import { getUserAppointments } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const AppointmentHistory = () => {
  const { isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, requested, in_progress, completed, cancelled

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching appointments...");

      // Kiểm tra authentication trước
      if (!isAuthenticated()) {
        alert("Vui lòng đăng nhập để đặt lịch khám!");
        window.location.href = "/login/patient";
        return;
      }

      const response = await getUserAppointments();
      console.log("✅ API Response received:", response);
      console.log("🔍 Response type:", typeof response);
      console.log("🔍 Response keys:", Object.keys(response || {}));

      // Handle different response structures
      const appointmentsData =
        response.listAppointments ||
        response.listAppointment ||
        response.appointments ||
        response.data ||
        response ||
        [];

      console.log("📋 Appointments data:", appointmentsData);
      console.log("📊 Data is array:", Array.isArray(appointmentsData));
      console.log("📊 Data length:", appointmentsData?.length);

      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching appointments:", err);
      console.error("❌ Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError(
          `Không thể tải danh sách lịch hẹn. ${
            err.response?.data?.message || err.message
          }`
        );
      }
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "requested":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Hoàn thành";
      case "requested":
        return "Đã đặt lịch";
      case "in_progress":
        return "Đang tiến hành";
      case "cancelled":
        return "Đã hủy";
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
                <option value="requested">Đã đặt lịch</option>
                <option value="in_progress">Đang tiến hành</option>
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
                        key={appointment.appointment_id || index}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-red-600">
                            # {appointment.queue_number || index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {appointment.appointment_id
                              ? `APT${String(
                                  appointment.appointment_id
                                ).padStart(3, "0")}`
                              : `APT${String(index + 1).padStart(3, "0")}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {appointment.service_name ||
                              appointment.serviceName ||
                              (appointment.service_id
                                ? `Dịch vụ ID: ${appointment.service_id}`
                                : "Chưa xác định")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {formatDate(
                              appointment.bookingDate ||
                                appointment.booking_date ||
                                appointment.created_at
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {appointment.service_type === "examination" &&
                            appointment.start_time
                              ? `${new Date(
                                  appointment.start_time
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} - ${new Date(
                                  appointment.end_time
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`
                              : appointment.time_slot ||
                                appointment.time ||
                                (appointment.slot_id
                                  ? `Slot ${appointment.slot_id}`
                                  : "Trong giờ làm việc")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {appointment.room ||
                              (appointment.room_id
                                ? `Phòng ${appointment.room_id}`
                                : "Chưa xác định")}
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
