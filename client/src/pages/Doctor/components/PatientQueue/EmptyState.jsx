import React from "react";
import { Clock, FileText, CheckCircle, Calendar, Search } from "lucide-react";
import { QUEUE_TYPES } from "../../utils/constants";

const EmptyState = ({
  type,
  message,
  searchTerm = null,
  selectedDate = null,
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case QUEUE_TYPES.WAITING:
        return {
          icon: Clock,
          color: "text-orange-400",
          bgColor: "bg-orange-50",
          title: "Không có bệnh nhân chờ khám",
          description: searchTerm
            ? "Không tìm thấy bệnh nhân nào phù hợp với từ khóa tìm kiếm"
            : selectedDate
            ? `Không có lịch hẹn nào vào ngày ${new Date(
                selectedDate
              ).toLocaleDateString("vi-VN")}`
            : "Hiện tại không có bệnh nhân nào đang chờ khám",
        };
      case QUEUE_TYPES.EXAMINING:
        return {
          icon: FileText,
          color: "text-blue-400",
          bgColor: "bg-blue-50",
          title: "Không có bệnh nhân đang khám",
          description: searchTerm
            ? "Không tìm thấy bệnh nhân nào phù hợp với từ khóa tìm kiếm"
            : "Hiện tại không có bệnh nhân nào đang trong quá trình khám",
        };
      case QUEUE_TYPES.COMPLETED:
        return {
          icon: CheckCircle,
          color: "text-green-400",
          bgColor: "bg-green-50",
          title: "Chưa có bệnh nhân hoàn thành",
          description: searchTerm
            ? "Không tìm thấy bệnh nhân nào phù hợp với từ khóa tìm kiếm"
            : selectedDate
            ? `Chưa có bệnh nhân nào hoàn thành khám vào ngày ${new Date(
                selectedDate
              ).toLocaleDateString("vi-VN")}`
            : "Hiện tại chưa có bệnh nhân nào hoàn thành khám",
        };
      default:
        return {
          icon: Calendar,
          color: "text-gray-400",
          bgColor: "bg-gray-50",
          title: "Không có dữ liệu",
          description: "Không có thông tin để hiển thị",
        };
    }
  };

  const config = getEmptyStateConfig();
  const IconComponent = config.icon;

  return (
    <div className={`text-center py-8 px-4 rounded-lg ${config.bgColor}`}>
      <div
        className={`inline-flex items-center justify-center w-16 h-16 ${config.bgColor} rounded-full mb-4`}
      >
        <IconComponent className={`w-8 h-8 ${config.color}`} />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">{config.title}</h3>

      <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
        {message || config.description}
      </p>

      {searchTerm && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Search className="w-4 h-4" />
          <span>Từ khóa: "{searchTerm}"</span>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
