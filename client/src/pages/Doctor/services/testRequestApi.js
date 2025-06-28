import apiClient from "./appointmentApi";
import { API_ENDPOINTS } from "../utils/constants";

export const testRequestApi = {
  // Get available test services
  getAvailableTests: async () => {
    console.log("[testRequestApi.getAvailableTests] Fetching available tests");
    const response = await apiClient.get(API_ENDPOINTS.TESTS.AVAILABLE);
    return response.data;
  },

  // Get patient's ongoing tests
  getOngoingTests: async (patientId) => {
    console.log(
      "[testRequestApi.getOngoingTests] Fetching ongoing tests for patient:",
      patientId
    );
    const response = await apiClient.get(
      API_ENDPOINTS.TESTS.ONGOING(patientId)
    );
    return response.data;
  },

  // Create test request
  create: async (testRequestData) => {
    const url = API_ENDPOINTS.TESTS.CREATE_REQUEST;
    const response = await apiClient.post(url, testRequestData);
    return response.data;
  },

  // Get test request by ID
  getById: async (requestId) => {
    const url = `/api/v1/test-requests/${requestId}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Update test request
  update: async (requestId, testRequestData) => {
    const url = `/api/v1/test-requests/${requestId}`;
    const response = await apiClient.put(url, testRequestData);
    return response.data;
  },

  // Cancel test request
  cancel: async (requestId) => {
    const url = `/api/v1/test-requests/${requestId}/cancel`;
    const response = await apiClient.post(url);
    return response.data;
  },

  // Get test request history for patient
  getHistory: async (patientId, page = 1, limit = 10) => {
    const url = `/api/v1/patients/${patientId}/test-requests`;
    const params = { page, limit };
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  // Get all available test types - API mới
  getTestTypes: async () => {
    try {
      console.log("[testRequestApi.getTestTypes] Fetching test types");
      const response = await apiClient.get("/api/v1/doctor/test-types");
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

      console.log(
        "[testRequestApi.createTestRequest] Creating test request:",
        payload
      );
      const response = await apiClient.post(
        "/api/v1/doctor/independent-test-requests",
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
      console.log(
        "[testRequestApi.getTestRequestsByPatient] Fetching test requests for patient:",
        patientId
      );
      const response = await apiClient.get(
        `/api/v1/doctor/test-requests/${patientId}`
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
      const response = await apiClient.get(
        `/api/v1/doctor/test-request-details/${requestId}`
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
    console.log("[prescriptionApi.getARVRegimens] Fetching ARV regimens");
    const response = await apiClient.get("/api/v1/doctor/arv-regimens");
    return response.data;
  },

  // Create prescription
  create: async (prescriptionData) => {
    const url = API_ENDPOINTS.PRESCRIPTIONS.CREATE;
    const response = await apiClient.post(url, prescriptionData);
    return response.data;
  },

  // Update prescription
  update: async (prescriptionId, prescriptionData) => {
    const url = `/api/v1/prescriptions/${prescriptionId}`;
    const response = await apiClient.put(url, prescriptionData);
    return response.data;
  },

  // Get prescription by appointment
  getByAppointment: async (appointmentId) => {
    const url = `/api/v1/appointments/${appointmentId}/prescription`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get prescription history for patient
  getHistory: async (patientId, page = 1, limit = 10) => {
    const url = `/api/v1/patients/${patientId}/prescriptions`;
    const params = { page, limit };
    const response = await apiClient.get(url, { params });
    return response.data;
  },
};
