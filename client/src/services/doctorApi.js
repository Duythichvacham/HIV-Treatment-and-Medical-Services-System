import api from "./api";

export const doctorApi = {
  // Fetch doctor profile by doctorId
  getDoctorProfile: async (doctorId) => {
    try {
      const response = await api.get(`VITE_API_API_PREFIX/doctors/profile/${doctorId}`);
      console.log("Doctor profile data:", response.data); // Debug
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      throw error;
    }
  },
  updateDoctorProfile: async (doctorId, data) => {
    try {
      const response = await api.patch(
        `VITE_API_API_PREFIX/doctors/profile/${doctorId}`,
        data
      );
      console.log("Updated doctor profile:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating doctor profile:", error);
      throw error;
    }
  },
};
