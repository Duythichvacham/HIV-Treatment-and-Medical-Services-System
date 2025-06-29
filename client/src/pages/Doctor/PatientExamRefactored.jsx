import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";

// Components
import PatientInfoCard from "./components/PatientExam/PatientInfoCard";
import ExamTabs from "./components/PatientExam/ExamTabs";
import VitalSigns from "./components/PatientExam/CurrentExam/VitalSigns";
import ClinicalSigns from "./components/PatientExam/CurrentExam/ClinicalSigns";
import TestRequests from "./components/PatientExam/CurrentExam/TestRequests";
import SimpleTestRequests from "./components/PatientExam/CurrentExam/SimpleTestRequests";
import Diagnosis from "./components/PatientExam/CurrentExam/Diagnosis";
import Prescription from "./components/PatientExam/CurrentExam/Prescription";
import ExamActions from "./components/PatientExam/CurrentExam/ExamActions";
import ExamHistoryList from "./components/PatientExam/ExamHistoryList";
import LoadingSpinner from "./components/Dashboard/LoadingSpinner";

// Hooks
import { usePatientDetail } from "./hooks/usePatientDetail";
import { useExamForm } from "./hooks/useExamForm";

// Utils
import { EXAM_TABS, EXAM_MODES } from "./utils/constants";

