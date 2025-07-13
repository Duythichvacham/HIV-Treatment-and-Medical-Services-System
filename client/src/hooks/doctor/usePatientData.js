import { useState, useEffect, useCallback } from "react";
import { patientApi } from "../../pages/Doctor/services/patientApi";

export const usePatientData = (patientId) => {
  const [patient, setPatient] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);

  // Fetch patient details
  const fetchPatientDetails = useCallback(async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await patientApi.getDetails(patientId);
      setPatient(response.data);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải thông tin bệnh nhân");
      setPatient(null);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Fetch exam history
  const fetchExamHistory = useCallback(
    async (page = 1, append = false) => {
      if (!patientId) return;

      setHistoryLoading(true);

      try {
        const response = await patientApi.getExamHistory(patientId, page, 10);
        const newHistory = response.data.items || [];

        if (append) {
          setExamHistory((prev) => [...prev, ...newHistory]);
        } else {
          setExamHistory(newHistory);
        }

        setHasMoreHistory(newHistory.length === 10); // If less than 10, no more data
        setHistoryPage(page);
      } catch (err) {
        console.error("Error fetching exam history:", err);
        if (!append) {
          setExamHistory([]);
        }
      } finally {
        setHistoryLoading(false);
      }
    },
    [patientId]
  );

  // Load more history
  const loadMoreHistory = useCallback(() => {
    if (!historyLoading && hasMoreHistory) {
      fetchExamHistory(historyPage + 1, true);
    }
  }, [fetchExamHistory, historyLoading, hasMoreHistory, historyPage]);

  // Refresh patient data
  const refreshPatientData = useCallback(() => {
    fetchPatientDetails();
    fetchExamHistory(1, false);
  }, [fetchPatientDetails, fetchExamHistory]);

  // Get patient summary for display
  const getPatientSummary = () => {
    if (!patient) return null;

    return {
      code: patient.code || `HIV${String(patient.patient_id).padStart(3, "0")}`,
      name: patient.full_name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      currentARV: patient.current_arv?.regimen_name || "Chưa có",
      adherence: patient.current_arv?.adherence || "Chưa đánh giá",
      latestViralLoad: patient.latest_tests?.viral_load || "Chưa có",
      latestCD4: patient.latest_tests?.cd4 || "Chưa có",
      lastTestDate: patient.latest_tests?.test_date || null,
    };
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
      fetchExamHistory(1, false);
    }
  }, [patientId, fetchPatientDetails, fetchExamHistory]);

  return {
    patient,
    examHistory,
    loading,
    error,
    historyLoading,
    hasMoreHistory,
    refreshPatientData,
    loadMoreHistory,
    getPatientSummary,
  };
};
