// src/services/personalAttendanceService.js
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  '';

const request = async (endpoint) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'Gagal mengambil data absensi');
  }

  return result.data;
};

const formatTime = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 5);
  }

  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatDay = (value) => {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('id-ID', {
    weekday: 'long',
  });
};

export const personalAttendanceService = {
  async getPersonalAttendance() {
    const [records, summaryData] = await Promise.all([
      request('/personal/me'),
      request('/personal/me/summary'),
    ]);

    const history = (records || []).map((item) => ({
      id: item.id,
      tanggal: formatDate(item.tanggal),
      hari: formatDay(item.tanggal),
      status: item.status || 'Belum ada data',
      checkIn: formatTime(item.jam_masuk),
      checkOut: formatTime(item.jam_keluar),
    }));

    const todayString = new Date().toISOString().slice(0, 10);

    const todayRecord = (records || []).find((item) => {
      const itemDate = new Date(item.tanggal)
        .toISOString()
        .slice(0, 10);

      return itemDate === todayString;
    });

    const total = summaryData?.total || 0;
    const hadir = summaryData?.hadir || 0;

    return {
      summary: {
        hadir,
        terlambat: summaryData?.terlambat || 0,
        tidakHadir: 0,
        persentase: total > 0 ? Math.round((hadir / total) * 100) : 0,
      },

      today: todayRecord
        ? {
            status: todayRecord.status,
            checkIn: formatTime(todayRecord.jam_masuk),
            checkOut: formatTime(todayRecord.jam_keluar),
          }
        : {
            status: 'Belum ada data',
            checkIn: null,
            checkOut: null,
          },

      history,
    };
  },
};

export default personalAttendanceService;