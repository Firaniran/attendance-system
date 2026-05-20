// ==================== API SERVICE ====================
// File: src/services/apiService.js

const BASE_URL = 'http://localhost:5000/api';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

// Auto-logout jika token expired
const handleResponse = async (res) => {
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) throw new Error(res.statusText || 'API Error');
  return res.json();
};

export const apiService = {

  // ==================== FETCH SEMUA ATTENDANCE ====================
  async fetchAllAttendance(startDate, endDate) {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        limit: 200
      });

      const res = await fetch(
        `${BASE_URL}/attendance/summary?${params.toString()}`,
        { method: 'GET', headers: getAuthHeader() }
      );

      const response = await handleResponse(res);
      return response?.data || [];
    } catch (err) {
      console.error('Error fetching attendance:', err);
      return [];
    }
  },

  // ==================== FETCH DOSEN ====================
  // Mengambil semua data lalu filter jabatan DOSEN di sisi client
  async fetchDosenAttendance(startDate, endDate) {
    try {
      const all = await this.fetchAllAttendance(startDate, endDate);
      return all.filter(
        (d) => (d.jabatan || '').toUpperCase() === 'DOSEN'
      );
    } catch (err) {
      console.error('Error fetching dosen attendance:', err);
      return [];
    }
  },

  // ==================== FETCH KARYAWAN ====================
  // Mengambil semua data lalu filter jabatan bukan DOSEN
  async fetchKaryawanAttendance(startDate, endDate) {
    try {
      const all = await this.fetchAllAttendance(startDate, endDate);
      return all.filter(
        (d) => (d.jabatan || '').toUpperCase() !== 'DOSEN'
      );
    } catch (err) {
      console.error('Error fetching karyawan attendance:', err);
      return [];
    }
  },

  // ==================== EXPORT ====================
  async exportData(format, jabatan, startDate, endDate) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });

      if (jabatan) params.append('jabatan', jabatan.toUpperCase());

      const res = await fetch(
        `${BASE_URL}/export/${format}?${params.toString()}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired');
      }

      if (!res.ok) throw new Error('Export gagal');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      let extension = 'xlsx';
      if (format === 'csv') extension = 'csv';
      else if (format === 'pdf') extension = 'pdf';

      const a = document.createElement('a');
      a.href = url;
      a.download = `rekap-absensi-${jabatan || 'all'}.${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: `Export ${extension.toUpperCase()} berhasil didownload.` };
    } catch (err) {
      console.error(err);
      throw new Error('Export gagal. Silakan coba lagi.');
    }
  }
};