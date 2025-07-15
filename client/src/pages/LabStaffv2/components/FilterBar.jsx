import React from "react";
import { Calendar, Search } from "lucide-react";
import { formatDateVietnamese } from "../../../utils/dateUtil";

const FilterBar = ({
  selectedDate,
  onDateChange,
  search,
  onSearchChange,
  formattedDate,
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />
          <button
            onClick={() => onDateChange(new Date().toISOString().split("T")[0])}
            disabled={selectedDate === new Date().toISOString().split("T")[0]}
            className={`px-4 py-3 rounded-lg transition-colors ${
              selectedDate === new Date().toISOString().split("T")[0]
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Hôm nay
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã bệnh nhân..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <Calendar className="w-4 h-4 inline-block mr-2" />
        Ngày: {formatDateVietnamese(formattedDate)}
      </div>
      {search && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Bộ lọc:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            Tìm: "{search}"
          </span>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
