import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  FileText,
  Eye,
  Pill,
  Clock,
  ChevronRight,
  X,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Stethoscope,
} from "lucide-react";
import { patientApi } from "../../services/patientApi";

const ExamHistoryList = ({ patientId }) => {
  const [examHistory, setExamHistory] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDetail, setExamDetail] = useState(null);
  const [prescriptionDetail, setPrescriptionDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load exam history - only completed appointments
  useEffect(() => {
    const loadExamHistory = async () => {
      if (!patientId) return;

      setLoading(true);
      setError(null);
      try {
        console.log(
          "[ExamHistoryList] Loading completed exam history for patient:",
          patientId
        );
        const response = await patientApi.getExamHistory(patientId);
        console.log("[ExamHistoryList] Exam history response:", response);

        const historyData = response.data || [];
        setExamHistory(historyData);
      } catch (error) {
        console.error("Error loading exam history:", error);
        setError("Không thể tải lịch sử khám");
      } finally {
        setLoading(false);
      }
    };

    loadExamHistory();
  }, [patientId]);

  // Load exam detail when user clicks "Chi tiết"
  const handleViewDetail = async (appointmentId) => {
    setDetailLoading(true);
    setError(null);
    try {
      console.log(
        "[ExamHistoryList] Loading exam detail for appointment:",
        appointmentId
      );

      // Load both clinical exam and prescription details
      const [clinicalResponse, prescriptionResponse] = await Promise.all([
        patientApi.getClinicalExamDetail(appointmentId),
        patientApi.getPrescriptionDetail(appointmentId),
      ]);

      console.log(
        "[ExamHistoryList] Clinical exam detail response:",
        clinicalResponse
      );
      console.log(
        "[ExamHistoryList] Prescription detail response:",
        prescriptionResponse
      );

      setExamDetail(clinicalResponse.data || null);
      setPrescriptionDetail(prescriptionResponse.data || null);
      setSelectedExam(appointmentId);
    } catch (error) {
      console.error("Error loading exam detail:", error);
      setError("Không thể tải chi tiết buổi khám");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedExam(null);
    setExamDetail(null);
    setPrescriptionDetail(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải lịch sử khám...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-red-400 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Lịch sử khám bệnh đã hoàn thành
        </h3>

        {examHistory.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chưa có lịch sử khám hoàn thành</p>
          </div>
        ) : (
          <div className="space-y-4">
            {examHistory.map((exam) => (
              <div
                key={exam.appointment_id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Header - Basic appointment info */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                        {exam.bookingDate}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {exam.slot_time}
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {exam.status === "completed"
                          ? "Đã hoàn thành"
                          : exam.status}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <User className="h-4 w-4 mr-1" />
                      <span>Bác sĩ: {exam.doctor_name}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <span>Mã cuộc hẹn: #{exam.appointment_id}</span>
                      <span className="ml-4">
                        Tạo lúc: {formatDateTime(exam.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleViewDetail(exam.appointment_id)}
                    disabled={detailLoading}
                    className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {detailLoading && selectedExam === exam.appointment_id
                      ? "Đang tải..."
                      : "Chi tiết"}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedExam && (
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
                  <span className="ml-3 text-gray-600">
                    Đang tải chi tiết...
                  </span>
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
                      {prescriptionDetail.prescriptionDetails &&
                        prescriptionDetail.prescriptionDetails.length > 0 && (
                          <div className="bg-white rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-gray-700 mb-3">
                              Chi tiết thuốc
                            </h4>
                            <div className="space-y-3">
                              {prescriptionDetail.prescriptionDetails.map(
                                (drug, index) => (
                                  <div
                                    key={drug.detail_id}
                                    className="border-l-4 border-blue-500 pl-4"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-gray-900">
                                          {drug.drug_name}
                                        </h5>
                                        <div className="text-sm text-gray-600 mt-1">
                                          <p>
                                            <span className="font-medium">
                                              Liều dùng:
                                            </span>{" "}
                                            {drug.dosage}
                                          </p>
                                          <p>
                                            <span className="font-medium">
                                              Tần suất:
                                            </span>{" "}
                                            {drug.frequency}
                                          </p>
                                          <p>
                                            <span className="font-medium">
                                              Thời gian:
                                            </span>{" "}
                                            {drug.duration_days} ngày
                                          </p>
                                          <p>
                                            <span className="font-medium">
                                              Hướng dẫn:
                                            </span>{" "}
                                            {drug.usage_instructions}
                                          </p>
                                          {drug.notes && (
                                            <p>
                                              <span className="font-medium">
                                                Ghi chú:
                                              </span>{" "}
                                              {drug.notes}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
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
                    </div>
                  )}

                  {!examDetail && !prescriptionDetail && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        Không có thông tin chi tiết
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExamHistoryList;
