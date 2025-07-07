import apiClient from "./appointmentApi";
import { API_ENDPOINTS } from "../utils/constants";

export const patientApi = {
  // Get patient details
  getDetails: async (patientId) => {
    const url = API_ENDPOINTS.PATIENTS.DETAILS(patientId);
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get patient exam history - only completed appointments
  getExamHistory: async (patientId, page = 1, limit = 20) => {
    try {
      console.log(
        "[patientApi.getExamHistory] Fetching completed exam history for patient:",
        patientId
      );
      const response = await apiClient.get(`/api/v1/doctors/appointments`, {
        params: {
          patient_id: patientId,
          status: "completed",
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error("[patientApi.getExamHistory] Error:", error);
      throw error;
    }
  },

  // Get clinical exam details
  getClinicalExamDetail: async (appointmentId) => {
    try {
      console.log(
        "[patientApi.getClinicalExamDetail] Fetching clinical exam detail for appointment:",
        appointmentId
      );
      const response = await apiClient.get(
        `/api/v1/clinical/clinical-exams/${appointmentId}`
      );
      return response.data;
    } catch (error) {
      console.error("[patientApi.getClinicalExamDetail] Error:", error);
      throw error;
    }
  },

  // Get prescription details
  getPrescriptionDetail: async (appointmentId) => {
    try {
      console.log(
        "[patientApi.getPrescriptionDetail] Fetching prescription detail for appointment:",
        appointmentId
      );
      const response = await apiClient.get(
        `/api/v1/prescriptions/${appointmentId}`
      );
      return response.data;
    } catch (error) {
      console.error("[patientApi.getPrescriptionDetail] Error:", error);
      throw error;
    }
  },

  // Get patient's current treatment info
  getCurrentTreatment: async (patientId) => {
    try {
      console.log(
        "[patientApi.getCurrentTreatment] Fetching current ARV regimen for patient:",
        patientId
      );
      const url = `/api/v1/patients/current-arv-regimen/${patientId}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("[patientApi.getCurrentTreatment] Error:", error);
      throw error;
    }
  },

  // Get patient's latest test results
  getLatestTests: async (patientId) => {
    try {
      console.log(
        "[patientApi.getLatestTests] Fetching latest tests for patient:",
        patientId
      );
      const url = `/api/v1/patients/latest-tests/${patientId}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("[patientApi.getLatestTests] Error:", error);
      throw error;
    }
  },

  // Search patients
  search: async (query) => {
    const url = "/api/v1/patients/search";
    const params = { q: query };
    const response = await apiClient.get(url, { params });
    return response.data;
  },
};
