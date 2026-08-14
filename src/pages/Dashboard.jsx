// ==================== UNIFIED DASHBOARD PAGE ====================
// File: src/pages/Dashboard.jsx
// Satu halaman dashboard dengan sidebar navigasi untuk semua fitur.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Calendar, Clock, FileText, Search, LogOut, Briefcase,
  Activity, Sun, Moon, LayoutGrid, ChevronRight, BarChart2,
  Home, Menu, X, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import DosenTable from '../components/DosenTable';
import KaryawanTable from '../components/KaryawanTable';
import FilterPanel from '../components/FilterPanel';
import LiveFeedList from '../components/LiveFeedList';
import HourlyBarChart from '../components/HourlyBarChart';
import { getTodayRange, getWeekRange, getMonthRange } from '../utils/dateUtils';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import notificationService from '../services/notificationService';
import '../styles/main.css';
import { Settings } from 'lucide-react';
import UserManagement from '../pages/UserManagement';

// ==================== HELPER ====================
export function getSesiFromTime(timeStr) {
  if (!timeStr) return null;
  const date = new Date(timeStr.replace(' ', 'T'));
  if (isNaN(date)) return null;
  const hour = date.getHours();
  if (hour >= 8 && hour < 16) return 'pagi';
  if (hour >= 16 && hour <= 21) return 'malam';
  return null;
}

