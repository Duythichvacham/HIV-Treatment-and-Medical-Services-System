// import { patientApi } from "../../../services/patientApi";

import { patientApi } from "../pages/Doctor/services/patientApi";

export const fetchExamHistory = async (patientId) => {
  try {
    console.log(
      "[examHistoryService] Loading completed exam history for patient:",
      patientId
    );
    const response = await patientApi.getExamHistory(patientId);
    console.log("[examHistoryService] Exam history response:", response);
    return response.data || [];
  } catch (error) {
    console.error("Error loading exam history:", error);
    throw new Error("Không thể tải lịch sử khám");
  }
};

export const fetchExamDetails = async (appointmentId) => {
  try {
    const [clinicalResponse, prescriptionResponse] = await Promise.all([
      patientApi.getClinicalExamDetail(appointmentId),
      patientApi.getPrescriptionDetail(appointmentId),
    ]);
    return {
      examDetail: clinicalResponse.data || null,
      prescriptionDetail: prescriptionResponse.data || null,
    };
  } catch (error) {
    console.error("Error loading exam detail:", error);
    throw new Error("Không thể tải chi tiết buổi khám");
  }
};
