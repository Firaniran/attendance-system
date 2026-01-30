// ==================== API CONFIG ====================
const BASE_URL = 'http://localhost:5000/api';
// Updated to match Backend PORT and /api prefix

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

// Helper to handle API response and auto-logout on 401/403
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
  // ==================== ATTENDANCE DOSEN ====================
  async fetchDosenAttendance(startDate, endDate, dosenId = null) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });

      if (dosenId) params.append('dosen_id', dosenId);

      const res = await fetch(
        `${BASE_URL}/attendance/dosen?${params.toString()}`,
        {
          method: 'GET',
          headers: getAuthHeader()
        }
      );

      const response = await handleResponse(res);
      // Backend returns: { success, message, data: [...] }
      return response?.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  // ==================== ATTENDANCE KARYAWAN ====================
  async fetchKaryawanAttendance(startDate, endDate, karyawanId = null) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });

      if (karyawanId) params.append('karyawan_id', karyawanId);

      const res = await fetch(
        `${BASE_URL}/attendance/karyawan?${params.toString()}`,
        {
          method: 'GET',
          headers: getAuthHeader()
        }
      );

      const response = await handleResponse(res);
      // Backend returns: { success, message, data: [...] }
      return response?.data || [];
    } catch (err) {
      console.error(err);
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

      // Add jabatan filter (DOSEN or KARYAWAN)
      if (jabatan) {
        params.append('jabatan', jabatan.toUpperCase());
      }

      const res = await fetch(
        `${BASE_URL}/export/${format}?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
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

      // Determine file extension based on format
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
    } catch (err) {
      console.error(err);
      alert('Export gagal. Silakan coba lagi.');
    }
  }
};