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

  // Get exam data by appointment ID (for loading saved temp data)
  getExamData: async (appointmentId) => {
    const url = `/api/v1/doctors/exams/${appointmentId}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Save exam (draft) - sử dụng endpoint mới
  save: async (appointmentId, examData, patientData = null) => {
    console.log("[examApi.save] Saving exam data:", {
      appointmentId,
      examData,
      patientData,
    });

    // Transform vitals to string format
    const formatVitals = (vitalSigns) => {
      if (!vitalSigns) return "";

      const parts = [];
      if (vitalSigns.blood_pressure || vitalSigns.bloodPressure)
        parts.push(
          `Huyết áp: ${vitalSigns.blood_pressure || vitalSigns.bloodPressure}`
        );
      if (vitalSigns.heart_rate || vitalSigns.heartRate)
        parts.push(
          `Mạch: ${vitalSigns.heart_rate || vitalSigns.heartRate}/phút`
        );
      if (vitalSigns.temperature)
        parts.push(`Nhiệt độ: ${vitalSigns.temperature}°C`);

      return parts.join(", ");
    };

    // Get ARV regimen details for regimen_drugs
    let regimenDrugs = [];
    if (examData.prescription?.arv_regimen_id) {
      // This should be populated from ARV regimen data
      regimenDrugs = examData.prescription?.regimen_drugs || [];
    }

    // Transform support drugs to proper format
    const supportDrugNames = examData.prescription?.support_drugs || [];
    const supportDrugDetails =
      examData.prescription?.support_drug_details || [];

    // Transform data để match với backend format
    const transformedData = {
      vitals: formatVitals(examData.vital_signs),
      weight: examData.vital_signs?.weight || null,
      height: examData.vital_signs?.height || null,
      bmi: examData.vital_signs?.bmi || null,
      clinical_signs: examData.clinical_signs || "",
      diagnosis_primary: examData.diagnosis_primary || "",
      diagnosis_secondary: examData.diagnosis_secondary || "",

      arv_regimen_id: examData.prescription?.arv_regimen_id || null,
      regimen_drugs: regimenDrugs,

      support_drugs: supportDrugNames,
      support_drug_details: supportDrugDetails,

      counseling_notes: examData.prescription?.counseling_notes || "",
      follow_up_plan: examData.prescription?.follow_up_plan || "",
      doctor_notes: examData.prescription?.doctor_notes || "",

      save_type: "temp", // Lưu tạm
    };

    console.log("[examApi.save] Transformed data:", transformedData);

    const response = await apiClient.post(
      `/api/v1/doctors/exams/${appointmentId}`,
      transformedData
    );
    return response.data;
  },

  // Update exam
  update: async (appointmentId, examData) => {
    return await examApi.save(appointmentId, examData);
  },

  // Complete exam - sử dụng endpoint mới
  complete: async (appointmentId, examData, patientData = null) => {
    console.log("[examApi.complete] Completing exam data:", {
      appointmentId,
      examData,
      patientData,
    });

    // Transform vitals to string format
    const formatVitals = (vitalSigns) => {
      if (!vitalSigns) return "";

      const parts = [];
      if (vitalSigns.blood_pressure || vitalSigns.bloodPressure)
        parts.push(
          `Huyết áp: ${vitalSigns.blood_pressure || vitalSigns.bloodPressure}`
        );
      if (vitalSigns.heart_rate || vitalSigns.heartRate)
        parts.push(
          `Mạch: ${vitalSigns.heart_rate || vitalSigns.heartRate}/phút`
        );
      if (vitalSigns.temperature)
        parts.push(`Nhiệt độ: ${vitalSigns.temperature}°C`);

      return parts.join(", ");
    };

    // Get ARV regimen details for regimen_drugs
    let regimenDrugs = [];
    if (examData.prescription?.arv_regimen_id) {
      // This should be populated from ARV regimen data
      regimenDrugs = examData.prescription?.regimen_drugs || [];
    }

    // Transform support drugs to proper format
    const supportDrugNames = examData.prescription?.support_drugs || [];
    const supportDrugDetails =
      examData.prescription?.support_drug_details || [];

    // Transform data để match với backend format
    const transformedData = {
      vitals: formatVitals(examData.vital_signs),
      weight: examData.vital_signs?.weight || null,
      height: examData.vital_signs?.height || null,
      bmi: examData.vital_signs?.bmi || null,
      clinical_signs: examData.clinical_signs || "",
      diagnosis_primary: examData.diagnosis_primary || "",
      diagnosis_secondary: examData.diagnosis_secondary || "",

      arv_regimen_id: examData.prescription?.arv_regimen_id || null,
      regimen_drugs: regimenDrugs,

      support_drugs: supportDrugNames,
      support_drug_details: supportDrugDetails,

      counseling_notes: examData.prescription?.counseling_notes || "",
      follow_up_plan: examData.prescription?.follow_up_plan || "",
      doctor_notes: examData.prescription?.doctor_notes || "",

      save_type: "complete", // Hoàn thành
    };

    console.log("[examApi.complete] Transformed data:", transformedData);

    const response = await apiClient.post(
      `/api/v1/doctors/exams/${appointmentId}`,
      transformedData
    );
    return response.data;
  },

  // Save exam temporarily (no validation) - alias for save
  saveTemp: async (appointmentId, examData, patientData = null) => {
    return await examApi.save(appointmentId, examData, patientData);
  },

  // Get exam by ID
  getById: async (examId) => {
    const url = `/api/v1/doctors/exam-detail/${examId}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Delete exam (if needed)
  remove: async (examId) => {
    const url = `/api/v1/doctors/exam-detail/${examId}`;
    const response = await apiClient.delete(url);
    return response.data;
  },

  // Helper function to parse ARV regimen components into drugs array
  parseRegimenComponents: (components) => {
    if (!components) return [];

    // Split components by "+" and clean up
    const drugComponents = components.split("+").map((drug) => drug.trim());

    // Parse each drug component to extract name and dosage
    return drugComponents.map((drugComponent) => {
      // Pattern to match drug name and dosage like "Tenofovir 300mg"
      const match = drugComponent.match(/^(.+?)\s+(\d+mg)$/);

      if (match) {
        const [, drugName, dosage] = match;
        return {
          drug_name: drugName.trim(),
          dosage: dosage,
          frequency: "1 lần/ngày", // Default frequency
          duration_days: 30, // Default duration
          usage_instructions: "",
          notes: "",
        };
      } else {
        // If no dosage pattern, just use the drug name
        return {
          drug_name: drugComponent,
          dosage: "",
          frequency: "1 lần/ngày",
          duration_days: 30,
          usage_instructions: "",
          notes: "",
        };
      }
    });
  },
};
