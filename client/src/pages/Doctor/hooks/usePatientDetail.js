import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Create axios instance with auth header - matching the main api service configuration
const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to automatically include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "🔑 Adding token to request:",
        token.substring(0, 20) + "..."
      );
    } else {
      console.warn("⚠️ No token found in localStorage");
      console.warn(
        "⚠️ Available localStorage keys:",
        Object.keys(localStorage)
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized - Token might be invalid or expired");
      console.error(
        "❌ Current token:",
        localStorage.getItem("token")?.substring(0, 20) + "..."
      );
    }
    return Promise.reject(error);
  }
);

// Hook để lấy thông tin chi tiết bệnh nhân từ appointment data
export const usePatientDetail = (patientId, appointmentId) => {
  const [patientDetail, setPatientDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy thông tin chi tiết bệnh nhân
  const fetchPatientDetail = useCallback(async () => {
    if (!patientId) {
      setPatientDetail(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Debug: Check authentication state comprehensively
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      console.log("🔍 usePatientDetail - Auth Debug:", {
        patientId,
        appointmentId,
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token?.substring(0, 30) + "...",
        hasUser: !!user,
        userPreview: user?.substring(0, 100) + "...",
        localStorageKeys: Object.keys(localStorage),
        timestamp: new Date().toISOString(),
      });

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      console.log("🔍 usePatientDetail - Fetching patient detail for:", {
        patientId,
        appointmentId,
      });

      // Parallel fetch all APIs using axios
      const [
        currentExamResponse,
        arvResponse,
        testResultsResponse,
        examHistoryResponse,
      ] = await Promise.allSettled([
        // 1. Lấy thông tin khám hiện tại (chỉ thông tin cơ bản)
        apiClient.get(
          `/api/v1/doctors/current-exam/${patientId}${
            appointmentId ? `?appointmentId=${appointmentId}` : ""
          }`
        ),
        // 2. Lấy thông tin phác đồ ARV hiện tại
        apiClient.get(`/api/v1/doctors/current-arv/${patientId}`),
        // 3. Lấy kết quả xét nghiệm gần nhất
        apiClient.get(`/api/v1/doctors/latest-tests/${patientId}`),
        // 4. Lấy lịch sử khám
        apiClient.get(`/api/v1/doctors/exam-history/${patientId}`),
      ]);

      // Extract data from settled promises
      const currentExamData =
        currentExamResponse.status === "fulfilled"
          ? currentExamResponse.value.data
          : { success: false };
      const arvData =
        arvResponse.status === "fulfilled"
          ? arvResponse.value.data
          : { success: false };
      const testResultsData =
        testResultsResponse.status === "fulfilled"
          ? testResultsResponse.value.data
          : { success: false };
      const examHistoryData =
        examHistoryResponse.status === "fulfilled"
          ? examHistoryResponse.value.data
          : { success: false };

      console.log("🔍 API Responses:", {
        currentExam: currentExamData,
        arv: arvData,
        testResults: testResultsData,
        examHistory: examHistoryData,
      });

      // Log any failed requests
      if (currentExamResponse.status === "rejected") {
        console.error(
          "❌ Current exam API failed:",
          currentExamResponse.reason
        );
      }
      if (arvResponse.status === "rejected") {
        console.error("❌ ARV API failed:", arvResponse.reason);
      }
      if (testResultsResponse.status === "rejected") {
        console.error(
          "❌ Test results API failed:",
          testResultsResponse.reason
        );
      }
      if (examHistoryResponse.status === "rejected") {
        console.error(
          "❌ Exam history API failed:",
          examHistoryResponse.reason
        );
      }

      // Kết hợp dữ liệu từ các API
      const combinedData = {
        currentExam: currentExamData.success ? currentExamData.data : {},
        examHistory: examHistoryData.success ? examHistoryData.data : [],

        // Thông tin cơ bản từ current exam
        basicInfo: {
          patient_id: patientId,
          full_name: currentExamData.success
            ? currentExamData.data?.patient?.full_name
            : "",
          age: currentExamData.success ? currentExamData.data?.patient?.age : 0,
          gender: currentExamData.success
            ? currentExamData.data?.patient?.gender
            : "",
          phone: currentExamData.success
            ? currentExamData.data?.patient?.phone
            : "",
          dob: currentExamData.success
            ? currentExamData.data?.patient?.dob
            : "",
          address: currentExamData.success
            ? currentExamData.data?.patient?.address
            : "",
          code: currentExamData.success
            ? currentExamData.data?.patient?.ma_bn
            : `HIV${String(patientId).padStart(3, "0")}`,
        },

        // Thông tin ARV hiện tại từ API riêng
        currentArv: arvData.success ? arvData.data : null,

        // Kết quả xét nghiệm gần nhất từ API riêng (4 loại chính)
        latestTestResults: testResultsData.success
          ? testResultsData.data
          : null,

        // Thông tin appointment hiện tại
        currentAppointment: currentExamData.success
          ? currentExamData.data?.appointment
          : {},
      };

      console.log("🔍 usePatientDetail - Combined data:", combinedData);
      setPatientDetail(combinedData);
    } catch (err) {
      console.error("❌ usePatientDetail - Error:", err);
      setError(err.message || "Có lỗi xảy ra khi tải thông tin bệnh nhân");
      setPatientDetail(null);
    } finally {
      setLoading(false);
    }
  }, [patientId, appointmentId]);

  // Reset khi patientId thay đổi
  useEffect(() => {
    fetchPatientDetail();
  }, [fetchPatientDetail]);

  // Refresh function
  const refreshPatientDetail = useCallback(() => {
    fetchPatientDetail();
  }, [fetchPatientDetail]);

  return {
    patientDetail,
    loading,
    error,
    refreshPatientDetail,
  };
};
