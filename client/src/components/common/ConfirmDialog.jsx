import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  isLoading = false,
  type = "warning", // warning, danger, info
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsSubmitting(true);
      try {
        const result = await onConfirm();
        if (result && result.success !== false) {
          // Only close if the operation was successful
          // The parent component will handle closing on success
        }
      } catch (error) {
        console.error("Confirm action failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  const getIconColor = () => {
    switch (type) {
      case "danger":
        return "text-red-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-yellow-600";
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700";
      case "info":
        return "bg-blue-600 hover:bg-blue-700";
      default:
        return "bg-yellow-600 hover:bg-yellow-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${getIconColor()}`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting || isLoading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonColor()}`}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? "Đang xử lý..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
