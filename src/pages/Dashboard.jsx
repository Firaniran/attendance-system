// ==================== DASHBOARD PAGE ====================
// File: src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Calendar, Clock, FileText, Search, LogOut, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import DosenTable from '../components/DosenTable';
import KaryawanTable from '../components/KaryawanTable';
import FilterPanel from '../components/FilterPanel';
import { getTodayRange, getWeekRange, getMonthRange } from '../utils/dateUtils';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import '../styles/main.css';

// ==================== HELPER: SESI DARI JAM ====================
export function getSesiFromTime(timeStr) {
  if (!timeStr) return null;
  const date = new Date(timeStr.replace(' ', 'T'));
  if (isNaN(date)) return null;
  const hour = date.getHours();
  if (hour >= 8 && hour < 16) return 'pagi';
  if (hour >= 16 && hour <= 21) return 'malam';
  return null;
}

// ==================== DASHBOARD COMPONENT ====================
function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dosen');
  const [activeSession, setActiveSession] = useState('all'); // 'all' | 'pagi' | 'malam'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [dateRange, setDateRange] = useState(getTodayRange());
  const [dosenData, setDosenData] = useState([]);
  const [karyawanData, setKaryawanData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Reload data setiap kali tab atau dateRange berubah
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'dosen') {
        const data = await apiService.fetchDosenAttendance(dateRange.start, dateRange.end);
        setDosenData(data || []);
      } else {
        const data = await apiService.fetchKaryawanAttendance(dateRange.start, dateRange.end);
        setKaryawanData(data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset session filter saat pindah ke tab karyawan
  useEffect(() => {
    if (activeTab === 'karyawan') setActiveSession('all');
  }, [activeTab]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period === 'today') setDateRange(getTodayRange());
    else if (period === 'week') setDateRange(getWeekRange());
    else if (period === 'month') setDateRange(getMonthRange());
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // ==================== FILTER SESI UNTUK DOSEN ====================
  // Sesi ditentukan dari field 'sesi' di data, atau fallback ke jam lastCheckIn
  const filteredDosenData = dosenData.filter((d) => {
    if (activeSession === 'all') return true;
    const sesi = d.sesi || getSesiFromTime(d.lastCheckIn);
    return sesi === activeSession;
  });

  // ==================== STATS ====================
  const stats =
    activeTab === 'dosen'
      ? {
          total: filteredDosenData.length,
          hadir: filteredDosenData.reduce((s, d) => s + (d.totalHadir || 0), 0),
          terlambat: filteredDosenData.reduce((s, d) => s + (d.totalTerlambat || 0), 0),
          avgPersentase:
            filteredDosenData.length > 0
              ? Math.round(
                  filteredDosenData.reduce((s, d) => {
                    const pct =
                      d.persentase ??
                      (d.totalHariKerja > 0
                        ? (d.totalHadir / d.totalHariKerja) * 100
                        : 0);
                    return s + pct;
                  }, 0) / filteredDosenData.length
                )
              : 0,
        }
      : {
          total: karyawanData.length,
          hadir: karyawanData.reduce((s, k) => s + (k.totalHadir || 0), 0),
          terlambat: karyawanData.reduce((s, k) => s + (k.totalTerlambat || 0), 0),
          avgPersentase:
            karyawanData.length > 0
              ? Math.round(
                  karyawanData.reduce((s, k) => {
                    const pct =
                      k.persentase ??
                      (k.totalHariKerja > 0
                        ? (k.totalHadir / k.totalHariKerja) * 100
                        : 0);
                    return s + pct;
                  }, 0) / karyawanData.length
                )
              : 0,
        };

  return (
    <div className="app-container">
      {/* ===== HEADER ===== */}
      <div className="dashboard-header">
        <div className="header-inner">
          <div>
            <h1 className="header-title">Sistem Rekap Absensi Kampus</h1>
            <p className="header-subtitle">Dashboard Monitoring Kehadiran Dosen &amp; Karyawan</p>
          </div>
          <div className="header-right">
            {user && (
              <div className="user-info">
                <p className="user-name">{user.name || user.username || 'User'}</p>
                <p className="user-email">{user.email || ''}</p>
              </div>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* ===== TAB NAVIGATION ===== */}
        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab('dosen')}
            className={`tab-button ${activeTab === 'dosen' ? 'active' : ''}`}
          >
            <Users size={18} />
            Rekap Dosen
          </button>
          <button
            onClick={() => setActiveTab('karyawan')}
            className={`tab-button ${activeTab === 'karyawan' ? 'active' : ''}`}
          >
            <Briefcase size={18} />
            Rekap Karyawan
          </button>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="stats-grid">
          <StatsCard
            icon={Users}
            title={`Total ${activeTab === 'dosen' ? 'Dosen' : 'Karyawan'}`}
            value={stats.total}
            color="#3B82F6"
          />
          <StatsCard
            icon={Calendar}
            title="Total Kehadiran"
            value={stats.hadir}
            color="#10B981"
          />
          <StatsCard
            icon={Clock}
            title="Total Keterlambatan"
            value={stats.terlambat}
            subtitle="kali"
            color="#EF4444"
          />
          <StatsCard
            icon={FileText}
            title="Rata-rata Kehadiran"
            value={`${stats.avgPersentase}%`}
            color="#8B5CF6"
          />
        </div>

        {/* ===== FILTER PANEL ===== */}
        <FilterPanel
          activeTab={activeTab}
          activeSession={activeSession}
          onSessionChange={setActiveSession}
          selectedPeriod={selectedPeriod}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onPeriodChange={handlePeriodChange}
        />

        {/* ===== SEARCH BAR ===== */}
        <div className="search-container">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder={
                activeTab === 'dosen'
                  ? 'Cari dosen (nama, NIP)...'
                  : 'Cari karyawan (nama, NIP)...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* ===== DATA TABLE ===== */}
        <div className="table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Memuat data...</div>
            </div>
          ) : activeTab === 'dosen' ? (
            <DosenTable data={filteredDosenData} searchTerm={searchTerm} />
          ) : (
            <KaryawanTable data={karyawanData} searchTerm={searchTerm} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;