const PatientExamRefactored = ({
  patientId,
  appointmentId,
  patientInfo, // Thông tin patient từ appointments API
  onBack,
  onFinishExam,
  mode = EXAM_MODES.EDIT,
}) => {
  const [activeExamTab, setActiveExamTab] = useState(EXAM_TABS.CURRENT);

  // Custom hooks - always load for ARV and test results
  const { patientDetail, loading: patientLoading } = usePatientDetail(
    patientId,
    appointmentId
  );

  // Create patient data from patientInfo or fallback to usePatientDetail
  const combinedPatientData = useMemo(() => {
    if (patientInfo) {
      // Use basic info from appointments API, but keep ARV and test results from patientDetail
      return {
        basicInfo: {
          patient_id: patientInfo.patient_id,
          full_name: patientInfo.full_name || "Chưa có thông tin",
          age: patientInfo.age || 0,
          gender: patientInfo.gender || "",
          phone: patientInfo.phone || "Chưa có thông tin",
          address: patientInfo.address || "Chưa có thông tin",
          code: `HIV${String(patientInfo.patient_id).padStart(3, "0")}`,
        },
        currentAppointment: {
          appointment_id: patientInfo.appointment_id,
          slot_time: patientInfo.slot_time,
          full_slot_time: patientInfo.slot_time,
          status: patientInfo.status,
        },
        // Keep ARV and test results from API
        currentArv: patientDetail?.currentArv || null,
        latestTestResults: patientDetail?.latestTestResults || null,
      };
    }
    // Fallback to usePatientDetail data
    return patientDetail;
  }, [patientInfo, patientDetail]);

  // Initialize exam form after combinedPatientData is available
  const examForm = useExamForm(patientId, appointmentId, combinedPatientData);

  // Debug logging
  useEffect(() => {
    console.log("[DEBUG] PatientExamRefactored - Props:", {
      patientId,
      appointmentId,
      patientInfo,
      mode,
    });
    console.log(
      "[DEBUG] PatientExamRefactored - Combined data:",
      combinedPatientData
    );
  }, [patientId, appointmentId, patientInfo, mode, combinedPatientData]);

  // Load initial data
  useEffect(() => {
    if (patientId && appointmentId && examForm?.loadInitialData) {
      examForm.loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, appointmentId]); // Only depend on IDs to avoid infinite loops

  // Handle save temp exam
  const handleSaveTemp = async () => {
    try {
      const result = await examForm.saveTemp();
      if (result.success) {
        alert("Đã lưu tạm thông tin khám thành công!");
        onBack(); // Go back to patient queue
      } else {
        alert("Có lỗi xảy ra khi lưu tạm: " + result.error);
      }
    } catch (error) {
      console.error("[handleSaveTemp] Error:", error);
      alert("Có lỗi xảy ra khi lưu tạm thông tin khám");
    }
  };

  // Handle complete exam
  const handleCompleteExam = async () => {
    try {
      // Validate for completion first
      const validationResult = examForm.validateForm(true); // true = strict validation for completion
      if (!validationResult) {
        alert(
          "Vui lòng nhập đầy đủ thông tin bắt buộc trước khi hoàn thành khám:\n" +
            "- Sinh hiệu (nhịp tim, huyết áp, nhiệt độ, cân nặng, chiều cao)\n" +
            "- Dấu hiệu lâm sàng\n" +
            "- Chẩn đoán chính\n" +
            "- Lời khuyên và tư vấn\n" +
            "- Kế hoạch tái khám\n" +
            "- Ghi chú của bác sĩ"
        );
        return;
      }

      const result = await examForm.completeExam();
      if (result.success) {
        alert("Hoàn thành khám bệnh thành công!");
        onFinishExam();
      } else {
        alert("Có lỗi xảy ra khi hoàn thành khám: " + result.error);
      }
    } catch (error) {
      console.error("[handleCompleteExam] Error:", error);
      alert("Có lỗi xảy ra khi hoàn thành khám bệnh");
    }
  };

  // Determine if we can complete the exam
  const canComplete = () => {
    // Use the same validation logic as validateExamCompletion
    const examData = examForm.examData;

    // Check required fields for completion
    const hasValidDiagnosis =
      examData.diagnosis_primary &&
      examData.diagnosis_primary.trim().length > 0;

    const hasEssentialVitalSigns =
      examData.vital_signs?.heart_rate ||
      examData.vital_signs?.heartRate ||
      examData.vital_signs?.blood_pressure ||
      examData.vital_signs?.bloodPressure ||
      examData.vital_signs?.temperature;

    const hasPhysicalMeasurements =
      examData.vital_signs?.weight && examData.vital_signs?.height;

    const hasClinicalSigns =
      examData.clinical_signs && examData.clinical_signs.trim().length > 0;

    const hasPrescriptionNotes =
      examData.prescription?.counseling_notes?.trim() &&
      examData.prescription?.follow_up_plan?.trim() &&
      examData.prescription?.doctor_notes?.trim();

    const canComplete =
      hasValidDiagnosis &&
      hasEssentialVitalSigns &&
      hasPhysicalMeasurements &&
      hasClinicalSigns &&
      hasPrescriptionNotes;

    console.log("[canComplete] Check:", {
      hasValidDiagnosis,
      hasEssentialVitalSigns,
      hasPhysicalMeasurements,
      hasClinicalSigns,
      hasPrescriptionNotes,
      canComplete,
      examData,
    });

    return canComplete;
  };

  const isReadOnly = mode === EXAM_MODES.VIEW;
  const hasCurrentExam =
    mode !== EXAM_MODES.VIEW || activeExamTab === EXAM_TABS.CURRENT;

  if (patientLoading && examForm.loading) {
    return (
      <div className="min-h-screen bg-blue-50 p-6">
        <LoadingSpinner message="Đang tải thông tin bệnh nhân..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isReadOnly ? "Thông tin bệnh nhân" : "Phiếu khám bệnh"}
            </h1>
            <p className="text-gray-600">
              {isReadOnly
                ? "Xem thông tin và lịch sử khám"
                : "Nhập thông tin khám lâm sàng"}
            </p>
          </div>
        </div>

        {/* Patient Info */}
        <PatientInfoCard
          patientData={combinedPatientData}
          isLoading={patientLoading && !patientInfo} // Don't show loading if we have patientInfo
        />

        {/* Test Requests - Independent section */}
        <SimpleTestRequests
          patientId={patientId}
          appointmentId={appointmentId}
          readOnly={isReadOnly}
        />

        {/* Exam Tabs */}
        <ExamTabs
          activeTab={activeExamTab}
          onTabChange={setActiveExamTab}
          hasCurrentExam={hasCurrentExam}
        />

        {/* Tab Content */}
        {activeExamTab === EXAM_TABS.CURRENT ? (
          <div className="space-y-6">
            {mode === EXAM_MODES.VIEW && activeExamTab === EXAM_TABS.CURRENT ? (
              // View mode for completed exam
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="text-center text-gray-500 py-8">
                  <p className="text-lg font-medium mb-2">
                    Không có khám hiện tại
                  </p>
                  <p>
                    Bệnh nhân đã hoàn thành khám. Xem lịch sử khám để biết thêm
                    chi tiết.
                  </p>
                </div>
              </div>
            ) : (
              // Edit mode or active exam
              <>
                {/* Vital Signs */}
                <VitalSigns
                  vitalSigns={examForm.examData.vital_signs}
                  onUpdate={examForm.updateVitalSigns}
                  errors={examForm.errors.vital_signs}
                  readOnly={isReadOnly}
                />

                {/* Clinical Signs */}
                <ClinicalSigns
                  clinicalSigns={examForm.examData.clinical_signs}
                  onUpdate={examForm.updateClinicalSigns}
                  errors={examForm.errors.clinical_signs}
                  readOnly={isReadOnly}
                />

                {/* Diagnosis */}
                <Diagnosis
                  diagnosis={{
                    primary: examForm.examData.diagnosis_primary,
                    secondary: examForm.examData.diagnosis_secondary,
                  }}
                  onUpdate={examForm.updateDiagnosis}
                  errors={{
                    primary: examForm.errors.diagnosis_primary,
                    secondary: examForm.errors.diagnosis_secondary,
                  }}
                  readOnly={isReadOnly}
                />

                {/* Prescription */}
                <Prescription
                  prescription={examForm.examData.prescription}
                  arvRegimens={examForm.arvRegimens}
                  currentARVRegimen={combinedPatientData?.currentArv}
                  onUpdatePrescription={examForm.updatePrescription}
                  onAddSupportDrug={examForm.addSupportDrug}
                  onUpdateSupportDrug={examForm.updateSupportDrug}
                  onRemoveSupportDrug={examForm.removeSupportDrug}
                  errors={examForm.errors.prescription}
                  readOnly={isReadOnly}
                />

                {/* Action Buttons */}
                <ExamActions
                  onSaveTemp={handleSaveTemp}
                  onComplete={handleCompleteExam}
                  onBack={onBack}
                  saving={examForm.saving}
                  canComplete={canComplete()}
                  readOnly={isReadOnly}
                />
              </>
            )}
          </div>
        ) : (
          // History Tab
          <ExamHistoryList patientId={patientId} />
        )}
      </div>
    </div>
  );
};

export default PatientExamRefactored;
