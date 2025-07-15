import { useState, useEffect, useCallback } from "react";
import { appointmentApi } from "../../pages/Doctor/services/appointmentApi";
import { APPOINTMENT_STATUS } from "../../pages/Doctor/utils/doctorConstants";

export const useAppointments = (doctorId, selectedDate) => {
  const [appointments, setAppointments] = useState({
    queue: [],
    inProgress: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments for all statuses
  const fetchAppointments = useCallback(async () => {
    if (!doctorId) {
      console.log("🔍 useAppointments - No doctorId provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await appointmentApi.getAllByDate(doctorId, selectedDate);

      // Validate data structure
      if (data && typeof data === "object") {
        const validatedData = {
          queue: Array.isArray(data.queue) ? data.queue : [],
          inProgress: Array.isArray(data.inProgress) ? data.inProgress : [],
          completed: Array.isArray(data.completed) ? data.completed : [],
        };
        console.log(
          "🔍 useAppointments - Setting validated data:",
          validatedData
        );
        setAppointments(validatedData);
      } else {
        console.log(
          "🔍 useAppointments - Invalid data structure, using empty arrays"
        );
        setAppointments({ queue: [], inProgress: [], completed: [] });
      }
    } catch (err) {
      console.error("❌ useAppointments - Error:", err);
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
      setAppointments({ queue: [], inProgress: [], completed: [] });
    } finally {
      setLoading(false);
    }
  }, [doctorId, selectedDate]);

  // Update appointment status
  const updateAppointmentStatus = useCallback(
    async (appointmentId, newStatus) => {
      try {
        await appointmentApi.updateStatus(appointmentId, newStatus);

        // Update local state based on status change
        setAppointments((prev) => {
          const newState = { ...prev };
          let movedAppointment = null;

          // Find and remove appointment from current status
          Object.keys(newState).forEach((status) => {
            const index = newState[status].findIndex(
              (apt) => apt.appointment_id === appointmentId
            );
            if (index !== -1) {
              movedAppointment = {
                ...newState[status][index],
                status: newStatus,
              };
              newState[status].splice(index, 1);
            }
          });

          // Add to new status
          if (movedAppointment) {
            switch (newStatus) {
              case APPOINTMENT_STATUS.REQUESTED:
                newState.queue.push(movedAppointment);
                break;
              case APPOINTMENT_STATUS.IN_PROGRESS:
                newState.inProgress.push(movedAppointment);
                break;
              case APPOINTMENT_STATUS.COMPLETED:
                newState.completed.push(movedAppointment);
                break;
            }
          }

          return newState;
        });

        return { success: true };
      } catch (error) {
        console.error("Error updating appointment status:", error);
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

  // Refresh appointments
  const refreshAppointments = useCallback(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Get appointment counts
  const getCounts = () => ({
    total:
      appointments.queue.length +
      appointments.inProgress.length +
      appointments.completed.length,
    queue: appointments.queue.length,
    inProgress: appointments.inProgress.length,
    completed: appointments.completed.length,
  });

  // Filter appointments by search term
  const filterAppointments = useCallback((appointmentList, searchTerm) => {
    if (!searchTerm) return appointmentList;

    const lowerSearch = searchTerm.toLowerCase();
    return appointmentList.filter(
      (appointment) =>
        (appointment.full_name || appointment.name || "")
          .toLowerCase()
          .includes(lowerSearch) ||
        (
          appointment.code ||
          (appointment.patient_id
            ? `HIV${String(appointment.patient_id).padStart(3, "0")}`
            : "")
        )
          .toLowerCase()
          .includes(lowerSearch) ||
        (appointment.phone || "").includes(searchTerm)
    );
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    updateAppointmentStatus,
    refreshAppointments,
    getCounts,
    filterAppointments,
  };
};
