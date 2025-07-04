import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";

// Components
import PatientInfoCard from "./components/PatientExam/PatientInfoCard";
import ExamTabs from "./components/PatientExam/ExamTabs";
import VitalSigns from "./components/PatientExam/CurrentExam/VitalSigns";
import ClinicalSigns from "./components/PatientExam/CurrentExam/ClinicalSigns";
import TestRequests from "./components/PatientExam/CurrentExam/TestRequests";
import TestRequestsSection from "./components/PatientExam/CurrentExam/TestRequestsSection";
import Diagnosis from "./components/PatientExam/CurrentExam/Diagnosis";
import PrescriptionNew from "./components/PatientExam/CurrentExam/PrescriptionNew";
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

  // Load initial data
  useEffect(() => {
    if (patientId && appointmentId && examForm?.loadInitialData) {
      examForm.loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, appointmentId]); // Only depend on IDs to avoid infinite loops

  // Reload data when patient status changes to "in_progress" (for "Tiếp tục khám" case)
  useEffect(() => {
    if (
      patientId &&
      appointmentId &&
      examForm?.reloadData &&
      combinedPatientData?.currentAppointment?.status === "in_progress"
    ) {
      console.log("[DEBUG] Patient status is in_progress, reloading exam data");
      // Small delay to ensure status change has been processed
      const timer = setTimeout(() => {
        examForm.reloadData();
      }, 100);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedPatientData?.currentAppointment?.status]);

  // Handle save temp exam
  const handleSaveTemp = async () => {
    try {
      const result = await examForm.saveTemp();
      if (result.success) {
        alert("Đã lưu tạm thông tin khám thành công!");
        // Reload data để đảm bảo có thể tiếp tục khám với data đã lưu
        if (examForm.reloadData) {
          await examForm.reloadData();
        }
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

  // Determine if we can complete the exam - memoized để tránh re-render liên tục
  const canCompleteExam = useMemo(() => {
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

    const result =
      hasValidDiagnosis &&
      hasEssentialVitalSigns &&
      hasPhysicalMeasurements &&
      hasClinicalSigns &&
      hasPrescriptionNotes;

    return result;
  }, [
    examForm.examData,
    // examForm.examData.diagnosis_primary,
    // examForm.examData.vital_signs,
    // examForm.examData.clinical_signs,
    // examForm.examData.prescription?.counseling_notes,
    // examForm.examData.prescription?.follow_up_plan,
    // examForm.examData.prescription?.doctor_notes,
  ]);

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

        {/* Current ARV Regimen */}
        {combinedPatientData?.currentArv ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b pb-2">
              Phác đồ ARV hiện tại
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Tên phác đồ:</span>
                <p className="font-medium text-blue-600">
                  {combinedPatientData.currentArv.name}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Loại thuốc:</span>
                <p className="font-medium">
                  {combinedPatientData.currentArv.components}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Ngày bắt đầu:</span>
                <p className="font-medium">
                  {combinedPatientData.currentArv.created_at}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <span className="font-medium">
                Chưa có thông tin phác đồ ARV.
              </span>
              Vui lòng cập nhật trong quá trình khám.
            </p>
          </div>
        )}

        {/* Latest Test Results */}
        {combinedPatientData?.latestTestResults ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 border-b pb-2">
              Kết quả xét nghiệm gần nhất
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(combinedPatientData.latestTestResults).map(
                ([key, test]) => (
                  <div key={key}>
                    <span className="text-sm text-gray-600">
                      {test.test_name}:
                    </span>
                    <p className="font-medium">
                      {test.result_value} {test.unit}
                    </p>
                    <span className="text-xs text-gray-500">
                      {test.test_date}
                    </span>
                    {test.notes && (
                      <p className="text-xs text-gray-600 mt-1">{test.notes}</p>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm text-center">
              <span className="font-medium">Chưa có kết quả xét nghiệm.</span>
              Vui lòng yêu cầu xét nghiệm trong quá trình khám.
            </p>
          </div>
        )}

        {/* Test Requests - Independent section */}
        <TestRequestsSection
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
                  readOnly={false}
                />

                {/* Prescription */}
                <PrescriptionNew
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
                  canComplete={canCompleteExam}
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
