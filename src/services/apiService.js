// ==================== API SERVICE ====================
// File: src/services/apiService.js

const BASE_URL = 'http://localhost:5000/api';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

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

  async fetchAllAttendance(startDate, endDate) {
    try {
      const params = new URLSearchParams({ startDate, endDate, limit: 200 });
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

  async fetchDosenAttendance(startDate, endDate) {
    try {
      const all = await this.fetchAllAttendance(startDate, endDate);
      return all.filter((d) => (d.jabatan || '').toUpperCase() === 'DOSEN');
    } catch (err) {
      console.error('Error fetching dosen attendance:', err);
      return [];
    }
  },

  async fetchKaryawanAttendance(startDate, endDate) {
    try {
      const all = await this.fetchAllAttendance(startDate, endDate);
      return all.filter((d) => (d.jabatan || '').toUpperCase() !== 'DOSEN');
    } catch (err) {
      console.error('Error fetching karyawan attendance:', err);
      return [];
    }
  },

  // ==================== REALTIME FEED ====================
  // Memanggil fetchAllAttendance dengan startDate = endDate = date,
  // lalu memetakan field ke format yang dipakai LiveFeedList & HourlyBarChart.
  async fetchRealtimeFeed(date) {
    try {
      const all = await this.fetchAllAttendance(date, date);

      return all.map((d) => ({
        // identitas
        id:     d.id    || d.nip,
        nama:   d.nama  || 'N/A',
        nip:    d.nip   || '',
        tipe:   (d.jabatan || '').toUpperCase() === 'DOSEN' ? 'dosen' : 'karyawan',

        // status absen — sesuaikan value-nya jika backend pakai string berbeda
        // misal backend kirim: "MASUK" / "KELUAR" / "TERLAMBAT"
        statusAbsen: (() => {
          const raw = (d.statusAbsen || d.status || '').toLowerCase();
          if (raw.includes('keluar'))   return 'keluar';
          if (raw.includes('terlambat')) return 'terlambat';
          return 'masuk';
        })(),

        terlambat: d.totalTerlambat > 0 || (d.statusAbsen || '').toLowerCase().includes('terlambat'),

        // waktu check-in untuk feed & bar chart
        waktu: d.lastCheckIn || d.waktu || null,

        // sesi dari jam check-in (sama dengan getSesiFromTime di Dashboard)
        sesi: (() => {
          const str = d.lastCheckIn || d.waktu || '';
          if (!str) return null;
          const dt = new Date(str.replace(' ', 'T'));
          if (isNaN(dt)) return null;
          const h = dt.getHours();
          if (h >= 8  && h < 16) return 'pagi';
          if (h >= 16 && h <= 21) return 'malam';
          return null;
        })(),
      }));
    } catch (err) {
      console.error('Error fetching realtime feed:', err);
      return [];
    }
  },

  // ==================== EXPORT ====================
  async exportData(format, jabatan, startDate, endDate) {
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
      if (jabatan) params.append('jabatan', jabatan.toUpperCase());

      const res = await fetch(
        `${BASE_URL}/export/${format}?${params.toString()}`,
        { method: 'GET', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
      if (!res.ok) throw new Error('Export gagal');

      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const ext  = format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : 'xlsx';

      const a = document.createElement('a');
      a.href = url;
      a.download = `rekap-absensi-${jabatan || 'all'}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: `Export ${ext.toUpperCase()} berhasil didownload.` };
    } catch (err) {
      console.error(err);
      throw new Error('Export gagal. Silakan coba lagi.');
    }
  }
};