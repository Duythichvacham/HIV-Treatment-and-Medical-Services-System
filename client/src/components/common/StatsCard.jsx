import React from "react";
//thư viện giúp kiểm tra kiểu dữ liệu (type checking) của các props được truyền vào component
import PropTypes from "prop-types";

/**
 * Component hiển thị thẻ thống kê với icon và thông tin
 * @param {object} props - Props của component
 * @param {string} props.title - Tiêu đề của thẻ
 * @param {string|number} props.value - Giá trị chính hiển thị
 * @param {string} props.subtitle - Thông tin phụ
 * @param {React.ReactNode} props.icon - Icon hiển thị
 * @param {string} props.iconColor - Màu của icon
 * @param {string} props.iconBg - Màu nền của icon
 */
const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = "text-blue-500",
  iconBg = "bg-blue-50",
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${iconBg} ${iconColor} ml-4`}>
        {icon}
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node.isRequired,
  iconColor: PropTypes.string,
  iconBg: PropTypes.string,
};

export default StatsCard;
