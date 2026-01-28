// ==================== DATE UTILS ====================
// File: src/utils/dateUtils.js

// Format: YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get week range (MASA LALU - untuk testing dengan data yang ada)
export const getWeekRange = () => {
  // Gunakan tanggal di masa lalu yang pasti ada datanya
  // Misalnya: 1-7 Januari 2025
  const start = new Date('2025-01-01');
  const end = new Date('2025-01-07');
  
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
};

// Get month range (MASA LALU)
export const getMonthRange = () => {
  // Gunakan bulan di masa lalu
  // Misalnya: Januari 2025
  const start = new Date('2025-01-01');
  const end = new Date('2025-01-31');
  
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
};

// Get custom date range
export const getCustomRange = (startDate, endDate) => {
  return {
    start: formatDate(new Date(startDate)),
    end: formatDate(new Date(endDate))
  };
};

// Get today's date
export const getToday = () => {
  return formatDate(new Date());
};

// Get date range for last N days
export const getLastNDays = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
};