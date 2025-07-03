import { useState, useCallback } from "react";
import { examApi } from "../services/examApi";
import { prescriptionApi } from "../services/testRequestApi";
// import { patientApi } from "../services/patientApi";
import { VITAL_SIGNS_DEFAULTS } from "../utils/constants";
import {
  validateVitalSigns,
  validateDiagnosis,
  validatePrescription,
  validateExamCompletion,
} from "../utils/validators";

export const useExamForm = (patientId, appointmentId, patientData = null) => {
  const [examData, setExamData] = useState({
    vital_signs: { ...VITAL_SIGNS_DEFAULTS },
    clinical_signs: "",
    diagnosis_primary: "",
    diagnosis_secondary: "",
    // test_requests removed - now managed independently
    follow_up_date: "",
    prescription: {
      arv_regimen_id: null,
      support_drugs: [],
      counseling_notes: "",
      follow_up_plan: "",
      doctor_notes: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  // availableTests and ongoingTests removed - now managed in IndependentTestRequests component
  const [arvRegimens, setARVRegimens] = useState([]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (!patientId || !appointmentId) return;
    setLoading(true);
    try {
      // Use exam-data API to get saved temp data
      let examDataLoaded = false;
      let arvRes;

      try {
        console.log("[useExamForm] Trying exam-data API...");
        const [examDataRes, arvResponse] = await Promise.all([
          examApi.getExamData(appointmentId),
          prescriptionApi.getARVRegimens(),
        ]);

        arvRes = arvResponse;

        if (examDataRes.success && examDataRes.data) {
          const data = examDataRes.data;
          console.log("[useExamForm] Exam data loaded:", data);

          // Parse vitals from string format "Huyết áp: 120/80, Mạch: 72/phút, Nhiệt độ: 36.5°C"
          const parseVitals = (vitalsString) => {
            const vitals = {
              bloodPressure: "",
              heartRate: "",
              temperature: "",
            };

            if (vitalsString) {
              const bloodPressureMatch =
                vitalsString.match(/Huyết áp:\s*([^,]+)/);
              const heartRateMatch = vitalsString.match(/Mạch:\s*(\d+)/);
              const temperatureMatch =
                vitalsString.match(/Nhiệt độ:\s*([\d.]+)/);

              if (bloodPressureMatch)
                vitals.bloodPressure = bloodPressureMatch[1].trim();
              if (heartRateMatch) vitals.heartRate = heartRateMatch[1];
              if (temperatureMatch) vitals.temperature = temperatureMatch[1];
            }

            return vitals;
          };

          const parsedVitals = parseVitals(data.clinicalExam?.vitals);

          const vitals = {
            bloodPressure: parsedVitals.bloodPressure,
            heartRate: parsedVitals.heartRate,
            temperature: parsedVitals.temperature,
            weight: data.clinicalExam?.weight || "",
            height: data.clinicalExam?.height || "",
            bmi: data.clinicalExam?.bmi || "",
          };

          // Transform prescription details to support drugs format
          const supportDrugs =
            data.prescriptionDetails?.map((detail) => ({
              id: detail.detail_id,
              name: detail.drug_name,
              dosage: detail.dosage,
              frequency: detail.frequency,
              duration_days: detail.duration_days,
              usage_instructions: detail.usage_instructions,
              notes: detail.notes,
            })) || [];

          setExamData({
            vital_signs: vitals,
            clinical_signs: data.clinicalExam?.clinical_signs || "",
            diagnosis_primary: data.clinicalExam?.diagnosis_primary || "",
            diagnosis_secondary: data.clinicalExam?.diagnosis_secondary || "",
            follow_up_date: "",
            prescription: {
              arv_regimen_id: data.prescription?.arv_regimen_id || null,
              support_drugs: supportDrugs,
              counseling_notes: data.prescription?.counseling_notes || "",
              follow_up_plan: data.prescription?.follow_up_plan || "",
              doctor_notes: data.prescription?.doctor_notes || "",
            },
          });

          examDataLoaded = true;
          console.log("[useExamForm] Data loaded from exam-data API");
        }
      } catch (error) {
        console.log(
          "[useExamForm] exam-data API failed, trying fallback:",
          error
        );
      }

      // Fallback to original getCurrent API if exam-detail failed
      if (!examDataLoaded) {
        const [examRes, arvResponse] = await Promise.all([
          examApi.getCurrent(patientId, appointmentId),
          prescriptionApi.getARVRegimens(),
        ]);

        arvRes = arvResponse;
        console.log("[useExamForm] Exam API response:", examRes);

        if (examRes.data?.exam_data) {
          const serverExamData = examRes.data.exam_data;
          console.log(
            "[useExamForm] Initial exam data loaded:",
            serverExamData
          );

          // Parse vitals từ server về dạng object
          const parseVitals = (vitalsString, weight, height, bmi) => {
            const vitals = { ...VITAL_SIGNS_DEFAULTS };

            // Parse vitals string nếu có và không rỗng
            if (
              vitalsString &&
              vitalsString !== "Chưa có thông tin" &&
              vitalsString.trim() !== ""
            ) {
              // Parse string như "Huyết áp: 120/80, Mạch: 72/phút, Nhiệt độ: 36.5°C"
              const bloodPressureMatch =
                vitalsString.match(/Huyết áp:\s*([^,]+)/);
              const heartRateMatch = vitalsString.match(/Mạch:\s*(\d+)/);
              const temperatureMatch =
                vitalsString.match(/Nhiệt độ:\s*([\d.]+)/);

              if (bloodPressureMatch)
                vitals.bloodPressure = bloodPressureMatch[1].trim();
              if (heartRateMatch) vitals.heartRate = heartRateMatch[1];
              if (temperatureMatch) vitals.temperature = temperatureMatch[1];
            }

            // Set physical measurements - chỉ set nếu có giá trị thực
            if (weight && weight > 0) vitals.weight = weight;
            if (height && height > 0) vitals.height = height;
            if (bmi && bmi > 0) vitals.bmi = bmi;

            return vitals;
          };

          // Parse support drugs từ prescription details
          let supportDrugs = [];
          if (
            serverExamData.prescription_details &&
            Array.isArray(serverExamData.prescription_details)
          ) {
            supportDrugs = serverExamData.prescription_details.map(
              (detail) => ({
                drug_name: detail.drug_name || "",
                dosage: detail.dosage || "",
                frequency: detail.frequency || "",
                duration_days: detail.duration_days || "",
                usage_instructions: detail.usage_instructions || "",
                notes: detail.notes || "",
              })
            );
          }

          setExamData({
            vital_signs: parseVitals(
              serverExamData.vitals,
              serverExamData.weight,
              serverExamData.height,
              serverExamData.bmi
            ),
            clinical_signs: serverExamData.clinical_signs || "",
            diagnosis_primary: serverExamData.diagnosis_primary || "",
            diagnosis_secondary: serverExamData.diagnosis_secondary || "",
            follow_up_date: "",
            prescription: {
              arv_regimen_id: serverExamData.arv_regimen_id || null,
              support_drugs: supportDrugs,
              counseling_notes: serverExamData.counseling_notes || "",
              follow_up_plan: serverExamData.follow_up_plan || "",
              doctor_notes: serverExamData.doctor_notes || "",
            },
          });
        } else {
          // Không có exam_data hoặc exam_data là null, giữ nguyên form trống với defaults
          console.log("[useExamForm] No exam data found, keeping defaults");
        }
      }

      setARVRegimens(arvRes.data || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  }, [patientId, appointmentId]);
  // Force reload data (useful when patient status changes)
  const reloadData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);
  // Update vital signs
  const updateVitalSigns = useCallback(
    (field, value) => {
      setExamData((prev) => ({
        ...prev,
        vital_signs: {
          ...prev.vital_signs,
          [field]: value,
        },
      }));

      // Calculate BMI if weight and height are available
      if (field === "weight" || field === "height") {
        setExamData((prev) => {
          const weight =
            field === "weight"
              ? parseFloat(value)
              : parseFloat(prev.vital_signs.weight);
          const height =
            field === "height"
              ? parseFloat(value)
              : parseFloat(prev.vital_signs.height);

          if (weight && height) {
            const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
            return {
              ...prev,
              vital_signs: {
                ...prev.vital_signs,
                [field]: value,
                bmi: bmi,
              },
            };
          }

          return prev;
        });
      }

      // Clear related errors
      if (errors.vital_signs?.[field]) {
        setErrors((prev) => ({
          ...prev,
          vital_signs: {
            ...prev.vital_signs,
            [field]: undefined,
          },
        }));
      }
    },
    [errors.vital_signs]
  );

  // Update clinical signs
  const updateClinicalSigns = useCallback((value) => {
    setExamData((prev) => ({
      ...prev,
      clinical_signs: value,
    }));
  }, []);

  // Update diagnosis
  const updateDiagnosis = useCallback(
    (field, value) => {
      setExamData((prev) => ({
        ...prev,
        [`diagnosis_${field}`]: value,
      }));

      // Clear related errors
      if (errors[`diagnosis_${field}`]) {
        setErrors((prev) => ({
          ...prev,
          [`diagnosis_${field}`]: undefined,
        }));
      }
    },
    [errors]
  );

  // Update prescription
  const updatePrescription = useCallback((fieldOrObject, value) => {
    setExamData((prev) => {
      // If first param is an object, merge it
      if (typeof fieldOrObject === "object" && fieldOrObject !== null) {
        return {
          ...prev,
          prescription: {
            ...prev.prescription,
            ...fieldOrObject,
          },
        };
      }

      // If it's a string field, use field/value pattern
      return {
        ...prev,
        prescription: {
          ...prev.prescription,
          [fieldOrObject]: value,
        },
      };
    });
  }, []);

  // Add support drug
  const addSupportDrug = useCallback(() => {
    setExamData((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        support_drugs: [
          ...prev.prescription.support_drugs,
          {
            drug_name: "",
            dosage: "",
            frequency: "",
            duration_days: "",
            usage_instructions: "",
            notes: "",
          },
        ],
      },
    }));
  }, []);

  // Update support drug
  const updateSupportDrug = useCallback((index, field, value) => {
    setExamData((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        support_drugs: prev.prescription.support_drugs.map((drug, i) =>
          i === index ? { ...drug, [field]: value } : drug
        ),
      },
    }));
  }, []);

  // Remove support drug
  const removeSupportDrug = useCallback((index) => {
    setExamData((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        support_drugs: prev.prescription.support_drugs.filter(
          (_, i) => i !== index
        ),
      },
    }));
  }, []);

  // Validate form
  const validateForm = useCallback(
    (forCompletion = false) => {
      const newErrors = {};

      // Validate vital signs
      const vitalValidation = validateVitalSigns(examData.vital_signs);
      if (!vitalValidation.isValid) {
        newErrors.vital_signs = vitalValidation.errors;
      }

      // Validate diagnosis
      const diagnosisValidation = validateDiagnosis({
        primary: examData.diagnosis_primary,
        secondary: examData.diagnosis_secondary,
      });
      if (!diagnosisValidation.isValid) {
        Object.assign(newErrors, diagnosisValidation.errors);
      }

      // Validate prescription
      const prescriptionValidation = validatePrescription(
        examData.prescription
      );
      if (!prescriptionValidation.isValid) {
        newErrors.prescription = prescriptionValidation.errors;
      }

      // Additional validation for completion
      if (forCompletion) {
        const completionValidation = validateExamCompletion(examData);
        if (!completionValidation.isValid) {
          Object.assign(newErrors, completionValidation.errors);
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [examData]
  );

  // Save exam temporarily (no validation)
  const saveTemp = useCallback(async () => {
    if (!appointmentId)
      return { success: false, error: "Không có thông tin lịch hẹn" };

    setSaving(true);
    try {
      console.log("[useExamForm] Saving temp exam data:", examData);
      await examApi.saveTemp(appointmentId, examData, patientData);

      return {
        success: true,
        message: "Đã lưu tạm thông tin khám thành công",
      };
    } catch (error) {
      console.error("Error saving temp exam:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Có lỗi xảy ra khi lưu tạm",
      };
    } finally {
      setSaving(false);
    }
  }, [appointmentId, examData, patientData]);

  // Save exam (draft)
  const saveExam = useCallback(async () => {
    if (!appointmentId)
      return { success: false, error: "Không có thông tin lịch hẹn" };

    setSaving(true);
    try {
      console.log("[useExamForm] Saving exam data:", examData);
      await examApi.save(appointmentId, examData, patientData);

      // Sau khi lưu thành công, reload lại dữ liệu từ server bằng exam-data API
      console.log("[useExamForm] Save successful, reloading data...");
      await reloadData();

      return { success: true };
    } catch (error) {
      console.error("Error saving exam:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Có lỗi xảy ra khi lưu phiếu khám",
      };
    } finally {
      setSaving(false);
    }
  }, [appointmentId, examData, patientData, reloadData]);

  // Complete exam
  const completeExam = useCallback(async () => {
    if (!appointmentId)
      return { success: false, error: "Không có thông tin lịch hẹn" };

    // Validate for completion
    if (!validateForm(true)) {
      return {
        success: false,
        error: "Vui lòng nhập đầy đủ thông tin bắt buộc",
      };
    }

    setSaving(true);
    try {
      await examApi.complete(appointmentId, examData, patientData);
      return { success: true };
    } catch (error) {
      console.error("Error completing exam:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Có lỗi xảy ra khi hoàn thành khám",
      };
    } finally {
      setSaving(false);
    }
  }, [appointmentId, examData, validateForm, patientData]);

  return {
    examData,
    loading,
    saving,
    errors,
    // availableTests and ongoingTests removed - now managed in IndependentTestRequests
    arvRegimens,
    loadInitialData,
    reloadData, // Add this new function
    updateVitalSigns,
    updateClinicalSigns,
    updateDiagnosis,
    // addTestRequest and removeTestRequest removed - now managed in IndependentTestRequests
    updatePrescription,
    addSupportDrug,
    updateSupportDrug,
    removeSupportDrug,
    validateForm,
    saveTemp,
    saveExam,
    completeExam,
  };
};
