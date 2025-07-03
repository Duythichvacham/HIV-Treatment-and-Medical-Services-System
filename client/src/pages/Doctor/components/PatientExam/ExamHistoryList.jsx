import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  FileText,
  Eye,
  Pill,
  TestTube,
  Clock,
  ChevronRight,
} from "lucide-react";
import ExamHistoryDetail from "./ExamHistoryDetail";
import { patientApi } from "../../services/patientApi";

const ExamHistoryList = ({ patientId }) => {
  const [examHistory, setExamHistory] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDetail, setExamDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load exam history
  useEffect(() => {
    const loadExamHistory = async () => {
      if (!patientId) return;

      setLoading(true);
      setError(null);
      try {
        console.log(
          "[ExamHistoryList] Loading exam history for patient:",
          patientId
        );
        const response = await patientApi.getExamHistory(patientId);
        console.log("[ExamHistoryList] Exam history response:", response);

        const historyData = response.data || response || [];
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

  // Load exam detail when user clicks "Xem chi tiết"
  const handleViewDetail = async (appointmentId) => {
    setDetailLoading(true);
    try {
      console.log(
        "[ExamHistoryList] Loading exam detail for appointment:",
        appointmentId
      );
      const response = await patientApi.getExamDetail(patientId, appointmentId);
      console.log("[ExamHistoryList] Exam detail response:", response);

      setExamDetail(response.data || response);
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
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "đã hoàn thành":
      case "completed":
        return "bg-green-100 text-green-800";
      case "đang khám":
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "chờ khám":
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Khám định kỳ":
        return "bg-blue-100 text-blue-800";
      case "Khám theo dõi":
        return "bg-green-100 text-green-800";
      case "Tư vấn":
        return "bg-purple-100 text-purple-800";
      case "Tái khám":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
          Lịch sử khám bệnh
        </h3>

        {examHistory.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chưa có lịch sử khám</p>
          </div>
        ) : (
          <div className="space-y-4">
            {examHistory.map((exam) => (
              <div
                key={exam.appointment_id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                        {exam.ngay_kham}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          exam.trang_thai
                        )}`}
                      >
                        {exam.trang_thai}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getTypeColor(
                          exam.loai_kham
                        )}`}
                      >
                        {exam.loai_kham}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <User className="h-4 w-4 mr-1" />
                      <span>Bác sĩ: {exam.bac_si}</span>
                      {exam.chuyen_khoa && (
                        <span className="ml-2 text-gray-500">
                          ({exam.chuyen_khoa})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {/* Chẩn đoán */}
                  <div>
                    {exam.chan_doan_chinh && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Chẩn đoán chính:
                        </span>
                        <p className="text-sm text-gray-900 mt-1">
                          {exam.chan_doan_chinh}
                        </p>
                      </div>
                    )}
                    {exam.chan_doan_phu && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Chẩn đoán phụ:
                        </span>
                        <p className="text-sm text-gray-900 mt-1">
                          {exam.chan_doan_phu}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Điều trị và ghi chú */}
                  <div>
                    {exam.ke_hoach_dieu_tri && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Kế hoạch điều trị:
                        </span>
                        <p className="text-sm text-gray-900 mt-1">
                          {exam.ke_hoach_dieu_tri}
                        </p>
                      </div>
                    )}
                    {exam.ghi_chu_ngan && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Ghi chú:
                        </span>
                        <p className="text-sm text-gray-900 mt-1">
                          {exam.ghi_chu_ngan}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary icons */}
                <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                  {exam.so_loai_thuoc > 0 && (
                    <div className="flex items-center">
                      <Pill className="h-3 w-3 mr-1 text-green-600" />
                      {exam.so_loai_thuoc} loại thuốc
                    </div>
                  )}
                  {exam.co_thuoc_ho_tro === "Có" && (
                    <div className="flex items-center">
                      <Pill className="h-3 w-3 mr-1 text-blue-600" />
                      Có thuốc hỗ trợ
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-gray-500" />
                    {formatDate(exam.created_at)}
                  </div>
                </div>

                {/* Action button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleViewDetail(exam.appointment_id)}
                    disabled={detailLoading}
                    className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {detailLoading && selectedExam === exam.appointment_id
                      ? "Đang tải..."
                      : "Xem chi tiết"}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {examDetail && (
        <ExamHistoryDetail
          examDetail={examDetail}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
};

export default ExamHistoryList;
