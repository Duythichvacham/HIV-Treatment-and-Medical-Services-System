import api from "../../../services/api";

export const arvRegimenApi = {
  // Get all ARV regimens
  getAll: async () => {
    try {
      const response = await api.get("/api/v1/arv-regimens/");
      return response.data;
    } catch (error) {
      console.error("Error fetching ARV regimens:", error);
      throw error;
    }
  },

  // Get ARV drugs for a selected regimen
  getById: async (regimenId) => {
    try {
      const response = await api.get(`/api/v1/arv-regimens/${regimenId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ARV regimen by ID:", error);
      throw error;
    }
  },

  // Get prescription details
  getPrescriptionDetails: async () => {
    try {
      const response = await api.get("/doctor/prescriptionDetails");
      return response.data;
    } catch (error) {
      console.error("Error fetching prescription details:", error);
      throw error;
    }
  },

  // Get latest test results for a patient
  getLatestTests: async (patientId) => {
    try {
      const response = await api.get(`/doctor/latest-tests/${patientId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching latest tests:", error);
      throw error;
    }
  },
};
