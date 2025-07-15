import React from "react";
import PropTypes from "prop-types";

/**
 * Component skeleton loading cho tables
 * @param {object} props - Props của component
 * @param {number} props.rows - Số dòng skeleton
 * @param {number} props.columns - Số cột skeleton
 * @param {string} props.className - CSS classes tùy chỉnh
 */
const TableSkeleton = ({ rows = 5, columns = 4, className = "" }) => {
  return (
    <div className={`animate-pulse space-y-4 p-6 ${className}`}>
      {/* Header skeleton */}
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>

      {/* Table rows skeleton */}
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {[...Array(columns)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
  className: PropTypes.string,
};

export default TableSkeleton;
