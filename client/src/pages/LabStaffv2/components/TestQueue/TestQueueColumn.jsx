import React from "react";
import { Clock, TestTube, CheckCircle } from "lucide-react";
import { TEST_STATUS } from "../../../../utils/labStaffConstants";
import TestCard from "./TestCard";
import EmptyState from "./EmptyState";

const TestQueueColumn = ({
  type,
  title,
  count,
  tests,
  onTestAction,
  loading = false,
}) => {
  const getColumnConfig = () => {
    switch (type) {
      case TEST_STATUS.REQUESTED:
        return {
          icon: Clock,
          color: "text-orange-700",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          badgeColor: "bg-orange-100 text-orange-800",
          statusText: "Chờ xử lý",
        };
      case TEST_STATUS.IN_PROGRESS:
        return {
          icon: TestTube,
          color: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          badgeColor: "bg-blue-100 text-blue-800",
          statusText: "Đang xử lý",
        };
      case TEST_STATUS.COMPLETED:
        return {
          icon: CheckCircle,
          color: "text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          badgeColor: "bg-green-100 text-green-800",
          statusText: "Hoàn thành",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-700",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          badgeColor: "bg-gray-100 text-gray-800",
          statusText: "Không xác định",
        };
    }
  };

  const config = getColumnConfig();
  const IconComponent = config.icon;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="animate-pulse w-32 h-6 bg-gray-300 rounded"></div>
            <div className="animate-pulse w-8 h-6 bg-gray-300 rounded-full"></div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className={`p-6 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${config.color}`}>
            <IconComponent className="w-5 h-5" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <span
            className={`${config.badgeColor} text-sm font-medium px-3 py-1 rounded-full`}
          >
            {count}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3 overflow-visible">
        {tests.length === 0 ? (
          <EmptyState message={`Không có mẫu ${title.toLowerCase()}`} />
        ) : (
          tests.map((test, index) => (
            <TestCard
              key={test.appointment_id || test.request_id || index}
              test={test}
              index={index + 1}
              statusType={type}
              onClick={() => onTestAction && onTestAction(test)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TestQueueColumn;
