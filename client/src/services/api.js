/**
 * Configured specifically for Vite environment
 */

import axios from "axios";
import { ENV } from "@/utils/env";

// ===========================================
// AXIOS INSTANCE CONFIGURATION
// ===========================================
const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json", // Default content type
  },
});

// ===========================================
// REQUEST INTERCEPTOR
// ===========================================
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (ENV.ENABLE_LOGGING) {
      console.log(
        ` API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => {
    if (ENV.ENABLE_LOGGING) {
      console.error("❌ Request Error:", error);
    }
    return Promise.reject(error);
  }
);

// ===========================================
// RESPONSE INTERCEPTOR
// ===========================================
api.interceptors.response.use(
  (response) => {
    if (ENV.ENABLE_LOGGING) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (ENV.ENABLE_LOGGING) {
      console.error(`❌ API Error:`, error.response?.data || error.message);
    }

    // Handle common errors
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ===========================================
// API ENDPOINTS
// ===========================================

/**
 * Get list of doctors
 * @param {string} date - Date in YYYY-MM-DD format (optional)
 */
export const getDoctors = async (date = null) => {
  console.log("🔄 API Call: getDoctors with date:", date);

  const params = {};
  if (date) params.date = date;

  try {
    const response = await api.get("/api/public/doctors/", { params });
    console.log("✅ getDoctors response:", response.data);
    return response.data.data || response.data; // Handle both formats
  } catch (error) {
    console.error("❌ getDoctors error:", error);
    throw error;
  }
};
//return response.data;
/**
 * Get list of time slots
 * @param {string} date - Date in YYYY-MM-DD format (optional)
 * @param {number} doctorId - Doctor ID (optional)
 */
export const getSlots = async (date = null, doctorId = null) => {
  console.log("🔄 API Call: getSlots with date:", date, "doctorId:", doctorId);

  const params = {};
  if (date) params.date = date;
  if (doctorId) params.doctor_id = doctorId;

  try {
    const response = await api.get("/api/public/slots/", { params });
    console.log("✅ getSlots response:", response.data);
    return response.data.data || response.data; // Handle both formats
  } catch (error) {
    console.error("❌ getSlots error:", error);
    throw error;
  }
};
/**
 * Get list of services
 * @param {string} type - Service type (e.g., "test", "consultation")
 */
// thằng này hiện tại mặc định là test vì mấy thằng kia không cần lấy
export const getServices = async (type) => {
  console.log("🔄 API Call: getServices with type:", type);

  try {
    const response = await api.get("/api/public/services/", {
      params: { type }, // Default to "test" type
    });
    console.log(
      "✅ getServices response:",
      response.data || response.data.data
    );
    return response.data.data || response.data; // Handle both formats
  } catch (error) {
    console.error("❌ getServices error:", error);
    throw error;
  }
};
/**
 * Create appointment
 * @param {Object} appointmentData - Appointment data
 */
export const createAppointment = async (appointmentData) => {
  const response = await api.post("/api/appointments/", appointmentData);
  return response.data;
};

/**
 * Get doctor by ID
 * @param {string|number} id - Doctor ID
 */
export const getDoctorById = async (id) => {
  try {
    const doctors = await getDoctors();
    return doctors.find((doc) => String(doc.id) === String(id));
  } catch (error) {
    console.error("❌ getDoctorById error:", error);
    throw error;
  }
};


/**
 * Get all services 
 */
export const getServices = async (type = "test") => {
  console.log("🔄 API Call: getServices with type:", type);

  const params = {};
  if (type) params.type = type;

  try {
    const response = await api.get("/api/public/services/", { params });
    console.log("✅ getServices response:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("❌ getServices error:", error);
    throw error;
  }
};

/**
 * Get service by ID
 * @param {string|number} id - Service ID
 */
export const getServiceById = async (id) => {
  try {
    const services = await getServices();
    return services.find((service) => String(service.service_id) === String(id));
  } catch (error) {
    console.error('❌ getServiceById error:', error);
    throw error;
  }
};

export default api;
