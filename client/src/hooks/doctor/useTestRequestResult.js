import { useState, useEffect } from "react";
import api from "../../services/api";
// import api from "../../utils/api"; // Đảm bảo đường dẫn đến file `api` đúng

const useTestRequestResult = (patientId, appointmentId) => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      if (!patientId) {
        setTestResults(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let url = `${import.meta.env.VITE_API_PREFIX}/patients/latest-tests/${patientId}`;
        if (appointmentId) {
          url += `?appointmentId=${appointmentId}`;
        }

        const testRes = await api.get(url);

        setTestResults(testRes.data?.data || null);
      } catch (err) {
        console.error("[useTestRequestResult] API call failed:", err);
        if (err.response?.status === 404) {
          console.log(
            "[useTestRequestResult] No test results found for this patient."
          );
          setTestResults(null);
        } else {
          console.error(
            "[useTestRequestResult] Error fetching test results:",
            err
          );
          setError(err.message || "Error fetching test results");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [patientId, appointmentId]);

  return { testResults, loading, error };
};

export default useTestRequestResult;
