import React from "react";
import { Loader2 } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Component loading spinner với message
 * @param {object} props - Props của component
 * @param {string} props.message - Thông báo hiển thị khi loading
 */
const LoadingSpinner = ({ message = "Đang tải..." }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
};

export default LoadingSpinner;
