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
  // Thêm 7 giờ để chuyển sang giờ Việt Nam
  const vnDate = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000));
  
  // Format theo định dạng: hh:mm:ss dd/mm/yyyy
  const hours = vnDate.getHours().toString().padStart(2, '0');
  const minutes = vnDate.getMinutes().toString().padStart(2, '0');
  const seconds = vnDate.getSeconds().toString().padStart(2, '0');
  const day = vnDate.getDate().toString().padStart(2, '0');
  const month = (vnDate.getMonth() + 1).toString().padStart(2, '0');
  const year = vnDate.getFullYear();
  
  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
};

/**
 * Format date without timezone conversion (for already Vietnam time)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDateTimeWithoutTimezone = (date) => {
  if (!date) return '-';
  // Nếu là dạng 'YYYY-MM-DD HH:mm:ss'
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(date)) {
    const [d, t] = date.split(' ');
    const [y, m, day] = d.split('-');
    const [hour, min] = t.split(':');
    return `${hour}:${min} ${day}/${m}/${y}`;
  }
  // Nếu là dạng 'HH:mm:ss DD/MM/YYYY' hoặc 'HH:mm:ss DD/M/YYYY'
  if (/^\d{2}:\d{2}:\d{2} \d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
    // Đảm bảo ngày/tháng có 2 số
    const [t, d] = date.split(' ');
    const [hour, min] = t.split(':');
    const [day, m, y] = d.split('/');
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = m.padStart(2, '0');
    return `${hour}:${min} ${paddedDay}/${paddedMonth}/${y}`;
  }
  // Nếu là ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(date)) {
    const [d, t] = date.split('T');
    const [y, m, day] = d.split('-');
    const [hour, min] = t.split(':');
    return `${hour}:${min} ${day}/${m}/${y}`;
  }
  // Nếu là ISO hoặc dạng khác, fallback về cũ
  return date;
};

/**
 * Get SQL Server compatible Vietnam time string
 * @returns {string} SQL Server compatible time string
 */
const getVietnamTimeForSQL = () => {
  const vietnamTime = getVietnamTime();
  return vietnamTime.toISOString().slice(0, 19).replace('T', ' ');
};
const pad = (n) => (n < 10 ? '0' + n : n);

const formatDate = (date) =>
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

module.exports = { formatDate };




module.exports = {
  formatDate,
  getVietnamTime,
  toVietnamTime,
  formatVietnamTime,
  formatDateTimeWithoutTimezone,
  getVietnamTimeForSQL
}; 