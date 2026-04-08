// import apiClient from "./appointmentApi";
import api from "../../../services/api";
import { API_ENDPOINTS } from "../utils/doctorConstants";

export const patientApi = {
  // // Get patient details
  // getDetails: async (patientId) => {
  //   const url = API_ENDPOINTS.PATIENTS.DETAILS(patientId);
  //   const response = await api.get(url);
  //   return response.data;
  // },

  // Get patient exam history - only completed appointments
  //, page = 1, limit = 20
  getExamHistory: async (patientId) => {
    try {
      console.log(
        "[patientApi.getExamHistory] Fetching completed exam history for patient:",
        patientId
      );
      const response = await api.get(`${import.meta.env.VITE_API_PREFIX}/doctors/appointments`, {
        params: {
          patient_id: patientId,
          status: "completed",
          // page,
          // limit,
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
      const response = await api.get(
        `${import.meta.env.VITE_API_PREFIX}/clinical/clinical-exams/${appointmentId}`
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
      const response = await api.get(`${import.meta.env.VITE_API_PREFIX}/prescriptions/${appointmentId}`);
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
      const url = `${import.meta.env.VITE_API_PREFIX}/patients/current-arv-regimen/${patientId}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("[patientApi.getCurrentTreatment] Error:", error);
      throw error;
    }
  },

  // Get patient's latest test results
  getLatestTests: async (patientId, appointmentId) => {
    try {
      console.log(
        "[patientApi.getLatestTests] Fetching latest tests for patient:",
        patientId
      );
      let url = `${import.meta.env.VITE_API_PREFIX}/patients/latest-tests?patientId=${patientId}`;
      if (appointmentId) {
        url += `&appointmentId=${appointmentId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("[patientApi.getLatestTests] Error:", error);
      throw error;
    }
  },

  // // Search patients
  // search: async (query) => {
  //   const url = `${import.meta.env.VITE_API_PREFIX}/patients/search`;
  //   const params = { q: query };
  //   const response = await api.get(url, { params });
  //   return response.data;
  // },
};
