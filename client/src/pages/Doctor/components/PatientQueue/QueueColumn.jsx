import React from "react";
import { Clock, FileText, CheckCircle } from "lucide-react";
import { QUEUE_TYPES } from "../../utils/constants";
import PatientCard from "./PatientCard";
import EmptyState from "./EmptyState";

const QueueColumn = ({
  type,
  title,
  count,
  patients,
  onPatientAction,
  loading = false,
}) => {
  const getColumnConfig = () => {
    switch (type) {
      case QUEUE_TYPES.WAITING:
        return {
          icon: Clock,
          color: "text-orange-700",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      case QUEUE_TYPES.EXAMINING:
        return {
          icon: FileText,
          color: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case QUEUE_TYPES.COMPLETED:
        return {
          icon: CheckCircle,
          color: "text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-700",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const config = getColumnConfig();
  const IconComponent = config.icon;

  if (loading) {
    return (
      <div className="flex-1">
        <div
          className={`flex items-center gap-2 mb-4 ${config.color} text-xl font-bold`}
        >
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="w-32 h-6 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div
        className={`flex items-center gap-2 mb-4 ${config.color} text-xl font-bold`}
      >
        <IconComponent className="w-6 h-6" />
        {title} ({count})
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {patients.length === 0 ? (
          <EmptyState
            type={type}
            message={`Không có bệnh nhân ${title.toLowerCase()}`}
          />
        ) : (
          patients.map((patient, index) => (
            <PatientCard
              key={patient.appointment_id || patient.id}
              patient={patient}
              index={index}
              type={type}
              onClick={() => onPatientAction(patient, type)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default QueueColumn;
