// File: client/src/components/common/TableHeader.jsx
import React from "react";
import { Plus } from "lucide-react";

const TableHeader = ({
  title,
  subtitle,
  onAdd,
  addButtonText = "Thêm mới",
  showAddButton = true,
  children,
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {showAddButton && onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addButtonText}
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default TableHeader;
