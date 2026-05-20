// ==================== EXPORT SERVICE ====================
// File: src/services/exportService.js
// Wrapper tipis di atas apiService.exportData
// agar FilterPanel bisa memanggil exportService.exportToExcel() dst.

import { apiService } from './apiService';

export const exportService = {
  async exportToExcel(type, startDate, endDate) {
    return apiService.exportData('excel', type, startDate, endDate);
  },

  async exportToPDF(type, startDate, endDate) {
    return apiService.exportData('pdf', type, startDate, endDate);
  },

  async exportToCSV(type, startDate, endDate) {
    return apiService.exportData('csv', type, startDate, endDate);
  },

  async exportDetailedToExcel(type, startDate, endDate) {
    // Endpoint detail — sesuaikan path jika berbeda di backend Anda
    return apiService.exportData('excel-detail', type, startDate, endDate);
  }
};