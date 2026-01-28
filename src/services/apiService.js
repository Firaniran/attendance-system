// ==================== API SERVICE ====================
// File: src/services/apiService.js

const BASE_URL = 'http://localhost:5000/api';

// ==================== GET AUTH HEADER ====================
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('❌ Token tidak ditemukan di localStorage');
    return null;
  }
  
  console.log('✅ Token ditemukan:', token.substring(0, 20) + '...');
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// ==================== HANDLE RESPONSE ====================
const handleResponse = async (res) => {
  // Handle unauthorized
  if (res.status === 401 || res.status === 403) {
    console.error('❌ Unauthorized - Token expired atau invalid');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  // Parse JSON response
  const data = await res.json();

  // Handle error response
  if (!res.ok) {
    throw new Error(data.message || res.statusText || 'API Error');
  }

  return data;
};

// ==================== API SERVICE OBJECT ====================
export const apiService = {
  
  // ==================== FETCH DOSEN ATTENDANCE ====================
  async fetchDosenAttendance(startDate, endDate, dosenId = null) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });

      if (dosenId) params.append('dosen_id', dosenId);

      const headers = getAuthHeader();
      
      if (!headers) {
        console.error('❌ Headers tidak valid, redirect ke login');
        window.location.href = '/login';
        return [];
      }

      const url = `${BASE_URL}/attendance/dosen?${params.toString()}`;
      console.log('📤 Fetching Dosen Attendance:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const response = await handleResponse(res);

      if (!response.success) {
        throw new Error(response.message || 'Request gagal');
      }

      console.log('✅ Dosen data received:', response.data);
      return response.data || [];
      
    } catch (err) {
      console.error('❌ Error fetchDosenAttendance:', err);
      return [];
    }
  },

  // ==================== FETCH KARYAWAN ATTENDANCE ====================
  async fetchKaryawanAttendance(startDate, endDate, karyawanId = null) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });

      if (karyawanId) params.append('karyawan_id', karyawanId);

      const headers = getAuthHeader();
      
      if (!headers) {
        console.error('❌ Headers tidak valid, redirect ke login');
        window.location.href = '/login';
        return [];
      }

      const url = `${BASE_URL}/attendance/karyawan?${params.toString()}`;
      console.log('📤 Fetching Karyawan Attendance:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const response = await handleResponse(res);

      if (!response.success) {
        throw new Error(response.message || 'Request gagal');
      }

      console.log('✅ Karyawan data received:', response.data);
      return response.data || [];
      
    } catch (err) {
      console.error('❌ Error fetchKaryawanAttendance:', err);
      return [];
    }
  },

  // ==================== EXPORT DATA ====================
  async exportData(jabatan, format, startDate, endDate) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });

      // Add jabatan filter (DOSEN or KARYAWAN)
      if (jabatan) {
        params.append('jabatan', jabatan.toUpperCase());
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Session expired. Silakan login kembali.');
        window.location.href = '/login';
        return;
      }

      const url = `${BASE_URL}/export/${format}?${params.toString()}`;
      console.log('📤 Exporting data:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired');
      }

      if (!res.ok) {
        throw new Error('Export gagal');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // Determine file extension
      let extension = 'xlsx';
      if (format === 'csv') extension = 'csv';
      else if (format === 'pdf') extension = 'pdf';

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `rekap-absensi-${jabatan || 'all'}-${startDate}.${extension}`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('✅ Export berhasil');
      
    } catch (err) {
      console.error('❌ Error export:', err);
      alert('Export gagal. Silakan coba lagi.');
    }
  }
};