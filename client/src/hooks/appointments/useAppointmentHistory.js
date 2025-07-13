import { useState, useEffect, useCallback } from "react";
import { getUserAppointments } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
/**
 * Hook for handling appointment history logic
 */
export const useAppointmentHistory = () => {
  const { isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);

      console.log("🔄 Fetching appointments...");

      if (!isAuthenticated()) {
        alert("Vui lòng đăng nhập để xem lịch sử!");
        window.location.href = "/login/patient";
        return;
      }

      const response = await getUserAppointments();
      console.log("✅ API Response received:", response);

      const appointmentsData =
        response.listAppointments ||
        response.listAppointment ||
        response.appointments ||
        response.data ||
        response ||
        [];

      // 1. Sắp xếp mảng appointmentsData
      const sortedAppointments = (
        Array.isArray(appointmentsData) ? appointmentsData : []
      ).sort((a, b) => {
        // Chuyển đổi bookingDate sang đối tượng Date để so sánh
        // Sắp xếp theo thứ tự giảm dần (ngày mới nhất lên đầu)
        return new Date(b.bookingDate) - new Date(a.bookingDate);
      });

      // 2. Cập nhật state với dữ liệu đã được sắp xếp
      setAppointments(sortedAppointments);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching appointments:", err);
      setError("Không thể tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getFilteredAppointments = () => {
    if (filter === "all") return appointments;
    return appointments.filter((apt) => apt.status === filter);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      requested: {
        text: "Chờ xác nhận",
        color: "bg-yellow-100 text-yellow-800",
      },
      confirmed: { text: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
      in_progress: {
        text: "Đang thực hiện",
        color: "bg-purple-100 text-purple-800",
      },
      completed: { text: "Hoàn thành", color: "bg-green-100 text-green-800" },
      cancelled: { text: "Đã hủy", color: "bg-red-100 text-red-800" },
    };

    const statusInfo = statusMap[status] || {
      text: status,
      color: "bg-gray-100 text-gray-800",
    };
    return statusInfo;
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    try {
      if (timeStr.includes("T")) {
        return timeStr.split("T")[1].substring(0, 5);
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  return {
    // State
    appointments,
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
  };
};
