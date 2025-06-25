import React, { useState } from "react";
import { Calendar, FileText, User, Clock, X } from "lucide-react";

const ExamDetailModal = ({ exam, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center border-b p-4">
        <h3 className="text-lg font-semibold">Chi tiết khám bệnh</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái: Thông tin khám */}
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-bold border-b border-gray-200 pb-2 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Thông tin khám
            </h4>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">Bác sĩ khám</div>
                <div className="font-medium">
                  {exam.bac_si || "TS.BS Nguyễn Văn A"}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Loại khám</div>
                <div className="font-medium">
                  {exam.loai_kham || "Khám định kỳ"}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Ngày khám</div>
                <div className="font-medium">
                  {exam.ngay_kham || "24/06/2025"}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Giờ khám</div>
                <div className="font-medium">{exam.gio_kham || "08:30"}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold border-b border-gray-200 pb-2 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Triệu chứng lâm sàng
            </h4>

            <div className="bg-gray-50 p-3 rounded text-gray-700 text-sm">
              {exam.clinical_signs || "Không có triệu chứng bất thường"}
            </div>
          </div>
        </div>

        {/* Cột phải: Chẩn đoán và Sinh hiệu */}
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-bold border-b border-gray-200 pb-2 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-green-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Sinh hiệu
            </h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-sm text-gray-500 mb-1">Huyết áp</div>
                <div className="font-medium">
                  {exam.vitals?.bloodPressure || "120/80 mmHg"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Nhiệt độ</div>
                <div className="font-medium">
                  {exam.vitals?.temperature || "36.5°C"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Nhịp tim</div>
                <div className="font-medium">
                  {exam.vitals?.heartRate || "72 bpm"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Cân nặng</div>
                <div className="font-medium">{exam.weight || "65 kg"}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold border-b border-gray-200 pb-2 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Chẩn đoán
            </h4>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Chẩn đoán chính
                </div>
                <div className="bg-gray-50 p-3 rounded text-gray-700">
                  {exam.diagnosis_primary ||
                    exam.chan_doan ||
                    "HIV nhiễm mạn tính, đáp ứng tốt với ARV"}
                </div>
              </div>

              {(exam.diagnosis_secondary || exam.chan_doan_phu) && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Chẩn đoán phụ
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-gray-700">
                    {exam.diagnosis_secondary || exam.chan_doan_phu}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4 border-t pt-4 mt-2">
        <div>
          <h4 className="text-base font-bold border-b border-gray-200 pb-2 mb-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-purple-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Đơn thuốc
          </h4>

          <div className="bg-blue-50 p-3 rounded text-gray-700">
            {exam.don_thuoc || "Tiếp tục TDF/3TC/DTG"}
          </div>
        </div>

        {exam.ghi_chu && (
          <div>
            <h4 className="text-base font-bold border-b border-gray-200 pb-2 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-yellow-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Ghi chú
            </h4>

            <div className="bg-gray-50 p-3 rounded text-gray-700">
              {exam.ghi_chu}
            </div>
          </div>
        )}

        {exam.ngay_tai_kham && (
          <div>
            <h4 className="text-base font-bold border-b border-gray-200 pb-2 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-green-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Ngày tái khám
            </h4>

            <div className="bg-green-50 p-3 rounded text-gray-700 flex items-center">
              <Calendar className="text-green-500 w-5 h-5 mr-2" />
              {exam.ngay_tai_kham}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ExamHistory = ({ history }) => {
  const [selectedExam, setSelectedExam] = useState(null);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Lịch sử khám bệnh</h3>

      {history.length === 0 ? (
        <div className="bg-gray-50 rounded p-8 text-center text-gray-500">
          <div className="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-300 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="font-medium">Không có lịch sử khám</p>
          <p className="text-sm mt-1">
            Bệnh nhân chưa có lần khám nào trước đây
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((item, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-500 w-4 h-4" />
                  <span className="font-medium">{item.ngay_kham}</span>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {item.loai_kham || "Khám định kỳ"}
                  </span>
                </div>
                <button
                  className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedExam(item);
                  }}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Xem chi tiết
                </button>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="text-gray-400 w-4 h-4" />
                    <span className="text-gray-600">Bác sĩ:</span>
                    <span className="font-medium">
                      {item.bac_si || "TS.BS Nguyễn Văn A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-gray-400 w-4 h-4" />
                    <span className="text-gray-600">Thời gian khám:</span>
                    <span>{item.gio_kham || "08:30"}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1 text-gray-600">
                    Chẩn đoán:
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-gray-700 text-sm">
                    {item.diagnosis_primary ||
                      item.chan_doan ||
                      "HIV nhiễm mạn tính, đáp ứng tốt với ARV"}
                  </div>
                </div>

                {(item.clinical_signs || item.diagnosis_secondary) && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1 text-gray-600">
                      {item.clinical_signs
                        ? "Triệu chứng lâm sàng:"
                        : "Chẩn đoán phụ:"}
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-gray-700 text-sm">
                      {item.clinical_signs || item.diagnosis_secondary}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium mb-1 text-gray-600">
                    Đơn thuốc:
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-gray-700 text-sm">
                    {item.don_thuoc || "Tiếp tục TDF/3TC/DTG"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedExam && (
        <ExamDetailModal
          exam={selectedExam}
          onClose={() => setSelectedExam(null)}
        />
      )}
    </div>
  );
};

export default ExamHistory;
