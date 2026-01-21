// ==================== API CONFIG ====================
const BASE_URL = 'http://localhost:8000'; 
// ganti sesuai BE lo: 3000 / 8080 / domain

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

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

      if (!res.ok) throw new Error('Fetch dosen gagal');
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
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

      if (!res.ok) throw new Error('Fetch karyawan gagal');
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  },

// ==================== EXPORT ====================
async exportData(type, startDate, endDate) {
  try {
    const params = new URLSearchParams({
      type,
      start_date: startDate,
      end_date: endDate
    });

    const res = await fetch(
      `${BASE_URL}/attendance/export?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!res.ok) throw new Error('Export gagal');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${type}.xlsx`;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert('Export gagal');
  }
 }
};