// ==================== MAIN COMPONENT ====================
function Dashboard() {
  const navigate = useNavigate();

  // ---- Layout state ----
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: Home },
  { key: 'realtime', label: 'Live Realtime', icon: Activity, badge: 'LIVE' },
  { key: 'dosen', label: 'Rekap Dosen', icon: Users },
  { key: 'karyawan', label: 'Rekap Karyawan', icon: Briefcase },

  ...(user?.role === 'admin'
    ? [{ key: 'user-alat', label: 'Manajemen Pengguna', icon: Settings }]
    : []),
];

  // ---- Rekap (Dosen & Karyawan) state ----
  const [rekapTab, setRekapTab] = useState('dosen');          
  const [activeSession, setActiveSession] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [dateRange, setDateRange] = useState(getTodayRange());
  const [dosenData, setDosenData] = useState([]);
  const [karyawanData, setKaryawanData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // ---- Realtime state ----
  const [rtTab, setRtTab] = useState('all');
  const [rtSession, setRtSession] = useState('all');
  const [feedItems, setFeedItems] = useState([]);
  const [rtStats, setRtStats] = useState({ total: 0, hadir: 0, terlambat: 0, avgPersentase: 0 });
  const [rtDate, setRtDate] = useState(new Date().toISOString().slice(0, 10));
  const [rtLoading, setRtLoading] = useState(false);
  const pollRef = useRef(null);

  // ---- Auth & Notifications ----

// Ambil user yang sedang login
useEffect(() => {
  const currentUser = authService.getCurrentUser();
  setUser(currentUser);
}, []);

// Request izin notifikasi
useEffect(() => {
  const setupNotifications = async () => {
    await notificationService.requestPermission();
  };

  setupNotifications();
}, []);

  // ==================== REKAP DATA ====================
  const loadRekapData = useCallback(async () => {
    setTableLoading(true);
    try {
      if (rekapTab === 'dosen') {
        const data = await apiService.fetchDosenAttendance(dateRange.start, dateRange.end);
        setDosenData(data || []);
      } else {
        const data = await apiService.fetchKaryawanAttendance(dateRange.start, dateRange.end);
        setKaryawanData(data || []);
      }
    } catch (error) {
      console.error('Error loading rekap data:', error);
    } finally {
      setTableLoading(false);
    }
  }, [rekapTab, dateRange]);

  useEffect(() => {
    if (activeSection === 'dosen' || activeSection === 'karyawan' || activeSection === 'overview') {
      loadRekapData();
    }
  }, [loadRekapData, activeSection]);

  useEffect(() => {
    if (rekapTab === 'karyawan') setActiveSession('all');
  }, [rekapTab]);

  // Sync rekapTab with activeSection
  useEffect(() => {
    if (activeSection === 'dosen') setRekapTab('dosen');
    if (activeSection === 'karyawan') setRekapTab('karyawan');
  }, [activeSection]);

  // ==================== REALTIME DATA ====================
  const loadFeed = useCallback(async () => {
    try {
      const data = await apiService.fetchRealtimeFeed(rtDate);
      setFeedItems(data || []);
      computeRtStats(data || []);
    } catch (err) {
      console.error('Realtime feed error:', err);
    } finally {
      setRtLoading(false);
    }
  }, [rtDate]);

  useEffect(() => {
    if (activeSection === 'realtime' || activeSection === 'overview') {
      setRtLoading(true);
      loadFeed();
      clearInterval(pollRef.current);
      pollRef.current = setInterval(loadFeed, 15000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [loadFeed, activeSection]);

  function computeRtStats(data) {
    const uniqueNames = new Set(data.map(d => d.nama || d.nip)).size;
    const hadir = data.filter(d => d.statusAbsen === 'masuk').length;
    const terlambat = data.filter(d => d.terlambat === true).length;
    const avg = data.length > 0 ? Math.round((hadir / data.length) * 100) : 0;
    setRtStats({ total: uniqueNames, hadir, terlambat, avgPersentase: avg });
  }

  // ==================== PERIOD HANDLERS ====================
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

  // ==================== DERIVED DATA ====================
  const filteredDosenData = dosenData.filter((d) => {
    if (activeSession === 'all') return true;
    const sesi = d.sesi || getSesiFromTime(d.lastCheckIn);
    return sesi === activeSession;
  });

  const rekapStats =
    rekapTab === 'dosen'
      ? {
          total: filteredDosenData.length,
          hadir: filteredDosenData.reduce((s, d) => s + (d.totalHadir || 0), 0),
          terlambat: filteredDosenData.reduce((s, d) => s + (d.totalTerlambat || 0), 0),
          avgPersentase:
            filteredDosenData.length > 0
              ? Math.round(filteredDosenData.reduce((s, d) => {
                  const pct = d.persentase ?? (d.totalHariKerja > 0 ? (d.totalHadir / d.totalHariKerja) * 100 : 0);
                  return s + pct;
                }, 0) / filteredDosenData.length)
              : 0,
        }
      : {
          total: karyawanData.length,
          hadir: karyawanData.reduce((s, k) => s + (k.totalHadir || 0), 0),
          terlambat: karyawanData.reduce((s, k) => s + (k.totalTerlambat || 0), 0),
          avgPersentase:
            karyawanData.length > 0
              ? Math.round(karyawanData.reduce((s, k) => {
                  const pct = k.persentase ?? (k.totalHariKerja > 0 ? (k.totalHadir / k.totalHariKerja) * 100 : 0);
                  return s + pct;
                }, 0) / karyawanData.length)
              : 0,
        };

  const filteredFeed = feedItems.filter(item => {
    if (rtTab === 'dosen' && item.tipe !== 'dosen') return false;
    if (rtTab === 'karyawan' && item.tipe !== 'karyawan') return false;
    if (rtSession === 'pagi' && item.sesi !== 'pagi') return false;
    if (rtSession === 'malam' && item.sesi !== 'malam') return false;
    return true;
  });

  // ==================== SECTION TITLE ====================
const sectionTitle = {
  overview: 'Overview',
  realtime: 'Live Realtime',
  dosen: 'Rekap Dosen',
  karyawan: 'Rekap Karyawan',
  'user-alat': 'Manajemen Pengguna',
}[activeSection];

  // ==================== RENDER ====================
  return (
    <div className={`dash-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>

      {/* ===== SIDEBAR ===== */}
      <aside className="dash-sidebar">
        {/* Logo / Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <BarChart2 size={20} />
          </div>
          {sidebarOpen && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">AbsensiKampus</span>
              <span className="sidebar-brand-sub">Monitoring System</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              className={`sidebar-nav-item ${activeSection === key ? 'active' : ''}`}
              onClick={() => setActiveSection(key)}
              title={!sidebarOpen ? label : undefined}
            >
              <span className="sidebar-nav-icon">
                <Icon size={18} />
                {badge && activeSection !== key && (
                  <span className="sidebar-live-dot" />
                )}
              </span>
              {sidebarOpen && (
                <span className="sidebar-nav-label">
                  {label}
                  {badge && <span className="sidebar-badge">{badge}</span>}
                </span>
              )}
              {sidebarOpen && activeSection === key && (
                <ChevronRight size={14} className="sidebar-nav-arrow" />
              )}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="sidebar-footer">
          {user && sidebarOpen && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name || user.username || 'User'}</span>
                <span className="sidebar-user-email">{user.email || ''}</span>
              </div>
            </div>
          )}
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="dash-main">

        {/* ---- Top Bar ---- */}
        <header className="dash-topbar">
          <div className="topbar-left">
            <button
              className="topbar-toggle-btn"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="topbar-breadcrumb">
              <span className="topbar-breadcrumb-root">Dashboard</span>
              <ChevronRight size={14} className="topbar-bc-sep" />
              <span className="topbar-breadcrumb-current">{sectionTitle}</span>
            </div>
          </div>
          <div className="topbar-right">
            {activeSection === 'realtime' && (
              <div className="topbar-live-badge">
                <span className="rt-pulse-dot" />
                REAL-TIME
              </div>
            )}
            <button className="topbar-icon-btn" title="Notifikasi">
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* ---- Page Content ---- */}
        <main className="dash-content">

          {/* ======================== OVERVIEW ======================== */}
          {activeSection === 'overview' && (
            <div className="section-overview">
              <div className="page-heading">
                <h2 className="page-title">Selamat datang{user ? `, ${user.name || user.username}` : ''} 👋</h2>
                <p className="page-sub">Ringkasan kehadiran hari ini</p>
              </div>

              {/* Quick stats row */}
              <div className="stats-grid">
                <StatsCard icon={Users}    title="Total Dosen"       value={dosenData.length}         color="#3B82F6" />
                <StatsCard icon={Briefcase} title="Total Karyawan"  value={karyawanData.length}       color="#10B981" />
                <StatsCard icon={Activity} title="Live Check-in"    value={rtStats.hadir}             color="#8B5CF6" />
                <StatsCard icon={Clock}    title="Keterlambatan"     value={rtStats.terlambat} subtitle="hari ini" color="#EF4444" />
              </div>

              {/* Two-column: live feed + quick links */}
              <div className="overview-grid">
                {/* Live feed mini */}
                <div className="overview-card">
                  <div className="overview-card-header">
                    <span className="overview-card-title">
                      <Activity size={15} />
                      Live Feed Kehadiran
                    </span>
                    <button
                      className="overview-card-link"
                      onClick={() => setActiveSection('realtime')}
                    >
                      Lihat semua <ChevronRight size={13} />
                    </button>
                  </div>
                  <LiveFeedList items={filteredFeed.slice(0, 8)} loading={rtLoading} compact />
                </div>

                {/* Quick navigation cards */}
                <div className="overview-quick-nav">
                  {[
                    { key: 'realtime', icon: Activity,  label: 'Live Realtime',  sub: 'Monitor kehadiran saat ini', color: '#8B5CF6' },
                    { key: 'dosen',    icon: Users,     label: 'Rekap Dosen',    sub: 'Data absensi dosen',         color: '#3B82F6' },
                    { key: 'karyawan', icon: Briefcase, label: 'Rekap Karyawan', sub: 'Data absensi karyawan',      color: '#10B981' },
                  ].map(({ key, icon: Icon, label, sub, color }) => (
                    <button
                      key={key}
                      className="quick-nav-card"
                      onClick={() => setActiveSection(key)}
                    >
                      <span className="quick-nav-icon" style={{ background: color + '20', color }}>
                        <Icon size={20} />
                      </span>
                      <span className="quick-nav-text">
                        <span className="quick-nav-label">{label}</span>
                        <span className="quick-nav-sub">{sub}</span>
                      </span>
                      <ChevronRight size={16} className="quick-nav-arrow" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================== REALTIME ======================== */}
          {activeSection === 'realtime' && (
            <div className="section-realtime">
              <div className="page-heading">
                <h2 className="page-title">Live Realtime</h2>
                <p className="page-sub">Diperbarui otomatis setiap 15 detik</p>
              </div>

              {/* Stats */}
              <div className="stats-grid">
                <StatsCard icon={Users}    title="Total Hadir Hari Ini" value={rtStats.total}                color="#3B82F6" />
                <StatsCard icon={Calendar} title="Total Check-in"       value={rtStats.hadir}                color="#10B981" />
                <StatsCard icon={Clock}    title="Keterlambatan"        value={rtStats.terlambat}            color="#EF4444" />
                <StatsCard icon={FileText} title="Rata-rata Kehadiran"  value={`${rtStats.avgPersentase}%`}  color="#8B5CF6" />
              </div>

              {/* Main layout */}
              <div className="rt-main-row">
                {/* Feed card */}
                <div className="rt-feed-card">
                  <div className="rt-feed-header">
                    <h3 className="rt-feed-title">
                      <Activity size={16} color="#1d4ed8" />
                      Live Feed Kehadiran
                    </h3>
                    <span className="rt-tag">● REAL-TIME</span>
                  </div>

                  <div className="rt-tab-group">
                    {['all', 'dosen', 'karyawan'].map(t => (
                      <button
                        key={t}
                        className={`rt-tab ${rtTab === t ? 'active' : ''}`}
                        onClick={() => setRtTab(t)}
                      >
                        {t === 'all' ? 'Semua' : t === 'dosen' ? 'Dosen' : 'Karyawan'}
                      </button>
                    ))}
                  </div>

                  <LiveFeedList items={filteredFeed} loading={rtLoading} />
                </div>

                {/* Side panel */}
                <div className="rt-side-panel">
                  <div className="rt-side-card">
                    <p className="rt-side-title">📅 Periode &amp; Sesi</p>
                    <label className="rt-label">Tanggal</label>
                    <input
                      type="date"
                      className="filter-input"
                      value={rtDate}
                      onChange={e => setRtDate(e.target.value)}
                      style={{ marginBottom: 10, width: '100%' }}
                    />
                    <label className="rt-label">Sesi Kelas</label>
                    <div className="rt-session-pills">
                      {[
                        { key: 'all',   label: 'Semua', Icon: LayoutGrid, cls: 'pill-all'   },
                        { key: 'pagi',  label: 'Pagi',  Icon: Sun,        cls: 'pill-pagi'  },
                        { key: 'malam', label: 'Malam', Icon: Moon,       cls: 'pill-malam' },
                      ].map(({ key, label, Icon, cls }) => (
                        <button
                          key={key}
                          className={`rt-pill ${cls} ${rtSession === key ? 'active' : ''}`}
                          onClick={() => setRtSession(key)}
                        >
                          <Icon size={13} /> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rt-side-card rt-chart-card">
                    <p className="rt-side-title">📊 Kehadiran Per Jam</p>
                    <HourlyBarChart items={feedItems} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================== REKAP DOSEN ======================== */}
          {activeSection === 'dosen' && (
            <RekapSection
              label="Dosen"
              icon={<Users size={18} />}
              stats={rekapStats}
              filteredData={filteredDosenData}
              karyawanData={karyawanData}
              activeSession={activeSession}
              onSessionChange={setActiveSession}
              selectedPeriod={selectedPeriod}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onPeriodChange={handlePeriodChange}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              loading={tableLoading}
              rekapTab={rekapTab}
            />
          )}

          {/* ======================== REKAP KARYAWAN ======================== */}
          {activeSection === 'karyawan' && (
            <RekapSection
              label="Karyawan"
              icon={<Briefcase size={18} />}
              stats={rekapStats}
              filteredData={filteredDosenData}
              karyawanData={karyawanData}
              activeSession={activeSession}
              onSessionChange={setActiveSession}
              selectedPeriod={selectedPeriod}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onPeriodChange={handlePeriodChange}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              loading={tableLoading}
              rekapTab={rekapTab}
            />
          )}

          {activeSection === 'user-alat' && (
            <UserManagement />
          )}

        </main>
      </div>
    </div>
  );
}

// ==================== REKAP SECTION COMPONENT ====================
function RekapSection({
  label, stats,
  filteredData, karyawanData,
  activeSession, onSessionChange,
  selectedPeriod, dateRange, onDateRangeChange, onPeriodChange,
  searchTerm, onSearchChange,
  loading, rekapTab,
}) {
  const isDosen = rekapTab === 'dosen';

  return (
    <div className="section-rekap">
      <div className="page-heading">
        <h2 className="page-title">Rekap {label}</h2>
        <p className="page-sub">Data kehadiran {label.toLowerCase()} berdasarkan periode yang dipilih</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatsCard icon={Users}    title={`Total ${label}`}      value={stats.total}               color="#3B82F6" />
        <StatsCard icon={Calendar} title="Total Kehadiran"       value={stats.hadir}               color="#10B981" />
        <StatsCard icon={Clock}    title="Total Keterlambatan"   value={stats.terlambat} subtitle="kali" color="#EF4444" />
        <StatsCard icon={FileText} title="Rata-rata Kehadiran"   value={`${stats.avgPersentase}%`} color="#8B5CF6" />
      </div>

      {/* Filter Panel */}
      <FilterPanel
        activeTab={rekapTab}
        activeSession={activeSession}
        onSessionChange={onSessionChange}
        selectedPeriod={selectedPeriod}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        onPeriodChange={onPeriodChange}
      />

      {/* Search */}
      <div className="search-container">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={`Cari ${label.toLowerCase()} (nama, NIP)...`}
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <div className="loading-text">Memuat data...</div>
          </div>
        ) : isDosen ? (
          <DosenTable data={filteredData} searchTerm={searchTerm} />
        ) : (
          <KaryawanTable data={karyawanData} searchTerm={searchTerm} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;