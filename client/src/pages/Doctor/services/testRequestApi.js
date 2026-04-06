// import apiClient from "./appointmentApi";
import api from "../../../services/api";
import { API_ENDPOINTS } from "../utils/doctorConstants";

export const testRequestApi = {
  // Get available test services
  getAvailableTests: async () => {
    const response = await api.get(API_ENDPOINTS.TESTS.AVAILABLE);
    return response.data;
  },

  // Get patient's ongoing tests
  getOngoingTests: async (patientId) => {
    const response = await api.get(API_ENDPOINTS.TESTS.ONGOING(patientId));
    return response.data;
  },

  // Create test request
  create: async (testRequestData) => {
    const url = API_ENDPOINTS.TESTS.CREATE_REQUEST;
    const response = await api.post(url, testRequestData);
    return response.data;
  },

  // Get test request by ID
  getById: async (requestId) => {
    const url = `VITE_API_API_PREFIX/doctors/test-request-details/${requestId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Update test request
  update: async (requestId, testRequestData) => {
    const url = `VITE_API_API_PREFIX/doctors/test-request-details/${requestId}`;
    const response = await api.put(url, testRequestData);
    return response.data;
  },

  // Get test request history for patient
  getHistory: async (patientId, page = 1, limit = 10) => {
    const url = `VITE_API_API_PREFIX/doctors/test-requests/${patientId}`;
    const params = { page, limit };
    const response = await api.get(url, { params });
    return response.data;
  },

  // Get all available test types - API mới
  getTestTypes: async () => {
    try {
      const response = await api.get("VITE_API_API_PREFIX/doctors/test-types");
      return response.data;
    } catch (error) {
      console.error("[testRequestApi.getTestTypes] Error:", error);
      throw error;
    }
  },

  // Create test request - API mới cho chỉ định xét nghiệm độc lập
  createTestRequest: async (appointmentId, testRequestData) => {
    try {
      const payload = {
        appointment_id: appointmentId,
        service_id: testRequestData.service_id,
        notes: testRequestData.notes || "",
      };

      const response = await api.post(
        "VITE_API_API_PREFIX/doctors/independent-test-requests",
        payload
      );
      return response.data;
    } catch (error) {
      console.error("[testRequestApi.createTestRequest] Error:", error);
      throw error;
    }
  },

  // Get test requests by patient - API mới
  getTestRequestsByPatient: async (patientId) => {
    try {
      const response = await api.get(
        `VITE_API_API_PREFIX/doctors/test-requests/${patientId}`
      );
      return response.data;
    } catch (error) {
      console.error("[testRequestApi.getTestRequestsByPatient] Error:", error);
      throw error;
    }
  },

  // Get test request details - API mới
  getTestRequestDetails: async (requestId) => {
    try {
      console.log(
        "[testRequestApi.getTestRequestDetails] Fetching test request details:",
        requestId
      );
      const response = await api.get(
        `VITE_API_API_PREFIX/doctors/test-request-details/${requestId}`
      );
      return response.data;
    } catch (error) {
      console.error("[testRequestApi.getTestRequestDetails] Error:", error);
      throw error;
    }
  },
};

export const prescriptionApi = {
  // Get ARV regimens
  getARVRegimens: async () => {
    const response = await api.get("VITE_API_API_PREFIX/arv-regimens/");
    return response.data;
  },

  // Get drugs for specific ARV regimen
  getRegimenDrugs: async (regimenId) => {
    const response = await api.get(`VITE_API_API_PREFIX/arv-regimens/${regimenId}`);
    return response.data;
  },

  // Create prescription
  create: async (prescriptionData) => {
    const url = API_ENDPOINTS.PRESCRIPTIONS.CREATE;
    const response = await api.post(url, prescriptionData);
    return response.data;
  },

  // // Update prescription
  // update: async (prescriptionId, prescriptionData) => {
  //   const url = `VITE_API_API_PREFIX/doctors/prescriptions/${prescriptionId}`;
  //   const response = await api.put(url, prescriptionData);
  //   return response.data;
  // },

  // Get prescription by appointment
  getByAppointment: async (appointmentId) => {
    const url = `VITE_API_API_PREFIX/doctors/prescriptionDetails`;
    const response = await api.get(url, { params: { appointmentId } });
    return response.data;
  },

  // Get prescription history for patient
  getHistory: async (patientId, page = 1, limit = 10) => {
    const url = `VITE_API_API_PREFIX/doctors/prescriptionDetails`;
    const params = { patientId, page, limit };
    const response = await api.get(url, { params });
    return response.data;
  },
};
