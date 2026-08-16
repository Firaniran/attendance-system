// ==================== PERSONAL DASHBOARD ====================
// File: src/pages/PersonalDashboard.jsx

import React, { useEffect, useState } from 'react';
import {
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart2,
  Bell,
  Briefcase,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import StatsCard from '../components/StatsCard';
import { authService } from '../services/authService';
import { personalAttendanceService } from '../services/personalAttendanceService';

import '../styles/main.css';

const PersonalDashboard = ({ user }) => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = (user?.role || 'karyawan').toLowerCase();

  const isDosen = role === 'dosen';

  const dashboardLabel = isDosen
    ? 'Dashboard Dosen'
    : 'Dashboard Karyawan';

  const roleLabel = isDosen ? 'Dosen' : 'Karyawan';

  // ==================== LOAD DATA ====================

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const result =
        await personalAttendanceService.getPersonalAttendance(user);

      setData(result);
    } catch (err) {
      console.error('Personal attendance error:', err);
      setError(
        err.message ||
        'Data absensi pribadi gagal dimuat.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // ==================== LOGOUT ====================

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // ==================== HELPERS ====================

  const getInitial = () => {
    const name =
      user?.name ||
      user?.username ||
      'U';

    return name.charAt(0).toUpperCase();
  };

  const getStatusClass = (status) => {
    const normalized = (status || '').toLowerCase();

    if (normalized.includes('hadir')) {
      return 'personal-status-hadir';
    }

    if (normalized.includes('terlambat')) {
      return 'personal-status-terlambat';
    }

    if (
      normalized.includes('tidak') ||
      normalized.includes('absen')
    ) {
      return 'personal-status-tidak-hadir';
    }

    return 'personal-status-neutral';
  };

  const getStatusIcon = (status) => {
    const normalized = (status || '').toLowerCase();

    if (normalized.includes('hadir')) {
      return <CheckCircle2 size={14} />;
    }

    if (normalized.includes('terlambat')) {
      return <AlertCircle size={14} />;
    }

    if (
      normalized.includes('tidak') ||
      normalized.includes('absen')
    ) {
      return <XCircle size={14} />;
    }

    return null;
  };

  // ==================== RENDER LOADING ====================

  if (loading) {
    return (
      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <BarChart2 size={20} />
            </div>

            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">
                AbsensiKampus
              </span>

              <span className="sidebar-brand-sub">
                Monitoring System
              </span>
            </div>
          </div>

          <div className="sidebar-footer">
            <button
              className="sidebar-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="dash-main">
          <header className="dash-topbar">
            <div className="topbar-left">
              <div className="topbar-breadcrumb">
                <span className="topbar-breadcrumb-root">
                  Dashboard
                </span>

                <ChevronRight
                  size={14}
                  className="topbar-bc-sep"
                />

                <span className="topbar-breadcrumb-current">
                  {dashboardLabel}
                </span>
              </div>
            </div>
          </header>

          <main className="dash-content">
            <div className="loading-container">
              <div className="loading-spinner" />

              <div className="loading-text">
                Memuat data absensi...
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==================== ERROR ====================

  if (error) {
    return (
      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <BarChart2 size={20} />
            </div>

            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">
                AbsensiKampus
              </span>

              <span className="sidebar-brand-sub">
                Monitoring System
              </span>
            </div>
          </div>

          <div className="sidebar-footer">
            <button
              className="sidebar-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="dash-main">
          <header className="dash-topbar">
            <div className="topbar-left">
              <div className="topbar-breadcrumb">
                <span className="topbar-breadcrumb-root">
                  Dashboard
                </span>

                <ChevronRight
                  size={14}
                  className="topbar-bc-sep"
                />

                <span className="topbar-breadcrumb-current">
                  {dashboardLabel}
                </span>
              </div>
            </div>
          </header>

          <main className="dash-content">
            <div className="empty-state">
              <AlertCircle
                size={48}
                className="no-data-icon"
              />

              <p className="no-data-text">
                {error}
              </p>

              <button
                type="button"
                className="overview-card-link"
                onClick={loadData}
                style={{
                  marginTop: '12px',
                }}
              >
                <RefreshCw size={14} />
                Coba lagi
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==================== EMPTY ====================

  if (!data) {
    return (
      <div className="dash-shell">
        <main className="dash-content">
          <div className="empty-state">
            <Calendar
              size={48}
              className="no-data-icon"
            />

            <p className="no-data-text">
              Belum ada data absensi.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const summary = data.summary || {};
  const today = data.today || {};
  const history = data.history || [];

  // ==================== MAIN ====================

  return (
    <div
      className={`dash-shell ${
        sidebarOpen
          ? 'sidebar-open'
          : 'sidebar-collapsed'
      }`}
    >
      {/* ================= SIDEBAR ================= */}

      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <BarChart2 size={20} />
          </div>

          {sidebarOpen && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">
                AbsensiKampus
              </span>

              <span className="sidebar-brand-sub">
                Monitoring System
              </span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <button
            className="sidebar-nav-item active"
            title={
              !sidebarOpen
                ? dashboardLabel
                : undefined
            }
          >
            <span className="sidebar-nav-icon">
              <User size={18} />
            </span>

            {sidebarOpen && (
              <span className="sidebar-nav-label">
                {dashboardLabel}
              </span>
            )}

            {sidebarOpen && (
              <ChevronRight
                size={14}
                className="sidebar-nav-arrow"
              />
            )}
          </button>
        </nav>

        <div className="sidebar-footer">
          {user && sidebarOpen && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {getInitial()}
              </div>

              <div className="sidebar-user-info">
                <span className="sidebar-user-name">
                  {user.name ||
                    user.username ||
                    'User'}
                </span>

                <span className="sidebar-user-email">
                  {user.email || ''}
                </span>
              </div>
            </div>
          )}

          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} />

            {sidebarOpen && (
              <span>Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <div className="dash-main">
        {/* TOPBAR */}

        <header className="dash-topbar">
          <div className="topbar-left">
            <button
              className="topbar-toggle-btn"
              onClick={() =>
                setSidebarOpen((value) => !value)
              }
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X size={18} />
              ) : (
                <Menu size={18} />
              )}
            </button>

            <div className="topbar-breadcrumb">
              <span className="topbar-breadcrumb-root">
                Dashboard
              </span>

              <ChevronRight
                size={14}
                className="topbar-bc-sep"
              />

              <span className="topbar-breadcrumb-current">
                {dashboardLabel}
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-icon-btn">
              <Bell size={16} />
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <main className="dash-content">
          {/* HEADER */}

          <div className="page-heading">
            <h2 className="page-title">
              {dashboardLabel}
            </h2>

            <p className="page-sub">
              Selamat datang,{' '}
              {user?.name ||
                user?.username ||
                'User'}
              . Berikut ringkasan kehadiran pribadi Anda.
            </p>
          </div>

          {/* ================= IDENTITY ================= */}

          <div className="personal-profile-card">
            <div className="personal-profile-avatar">
              {getInitial()}
            </div>

            <div className="personal-profile-info">
              <h3>
                {user?.name ||
                  user?.username ||
                  'User'}
              </h3>

              <div className="personal-profile-role">
                <Briefcase size={14} />

                <span>
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="personal-profile-details">
              <div>
                <Mail size={14} />
                <span>
                  {user?.email ||
                    'Email tidak tersedia'}
                </span>
              </div>
            </div>
          </div>

          {/* ================= STATS ================= */}

          <div className="stats-grid">
            <StatsCard
              icon={CheckCircle2}
              title="Total Hadir"
              value={summary.hadir || 0}
              color="#10B981"
            />

            <StatsCard
              icon={Clock}
              title="Terlambat"
              value={summary.terlambat || 0}
              color="#EF4444"
            />

            <StatsCard
              icon={XCircle}
              title="Tidak Hadir"
              value={summary.tidakHadir || 0}
              color="#F59E0B"
            />

            <StatsCard
              icon={BarChart2}
              title="Persentase Kehadiran"
              value={`${summary.persentase || 0}%`}
              color="#3B82F6"
            />
          </div>

          {/* ================= TODAY ================= */}

          <div className="personal-section-grid">
            <div className="overview-card">
              <div className="overview-card-header">
                <span className="overview-card-title">
                  <Calendar size={15} />
                  Kehadiran Hari Ini
                </span>
              </div>

              <div className="personal-today-body">
                <div className="personal-today-status">
                  <span
                    className={`personal-status-badge ${getStatusClass(
                      today.status
                    )}`}
                  >
                    {getStatusIcon(today.status)}
                    {today.status || 'Belum ada data'}
                  </span>
                </div>

                <div className="personal-time-grid">
                  <div className="personal-time-item">
                    <span className="personal-time-label">
                      Jam Masuk
                    </span>

                    <strong>
                      {today.checkIn || '--:--'}
                    </strong>
                  </div>

                  <div className="personal-time-item">
                    <span className="personal-time-label">
                      Jam Pulang
                    </span>

                    <strong>
                      {today.checkOut || '--:--'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-card-header">
                <span className="overview-card-title">
                  <Clock size={15} />
                  Informasi Akun
                </span>
              </div>

              <div className="personal-account-list">
                <div>
                  <span>Nama</span>
                  <strong>
                    {user?.name ||
                      user?.username ||
                      '-'}
                  </strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>{roleLabel}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ================= HISTORY ================= */}

          <div className="overview-card personal-history-card">
            <div className="overview-card-header">
              <span className="overview-card-title">
                <Calendar size={15} />
                Riwayat Absensi
              </span>
            </div>

            {history.length === 0 ? (
              <div className="empty-state">
                <Calendar
                  size={48}
                  className="no-data-icon"
                />

                <p className="no-data-text">
                  Belum ada riwayat absensi.
                </p>
              </div>
            ) : (
              <div className="table-wrapper personal-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tanggal</th>
                      <th>Hari</th>
                      <th>Status</th>
                      <th>Jam Masuk</th>
                      <th>Jam Pulang</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map(
                      (item, index) => (
                        <tr
                          key={
                            item.id ||
                            `${item.tanggal}-${index}`
                          }
                        >
                          <td>{index + 1}</td>

                          <td>
                            {item.tanggal || '-'}
                          </td>

                          <td>
                            {item.hari || '-'}
                          </td>

                          <td>
                            <span
                              className={`personal-status-badge ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {getStatusIcon(
                                item.status
                              )}

                              {item.status ||
                                '-'}
                            </span>
                          </td>

                          <td>
                            {item.checkIn ||
                              '--:--'}
                          </td>

                          <td>
                            {item.checkOut ||
                              '--:--'}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PersonalDashboard;