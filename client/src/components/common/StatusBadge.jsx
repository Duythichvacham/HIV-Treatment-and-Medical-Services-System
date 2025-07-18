import React from "react";
import { CheckCircle, AlertCircle, X, Clock } from "lucide-react";

const StatusBadge = ({
  status,
  onClick,
  disabled = false,
  showIcon = true,
  variant = "button", // "button" | "badge"
}) => {
  const statusConfig = {
    active: {
      icon: CheckCircle,
      text: "Hoạt động",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      hoverColor: "hover:bg-green-200",
    },
    inactive: {
      icon: AlertCircle,
      text: "Tạm dừng",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
      hoverColor: "hover:bg-gray-200",
    },
    pending: {
      icon: Clock,
      text: "Chờ duyệt",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      hoverColor: "hover:bg-yellow-200",
    },
    cancelled: {
      icon: X,
      text: "Đã hủy",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      hoverColor: "hover:bg-red-200",
    },
  };

  const config = statusConfig[status] || statusConfig.inactive;
  const IconComponent = config.icon;

  const baseClasses = `inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${config.bgColor} ${config.textColor}`;
  const buttonClasses =
    onClick && !disabled
      ? `${baseClasses} ${config.hoverColor} cursor-pointer`
      : baseClasses;
  const badgeClasses = `${baseClasses} cursor-default`;

  const finalClasses = variant === "button" ? buttonClasses : badgeClasses;

  const handleClick = () => {
    if (onClick && !disabled && variant === "button") {
      onClick();
    }
  };

  return (
    <span className={finalClasses} onClick={handleClick}>
      {showIcon && <IconComponent size={16} />}
      <span>{config.text}</span>
    </span>
  );
};

export default StatusBadge;
