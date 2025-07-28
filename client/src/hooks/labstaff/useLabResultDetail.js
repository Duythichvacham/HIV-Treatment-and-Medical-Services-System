import { useState } from "react";
import { fetchLabResultDetail } from "../../services/labstaffApi";
// import { fetchLabResultDetail } from "../../services/labResultApi"; // API giả định

export const useLabResultDetail = () => {
  const [selectedLabResult, setSelectedLabResult] = useState(null);
  const [labResultDetail, setLabResultDetail] = useState(null);
  const [labResultLoading, setLabResultLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleViewLabResult = async (appointmentId) => {
    setLabResultLoading(true);
    setError(null);
    try {
      const resultDetail = await fetchLabResultDetail(appointmentId);
      setLabResultDetail(resultDetail);
      setSelectedLabResult(appointmentId);
    } catch (error) {
      console.error("Error fetching lab result detail:", error);
      setError(error.message || "Không thể tải kết quả xét nghiệm.");
    } finally {
      setLabResultLoading(false);
    }
  };

  const handleCloseLabResult = () => {
    setSelectedLabResult(null);
    setLabResultDetail(null);
  };

  return {
    selectedLabResult,
    labResultDetail,
    labResultLoading,
    error,
    handleViewLabResult,
    handleCloseLabResult,
  };
};
