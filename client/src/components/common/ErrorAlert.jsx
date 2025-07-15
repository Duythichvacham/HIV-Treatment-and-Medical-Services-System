// File: client/src/components/common/ErrorAlert.jsx
import React from "react";
import { AlertCircle } from "lucide-react";

const ErrorAlert = ({ error, onRetry, className = "" }) => {
  if (!error) return null;

  return (
    <div
      className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
    >
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        <p className="text-red-700 flex-1">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
          >
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
