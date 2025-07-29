import { useState } from "react";
import { fetchExamDetails } from "../../services/examHistoryApi";
// import { fetchExamDetails } from "../../services/examHistoryApi";

export const useExamDetail = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDetail, setExamDetail] = useState(null);
  const [prescriptionDetail, setPrescriptionDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleViewDetail = async (appointmentId) => {
    setDetailLoading(true);
    setError(null);
    try {
      const { examDetail, prescriptionDetail } = await fetchExamDetails(
        appointmentId
      );
      setExamDetail(examDetail);
      setPrescriptionDetail(prescriptionDetail);
      setSelectedExam(appointmentId);
    } catch (error) {
      setError(error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedExam(null);
    setExamDetail(null);
    setPrescriptionDetail(null);
  };

  return {
    selectedExam,
    examDetail,
    prescriptionDetail,
    detailLoading,
    error,
    handleViewDetail,
    handleCloseDetail,
  };
};
