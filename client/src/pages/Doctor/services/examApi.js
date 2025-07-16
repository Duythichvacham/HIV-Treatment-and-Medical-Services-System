// import apiClient from "./appointmentApi";
import { API_ENDPOINTS } from "../utils/doctorConstants";
import api from "../../../services/api";

export const examApi = {
  // Get current exam data
  getCurrent: async (patientId, appointmentId = null) => {
    const url = API_ENDPOINTS.EXAMS.CURRENT(patientId);
    const params = appointmentId ? { appointment_id: appointmentId } : {};
    const response = await api.get(url, { params });
    return response.data;
  },

  // Get exam data by appointment ID (for loading saved temp data)
  // getExamData: async (appointmentId) => {
  //   // Use the clinical exam endpoint to get existing exam data
  //   const url = `/api/v1/clinical/clinical-exams/${appointmentId}`;
  //   const response = await api.get(url);
  //   return response.data;
  // },

  // Get saved prescription and clinical data for continuing exam
  getSavedExamData: async (appointmentId) => {
    try {
      console.log("[examApi.getSavedExamData] API URLs:", {
        clinicalURL: `/api/v1/clinical/clinical-exams/${appointmentId}`,
        prescriptionURL: `/api/v1/prescriptions/${appointmentId}`,
      });

      // Load both clinical exam and prescription data
      const [clinicalResponse, prescriptionResponse] = await Promise.all([
        api.get(`/api/v1/clinical/clinical-exams/${appointmentId}`),
        api.get(`/api/v1/prescriptions/${appointmentId}`),
      ]);

      // Extract prescription_details and rename to match expected format
      const clinicalData = clinicalResponse.data?.data || null;
      const prescriptionData = prescriptionResponse.data?.data || null;

      // Map prescriptionDetails to prescription_details for consistency
      if (prescriptionData && prescriptionData.prescriptionDetails) {
        prescriptionData.prescription_details =
          prescriptionData.prescriptionDetails;
      }

      return {
        success: true,
        data: {
          clinical: clinicalData,
          prescription: prescriptionData,
        },
      };
    } catch (error) {
      console.error("[examApi.getSavedExamData] Error:", error);

      // Handle 404 errors gracefully (no saved data)
      if (error.response?.status === 404) {
        return {
          success: true,
          data: {
            clinical: null,
            prescription: null,
          },
        };
      }

      throw error;
    }
  },

  // Save exam (temp) - save clinical exam + prescription
  save: async (appointmentId, examData, patientData = null) => {
    console.log("[examApi.save] Saving exam data:", {
      appointmentId,
      examData,
      patientData,
    });

    console.log("[examApi.save] Prescription data:", examData.prescription);
    console.log(
      "[examApi.save] ARV regimen ID:",
      examData.prescription?.arv_regimen_id
    );

    try {
      // Step 1: Save clinical exam
      const clinicalExamData = {
        appointment_id: appointmentId,
        huyet_ap: examData.vital_signs?.bloodPressure || "",
        mach: examData.vital_signs?.heartRate || "",
        nhiet_do: examData.vital_signs?.temperature || "",
        weight: examData.vital_signs?.weight || null,
        height: examData.vital_signs?.height || null,
        bmi: examData.vital_signs?.bmi || null,
        clinical_signs: examData.clinical_signs || "",
        diagnosis_primary: examData.diagnosis_primary || "",
        diagnosis_secondary: examData.diagnosis_secondary || "",
      };

      console.log("[examApi.save] Saving clinical exam:", clinicalExamData);
      const clinicalResponse = await api.post(
        `/api/v1/clinical/clinical-exams`,
        clinicalExamData
      );

      // Step 2: Save prescription if there's prescription data
      let prescriptionResponse = null;
      if (examData.prescription) {
        // Build prescription_detail array from ARV medications and support drugs
        const prescriptionDetail = [];

        console.log("[examApi.save] Prescription data structure:", {
          arv_medications: examData.prescription.arv_medications,
          current_arv_medications:
            examData.prescription.current_arv_medications,
          support_drugs: examData.prescription.support_drugs,
          regimen_type: examData.prescription.regimen_type,
        });

        // Determine which ARV medications to use based on regimen_type
        // Only add ONE set of ARV medications (either new regimen or current regimen, not both)
        const isUsingNewRegimen =
          examData.prescription.regimen_type === "change";
        const isUsingCurrentRegimen =
          examData.prescription.regimen_type === "continue";

        console.log("[examApi.save] Regimen selection logic:", {
          regimen_type: examData.prescription.regimen_type,
          isUsingNewRegimen,
          isUsingCurrentRegimen,
        });

        if (
          isUsingNewRegimen &&
          examData.prescription.arv_medications &&
          examData.prescription.arv_medications.length > 0
        ) {
          console.log(
            "[examApi.save] Adding NEW ARV medications (regimen change):",
            examData.prescription.arv_medications
          );
          examData.prescription.arv_medications.forEach((drug) => {
            // Always include all ARV drugs, regardless of configured status
            prescriptionDetail.push({
              drug_name: drug.drug_name,
              dosage: drug.dosage || "300mg", // Default dosage if not specified
              frequency: drug.frequency || "1 lần/ngày", // Default frequency
              duration_days: parseInt(drug.duration_days) || 30, // Default duration
              usage_instructions:
                drug.usage_instructions || "Uống theo chỉ định của bác sĩ",
              notes: drug.notes || "Phác đồ chính",
            });
          });
        } else if (
          isUsingCurrentRegimen &&
          examData.prescription.current_arv_medications &&
          examData.prescription.current_arv_medications.length > 0
        ) {
          console.log(
            "[examApi.save] Adding CURRENT ARV medications (continue regimen):",
            examData.prescription.current_arv_medications
          );
          examData.prescription.current_arv_medications.forEach((drug) => {
            // Always include all current ARV drugs, regardless of configured status
            prescriptionDetail.push({
              drug_name: drug.drug_name,
              dosage: drug.dosage || "300mg", // Default dosage if not specified
              frequency: drug.frequency || "1 lần/ngày", // Default frequency
              duration_days: parseInt(drug.duration_days) || 30, // Default duration
              usage_instructions:
                drug.usage_instructions || "Uống theo chỉ định của bác sĩ",
              notes: drug.notes || "Phác đồ hiện tại",
            });
          });
        } else {
          // Fallback: If regimen_type is not set, prioritize new regimen over current
          if (
            examData.prescription.arv_medications &&
            examData.prescription.arv_medications.length > 0
          ) {
            console.log(
              "[examApi.save] Adding ARV medications (fallback - new regimen):",
              examData.prescription.arv_medications
            );
            examData.prescription.arv_medications.forEach((drug) => {
              prescriptionDetail.push({
                drug_name: drug.drug_name,
                dosage: drug.dosage || "300mg",
                frequency: drug.frequency || "1 lần/ngày",
                duration_days: parseInt(drug.duration_days) || 30,
                usage_instructions:
                  drug.usage_instructions || "Uống theo chỉ định của bác sĩ",
                notes: drug.notes || "Phác đồ chính",
              });
            });
          } else if (
            examData.prescription.current_arv_medications &&
            examData.prescription.current_arv_medications.length > 0
          ) {
            console.log(
              "[examApi.save] Adding current ARV medications (fallback - current regimen):",
              examData.prescription.current_arv_medications
            );
            examData.prescription.current_arv_medications.forEach((drug) => {
              prescriptionDetail.push({
                drug_name: drug.drug_name,
                dosage: drug.dosage || "300mg",
                frequency: drug.frequency || "1 lần/ngày",
                duration_days: parseInt(drug.duration_days) || 30,
                usage_instructions:
                  drug.usage_instructions || "Uống theo chỉ định của bác sĩ",
                notes: drug.notes || "Phác đồ hiện tại",
              });
            });
          }
        }

        // Add support drugs if any
        const supportDrugNames = []; // Track support drug names for support_drugs string
        if (
          examData.prescription.support_drugs &&
          examData.prescription.support_drugs.length > 0
        ) {
          console.log(
            "[examApi.save] Adding support drugs:",
            examData.prescription.support_drugs
          );
          examData.prescription.support_drugs.forEach((drug) => {
            prescriptionDetail.push({
              drug_name: drug.drug_name,
              dosage: drug.dosage || "300mg", // Default dosage if not specified
              frequency: drug.frequency || "1 lần/ngày", // Default frequency
              duration_days: parseInt(drug.duration_days) || 30, // Default duration
              usage_instructions:
                drug.usage_instructions || "Uống theo chỉ định của bác sĩ",
              notes: drug.notes || "Thuốc hỗ trợ",
            });
            // Add drug name to support drugs list
            supportDrugNames.push(drug.drug_name);
          });
        }

        console.log(
          "[examApi.save] Final prescription_detail:",
          prescriptionDetail
        );
        console.log("[examApi.save] Support drug names:", supportDrugNames);

        const prescriptionData = {
          appointment_id: appointmentId,
          arv_regimen_id: examData.prescription.arv_regimen_id || null,
          support_drugs: supportDrugNames.join(" + ") || "", // Join support drug names with " + "
          counseling_notes: examData.prescription.counseling_notes || "",
          follow_up_plan: examData.prescription.follow_up_plan || "",
          doctor_notes: examData.prescription.doctor_notes || "",
          prescription_detail: prescriptionDetail,
        };

        console.log("[examApi.save] Saving prescription:", prescriptionData);
        prescriptionResponse = await api.post(
          `/api/v1/prescriptions/`,
          prescriptionData
        );
      }

      return {
        success: true,
        clinical_exam: clinicalResponse.data,
        prescription: prescriptionResponse?.data,
      };
    } catch (error) {
      console.error("[examApi.save] Error saving exam:", error);
      throw error;
    }
  },

  // Update exam
  update: async (appointmentId, examData) => {
    return await examApi.save(appointmentId, examData);
  },

  // Complete exam - save clinical exam + prescription + update appointment status
  complete: async (appointmentId, examData, patientData = null) => {
    console.log("[examApi.complete] Completing exam data:", {
      appointmentId,
      examData,
      patientData,
    });

    try {
      // Step 1 & 2: Save clinical exam and prescription (same as save method)
      const saveResult = await examApi.save(
        appointmentId,
        examData,
        patientData
      );

      // Step 3: Update appointment status to completed
      console.log(
        "[examApi.complete] Updating appointment status to completed"
      );
      const statusResponse = await api.patch(
        `/api/v1/appointments/${appointmentId}/status`,
        { status: "completed" }
      );

      return {
        success: true,
        clinical_exam: saveResult.clinical_exam,
        prescription: saveResult.prescription,
        appointment_status: statusResponse.data,
      };
    } catch (error) {
      console.error("[examApi.complete] Error completing exam:", error);
      throw error;
    }
  },

  // Save exam temporarily (no validation) - alias for save
  saveTemp: async (appointmentId, examData, patientData = null) => {
    return await examApi.save(appointmentId, examData, patientData);
  },

  // Get exam by ID
  getById: async (examId) => {
    const url = `/api/v1/doctors/exam-detail/${examId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Helper function to parse ARV regimen components into drugs array
  // parseRegimenComponents: (components) => {
  //   if (!components) return [];

  //   // Split components by "+" and clean up
  //   const drugComponents = components.split("+").map((drug) => drug.trim());

  //   // Parse each drug component to extract name and dosage
  //   return drugComponents.map((drugComponent) => {
  //     // Pattern to match drug name and dosage like "Tenofovir 300mg"
  //     const match = drugComponent.match(/^(.+?)\s+(\d+mg)$/);

  //     if (match) {
  //       const [, drugName, dosage] = match;
  //       return {
  //         drug_name: drugName.trim(),
  //         dosage: dosage,
  //         frequency: "1 lần/ngày", // Default frequency
  //         duration_days: 30, // Default duration
  //         usage_instructions: "",
  //         notes: "",
  //       };
  //     } else {
  //       // If no dosage pattern, just use the drug name
  //       return {
  //         drug_name: drugComponent,
  //         dosage: "",
  //         frequency: "1 lần/ngày",
  //         duration_days: 30,
  //         usage_instructions: "",
  //         notes: "",
  //       };
  //     }
  //   });
  // },
};
