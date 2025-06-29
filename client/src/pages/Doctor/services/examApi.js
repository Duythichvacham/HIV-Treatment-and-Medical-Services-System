import apiClient from "./appointmentApi";
import { API_ENDPOINTS } from "../utils/constants";

export const examApi = {
  // Get current exam data
  getCurrent: async (patientId, appointmentId = null) => {
    const url = API_ENDPOINTS.EXAMS.CURRENT(patientId);
    const params = appointmentId ? { appointment_id: appointmentId } : {};
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  // Save exam (draft) - sử dụng endpoint backend thực tế
  save: async (appointmentId, examData, patientData = null) => {
    console.log("[examApi.save] Saving exam data:", {
      appointmentId,
      examData,
      patientData,
    });

    // Determine ARV regimen ID
    let arvRegimenId = examData.prescription?.arv_regimen_id;

    // Transform vitals to string format for ClinicalExams table
    const formatVitals = (vitalSigns) => {
      if (!vitalSigns) return "Chưa có thông tin";

      const parts = [];
      if (vitalSigns.bloodPressure)
        parts.push(`Huyết áp: ${vitalSigns.bloodPressure}`);
      if (vitalSigns.heartRate)
        parts.push(`Mạch: ${vitalSigns.heartRate}/phút`);
      if (vitalSigns.temperature)
        parts.push(`Nhiệt độ: ${vitalSigns.temperature}°C`);

      return parts.length > 0 ? parts.join(", ") : "Chưa có thông tin";
    };

    // Transform data để match với backend format
    const transformedData = {
      appointment_id: appointmentId,

      // Clinical Exam data
      vitals: formatVitals(examData.vital_signs),
      weight: examData.vital_signs?.weight || 0,
      height: examData.vital_signs?.height || 0,
      bmi: examData.vital_signs?.bmi || 0,
      clinical_signs: examData.clinical_signs || "",
      diagnosis_primary: examData.diagnosis_primary || "",
      diagnosis_secondary: examData.diagnosis_secondary || "",

      // Prescription data
      regimen_type: arvRegimenId ? "change" : "continue",
      arv_regimen_id: arvRegimenId,
      support_drugs: examData.prescription?.support_drugs || [],
      counseling_notes: examData.prescription?.counseling_notes || "",
      follow_up_plan: examData.prescription?.follow_up_plan || "",
      doctor_notes: examData.prescription?.doctor_notes || "",

      // Note: test_requests now managed separately via testRequestApi

      is_temporary: true, // Draft save
    };

    console.log("[examApi.save] Transformed data:", transformedData);

    const response = await apiClient.post(
      "/api/v1/doctors/save-exam-data-temp",
      transformedData
    );
    return response.data;
  },

  // Update exam
  update: async (appointmentId, examData) => {
    return await examApi.save(appointmentId, examData);
  },

  // Complete exam - sử dụng endpoint backend thực tế
  complete: async (appointmentId, examData, patientData = null) => {
    console.log("[examApi.complete] Completing exam data:", {
      appointmentId,
      examData,
      patientData,
    });

    // Determine ARV regimen ID
    let arvRegimenId = examData.prescription?.arv_regimen_id;

    // Transform vitals to string format for ClinicalExams table
    const formatVitals = (vitalSigns) => {
      if (!vitalSigns) return "Chưa có thông tin";

      const parts = [];
      if (vitalSigns.bloodPressure)
        parts.push(`Huyết áp: ${vitalSigns.bloodPressure}`);
      if (vitalSigns.heartRate)
        parts.push(`Mạch: ${vitalSigns.heartRate}/phút`);
      if (vitalSigns.temperature)
        parts.push(`Nhiệt độ: ${vitalSigns.temperature}°C`);

      return parts.length > 0 ? parts.join(", ") : "Chưa có thông tin";
    };

    // Transform data để match với backend format
    const transformedData = {
      appointment_id: appointmentId,

      // Clinical Exam data
      vitals: formatVitals(examData.vital_signs),
      weight: examData.vital_signs?.weight || 0,
      height: examData.vital_signs?.height || 0,
      bmi: examData.vital_signs?.bmi || 0,
      clinical_signs: examData.clinical_signs || "",
      diagnosis_primary: examData.diagnosis_primary || "",
      diagnosis_secondary: examData.diagnosis_secondary || "",

      // Prescription data
      regimen_type: arvRegimenId ? "change" : "continue",
      arv_regimen_id: arvRegimenId,
      support_drugs: examData.prescription?.support_drugs || [],
      counseling_notes: examData.prescription?.counseling_notes || "",
      follow_up_plan: examData.prescription?.follow_up_plan || "",
      doctor_notes: examData.prescription?.doctor_notes || "",

      // Note: test_requests now managed separately via testRequestApi

      is_completed: true, // Complete exam
    };

    console.log("[examApi.complete] Transformed data:", transformedData);

    const response = await apiClient.post(
      "/api/v1/doctors/save-exam-data",
      transformedData
    );
    return response.data;
  },

  // Save exam temporarily (no validation)
  saveTemp: async (appointmentId, examData, patientData = null) => {
    console.log("[examApi.saveTemp] Saving temp exam data:", {
      appointmentId,
      examData,
      patientData,
    });

    // Determine ARV regimen ID
    let arvRegimenId = examData.prescription?.arv_regimen_id;

    // Transform vitals to string format for ClinicalExams table
    const formatVitals = (vitalSigns) => {
      if (!vitalSigns) return "Chưa có thông tin";

      const parts = [];
      if (vitalSigns.bloodPressure)
        parts.push(`Huyết áp: ${vitalSigns.bloodPressure}`);
      if (vitalSigns.heartRate)
        parts.push(`Mạch: ${vitalSigns.heartRate}/phút`);
      if (vitalSigns.temperature)
        parts.push(`Nhiệt độ: ${vitalSigns.temperature}°C`);

      return parts.length > 0 ? parts.join(", ") : "Chưa có thông tin";
    };

    // Transform data để match với backend format
    const transformedData = {
      appointment_id: appointmentId,
      vital_signs: formatVitals(examData.vital_signs), // Format as string
      weight: examData.vital_signs?.weight || null,
      height: examData.vital_signs?.height || null,
      bmi: examData.vital_signs?.bmi || null,
      clinical_signs: examData.clinical_signs || "",
      diagnosis_primary: examData.diagnosis_primary || "",
      diagnosis_secondary: examData.diagnosis_secondary || "",
      arv_regimen_id: arvRegimenId,
      support_drugs: examData.prescription?.support_drugs || [],
      counseling_notes: examData.prescription?.counseling_notes || "",
      follow_up_plan: examData.prescription?.follow_up_plan || "",
      doctor_notes: examData.prescription?.doctor_notes || "",
      follow_up_date: examData.follow_up_date || null,
      is_completed: false, // Temp save - keep in_progress
    };

    console.log("[examApi.saveTemp] Transformed data:", transformedData);

    const response = await apiClient.post(
      "/api/v1/doctors/save-exam-data-temp",
      transformedData
    );
    return response.data;
  },

  // Get exam by ID
  getById: async (examId) => {
    const url = `/api/v1/doctors/exam-detail/${examId}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Delete exam (if needed)
  delete: async (examId) => {
    const url = `/api/v1/doctors/exam-detail/${examId}`;
    const response = await apiClient.delete(url);
    return response.data;
  },
};
