import apiClient from "./appointmentApi";
import { API_ENDPOINTS } from "../utils/constants";

export const patientApi = {
  // Get patient details
  getDetails: async (patientId) => {
    const url = API_ENDPOINTS.PATIENTS.DETAILS(patientId);
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get patient exam history
  getExamHistory: async (patientId, page = 1, limit = 20) => {
    try {
      console.log(
        "[patientApi.getExamHistory] Fetching exam history for patient:",
        patientId
      );
      const response = await apiClient.get(
        `/api/v1/doctor/exam-history/${patientId}`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("[patientApi.getExamHistory] Error:", error);
      throw error;
    }
  },

  // Get exam detail
  getExamDetail: async (patientId, appointmentId) => {
    try {
      console.log(
        "[patientApi.getExamDetail] Fetching exam detail for patient:",
        patientId,
        "appointment:",
        appointmentId
      );
      const response = await apiClient.get(
        `/api/v1/doctor/exam-detail/${patientId}/${appointmentId}`
      );
      return response.data;
    } catch (error) {
      console.error("[patientApi.getExamDetail] Error:", error);
      throw error;
    }
  },

  // Get patient's current treatment info
  getCurrentTreatment: async (patientId) => {
    const url = `/api/v1/patients/${patientId}/current-treatment`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get patient's latest test results
  getLatestTests: async (patientId) => {
    const url = `/api/v1/patients/${patientId}/latest-tests`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Search patients
  search: async (query) => {
    const url = "/api/v1/patients/search";
    const params = { q: query };
    const response = await apiClient.get(url, { params });
    return response.data;
  },
};
