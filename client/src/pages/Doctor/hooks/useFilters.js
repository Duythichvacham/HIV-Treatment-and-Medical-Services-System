import { useState, useCallback } from "react";

export const useFilters = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [tab, setTab] = useState("queue");

  // Update date filter
  const updateDate = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  // Update search filter
  const updateSearch = useCallback((searchTerm) => {
    setSearch(searchTerm);
  }, []);

  // Update slot filter
  const updateSlot = useCallback((slotId) => {
    setSelectedSlot(slotId);
  }, []);

  // Update active tab
  const updateTab = useCallback((tabName) => {
    setTab(tabName);
  }, []);

  // Reset to today
  const resetToToday = useCallback(() => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedSlot(null);
    resetToToday();
  }, [resetToToday]);

  // Get formatted date for display
  const getFormattedDate = useCallback(() => {
    return new Date(selectedDate).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  // Check if date is today
  const isToday = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return selectedDate === today;
  }, [selectedDate]);

  return {
    selectedDate,
    search,
    selectedSlot,
    tab,
    updateDate,
    updateSearch,
    updateSlot,
    updateTab,
    resetToToday,
    clearFilters,
    getFormattedDate,
    isToday,
  };
};
