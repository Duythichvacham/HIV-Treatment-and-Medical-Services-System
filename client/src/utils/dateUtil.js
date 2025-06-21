/**
 * Get current date in YYYY-MM-DD format for date input fields
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};
//
/**
 * Format date for Vietnamese display
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date in Vietnamese
 */
export const formatDateVietnamese = (dateString) => {
  if (!dateString) return "Chưa chọn";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

/**
 * Check if a date is today or in the future
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if date is today or future
 */
export const isValidAppointmentDate = (dateString) => {
  if (!dateString) return false;
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate >= today;
};

/**
 * Get minimum date for appointment booking (today)
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getMinAppointmentDate = () => {
  return getCurrentDate();
};
