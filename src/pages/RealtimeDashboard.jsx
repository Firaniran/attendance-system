// ==================== REALTIME DASHBOARD PAGE ====================
// File: src/pages/RealtimeDashboard.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Calendar, Clock, FileText, Activity, Sun, Moon, LayoutGrid, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import LiveFeedList from '../components/LiveFeedList';
import HourlyBarChart from '../components/HourlyBarChart';
import { apiService } from '../services/apiService';
import '../styles/realtime.css';

function RealtimeDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [activeSession, setActiveSession] = useState('all');
  const [feedItems, setFeedItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, hadir: 0, terlambat: 0, avgPersentase: 0 });
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  // ==================== UNLOCK SCROLL ====================
  // Override overflow:hidden yang di-set global oleh main.css
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyMaxHeight = document.body.style.maxHeight;

    document.body.style.overflow = 'auto';
    document.body.style.maxHeight = 'none';
    document.documentElement.style.overflow = 'auto';

    // Cari elemen #root / .app-container yang mungkin punya overflow:hidden
    const root = document.getElementById('root');
    const appContainer = document.querySelector('.app-container');
    const prevRootOverflow = root ? root.style.overflow : '';
    const prevAppOverflow = appContainer ? appContainer.style.overflow : '';
    const prevRootMaxHeight = root ? root.style.maxHeight : '';
    const prevAppMaxHeight = appContainer ? appContainer.style.maxHeight : '';

    if (root) {
      root.style.overflow = 'visible';
      root.style.maxHeight = 'none';
    }
    if (appContainer) {
      appContainer.style.overflow = 'visible';
      appContainer.style.maxHeight = 'none';
    }

    return () => {
      // Kembalikan semua saat unmount agar halaman lain tidak terpengaruh
      document.body.style.overflow = prevBodyOverflow || '';
      document.body.style.maxHeight = prevBodyMaxHeight || '';
      document.documentElement.style.overflow = prevHtmlOverflow || '';
      if (root) {
        root.style.overflow = prevRootOverflow || '';
        root.style.maxHeight = prevRootMaxHeight || '';
      }
      if (appContainer) {
        appContainer.style.overflow = prevAppOverflow || '';
        appContainer.style.maxHeight = prevAppMaxHeight || '';
      }
    };
  }, []);

  // ==================== LOAD & POLLING ====================
  const loadFeed = useCallback(async () => {
    try {
      const data = await apiService.fetchRealtimeFeed(date);
      setFeedItems(data || []);
      computeStats(data || []);
    } catch (err) {
      console.error('Realtime feed error:', err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setLoading(true);
    loadFeed();
    pollRef.current = setInterval(loadFeed, 15000);
    return () => clearInterval(pollRef.current);
  }, [loadFeed]);

  function computeStats(data) {
    const uniqueNames = new Set(data.map(d => d.nama || d.nip)).size;
    const hadir = data.filter(d => d.statusAbsen === 'masuk').length;
    const terlambat = data.filter(d => d.terlambat === true).length;
    const avg = data.length > 0 ? Math.round((hadir / data.length) * 100) : 0;
    setStats({ total: uniqueNames, hadir, terlambat, avgPersentase: avg });
  }

  const filteredItems = feedItems.filter(item => {
    if (activeTab === 'dosen'    && item.tipe !== 'dosen')    return false;
    if (activeTab === 'karyawan' && item.tipe !== 'karyawan') return false;
    if (activeSession === 'pagi'  && item.sesi !== 'pagi')    return false;
    if (activeSession === 'malam' && item.sesi !== 'malam')   return false;
    return true;
  });

  return (
    <div className="rt-container">
      {/* ===== HEADER ===== */}
      <div className="rt-header">
        <div>
          <h1 className="rt-header-title">Dashboard Ringkasan</h1>
          <p className="rt-header-sub">Live monitoring kehadiran — diperbarui otomatis</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="rt-back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={15} /> Dasbor Utama
          </button>
          <div className="rt-live-badge">
            <span className="rt-pulse-dot" />
            REAL-TIME
          </div>
        </div>
      </div>

      <div className="rt-body">
        {/* ===== STATS CARDS ===== */}
        <div className="rt-stats-grid">
          <StatsCard icon={Users}    title="Total Dosen & Karyawan" value={stats.total}                color="#3B82F6" />
          <StatsCard icon={Calendar} title="Total Kehadiran"         value={stats.hadir}                color="#10B981" />
          <StatsCard icon={Clock}    title="Total Keterlambatan"     value={stats.terlambat}            color="#EF4444" />
          <StatsCard icon={FileText} title="Rata-rata Kehadiran"     value={`${stats.avgPersentase}%`}  color="#8B5CF6" />
        </div>

        {/* ===== MAIN LAYOUT ===== */}
        <div className="rt-main-row">
          {/* Feed */}
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
                  className={`rt-tab ${activeTab === t ? 'active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t === 'all' ? 'Semua' : t === 'dosen' ? 'Dosen' : 'Karyawan'}
                </button>
              ))}
            </div>

            <LiveFeedList items={filteredItems} loading={loading} />
          </div>

          {/* Side panel */}
          <div className="rt-side-panel">
            <div className="rt-side-card">
              <p className="rt-side-title">📅 Periode &amp; Sesi</p>
              <label className="rt-label">Tanggal</label>
              <input
                type="date"
                className="filter-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ marginBottom: 10, width: '100%' }}
              />
              <label className="rt-label">Sesi Kelas</label>
              <div className="rt-session-pills">
                {[
                  { key: 'all',   label: 'Semua Sesi', Icon: LayoutGrid, cls: 'pill-all'   },
                  { key: 'pagi',  label: 'Pagi',       Icon: Sun,        cls: 'pill-pagi'  },
                  { key: 'malam', label: 'Malam',      Icon: Moon,       cls: 'pill-malam' },
                ].map(({ key, label, Icon, cls }) => (
                  <button
                    key={key}
                    className={`rt-pill ${cls} ${activeSession === key ? 'active' : ''}`}
                    onClick={() => setActiveSession(key)}
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
    </div>
  );
}

export default RealtimeDashboard;