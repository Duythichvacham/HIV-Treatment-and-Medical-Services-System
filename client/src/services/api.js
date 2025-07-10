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
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        const userType = localStorage.getItem("userType");
        localStorage.removeItem("userType");
        if (userType === "staff") {
          window.location.href = "/login/staff";
        }
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

/**
 * Confirm payment for appointment
 * @param {number} appointmentId - Appointment ID
 * @param {string} paymentMethod - Payment method (cash, qr_code)
 */
export const confirmAppointmentPayment = async (
  appointmentId,
  paymentMethod
) => {
  try {
    const response = await api.post(
      `/api/v1/appointments/${appointmentId}/confirm-payment`,
      {
        paymentMethod: paymentMethod,
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ confirmAppointmentPayment error:", error);
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
      // Lưu loại user
      if (response.data.role === "Patient") {
        localStorage.setItem("userType", "patient");
      } else {
        localStorage.setItem("userType", "staff");
      }
    }

    return response.data;
  } catch (error) {
    console.error("❌ login error:", error);
    throw error;
  }
};

/**
 * Get current user info from token (UNUSED - user info is decoded from JWT)
 * TODO: Remove this function if not needed or implement /api/auth/me endpoint
 */
// export const getCurrentUser = async () => {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     throw new Error("No token found");
//   }

//   try {
//     const response = await api.get("/api/auth/me");
//     return response.data;
//   } catch (error) {
//     console.error("❌ getCurrentUser error:", error);
//     throw error;
//   }
// };

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

// ===========================================
// LAB STAFF API ENDPOINTS
// ===========================================

/**
 * Get all lab tests with optional filtering
 * @param {string} status - Filter by status (requested, in_progress, completed, cancelled)
 * @param {string} date - Filter by date (YYYY-MM-DD format)
 * @param {number} lab_staff_id - Filter by lab staff ID
 * @param {number} room_id - Filter by room ID
 */
export const getAllLabTests = async (
  status = null,
  date = null,
  lab_staff_id = null,
  room_id = null
) => {
  const params = {};
  if (status) params.status = status;
  if (date) params.date = date;
  if (lab_staff_id) params.lab_staff_id = lab_staff_id;
  if (room_id) params.room_id = room_id;

  const response = await api.get("/api/v1/lab/lab-tests", { params });
  return response.data.data;
};

/**
 * Get lab queue (wrapper for getAllLabTests)
 * @param {string} date - Filter by date (YYYY-MM-DD format)
 * @param {number} lab_staff_id - Filter by lab staff ID
 * @param {number} room_id - Filter by room ID
 */
export const getLabQueue = async (
  date,
  lab_staff_id = null,
  room_id = null
) => {
  return getAllLabTests("requested", date, lab_staff_id, room_id);
};

/**
 * Get lab in progress (wrapper for getAllLabTests)
 * @param {string} date - Filter by date (YYYY-MM-DD format)
 * @param {number} lab_staff_id - Filter by lab staff ID
 * @param {number} room_id - Filter by room ID
 */
export const getLabInProgress = async (
  date,
  lab_staff_id = null,
  room_id = null
) => {
  return getAllLabTests("in_progress", date, lab_staff_id, room_id);
};

/**
 * Get lab done (wrapper for getAllLabTests)
 * @param {string} date - Filter by date (YYYY-MM-DD format)
 * @param {number} lab_staff_id - Filter by lab staff ID
 * @param {number} room_id - Filter by room ID
 */
export const getLabDone = async (date, lab_staff_id = null, room_id = null) => {
  return getAllLabTests("completed", date, lab_staff_id, room_id);
};

/**
 * Get list of lab rooms
 */
export const getLabRooms = async () => {
  const response = await api.get("/api/v1/lab/rooms");
  return response.data.data;
};

/**
 * Get lab staff shifts
 * @param {string} date - Filter by date (YYYY-MM-DD format)
 * @param {number} lab_staff_id - Filter by lab staff ID
 */
export const getLabStaffShifts = async (date = null, lab_staff_id = null) => {
  const params = {};
  if (date) params.date = date;
  if (lab_staff_id) params.lab_staff_id = lab_staff_id;

  const response = await api.get("/api/v1/lab/shifts", { params });
  return response.data.data;
};

/**
 * Get current lab staff shift
 * @param {number} lab_staff_id - Lab staff ID (required)
 * @param {string} date - Filter by date (YYYY-MM-DD format, default: today)
 */
export const getCurrentLabStaffShift = async (lab_staff_id, date = null) => {
  const params = { lab_staff_id };
  if (date) params.date = date;

  const response = await api.get("/api/v1/lab/current-shift", { params });
  return response.data.data;
};

// ===========================================
// CHECK EXISTING APPOINTMENTS
// ===========================================
export const checkExistingAppointment = async (
  serviceId,
  bookingDate,
  doctorId = null
) => {
  try {
    const params = { serviceId, bookingDate };
    if (doctorId) params.doctorId = doctorId;

    const response = await api.get("/api/v1/appointments/check-existing", {
      params,
    });
    return response.data.data;
  } catch (error) {
    console.error("Error checking existing appointment:", error);
    // Return false để cho phép đặt lịch tiếp tục nếu có lỗi server
    return { hasExisting: false };
  }
};

// ===========================================
// GET USER APPOINTMENTS HISTORY
// ===========================================
export const getUserAppointments = async () => {
  try {
    const response = await api.get("/api/v1/patients/appointment-history");
    return response.data;
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw error;
  }
};

// ===========================================
// REGISTRATION STAFF API ENDPOINTS
// ===========================================

/**
 * Get pending test requests for registration staff
 */
export const getPendingTestRequests = async () => {
  try {
    const response = await api.get(
      "/api/v1/registrations/test-requests/pending"
    );
    console.log("API getPendingTestRequests response:", response);
    return response.data;
  } catch (error) {
    console.error("❌ getPendingTestRequests error:", error);
    throw error;
  }
};

/**
 * Approve test request and process payment
 * @param {number} requestId - Test request ID
 * @param {string} paymentMethod - Payment method (cash, qr_code)
 */
export const approveTestRequest = async (requestId, paymentMethod) => {
  try {
    const response = await api.patch(
      `/api/v1/registrations/test-requests/${requestId}/approve`,
      {
        payment_method: paymentMethod,
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ approveTestRequest error:", error);
    throw error;
  }
};

/**
 * Get registration staff statistics
 */
export const getRegistrationStatistics = async () => {
  try {
    const response = await api.get(
      "/api/v1/registrations/test-requests/statistics"
    );
    return response.data;
  } catch (error) {
    console.error("❌ getRegistrationStatistics error:", error);
    throw error;
  }
};

/**
 * Get payment history for registration staff
 * @param {string} date - Filter by date (YYYY-MM-DD format)
 * @param {string} search - Search term
 */
export const getPaymentHistory = async (date = null, search = null) => {
  try {
    const params = {};
    if (date) params.date = date;
    if (search) params.search = search;

    const response = await api.get(
      "/api/v1/registrations/test-requests/payment-history",
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ getPaymentHistory error:", error);
    throw error;
  }
};

// ===========================================
// ADMIN/MANAGER ENDPOINTS
// ===========================================

/**
 * Manual cancel all pending appointments for today (Admin/Manager only)
 */
export const cancelPendingAppointments = async () => {
  try {
    const response = await api.post("/api/v1/appointments/cancel-pending");
    return response.data;
  } catch (error) {
    console.error("❌ cancelPendingAppointments error:", error);
    throw error;
  }
};

/**
 * Get lab statistics for Lab Staff dashboard
 * @param {string} date - Filter by date (YYYY-MM-DD format)
 * @param {number} lab_staff_id - Filter by lab staff ID
 */
export const getLabStatistics = async (date = null, lab_staff_id = null) => {
  try {
    const params = {};
    if (date) params.date = date;
    if (lab_staff_id) params.lab_staff_id = lab_staff_id;

    const response = await api.get("/api/v1/lab/statistics", { params });
    return response.data;
  } catch (error) {
    console.error("❌ getLabStatistics error:", error);
    throw error;
  }
};

/**
 * Update test status (for Lab Staff workflow)
 * @param {number} test_id - Test ID
 * @param {string} status - New status (requested, in_progress, completed)
 */
export const updateTestStatus = async (test_id, status) => {
  try {
    const response = await api.patch(`/api/v1/lab/tests/${test_id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("❌ updateTestStatus error:", error);
    throw error;
  }
};

/**
 * Get test note details by ID
 * @param {number} test_note_id - Test note ID
 */
export const getTestNoteDetails = async (test_note_id) => {
  try {
    const response = await api.get(`/api/v1/lab/test-notes/${test_note_id}`);
    return response.data;
  } catch (error) {
    console.error("❌ getTestNoteDetails error:", error);
    throw error;
  }
};

/**
 * Get test results by test note ID
 * @param {number} test_note_id - Test note ID
 */
export const getTestResults = async (test_note_id) => {
  try {
    const response = await api.get(`/api/v1/lab/test-results/${test_note_id}`);
    return response.data;
  } catch (error) {
    console.error("❌ getTestResults error:", error);
    throw error;
  }
};

/**
 * Get latest test results for a patient
 * @param {number} patient_id - Patient ID
 */
export const getLatestTestResultsForPatient = async (patient_id) => {
  try {
    const response = await api.get(
      `/api/v1/lab/test-latest-results/${patient_id}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ getLatestTestResultsForPatient error:", error);
    throw error;
  }
};

/**
 * Create test note
 * @param {object} noteData - Test note data
 */
export const createTestNote = async (noteData) => {
  try {
    const response = await api.post("/api/v1/lab/test-notes", noteData);
    return response.data;
  } catch (error) {
    console.error("❌ createTestNote error:", error);
    throw error;
  }
};

/**
 * Update test note
 * @param {number} test_note_id - Test note ID
 * @param {object} updateData - Data to update
 */
export const updateTestNote = async (test_note_id, updateData) => {
  try {
    const response = await api.patch(
      `/api/v1/lab/test-notes/${test_note_id}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("❌ updateTestNote error:", error);
    throw error;
  }
};

/**
 * Create test result
 * @param {object} resultData - Test result data
 */
export const createTestResult = async (resultData) => {
  try {
    const response = await api.post("/api/v1/lab/test-results", resultData);
    return response.data;
  } catch (error) {
    console.error("❌ createTestResult error:", error);
    throw error;
  }
};
export const getInvoiceInfo = async (appointmentId) => {
  try {
    const response = await api.get(
      `/api/v1/appointments/${appointmentId}/invoice`
    );
    return response.data;
  } catch (error) {
    console.error("❌ getInvoiceInfo error:", error);
    throw error;
  }
};
export default api;
