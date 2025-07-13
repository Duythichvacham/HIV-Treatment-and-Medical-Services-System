import { useState, useEffect, useCallback } from "react";
import {
  fetchSelfRegisteredOrders,
  fetchDoctorOrders,
  // Đổi tên các hàm import để tránh đệ quy vô hạn
  updateTestRequestStatus as apiUpdateTestRequestStatus,
  updateLabAppointmentStatus as apiUpdateLabAppointmentStatus,
  saveTestResults as apiSaveTestResults,
} from "../../services/labstaffApi";
// import { TEST_QUEUE_TYPES } from "../utils/constants";

const serviceIdToName = {
  3: "Xét nghiệm CD4 và Viral Load",
  4: "Xét nghiệm sàng lọc",
  5: "Xét nghiệm khẳng định",
};

// Thay đổi chữ ký của hook: nhận `date` thay vì `params` object
const useLabAppointments = (date) => {
  const [appointments, setAppointments] = useState({
    requested: [],
    inProgress: [],
    completed: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatOrder = useCallback((order, source) => {
    const normalizeStatus = (status) => {
      if (status === "pending" || status === "requested") return "requested";
      if (status === "in_progress") return "in_progress";
      if (status === "completed") return "completed";
      return "requested"; // Mặc định
    };

    return {
      id: order.appointment_id,
      name: order.full_name || "Unknown",
      phone: order.phone || "N/A",
      timeBookingDate: order.bookingDate || new Date().toISOString(),
      serviceIds: Array.isArray(order.service_id)
        ? order.service_id
        : [order.service_id],
      serviceNames: Array.isArray(order.service_name)
        ? order.service_name
        : [
            order.service_name ||
              serviceIdToName[order.service_id] ||
              "Unknown Service",
          ],
      status: normalizeStatus(order.status),
      source,
      requestId: order.request_id || null,
      patientId: order.patient_id || 0,
      age: order.age || 0,
      gender: order.gender || "unknown",
      email: order.email || "N/A",
      address: order.address || "N/A",
      createdAt: order.created_at || new Date().toISOString(),
      testTypes: order.testTypes || [],
    };
  }, []);

  const fetchAppointments = useCallback(async () => {
    // Sử dụng `date` trực tiếp từ tham số của hook
    if (!date) {
      console.log("🔍 useLabAppointments - No date provided");
      return;
    }
    console.log("🔍 useLabAppointments - Starting fetch with:", { date });
    setLoading(true);
    setError(null);
    try {
      const [selfOrders, doctorOrders] = await Promise.all([
        fetchSelfRegisteredOrders({ date }),
        fetchDoctorOrders({ date }),
      ]);
      console.log("🔍 useLabAppointments - Received data:", {
        selfOrders,
        doctorOrders,
      });

      const formattedData = [
        ...selfOrders.map((order) => formatOrder(order, "appointment")),
        ...doctorOrders.map((order) => formatOrder(order, "doctor_request")),
      ];

      setAppointments({
        requested: formattedData.filter(
          (order) => order.status === "requested"
        ),
        inProgress: formattedData.filter(
          (order) => order.status === "in_progress"
        ),
        completed: formattedData.filter(
          (order) => order.status === "completed"
        ),
      });
      setError(null);
    } catch (err) {
      console.error(
        "❌ useLabAppointments - Error:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu");
      setAppointments({ requested: [], inProgress: [], completed: [] });
    } finally {
      setLoading(false);
    }
  }, [date, formatOrder]); // Dependency chính là `date` và `formatOrder`

  const updateTestRequestStatus = useCallback(async (requestId, status) => {
    try {
      console.log("[useLabAppointments] Updating test request status:", {
        requestId,
        status,
      });
      const response = await apiUpdateTestRequestStatus(requestId, status);
      setAppointments((prev) => {
        const newState = { ...prev };
        let movedTest = null;
        Object.keys(newState).forEach((queue) => {
          const index = newState[queue].findIndex(
            (test) => test.requestId === requestId
          );
          if (index !== -1) {
            movedTest = { ...newState[queue][index], status };
            newState[queue].splice(index, 1);
          }
        });
        if (movedTest) {
          switch (status) {
            case "requested":
              newState.requested.push(movedTest);
              break;
            case "in_progress":
              newState.inProgress.push(movedTest);
              break;
            case "completed":
              newState.completed.push(movedTest);
              break;
          }
        }
        return newState;
      });
      return { success: true, data: response };
    } catch (error) {
      console.error(
        "[useLabAppointments] Error updating test request status:",
        error
      );
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật trạng thái",
      };
    }
  }, []);

  const updateLabAppointmentStatus = useCallback(
    async (appointmentId, status) => {
      try {
        console.log("[useLabAppointments] Updating lab appointment status:", {
          appointmentId,
          status,
        });
        const response = await apiUpdateLabAppointmentStatus(
          appointmentId,
          status
        );
        setAppointments((prev) => {
          const newState = { ...prev };
          let movedTest = null;
          Object.keys(newState).forEach((queue) => {
            const index = newState[queue].findIndex(
              (test) => test.id === appointmentId
            );
            if (index !== -1) {
              movedTest = { ...newState[queue][index], status };
              newState[queue].splice(index, 1);
            }
          });
          if (movedTest) {
            switch (status) {
              case "requested":
                newState.requested.push(movedTest);
                break;
              case "in_progress":
                newState.inProgress.push(movedTest);
                break;
              case "completed":
                newState.completed.push(movedTest);
                break;
            }
          }
          return newState;
        });
        return { success: true, data: response };
      } catch (error) {
        console.error(
          "[useLabAppointments] Error updating lab appointment status:",
          error
        );
        return {
          success: false,
          error:
            error.response?.data?.message ||
            "Có lỗi xảy ra khi cập nhật trạng thái",
        };
      }
    },
    []
  );

  const saveTestResults = useCallback(async (payload) => {
    try {
      console.log("[useLabAppointments] Saving test results:", payload);
      // Chỉ gọi API và trả về kết quả, không thay đổi state ở đây
      const response = await apiSaveTestResults(payload);
      return { success: true, data: response };
    } catch (error) {
      console.error("[useLabAppointments] Error saving test results:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi lưu kết quả xét nghiệm",
      };
    }
  }, []);

  const getServiceTypeCounts = useCallback(() => {
    const stats = {
      cd4_viral: 0,
      screening: 0,
      confirmation: 0,
      completed: appointments.completed.length,
    };
    [
      ...appointments.requested,
      ...appointments.inProgress,
      ...appointments.completed,
    ].forEach((order) => {
      order.serviceIds.forEach((serviceId) => {
        if (serviceId === 3) stats.cd4_viral += 1;
        if (serviceId === 4) stats.screening += 1;
        if (serviceId === 5) stats.confirmation += 1;
      });
    });
    return stats;
  }, [appointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]); // fetchAppointments đã có dependency là `date`

  return {
    appointments,
    loading,
    error,
    getServiceTypeCounts,
    updateTestRequestStatus,
    updateLabAppointmentStatus,
    saveTestResults,
    refreshAppointments: fetchAppointments,
  };
};

export default useLabAppointments;
