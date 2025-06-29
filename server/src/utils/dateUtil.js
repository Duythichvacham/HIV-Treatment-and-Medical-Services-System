/**
 * Utility functions for date/time handling with Vietnam timezone
 */

/**
 * Get current time in Vietnam timezone (UTC+7)
 * @returns {Date} Current time in Vietnam timezone
 */
const getVietnamTime = () => {
  const now = new Date();
  // Add 7 hours to convert to Vietnam timezone (UTC+7)
  return new Date(now.getTime() + (7 * 60 * 60 * 1000));
};

/**
 * Convert a date to Vietnam timezone
 * @param {Date|string} date - Date to convert
 * @returns {Date} Date in Vietnam timezone
 */
const toVietnamTime = (date) => {
  if (!date) return null;
  const dateObj = new Date(date);
  return new Date(dateObj.getTime() + (7 * 60 * 60 * 1000));
};

/**
 * Format date to Vietnam locale string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatVietnamTime = (date) => {
  if (!date) return '-';
  const dateObj = new Date(date);
  return dateObj.toLocaleString('vi-VN', { 
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Get SQL Server compatible Vietnam time string
 * @returns {string} SQL Server compatible time string
 */
const getVietnamTimeForSQL = () => {
  const vietnamTime = getVietnamTime();
  return vietnamTime.toISOString().slice(0, 19).replace('T', ' ');
};

module.exports = {
  getVietnamTime,
  toVietnamTime,
  formatVietnamTime,
  getVietnamTimeForSQL
}; 