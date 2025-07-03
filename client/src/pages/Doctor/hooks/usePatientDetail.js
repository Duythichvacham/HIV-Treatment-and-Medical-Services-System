import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const usePatientDetail = (patientId) => {
  const [patientDetail, setPatientDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatientDetail = useCallback(async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);

    try {
      const [arvRes, testRes] = await Promise.all([
        apiClient.get(`/api/v1/patients/current-arv-regimen/${patientId}`),
        apiClient.get(`/api/v1/patients/latest-tests/${patientId}`),
      ]);

      setPatientDetail({
        currentArv: arvRes.data?.data || null,
        latestTestResults: testRes.data?.data || null,
      });
    } catch (err) {
      setError("Lỗi khi tải thông tin bệnh nhân");
      setPatientDetail(null);
      console.error("❌ Error fetching patient detail:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatientDetail();
  }, [fetchPatientDetail]);

  return {
    patientDetail,
    loading,
    error,
    refreshPatientDetail: fetchPatientDetail,
  };
};
