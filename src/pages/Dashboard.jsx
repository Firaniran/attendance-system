// ==================== DASHBOARD PAGE ====================
// File: src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, FileText, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import FilterPanel from '../components/FilterPanel';
import DosenTable from '../components/DosenTable';
import KaryawanTable from '../components/KaryawanTable';
import { getWeekRange, getMonthRange } from '../utils/dateUtils';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import '../styles/main.css';

// ==================== MOCK DATA (FALLBACK) ====================
const mockDosenData = [
  {
    id: 1,
    nama: 'Aziz Azidani, M.Kom',
    nip: '198501012010011001',
    matakuliah: 'Kongfigurasi Jaringan',
    totalHadir: 18,
    totalMengajar: 20,
    persentase: 90,
    lastAttendance: '2025-01-07 14:30'
  },
  {
    id: 2,
    nama: 'Ilham Akhsani, M.Kom',
    nip: '197803152008012002',
    matakuliah: 'Basis Data',
    totalHadir: 15,
    totalMengajar: 16,
    persentase: 93.75,
    lastAttendance: '2025-01-07 10:15'
  },
];

const mockKaryawanData = [
  {
    id: 1,
    nama: 'Budi Santoso',
    nip: '199001012015011001',
    jabatan: 'Staff IT',
    totalHadir: 20,
    totalHariKerja: 22,
    totalTerlambat: 3,
    persentase: 90.9,
    lastCheckIn: '2025-01-07 08:15',
    lastCheckOut: '2025-01-06 17:05'
  },
  {
    id: 2,
    nama: 'Dewi Lestari',
    nip: '198505102016012001',
    jabatan: 'Staff Akademik',
    totalHadir: 21,
    totalHariKerja: 22,
    totalTerlambat: 1,
    persentase: 95.45,
    lastCheckIn: '2025-01-07 07:55',
    lastCheckOut: '2025-01-06 17:10'
  },
  {
    id: 3,
    nama: 'Andi Wijaya',
    nip: '199203202017011002',
    jabatan: 'Staff Keuangan',
    totalHadir: 19,
    totalHariKerja: 22,
    totalTerlambat: 5,
    persentase: 86.36,
    lastCheckIn: '2025-01-07 08:25',
    lastCheckOut: '2025-01-06 17:00'
  }
];

// ==================== DASHBOARD COMPONENT ====================
function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dosen');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState(getWeekRange());
  const [dosenData, setDosenData] = useState(mockDosenData);
  const [karyawanData, setKaryawanData] = useState(mockKaryawanData);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // ==================== CHECK AUTHENTICATION ====================
  useEffect(() => {
    console.log('🔍 Checking authentication...');
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    // Get current user info
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    console.log('✅ User authenticated:', currentUser);
    
    // Load initial data
    loadData();
  }, []); // Run only once on mount

  // ==================== LOAD DATA WHEN TAB OR DATE CHANGES ====================
  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadData();
    }
  }, [activeTab, dateRange]);

  // ==================== LOAD DATA FUNCTION ====================
  const loadData = async () => {
    console.log('📊 Loading data for tab:', activeTab);
    setLoading(true);
    
    try {
      if (activeTab === 'dosen') {
        const data = await apiService.fetchDosenAttendance(
          dateRange.start, 
          dateRange.end
        );
        
        if (data && data.length > 0) {
          console.log('✅ Dosen data loaded:', data.length, 'records');
          setDosenData(data);
        } else {
          console.log('⚠️ No dosen data, using mock data');
          setDosenData(mockDosenData);
        }
      } else {
        const data = await apiService.fetchKaryawanAttendance(
          dateRange.start, 
          dateRange.end
        );
        
        if (data && data.length > 0) {
          console.log('✅ Karyawan data loaded:', data.length, 'records');
          setKaryawanData(data);
        } else {
          console.log('⚠️ No karyawan data, using mock data');
          setKaryawanData(mockKaryawanData);
        }
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      // Use mock data as fallback
      if (activeTab === 'dosen') {
        setDosenData(mockDosenData);
      } else {
        setKaryawanData(mockKaryawanData);
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLE PERIOD CHANGE ====================
  const handlePeriodChange = (period) => {
    console.log('📅 Period changed to:', period);
    if (period === 'week') {
      setDateRange(getWeekRange());
    } else if (period === 'month') {
      setDateRange(getMonthRange());
    }
  };

  // ==================== HANDLE EXPORT ====================
  const handleExport = async (format) => {
    console.log('📥 Exporting as:', format);
    await apiService.exportData(activeTab, format, dateRange.start, dateRange.end);
  };

  // ==================== HANDLE LOGOUT ====================
  const handleLogout = () => {
    console.log('🚪 Logging out...');
    authService.logout();
    navigate('/login');
  };

  // ==================== CALCULATE STATS ====================
  const stats = activeTab === 'dosen' ? {
    total: dosenData.length,
    hadir: dosenData.reduce((sum, d) => sum + (d.totalHadir || 0), 0),
    avgPersentase: dosenData.length > 0 
      ? (dosenData.reduce((sum, d) => sum + (d.persentase || 0), 0) / dosenData.length).toFixed(1)
      : '0.0'
  } : {
    total: karyawanData.length,
    hadir: karyawanData.reduce((sum, k) => sum + (k.totalHadir || 0), 0),
    terlambat: karyawanData.reduce((sum, k) => sum + (k.totalTerlambat || 0), 0),
    avgPersentase: karyawanData.length > 0
      ? (karyawanData.reduce((sum, k) => sum + (k.persentase || 0), 0) / karyawanData.length).toFixed(1)
      : '0.0'
  };

  // ==================== RENDER ====================
  return (
    <div className="app-container">
      {/* Header with Logout Button */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        color: 'white',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', margin: 0 }}>
              Sistem Rekap Absensi Kampus
            </h1>
            <p style={{ color: '#bfdbfe', fontSize: '14px', margin: 0 }}>
              Dashboard Monitoring Kehadiran Dosen & Karyawan
            </p>
          </div>
          
          {/* User Info & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  {user.name || user.nama || 'User'}
                </p>
                <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>
                  {user.email || ''}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="main-content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab('dosen')}
            className={`tab-button ${activeTab === 'dosen' ? 'active' : ''}`}
          >
            <Users size={20} />
            Rekap Dosen
          </button>
          <button
            onClick={() => setActiveTab('karyawan')}
            className={`tab-button ${activeTab === 'karyawan' ? 'active' : ''}`}
          >
            <Clock size={20} />
            Rekap Karyawan
          </button>
        </div>

        {/* Stats Cards */}
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
          {activeTab === 'karyawan' && (
            <StatsCard
              icon={Clock}
              title="Total Keterlambatan"
              value={stats.terlambat}
              subtitle="kali"
              color="#EF4444"
            />
          )}
          <StatsCard
            icon={FileText}
            title="Rata-rata Kehadiran"
            value={`${stats.avgPersentase}%`}
            color="#8B5CF6"
          />
        </div>

        {/* Filter Panel */}
        <FilterPanel
          activeTab={activeTab}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onPeriodChange={handlePeriodChange}
          onExport={handleExport}
        />

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder={`Cari ${activeTab === 'dosen' ? 'dosen (nama, NIP, mata kuliah)' : 'karyawan (nama, NIP, jabatan)'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Memuat data...</div>
            </div>
          ) : activeTab === 'dosen' ? (
            <DosenTable data={dosenData} searchTerm={searchTerm} />
          ) : (
            <KaryawanTable data={karyawanData} searchTerm={searchTerm} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;