import React from "react";

const LoadingSpinner = ({
  message = "Đang tải dữ liệu...",
  size = "medium",
}) => {
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  return (
    <div className="text-center text-gray-500 py-12">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-500 mx-auto mb-4 ${sizeClasses[size]}`}
      ></div>
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
