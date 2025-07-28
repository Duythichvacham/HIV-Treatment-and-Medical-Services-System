// components/patientHistory/ExamHistoryList.jsx
import React from "react";
import { Calendar, User, FileText, Eye, Clock } from "lucide-react";
import { useExamHistory } from "../../../../../hooks/patientHistory/useExamHistory";
import { useExamDetail } from "../../../../../hooks/patientHistory/useExamDetail";
import ExamHistoryDetailCard from "./ExamHistoryDetailCard"; // Import the new component

const ExamHistoryList = ({ patientId }) => {
  console.log("[ExamHistoryList] Received patientId:", patientId);

  const { examHistory, loading, error } = useExamHistory(patientId);
  const {
    selectedExam,
    examDetail,
    prescriptionDetail,
    detailLoading,
    handleViewDetail,
    handleCloseDetail,
  } = useExamDetail();
  // const [patientId, setpatientId] = useState("");

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
                      <span className="ml-4">Tạo lúc: {exam.created_at}</span>
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
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal - Now a separate component */}
      <ExamHistoryDetailCard
        patientId={patientId}
        selectedExam={selectedExam}
        examDetail={examDetail}
        prescriptionDetail={prescriptionDetail}
        detailLoading={detailLoading}
        handleCloseDetail={handleCloseDetail}
      />
    </>
  );
};

export default ExamHistoryList;
