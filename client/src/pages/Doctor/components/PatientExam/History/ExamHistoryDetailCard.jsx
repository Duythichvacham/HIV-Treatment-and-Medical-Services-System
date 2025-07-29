// components/patientHistory/ExamHistoryDetailCard.jsx
import React from "react";
import {
  X,
  Pill,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Stethoscope,
  FileText,
} from "lucide-react";
import useTestRequestResult from "../../../../../hooks/doctor/useTestRequestResult";

const ExamHistoryDetailCard = ({
  patientId,
  selectedExam,
  examDetail,
  prescriptionDetail,
  detailLoading,
  handleCloseDetail,
}) => {
  console.log("[ExamHistoryDetailCard] Props received:", {
    patientId,
    selectedExam,
    examDetail: !!examDetail,
    prescriptionDetail: !!prescriptionDetail,
  });

  const { testResults } = useTestRequestResult(patientId, selectedExam);
  // console.log("[ExamHistoryDetailCard] testResults from hook:", testResults);

  if (!selectedExam) {
    return null; // Don't render if no exam is selected
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Chi tiết buổi khám #{selectedExam}
          </h2>
          <button
            onClick={handleCloseDetail}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải chi tiết...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Clinical Exam Details */}
              {examDetail && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Thông tin khám lâm sàng
                  </h3>
                  {/* Vital Signs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <Heart className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700">
                          Huyết áp
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {examDetail.huyet_ap || "Chưa đo"}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <Activity className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700">
                          Mạch
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {examDetail.mach
                          ? `${examDetail.mach}/phút`
                          : "Chưa đo"}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <Thermometer className="h-4 w-4 text-orange-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700">
                          Nhiệt độ
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {examDetail.nhiet_do
                          ? `${examDetail.nhiet_do}°C`
                          : "Chưa đo"}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <Weight className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700">
                          BMI
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {examDetail.bmi || "Chưa tính"}
                      </p>
                    </div>
                  </div>
                  {/* Physical Measurements */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <Weight className="h-4 w-4 text-purple-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700">
                          Cân nặng
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {examDetail.weight
                          ? `${examDetail.weight} kg`
                          : "Chưa đo"}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <Ruler className="h-4 w-4 text-indigo-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700">
                          Chiều cao
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {examDetail.height
                          ? `${examDetail.height} cm`
                          : "Chưa đo"}
                      </p>
                    </div>
                  </div>

                  {/* Clinical Signs and Diagnosis */}
                  <div className="space-y-3">
                    {examDetail.clinical_signs && (
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Triệu chứng lâm sàng
                        </h4>
                        <p className="text-gray-900">
                          {examDetail.clinical_signs}
                        </p>
                      </div>
                    )}

                    {examDetail.diagnosis_primary && (
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Chẩn đoán chính
                        </h4>
                        <p className="text-gray-900">
                          {examDetail.diagnosis_primary}
                        </p>
                      </div>
                    )}

                    {examDetail.diagnosis_secondary && (
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Chẩn đoán phụ
                        </h4>
                        <p className="text-gray-900">
                          {examDetail.diagnosis_secondary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prescription Details */}
              {prescriptionDetail && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <Pill className="h-5 w-5 mr-2" />
                    Thông tin đơn thuốc
                  </h3>

                  {/* ARV Regimen Info */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Phác đồ ARV
                    </h4>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Tên phác đồ:</span>{" "}
                        {prescriptionDetail.regimens_name}
                      </p>
                      <p>
                        <span className="font-medium">Nhóm đối tượng:</span>{" "}
                        {prescriptionDetail.for_group}
                      </p>
                      <p>
                        <span className="font-medium">Thành phần:</span>{" "}
                        {prescriptionDetail.components}
                      </p>
                      {prescriptionDetail.support_drugs && (
                        <p>
                          <span className="font-medium">Thuốc hỗ trợ:</span>{" "}
                          {prescriptionDetail.support_drugs}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Prescription Details */}
                  {/* Prescription Details */}
                  {prescriptionDetail.prescriptionDetails &&
                    prescriptionDetail.prescriptionDetails.length > 0 && (
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-700 mb-3">
                          Chi tiết thuốc
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {prescriptionDetail.prescriptionDetails.map(
                            (drug) => (
                              <div
                                key={drug.detail_id}
                                className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200"
                              >
                                <h5 className="text-base font-semibold text-gray-900 mb-2">
                                  {drug.drug_name}
                                </h5>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  <li>
                                    <span className="font-medium">
                                      Liều dùng:
                                    </span>{" "}
                                    {drug.dosage}
                                  </li>
                                  <li>
                                    <span className="font-medium">
                                      Tần suất:
                                    </span>{" "}
                                    {drug.frequency}
                                  </li>
                                  <li>
                                    <span className="font-medium">
                                      Thời gian:
                                    </span>{" "}
                                    {drug.duration_days} ngày
                                  </li>
                                  <li>
                                    <span className="font-medium">
                                      Hướng dẫn:
                                    </span>{" "}
                                    {drug.usage_instructions}
                                  </li>
                                  <li>
                                    <span className="font-medium">
                                      Ghi chú:
                                    </span>{" "}
                                    {drug.notes}
                                  </li>
                                </ul>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {/* Prescription Notes */}
                  <div className="space-y-3">
                    {prescriptionDetail.counseling_notes && (
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Lời khuyên và tư vấn
                        </h4>
                        <p className="text-gray-900">
                          {prescriptionDetail.counseling_notes}
                        </p>
                      </div>
                    )}

                    {prescriptionDetail.follow_up_plan && (
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Kế hoạch tái khám
                        </h4>
                        <p className="text-gray-900">
                          {prescriptionDetail.follow_up_plan}
                        </p>
                      </div>
                    )}

                    {prescriptionDetail.doctor_notes && (
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Ghi chú của bác sĩ
                        </h4>
                        <p className="text-gray-900">
                          {prescriptionDetail.doctor_notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <Stethoscope className="h-5 w-5 mr-2" />
                      Kết quả xét nghiệm
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {testResults ? (
                        Object.entries(testResults).map(([key, result]) =>
                          result ? (
                            <div
                              key={key}
                              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                            >
                              <h4 className="text-base font-semibold text-gray-900 mb-2">
                                {result.test_name}
                              </h4>
                              <ul className="text-sm text-gray-700 space-y-1">
                                <li>
                                  <span className="font-medium">Kết quả:</span>{" "}
                                  {result.result_value} {result.unit}
                                </li>

                                <li>
                                  <span className="font-medium">
                                    Ngày xét nghiệm:
                                  </span>{" "}
                                  {result.test_date}
                                </li>
                                {result.notes && (
                                  <li>
                                    <span className="font-medium">
                                      Ghi chú:
                                    </span>{" "}
                                    {result.notes}
                                  </li>
                                )}
                              </ul>
                            </div>
                          ) : (
                            <div
                              key={key}
                              className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200"
                            >
                              <h4 className="text-base font-semibold text-gray-900 mb-2">
                                {key === "sang_loc" ? "Sàng lọc HIV" : key}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Không có kết quả
                              </p>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-gray-500">
                          Không có kết quả xét nghiệm.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {!examDetail && !prescriptionDetail && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Không có thông tin chi tiết</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamHistoryDetailCard;
