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
    "Content-Type": "application/json",
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

export default api;
