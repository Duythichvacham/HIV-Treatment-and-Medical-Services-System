import React from "react";
import ExamForm from "./ExamForm";

const CurrentExam = ({ info, onFinish, onSaveTemp, mode = "edit" }) => {
  console.log("CurrentExam - info:", info);
  console.log("CurrentExam - mode:", mode);

  // Tạo dữ liệu mặc định khi không có thông tin từ API
  const defaultInfo = {
    ho_ten: "Không có thông tin",
    ma_bn: "Không có mã",
    tuoi: "N/A",
    gender: "N/A",
    gio_hen: "N/A",
    phac_do: "Chưa có thông tin",
    ngay_bat_dau: "Chưa có thông tin",
    tuan_thu: "Chưa ghi nhận",
    tac_dung_phu: "Không ghi nhận",
    viral_load: "Chưa có kết quả",
    cd4: "Chưa có kết quả",
    sang_loc: "Chưa có kết quả",
    khang_dinh: "Chưa có kết quả",
    ...info, // Ghi đè lên dữ liệu mặc định nếu có thông tin thực tế
  };
  // Sử dụng defaultInfo thay vì info trực tiếp
  const patientInfo = info ? { ...defaultInfo, ...info } : defaultInfo;

  console.log("PatientInfo with exam_data:", patientInfo);

  return (
    <div>
      {/* Chỉ hiển thị ExamForm khi đang khám (mode = edit) */}
      {mode === "edit" && (
        <ExamForm
          patient={patientInfo}
          onFinish={onFinish}
          onSaveTemp={onSaveTemp}
        />
      )}
      {mode === "view" && (
        <div className="bg-gray-50 rounded p-6 mb-6">
          <div className="flex items-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500 mr-2"
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
            <h3 className="font-bold text-gray-600">
              Bệnh nhân đã hoàn thành khám
            </h3>
          </div>
          <p className="text-gray-500 ml-7">
            Để xem chi tiết lịch sử khám, chuyển sang tab "Lịch sử khám"
          </p>
        </div>
      )}
    </div>
  );
};

export default CurrentExam;
