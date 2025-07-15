// File: client/src/components/common/EmptyState.jsx
import React from "react";

const EmptyState = ({
  message,
  showClearFilter = false,
  onClearFilter,
  className = "",
}) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <p className="text-gray-500">{message}</p>
      {showClearFilter && onClearFilter && (
        <button
          onClick={onClearFilter}
          className="mt-2 text-blue-600 hover:text-blue-500 text-sm"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
};

export default EmptyState;
