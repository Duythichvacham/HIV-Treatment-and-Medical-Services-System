import React, { useState, useEffect } from "react";
import { Calendar, Search, Filter, RotateCcw } from "lucide-react";
import { slotApi } from "../../services/slotApi";

const FilterBar = ({
  selectedDate,
  onDateChange,
  search,
  onSearchChange,
  selectedSlot,
  onSlotChange,
  onResetToToday,
  isToday,
  formattedDate,
}) => {
  const [slots, setSlots] = useState([]);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch slots from API
  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const response = await slotApi.getFullTimeSlots();
        if (response.success) {
          // Add "All slots" option at the beginning
          const allSlotsOption = { slot_id: null, slot_time: "Tất cả slot" };
          setSlots([allSlotsOption, ...response.data]);
        }
      } catch (error) {
        console.error("Error fetching slots:", error);
        // Fallback to basic "All slots" option
        setSlots([{ slot_id: null, slot_time: "Tất cả slot" }]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  const handleSlotCycle = () => {
    const nextIndex = (currentSlotIndex + 1) % slots.length;
    setCurrentSlotIndex(nextIndex);
    onSlotChange(slots[nextIndex]?.slot_id || null);
  };

  const currentSlot = slots[currentSlotIndex] || slots[0];

  return (
    <div className="mb-6 space-y-4">
      {/* Date and Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Picker */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
          />
          <button
            onClick={onResetToToday}
            disabled={isToday}
            className={`px-4 py-3 rounded-lg transition-colors ${
              isToday
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Hôm nay
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã bệnh nhân..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Date Display and Slot Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Current Date Display */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Ngày: {formattedDate}</span>
        </div>

        {/* Slot Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <button
            onClick={handleSlotCycle}
            disabled={loading || slots.length === 0}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium">
              {loading
                ? "Đang tải..."
                : currentSlot?.slot_time || "Tất cả slot"}
            </span>
            <RotateCcw className="w-3 h-3 text-gray-400" />
          </button>
          <span className="text-xs text-gray-500">
            {currentSlotIndex + 1}/{slots.length}
          </span>
        </div>
      </div>

      {/* Active Filters Display */}
      {(search || selectedSlot) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Bộ lọc:</span>
          {search && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              Tìm: "{search}"
            </span>
          )}
          {selectedSlot && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Slot: {slots.find((s) => s.slot_id === selectedSlot)?.slot_time}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
