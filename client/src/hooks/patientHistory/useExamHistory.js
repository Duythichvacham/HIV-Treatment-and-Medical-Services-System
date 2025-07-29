// hooks/patientHistory/useExamHistory.js
import { useState, useEffect } from "react";
import { fetchExamHistory } from "../../services/examHistoryApi";
// import { fetchExamHistory } from "../../services/examHistoryApi";

export const useExamHistory = (patientId) => {
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExamHistory = async () => {
      if (!patientId) return;

      setLoading(true);
      setError(null);
      try {
        const historyData = await fetchExamHistory(patientId);
        setExamHistory(historyData);
      } catch (error) {
        // It's good practice to log the error for debugging purposes
        console.error("Failed to fetch exam history:", error);
        setError(error.message || "Failed to load exam history.");
      } finally {
        setLoading(false);
      }
    };

    loadExamHistory();
  }, [patientId]);

  return {
    examHistory,
    loading,
    error,
  };
};
