import api from "./api";

// ===========================================
// WORKING SHIFT API
// ===========================================

/**
 * Get all working shifts
 */
export const getAllWorkingShifts = async () => {
  try {
    const response = await api.get("/api/v1/managers/working-shift");
    console.log("✅ getAllWorkingShifts response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ getAllWorkingShifts error:", error);
    throw error;
  }
};

/**
 * Create new working shift
 * @param {Object} shiftData - Working shift data
 */
export const createWorkingShift = async (shiftData) => {
  try {
    const response = await api.post(
      "/api/v1/managers/working-shift",
      shiftData
    );
    console.log("✅ createWorkingShift response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ createWorkingShift error:", error);
    throw error;
  }
};

/**
 * Update working shift
 * @param {number} shiftId - Shift ID
 * @param {Object} updateData - Update data
 */
export const updateWorkingShift = async (shiftId, updateData) => {
  try {
    const response = await api.patch(
      `/api/v1/managers/working-shift/update/${shiftId}`,
      updateData
    );
    console.log("✅ updateWorkingShift response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ updateWorkingShift error:", error);
    throw error;
  }
};

/**
 * Get available rooms for working shifts
 */
export const getAvailableRooms = async () => {
  try {
    const response = await api.get("/api/v1/managers/working-shift/rooms");
    console.log("✅ getAvailableRooms response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ getAvailableRooms error:", error);
    throw error;
  }
};

// ===========================================
// DOCTOR API (for working shift assignment)
// ===========================================

/**
 * Get all doctors (for working shift assignment)
 */
export const getDoctorsForDropdown = async () => {
  try {
    // TODO: Need API endpoint to get all doctors for manager
    // For now, we'll use the public doctors endpoint
    const response = await api.get("/api/v1/managers/working-shift/doctors");
    console.log("✅ getAllDoctors response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ getAllDoctors error:", error);
    throw error;
  }
};
