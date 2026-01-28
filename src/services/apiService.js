// src/services/apiService.js

const BASE_URL = "http://localhost:5000/api";

// ==================== AUTH HEADER ====================
const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("❌ Token tidak ditemukan");
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
};

// ==================== HANDLE RESPONSE ====================
const handleResponse = async (res) => {
  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    throw new Error(data?.message || res.statusText || "API Error");
  }

  return data;
};

// ==================== API SERVICE ====================
export const apiService = {

  // ==================== DOSEN ATTENDANCE ====================
  async fetchDosenAttendance(startDate, endDate, dosenId = null) {
    try {
      const headers = getAuthHeader();
      if (!headers) return [];

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        page: 1,
        limit: 1000
      });

      if (dosenId) params.append("dosen_id", dosenId);

      const url = `${BASE_URL}/attendance/dosen?${params.toString()}`;
      console.log("📤 FETCH DOSEN:", url);

      const res = await fetch(url, { headers });
      const data = await handleResponse(res);

      return Array.isArray(data?.data) ? data.data : [];

    } catch (err) {
      console.error("❌ fetchDosenAttendance:", err.message);
      return [];
    }
  },

  // ==================== KARYAWAN ATTENDANCE ====================
  async fetchKaryawanAttendance(startDate, endDate, karyawanId = null) {
    try {
      const headers = getAuthHeader();
      if (!headers) return [];

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        page: 1,
        limit: 1000
      });

      if (karyawanId) params.append("karyawan_id", karyawanId);

      const url = `${BASE_URL}/attendance/karyawan?${params.toString()}`;
      console.log("📤 FETCH KARYAWAN:", url);

      const res = await fetch(url, { headers });
      const data = await handleResponse(res);

      return Array.isArray(data?.data) ? data.data : [];

    } catch (err) {
      console.error("❌ fetchKaryawanAttendance:", err.message);
      return [];
    }
  },

  // ==================== EXPORT ====================
  async exportData(jabatan, format, startDate, endDate) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        jabatan: jabatan?.toUpperCase()
      });

      const url = `${BASE_URL}/export/${format}?${params.toString()}`;
      console.log("📤 EXPORT:", url);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Export gagal");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `rekap-${jabatan}-${startDate}.${format}`;
      link.click();

      URL.revokeObjectURL(link.href);
      console.log("✅ Export sukses");

    } catch (err) {
      console.error("❌ Export error:", err.message);
      alert("Export gagal");
    }
  }
};