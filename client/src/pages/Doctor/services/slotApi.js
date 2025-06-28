import api from "../../../services/api";

export const slotApi = {
  // Get all available time slots
  getFullTimeSlots: async () => {
    try {
      const response = await api.get("/public/slots/full-time-slots");
      return response.data;
    } catch (error) {
      console.error("Error fetching time slots:", error);
      throw error;
    }
  },
};
