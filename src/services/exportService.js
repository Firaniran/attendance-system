// ==================== EXPORT SERVICE ====================

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
};