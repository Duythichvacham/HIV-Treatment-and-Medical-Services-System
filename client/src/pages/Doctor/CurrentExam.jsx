import React from "react";
import ExamForm from "./ExamForm";

const CurrentExam = ({ info, onFinish, onSaveTemp, mode = "edit" }) => {
  console.log('CurrentExam - info:', info);
  console.log('CurrentExam - mode:', mode);
  
  if (!info) return <div>Không có dữ liệu</div>;
  return (
    <div>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Thông tin bệnh nhân</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <b>Họ tên:</b> {info.ho_ten}
          </div>
          <div>
            <b>Mã BN:</b> {info.ma_bn}
          </div>
          <div>
            <b>Tuổi/Giới:</b> {info.tuoi} - {info.gender}
          </div>
          <div>
            <b>Giờ hẹn:</b> {info.gio_hen}
          </div>
        </div>
      </div>
      <div className="bg-blue-50 rounded-xl shadow p-6 mb-6">
        <h3 className="font-bold mb-2">Thông tin điều trị ARV hiện tại</h3>
        <div>Phác đồ: {info.phac_do}</div>
        <div>Bắt đầu: {info.ngay_bat_dau}</div>
        <div>Tuân thủ: {info.tuan_thu}</div>
        <div>Tác dụng phụ: {info.tac_dung_phu}</div>
      </div>
      <div className="bg-green-50 rounded-xl shadow p-6 mb-6">
        <h3 className="font-bold mb-2">Kết quả xét nghiệm gần nhất</h3>
        <div>Viral Load: {info.viral_load}</div>
        <div>CD4: {info.cd4}</div>
        <div>Sàng lọc: {info.sang_loc}</div>
        <div>Khẳng định: {info.khang_dinh}</div>
      </div>
      {/* Chỉ hiển thị ExamForm khi đang khám (mode = edit) */}
      {mode === "edit" && (
        <ExamForm patient={info} onFinish={onFinish} onSaveTemp={onSaveTemp} />
      )}
      {mode === "view" && (
        <div className="bg-gray-50 rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold mb-2 text-gray-600">Bệnh nhân đã hoàn thành khám</h3>
          <p className="text-gray-500">Để xem chi tiết lịch sử khám, chuyển sang tab "Lịch sử khám"</p>
        </div>
      )}
    </div>
  );
};

export default CurrentExam;
