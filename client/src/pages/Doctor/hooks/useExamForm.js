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
      // For managing ARV medications
      arv_medications: [],
      current_arv_medications: [],
      regimen_type: "continue", // Track whether user is continuing or changing regimen
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
        console.log("[useExamForm] Trying getSavedExamData API...");
        const [examDataRes, arvResponse] = await Promise.all([
          examApi.getSavedExamData(appointmentId),
          prescriptionApi.getARVRegimens(),
        ]);

        arvRes = arvResponse;

        if (examDataRes.success && examDataRes.data) {
          const data = examDataRes.data;
          console.log("[useExamForm] Exam data loaded:", data);

          // Lấy dữ liệu khám lâm sàng và đơn thuốc
          const clinicalData = data.clinical;
          const prescriptionData = data.prescription;

          console.log("[useExamForm] Clinical data:", clinicalData);
          console.log("[useExamForm] Prescription data:", prescriptionData);

          // Parse vital signs from database fields (huyet_ap, mach, nhiet_do)
          const vitals = {
            bloodPressure: clinicalData?.huyet_ap || "",
            heartRate: clinicalData?.mach || "",
            temperature: clinicalData?.nhiet_do || "",
            weight: clinicalData?.weight || "",
            height: clinicalData?.height || "",
            bmi: clinicalData?.bmi || "",
          };

          console.log("[useExamForm] Parsed vital signs from API:", vitals);
          console.log("[useExamForm] Original clinical data:", {
            huyet_ap: clinicalData?.huyet_ap,
            mach: clinicalData?.mach,
            nhiet_do: clinicalData?.nhiet_do,
            weight: clinicalData?.weight,
            height: clinicalData?.height,
            bmi: clinicalData?.bmi,
          });

          // Classify prescription details into main ARV drugs and support drugs
          let mainDrugs = [];
          let supportDrugs = [];

          if (prescriptionData) {
            console.log("[useExamForm] Processing prescription data");

            // Handle different API response structures
            const prescriptionDetails =
              prescriptionData.prescription_details ||
              prescriptionData.prescriptionDetails ||
              [];

            if (
              Array.isArray(prescriptionDetails) &&
              prescriptionDetails.length > 0
            ) {
              console.log(
                "[useExamForm] Processing prescription details:",
                prescriptionDetails
              );

              // Extract regimen components if available
              let regimenComponents = [];
              if (prescriptionData.components) {
                console.log(
                  "[useExamForm] Regimen components:",
                  prescriptionData.components
                );
                regimenComponents = prescriptionData.components
                  .split("+")
                  .map((comp) => comp.trim());
              }

              // Process each prescription detail
              prescriptionDetails.forEach((detail) => {
                const drugItem = {
                  drug_name: detail.drug_name,
                  dosage: detail.dosage,
                  frequency: detail.frequency,
                  duration_days: detail.duration_days,
                  usage_instructions: detail.usage_instructions,
                  notes: detail.notes,
                };

                // Check if this is a main ARV drug based on:
                // 1. Notes field contains "Phác đồ chính" or "Phác đồ hiện tại"
                // 2. The drug name appears in the regimen components
                const isMainByNotes =
                  detail.notes &&
                  (detail.notes.includes("Phác đồ chính") ||
                    detail.notes.includes("Phác đồ hiện tại"));

                const isMainByRegimen = regimenComponents.some(
                  (comp) =>
                    comp
                      .toLowerCase()
                      .includes(detail.drug_name.toLowerCase()) ||
                    detail.drug_name.toLowerCase().includes(comp.toLowerCase())
                );

                console.log(`[useExamForm] Classifying ${detail.drug_name}: `, {
                  isMainByNotes,
                  isMainByRegimen,
                  notes: detail.notes,
                });

                if (isMainByNotes || isMainByRegimen) {
                  mainDrugs.push(drugItem);
                } else {
                  supportDrugs.push(drugItem);
                }
              });
            } else {
              console.log(
                "[useExamForm] No prescription details found or invalid format"
              );
            }

            console.log("[useExamForm] Final classification:");
            console.log("[useExamForm] Main ARV drugs:", mainDrugs);
            console.log("[useExamForm] Support drugs:", supportDrugs);
          }

          setExamData({
            vital_signs: vitals,
            clinical_signs: clinicalData?.clinical_signs || "",
            diagnosis_primary: clinicalData?.diagnosis_primary || "",
            diagnosis_secondary: clinicalData?.diagnosis_secondary || "",
            follow_up_date: "",
            prescription: {
              arv_regimen_id: prescriptionData?.arv_regimen_id || null,
              support_drugs: supportDrugs,
              counseling_notes: prescriptionData?.counseling_notes || "",
              follow_up_plan: prescriptionData?.follow_up_plan || "",
              doctor_notes: prescriptionData?.doctor_notes || "",
              // Đặt loại phác đồ mặc định là "continue" nếu có arv_regimen_id
              regimen_type: prescriptionData?.arv_regimen_id
                ? "continue"
                : "change",
              // Phân loại thuốc thành thuốc chính và thuốc hỗ trợ
              arv_medications: [], // Sẽ được điền sau khi chọn phác đồ mới
              current_arv_medications: mainDrugs, // Thuốc chính hiện tại
            },
          });

          console.log("[useExamForm] Final exam data after loading:", {
            vital_signs: vitals,
            current_arv_medications: mainDrugs,
            support_drugs: supportDrugs,
          });

          examDataLoaded = true;
          console.log("[useExamForm] Data loaded from getSavedExamData API");
        }
      } catch (error) {
        console.log(
          "[useExamForm] getSavedExamData API failed, trying fallback:",
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
    console.log(
      "[useExamForm] Reloading data for appointment ID:",
      appointmentId
    );
    await loadInitialData();

    // Log the state after reload to ensure vital signs are loaded properly
    setExamData((current) => {
      console.log(
        "[useExamForm] After reload - Vital signs data:",
        current.vital_signs
      );

      // Double-check that vital signs are in the expected format (camelCase keys)
      if (current.vital_signs) {
        // Ensure all vital signs fields are properly set using camelCase keys
        const vitals = {
          ...current.vital_signs,
          // Explicitly set these fields to ensure they're present with the right keys
          heartRate: current.vital_signs.heartRate || "",
          bloodPressure: current.vital_signs.bloodPressure || "",
          temperature: current.vital_signs.temperature || "",
          weight: current.vital_signs.weight || "",
          height: current.vital_signs.height || "",
          bmi: current.vital_signs.bmi || "",
        };

        return {
          ...current,
          vital_signs: vitals,
        };
      }

      return current;
    });

    console.log("[useExamForm] Data reloaded successfully");
  }, [loadInitialData, appointmentId]);
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
    console.log(
      "[useExamForm] updatePrescription called with:",
      fieldOrObject,
      value
    );

    setExamData((prev) => {
      // If first param is an object, merge it
      if (typeof fieldOrObject === "object" && fieldOrObject !== null) {
        const newPrescription = {
          ...prev.prescription,
          ...fieldOrObject,
        };
        console.log(
          "[useExamForm] New prescription (object):",
          newPrescription
        );
        return {
          ...prev,
          prescription: newPrescription,
        };
      }

      // If it's a string field, use field/value pattern
      const newPrescription = {
        ...prev.prescription,
        [fieldOrObject]: value,
      };
      console.log("[useExamForm] New prescription (field):", newPrescription);
      return {
        ...prev,
        prescription: newPrescription,
      };
    });
  }, []);

  // Add support drug
  const addSupportDrug = useCallback((drugData) => {
    setExamData((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        support_drugs: [
          ...(prev.prescription.support_drugs || []),
          {
            drug_name: drugData.drug_name || "",
            dosage: drugData.dosage || "",
            frequency: drugData.frequency || "",
            duration_days: drugData.duration_days || "",
            usage_instructions: drugData.usage_instructions || "",
            notes: drugData.notes || "Thuốc hỗ trợ",
          },
        ],
      },
    }));
  }, []);

  // Update support drug
  const updateSupportDrug = useCallback((index, drugData) => {
    setExamData((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        support_drugs: (prev.prescription.support_drugs || []).map((drug, i) =>
          i === index ? { ...drug, ...drugData } : drug
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
        support_drugs: (prev.prescription.support_drugs || []).filter(
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
      // Log the current exam data before saving, especially vital signs
      console.log("[useExamForm] Saving temp exam data:", examData);
      console.log("[useExamForm] Saving vital signs:", examData.vital_signs);

      await examApi.saveTemp(appointmentId, examData, patientData);

      // Reload data after saving temp
      console.log("[useExamForm] Save temp successful, reloading data...");

      // Wait for reload to complete
      await reloadData();

      // Verify vital signs after reload
      console.log(
        "[useExamForm] Vital signs after reload:",
        examData.vital_signs
      );

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
  }, [appointmentId, examData, patientData, reloadData]);

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
