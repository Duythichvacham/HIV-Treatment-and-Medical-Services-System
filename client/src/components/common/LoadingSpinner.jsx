import React from "react";
import { Loader2 } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Component loading spinner linh hoạt có thể tái sử dụng
 * @param {object} props - Props của component
 * @param {string} props.message - Thông báo hiển thị khi loading
 * @param {string} props.size - Kích thước spinner (sm, md, lg, xl)
 * @param {string} props.variant - Loại hiển thị (fullscreen, inline, overlay)
 * @param {string} props.className - CSS classes tùy chỉnh
 * @param {boolean} props.showMessage - Có hiển thị message hay không
 */
const LoadingSpinner = ({
  message = "Đang tải...",
  size = "md",
  variant = "inline",
  className = "",
  showMessage = true,
}) => {
  // Size configurations
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  // Variant configurations
  const getVariantClasses = () => {
    switch (variant) {
      case "fullscreen":
        return "min-h-screen bg-gray-50 flex items-center justify-center";
      case "overlay":
        return "absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10";
      case "inline":
      default:
        return "flex items-center justify-center p-6";
    }
  };

  const spinnerClasses = `${sizeClasses[size]} animate-spin text-blue-600`;

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      <div className="text-center">
        <Loader2
          className={`${spinnerClasses} mx-auto ${showMessage ? "mb-4" : ""}`}
        />
        {showMessage && <p className="text-gray-600">{message}</p>}
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  variant: PropTypes.oneOf(["fullscreen", "inline", "overlay"]),
  className: PropTypes.string,
  showMessage: PropTypes.bool,
};

export default LoadingSpinner;
