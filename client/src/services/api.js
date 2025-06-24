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
    const token = localStorage.getItem("token");
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
      // Only redirect if it's not a login request (token expired case)
      const isLoginRequest = error.config?.url?.includes("/login");

      if (!isLoginRequest) {
        // Clear auth and redirect to login only for token expiration
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login/staff";
      }
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
    const response = await api.get("/api/public/services", {
      params: { type },
    });
    console.log(
      "✅ getServices response:",
      response.data || response.data.data
    );
    return response.data; // Return the full response object
  } catch (error) {
    console.error("❌ getServices error:", error);
    throw error;
  }
};
/**
 * Create appointment
 * @param {Object} appointmentData - Appointment data
 */

/**
 * Đặt lịch khám mới
 * @param {object} data - Thông tin đặt lịch
 * @returns {Promise<object>} - Kết quả đặt lịch
 */
export const createAppointment = async (data) => {
  try {
    const response = await api.post("/api/v1/appointments", data);
    return response.data;
  } catch (error) {
    console.error("❌ createAppointment error:", error);
    throw error;
  }
};

// ===========================================
// AUTH ENDPOINTS
// ===========================================

/**
 * Login user (both staff and patient)
 * @param {string} username - Username
 * @param {string} password - Password
 */
export const login = async (username, password) => {
  console.log("🔄 API Call: login with username:", username);

  try {
    const response = await api.post("/api/auth/login", {
      username: username.trim(),
      password: password.trim(),
    });

    console.log("✅ login response:", response.data);
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("❌ login error:", error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("staff");
  localStorage.removeItem("patient");
};

/**
 * Get current user info from token
 */
export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await api.get("/api/auth/me");
    return response.data;
  } catch (error) {
    console.error("❌ getCurrentUser error:", error);
    throw error;
  }
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
export const getLabQueue = async (date) => {
  const params = {};
  if (date) params.date = date;
  const response = await api.get("/api/v1/lab/queue", { params });
  return response.data.data;
};

export const getLabInProgress = async (date) => {
  const params = {};
  if (date) params.date = date;
  const response = await api.get("/api/v1/lab/in-progress", { params });
  return response.data.data;
};

export const getLabDone = async (date) => {
  const params = {};
  if (date) params.date = date;
  const response = await api.get("/api/v1/lab/done", { params });
  return response.data.data;
};

// ===========================================
// CHECK EXISTING APPOINTMENTS
// ===========================================
export const checkExistingAppointment = async (
  date,
  serviceType,
  doctorId = null
) => {
  try {
    const params = { date, serviceType };
    if (doctorId) params.doctorId = doctorId;
    const response = await api.get("/api/v1/appointments/check", { params });
    return response.data;
  } catch (error) {
    console.error("Error checking existing appointment:", error);
    throw error;
  }
};

// ===========================================
// GET USER APPOINTMENTS HISTORY
// ===========================================
export const getUserAppointments = async () => {
  try {
    const response = await api.get("/api/v1/appointments/patient");
    return response.data;
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw error;
  }
};

export default api;
