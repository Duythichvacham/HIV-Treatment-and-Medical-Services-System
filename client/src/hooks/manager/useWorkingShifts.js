import { useState, useEffect, useCallback } from "react";
import {
  getAllWorkingShifts,
  createWorkingShift,
  updateWorkingShift,
  getAvailableRooms,
  getDoctorsForDropdown,
} from "../../services/managerApi";

/**
 * Hook for managing working shifts
 */
export const useWorkingShifts = () => {
  const [workingShifts, setWorkingShifts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [shiftsRes, doctorsRes, roomsRes] = await Promise.all([
        getAllWorkingShifts(),
        getDoctorsForDropdown(),
        getAvailableRooms(),
      ]);

      setWorkingShifts(shiftsRes.data || []);
      setDoctors(doctorsRes.data || doctorsRes || []); // Handle both data.data and direct data
      setRooms(roomsRes.rooms || []);
    } catch (err) {
      console.error("Error fetching working shifts data:", err);
      setError("Không thể tải dữ liệu ca làm việc");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new working shift
  const createShift = useCallback(
    async (shiftData) => {
      try {
        setActionLoading(true);
        setError(null);

        const response = await createWorkingShift(shiftData);

        if (response.success) {
          // Refresh data after creation
          await fetchData();
          return { success: true, message: response.message };
        }

        return { success: false, message: response.message || "Có lỗi xảy ra" };
      } catch (err) {
        console.error("Error creating working shift:", err);
        const errorMessage =
          err.response?.data?.message || "Không thể tạo ca làm việc";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchData]
  );

  // Update working shift
  const updateShift = useCallback(
    async (shiftId, updateData) => {
      try {
        setActionLoading(true);
        setError(null);

        const response = await updateWorkingShift(shiftId, updateData);

        if (response.success) {
          // Refresh data after update
          await fetchData();
          return { success: true, message: response.message };
        }

        return { success: false, message: response.message || "Có lỗi xảy ra" };
      } catch (err) {
        console.error("Error updating working shift:", err);
        const errorMessage =
          err.response?.data?.message || "Không thể cập nhật ca làm việc";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchData]
  );

  // Filter shifts by doctor
  const getShiftsByDoctor = useCallback(
    (doctorId) => {
      return workingShifts.filter((shift) => shift.doctor_id === doctorId);
    },
    [workingShifts]
  );

  // Filter shifts by date
  const getShiftsByDate = useCallback(
    (date) => {
      return workingShifts.filter((shift) => {
        if (!shift.shift_date) return false;
        const shiftDate = new Date(shift.shift_date)
          .toISOString()
          .split("T")[0];
        return shiftDate === date;
      });
    },
    [workingShifts]
  );

  // Get shift statistics
  const getShiftStats = useCallback(() => {
    const total = workingShifts.length;
    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date(today);

    // Ca hôm nay
    const todayShifts = workingShifts.filter((shift) => {
      if (!shift.shift_date) return false;
      const shiftDate = new Date(shift.shift_date).toISOString().split("T")[0];
      return shiftDate === today;
    }).length;

    // Ca sắp tới (từ ngày mai trở đi và có status approved)
    const upcomingShifts = workingShifts.filter((shift) => {
      if (!shift.shift_date) return false;
      const shiftDate = new Date(shift.shift_date);
      return shiftDate > todayDate && shift.status === "approved";
    }).length;

    // Ca đã hủy (chỉ status cancelled)
    const cancelledShifts = workingShifts.filter(
      (shift) => shift.status === "cancelled"
    ).length;

    return {
      total,
      upcoming: upcomingShifts,
      today: todayShifts,
      cancelled: cancelledShifts,
    };
  }, [workingShifts]);

  // Get doctor name by ID
  const getDoctorName = useCallback(
    (doctorId) => {
      const doctor = doctors.find((d) => d.doctor_id === doctorId);
      return doctor
        ? doctor.name ||
            doctor.full_name ||
            doctor.doctor_name ||
            `Doctor ${doctorId}`
        : "Chưa xác định";
    },
    [doctors]
  );

  // Get room name by ID
  const getRoomName = useCallback(
    (roomId) => {
      const room = rooms.find((r) => r.room_id === roomId);
      return room ? room.room_name : "Chưa xác định";
    },
    [rooms]
  );

  // Check if shift is completed (in the past)
  const isShiftCompleted = useCallback((shift) => {
    if (!shift.shift_date) return false;
    const shiftDate = new Date(shift.shift_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return shiftDate < today;
  }, []);

  // Filter and search working shifts
  const filterShifts = useCallback(
    (searchTerm, filters = {}) => {
      let filteredShifts = [...workingShifts];

      // Sort by date: nearest to current time first, then furthest
      filteredShifts.sort((a, b) => {
        const dateA = new Date(a.shift_date || 0);
        const dateB = new Date(b.shift_date || 0);
        const now = new Date();

        // Calculate distance from current time
        const distanceA = Math.abs(dateA - now);
        const distanceB = Math.abs(dateB - now);

        return distanceA - distanceB;
      });

      // Search by doctor name or room name
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filteredShifts = filteredShifts.filter((shift) => {
          const doctorName = getDoctorName(shift.doctor_id).toLowerCase();
          const roomName = getRoomName(shift.room_id).toLowerCase();
          return (
            doctorName.includes(lowerSearch) || roomName.includes(lowerSearch)
          );
        });
      }

      // Filter by status
      if (filters.status !== undefined) {
        filteredShifts = filteredShifts.filter(
          (shift) => shift.status === filters.status
        );
      }

      // Filter by date range
      if (filters.startDate) {
        filteredShifts = filteredShifts.filter((shift) => {
          if (!shift.shift_date) return false;
          const shiftDate = new Date(shift.shift_date)
            .toISOString()
            .split("T")[0];
          return shiftDate >= filters.startDate;
        });
      }

      if (filters.endDate) {
        filteredShifts = filteredShifts.filter((shift) => {
          if (!shift.shift_date) return false;
          const shiftDate = new Date(shift.shift_date)
            .toISOString()
            .split("T")[0];
          return shiftDate <= filters.endDate;
        });
      }

      // Filter by doctor
      if (filters.doctorId) {
        filteredShifts = filteredShifts.filter(
          (shift) => shift.doctor_id === filters.doctorId
        );
      }

      return filteredShifts;
    },
    [workingShifts, getDoctorName, getRoomName]
  );

  // Initialize data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    // Data
    workingShifts,
    doctors,
    rooms,
    loading,
    actionLoading,
    error,

    // Actions
    createShift,
    updateShift,
    refreshData: fetchData,

    // Helpers
    getShiftsByDoctor,
    getShiftsByDate,
    getShiftStats,
    getDoctorName,
    getRoomName,
    filterShifts,
    isShiftCompleted,
  };
};
