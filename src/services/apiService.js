// Konfigurasi API
const API_CONFIG = {
  BASE_URL: 'https://api-kampus-anda.com',
  ENDPOINTS: {
    DOSEN: '/api/attendance/dosen',
    KARYAWAN: '/api/attendance/karyawan',
    EXPORT: '/api/attendance/export'
  }
};

export const apiService = {
  // Fetch data dosen
  async fetchDosenAttendance(startDate, endDate, dosenId = null) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        ...(dosenId && { dosen_id: dosenId })
      });
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOSEN}?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch dosen data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dosen:', error);
      return null;
    }
  },

  // Fetch data karyawan
  async fetchKaryawanAttendance(startDate, endDate, karyawanId = null) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        ...(karyawanId && { karyawan_id: karyawanId })
      });
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.KARYAWAN}?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch karyawan data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching karyawan:', error);
      return null;
    }
  },

  // Export data
  async exportData(type, format, startDate, endDate, userId = null) {
    try {
      const params = new URLSearchParams({
        type,
        format,
        start_date: startDate,
        end_date: endDate,
        ...(userId && { user_id: userId })
      });
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPORT}?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rekap-absensi-${type}-${format}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Gagal mengekspor data');
    }
  }
};