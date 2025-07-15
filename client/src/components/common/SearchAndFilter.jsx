// File: client/src/components/common/SearchAndFilter.jsx
import React from "react";
import { Search } from "lucide-react";

const SearchAndFilter = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  filterValue,
  onFilterChange,
  filterOptions = [],
  filterLabel = "Tất cả",
  className = "",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      {/* Search Input */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Filter Select */}
      {filterOptions.length > 0 && (
        <div className="sm:w-48">
          <select
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">{filterLabel}</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
