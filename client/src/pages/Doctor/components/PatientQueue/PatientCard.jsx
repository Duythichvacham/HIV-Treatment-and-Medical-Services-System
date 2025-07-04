import React from "react";
import { User, Phone, Clock, Calendar, Activity } from "lucide-react";
import {
  formatPatientCode,
  formatGender,
  formatPhone,
  getStatusColor,
  getStatusText,
} from "../../utils/formatters";
import { QUEUE_TYPES } from "../../utils/constants";

const PatientCard = ({ patient, index, type, onClick, processing }) => {
  const getActionButton = () => {
    switch (type) {
      case QUEUE_TYPES.WAITING:
        return (
          <button
            onClick={onClick}
            className="w-full mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            disabled={processing}
          >
            Bắt đầu khám
          </button>
        );
      case QUEUE_TYPES.EXAMINING:
        return (
          <button
            onClick={onClick}
            className="w-full mt-3 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Tiếp tục khám
          </button>
        );
      case QUEUE_TYPES.COMPLETED:
        return (
          <button
            onClick={onClick}
            className="w-full mt-3 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            Xem hồ sơ
          </button>
        );
      default:
        return null;
    }
  };

  const getCardBorder = () => {
    switch (type) {
      case QUEUE_TYPES.WAITING:
        return "border-l-4 border-l-orange-400";
      case QUEUE_TYPES.EXAMINING:
        return "border-l-4 border-l-blue-400";
      case QUEUE_TYPES.COMPLETED:
        return "border-l-4 border-l-green-400";
      default:
        return "border-l-4 border-l-gray-400";
    }
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer ${getCardBorder()}`}
    >
      {/* Queue Number Badge */}
      {(patient.queue_number || index + 1) && (
        <div className="flex justify-between items-start mb-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
            STT: {patient.queue_number || index + 1}
          </span>
          {patient.status && (
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                patient.status
              )}`}
            >
              {getStatusText(patient.status)}
            </span>
          )}
        </div>
      )}

      {/* Patient Basic Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-900">
            {patient.full_name || patient.name}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>
            Mã BN:{" "}
            <span className="font-medium">
              {patient.code || formatPatientCode(patient.patient_id)}
            </span>
          </div>
          <div>
            {patient.age} tuổi - {formatGender(patient.gender)}
          </div>
        </div>

        {patient.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-3 h-3" />
            {formatPhone(patient.phone)}
          </div>
        )}

        {patient.slot_time && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-3 h-3" />
            Slot: {patient.slot_time}
          </div>
        )}

        {patient.bookingDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-3 h-3" />
            Ngày đặt:{" "}
            {new Date(patient.bookingDate).toLocaleDateString("vi-VN")}
          </div>
        )}

        {/* Additional Info for Medical Status */}
        {(patient.arv || patient.adherence || patient.viralLoad) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-gray-700">
                Tình trạng điều trị
              </span>
            </div>

            {patient.arv && (
              <div className="text-xs text-gray-600 mb-1">
                ARV: {patient.arv}
              </div>
            )}

            {patient.adherence && (
              <div className="text-xs text-gray-600 mb-1">
                Tuân thủ: {patient.adherence}
              </div>
            )}

            {patient.viralLoad && (
              <div className="text-xs text-gray-600">
                Viral Load: {patient.viralLoad}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      {getActionButton()}
    </div>
  );
};

export default PatientCard;
