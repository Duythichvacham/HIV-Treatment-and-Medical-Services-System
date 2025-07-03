import { Calendar, Clock, FileText, Phone, User } from "lucide-react";
import React from "react";

const PatientCard = ({
  patient,
  index,
  type,
  onStartExam,
  onContinueExam,
  onViewHistory,
}) => (
  <div className="bg-white rounded-xl shadow border p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
          patient.queue_number === 0 
            ? 'bg-red-100 text-red-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {patient.queue_number === 0 ? '!' : (patient.queue_number || index + 1)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-900">
              {patient.full_name || patient.name}
            </span>            <span className={`text-xs px-2 py-0.5 rounded-full ${
              patient.queue_number === 0 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {patient.queue_number === 0 ? 'Ưu tiên' : 'Thường'}
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            {patient.code ||
              `HIV${String(patient.patient_id).padStart(3, "0")}`}
          </div>
        </div>
      </div>      {(patient.status === "urgent" || patient.queue_number === 0) && (
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          Khẩn cấp
        </span>
      )}
    </div>
    <div className="flex flex-col gap-1 text-gray-700 text-sm mb-2">
      <div className="flex items-center gap-1">
        <User className="w-4 h-4 text-gray-400" />
        {patient.age} tuổi -{" "}
        {patient.gender === "Male"
          ? "Nam"
          : patient.gender === "Female"
          ? "Nữ"
          : patient.gender}
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-4 h-4 text-gray-400" />
        Hẹn lúc:{" "}
        {patient.start_time
          ? new Date(patient.start_time).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""}
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="w-4 h-4 text-gray-400" />
        Đặt lúc:{" "}
        {patient.booking_time
          ? new Date(patient.booking_time).toLocaleString("vi-VN")
          : ""}
      </div>
      {patient.phone && (
        <div className="flex items-center gap-1">
          <Phone className="w-4 h-4 text-pink-500" />
          <span className="font-medium">{patient.phone}</span>
        </div>
      )}
    </div>
    <div className="bg-blue-50 rounded p-3 text-sm">
      <span className="font-semibold">ARV:</span>{" "}
      {patient.arv_regimen || "Chưa có"}
      <br />
      <span className="font-semibold">Tuân thủ:</span>{" "}
      {patient.arv_adherence === "good"
        ? "Tốt (>95%)"
        : patient.arv_adherence === "average"
        ? "Khá (90-95%)"
        : patient.arv_adherence || "Chưa có"}
    </div>
    <div className="bg-green-50 rounded p-3 text-sm mt-2">
      <span className="font-semibold">Viral Load:</span>{" "}
      {patient.viral_load || "Chưa có"}
      <br />
      <span className="font-semibold">CD4:</span>{" "}
      {patient.cd4 ? `${patient.cd4}` : "Chưa có"}
    </div>
    {type === "waiting" && (
      <button
        onClick={onStartExam}
        className="w-full mt-2 bg-gray-900 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-gray-800 transition"
      >
        <FileText className="w-5 h-5" />
        Bắt đầu khám
      </button>
    )}
    {type === "examining" && (
      <button
        onClick={onContinueExam}
        className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-blue-700 transition"
      >
        <FileText className="w-5 h-5" />
        Tiếp tục khám
      </button>
    )}
    {type === "completed" && (
      <button
        onClick={onViewHistory}
        className="w-full mt-2 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-gray-200 transition"
      >
        <FileText className="w-5 h-5" />
        Xem hồ sơ
      </button>
    )}
  </div>
);

export default PatientCard;
