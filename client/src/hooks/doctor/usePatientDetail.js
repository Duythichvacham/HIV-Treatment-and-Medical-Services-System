import { useState, useEffect, useCallback } from "react";
// import axios from "axios";
import api from "../../services/api";
import { patientApi } from "../../pages/Doctor/services/patientApi";

// // Axios instance
// const apiClient = axios.create({
//   baseURL: "http://localhost:5000",
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// Add request interceptor to include auth token
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

export const usePatientDetail = (patientId) => {
  const [patientDetail, setPatientDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Auto-refresh test results every 30 seconds to check for new results
  useEffect(() => {
    if (!patientId) return;

    // Internal fetch function
    const fetchPatientDetailInternal = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch ARV regimen and test results separately to handle 404 cases
        let arvData = null;
        let testData = null;

        // Try to get ARV regimen - might return 404 for new patients
        try {
          const arvRes = await api.get(
            `VITE_API_API_PREFIX/patients/current-arv-regimen/${patientId}`
          );
          arvData = arvRes.data?.data || null;
          console.log("[usePatientDetail] ARV response:", arvRes.data);
        } catch (arvErr) {
          if (arvErr.response?.status === 404) {
            console.log(
              "[usePatientDetail] No ARV regimen found for new patient - this is normal"
            );
            arvData = null;
          } else {
            throw arvErr; // Re-throw if it's not a 404
          }
        }

        // Try to get test results - might return 404 for new patients
        try {
          const testRes = await api.get(
            `VITE_API_API_PREFIX/patients/latest-tests/${patientId}`
          );
          testData = testRes.data?.data || null;
        } catch (testErr) {
          if (testErr.response?.status === 404) {
            console.log(
              "[usePatientDetail] No test results found for new patient - this is normal"
            );
            testData = null;
          } else {
            throw testErr; // Re-throw if it's not a 404
          }
        }

        setPatientDetail({
          currentArv: arvData,
          latestTestResults: testData,
        });

        setLastRefresh(new Date());
      } catch (err) {
        setError("Lỗi khi tải thông tin bệnh nhân");
        setPatientDetail(null);
        console.error("❌ Error fetching patient detail:", err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchPatientDetailInternal();

    // Set up auto-refresh for test results (disabled for now to avoid spam)
    // const interval = setInterval(() => {
    //   console.log("[usePatientDetail] Auto-refreshing test results...");
    //   fetchPatientDetailInternal();
    // }, 30000); // Refresh every 30 seconds

    // return () => clearInterval(interval);
  }, [patientId]);

  // Public refresh function that can be called manually
  const refreshPatientDetail = useCallback(async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch ARV regimen and test results separately to handle 404 cases
      let arvData = null;
      let testData = null;

      // Try to get ARV regimen - might return 404 for new patients
      try {
        const arvRes = await patientApi.getCurrentTreatment(patientId);
        // const arvRes = await api.get(
        //   `VITE_API_API_PREFIX/patients/current-arv-regimen/${patientId}`
        // );
        arvData = arvRes.data?.data || null;
        console.log("[usePatientDetail] ARV response:", arvRes.data);
      } catch (arvErr) {
        if (arvErr.response?.status === 404) {
          console.log(
            "[usePatientDetail] No ARV regimen found for new patient - this is normal"
          );
          arvData = null;
        } else {
          throw arvErr; // Re-throw if it's not a 404
        }
      }

      // Try to get test results - might return 404 for new patients
      try {
        const testRes = patientApi.getLatestTests(patientId);
        // const testRes = await api.get(
        //   `VITE_API_API_PREFIX/patients/latest-tests/${patientId}`
        // );
        testData = testRes.data?.data || null;
        console.log("[usePatientDetail] Test response:", testRes.data);
      } catch (testErr) {
        if (testErr.response?.status === 404) {
          console.log(
            "[usePatientDetail] No test results found for new patient - this is normal"
          );
          testData = null;
        } else {
          throw testErr; // Re-throw if it's not a 404
        }
      }

      setPatientDetail({
        currentArv: arvData,
        latestTestResults: testData,
      });

      setLastRefresh(new Date());
    } catch (err) {
      setError("Lỗi khi tải thông tin bệnh nhân");
      setPatientDetail(null);
      console.error("❌ Error refreshing patient detail:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  return {
    patientDetail,
    loading,
    error,
    lastRefresh,
    refreshPatientDetail,
  };
};
