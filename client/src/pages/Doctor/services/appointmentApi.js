// import axios from "axios";
import api from "../../../services/api";

// const baseURL = "http://localhost:5000";

// // Create axios instance with default config
// const apiClient = axios.create({
//   baseURL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Add auth token to requests
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Handle response errors
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error("API Error:", error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );

export const appointmentApi = {
  // Get appointments by status using the new API endpoint
  getQueue: async (doctorId, date) => {
    const url = `/api/v1/doctors/appointments`;
    const params = {
      doctor_id: doctorId,
      status: "requested",
      bookingDate: date,
    };
    console.log("🔍 getQueue - Request params:", params);
    const response = await api.get(url, { params });
    console.log("🔍 getQueue - Raw response:", response);
    console.log("🔍 getQueue - Response data:", response.data);

    // Handle different response structures
    if (response.data && response.data.data) {
      return response.data.data; // Backend returns { success: true, data: [...] }
    }
    return response.data || []; // Direct array or fallback
  },

  getInProgress: async (doctorId, date) => {
    const url = `/api/v1/doctors/appointments`;
    const params = {
      doctor_id: doctorId,
      status: "in_progress",
      bookingDate: date,
    };
    console.log("🔍 getInProgress - Request params:", params);
    const response = await api.get(url, { params });
    console.log("🔍 getInProgress - Response data:", response.data);

    // Handle different response structures
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data || [];
  },

  getCompleted: async (doctorId, date) => {
    const url = `/api/v1/doctors/appointments`;
    const params = {
      doctor_id: doctorId,
      status: "completed",
      bookingDate: date,
    };
    console.log("🔍 getCompleted - Request params:", params);
    const response = await api.get(url, { params });
    console.log("🔍 getCompleted - Response data:", response.data);

    // Handle different response structures
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data || [];
  },

  // Get all appointments for a doctor on a specific date
  getAllByDate: async (doctorId, date) => {
    try {
      console.log("🔍 getAllByDate - Starting fetch for:", { doctorId, date });

      const [queueRes, inProgressRes, completedRes] = await Promise.all([
        appointmentApi.getQueue(doctorId, date),
        appointmentApi.getInProgress(doctorId, date),
        appointmentApi.getCompleted(doctorId, date),
      ]);

      console.log("🔍 getAllByDate - Individual results:");
      console.log("  Queue:", queueRes);
      console.log("  InProgress:", inProgressRes);
      console.log("  Completed:", completedRes);

      const result = {
        queue: Array.isArray(queueRes) ? queueRes : [],
        inProgress: Array.isArray(inProgressRes) ? inProgressRes : [],
        completed: Array.isArray(completedRes) ? completedRes : [],
      };

      console.log("🔍 getAllByDate - Final result:", result);
      return result;
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      return {
        queue: [],
        inProgress: [],
        completed: [],
      };
    }
  },

  // Update appointment status
  updateStatus: async (appointmentId, status) => {
    const url = `/api/v1/appointments/${appointmentId}/status`;
    const response = await api.post(url, { status });
    return response.data;
  },

  // Get appointments by slot using the new API
  getBySlot: async (doctorId, date, slotId, status = null) => {
    const url = `/api/v1/doctors/appointments`;
    const params = {
      doctor_id: doctorId,
      bookingDate: date,
      slot_id: slotId,
    };
    if (status) {
      params.status = status;
    }
    console.log("🔍 getBySlot - Request params:", params);
    const response = await api.get(url, { params });
    console.log("🔍 getBySlot - Response data:", response.data);

    // Handle different response structures
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data || [];
  },

  // Get appointments with multiple filters
  getWithFilters: async (doctorId, filters = {}) => {
    const url = `/api/v1/doctors/appointments`;
    const params = {
      doctor_id: doctorId,
      ...filters, // Can include: status, slot_id, bookingDate
    };
    console.log("🔍 getWithFilters - Request params:", params);
    const response = await api.get(url, { params });
    console.log("🔍 getWithFilters - Response data:", response.data);

    // Handle different response structures
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data || [];
  },
};

export default api;
