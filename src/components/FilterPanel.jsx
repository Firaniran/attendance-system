// ==================== FILTER PANEL ====================
// File: src/components/FilterPanel.jsx
//
// ⚠️  ATURAN PENTING — ROLE CHECK DI SINI:
//   SELALU gunakan prop `permissions.canExport` untuk guard export.
//   JANGAN pernah cek user.role langsung di komponen ini.
//
// Alasan: authService menyimpan role sebagai LOWERCASE ('admin', 'pimpinan').
// ROLE_PERMISSIONS di AuthContext menggunakan key lowercase juga.
// Dashboard sudah menghitung permissions yang benar dan meneruskannya ke sini.
// Mengecek ulang user.role di sini (apalagi dengan uppercase) menyebabkan bug
// di mana Admin/Pimpinan yang valid dianggap tidak punya akses export.

import React, { useState } from 'react';
import { Sun, Moon, LayoutGrid, Download, Lock } from 'lucide-react';
import { apiService } from '../services/apiService';

// ── Opsi tombol cepat periode ──
const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hari Ini'   },
  { value: 'week',  label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini'  },
];

// ── Opsi sesi kelas (hanya untuk tab Dosen) ──
const SESSION_OPTIONS = [
  {
    key:      'all',
    label:    'Semua Sesi',
    sub:      'Gabungan pagi & malam',
    Icon:     LayoutGrid,
    cls:      'session-btn-all',
    infoCls:  'session-info-all',
    infoText: 'Menampilkan semua sesi kehadiran',
  },
  {
    key:      'pagi',
    label:    'Pagi',
    sub:      '08.00 – 15.59 WIB',
    Icon:     Sun,
    cls:      'session-btn-pagi',
    infoCls:  'session-info-pagi',
    infoText: 'Sesi Pagi: pukul 08.00 – 15.59 WIB',
  },
  {
    key:      'malam',
    label:    'Malam',
    sub:      '16.00 – 21.00 WIB',
    Icon:     Moon,
    cls:      'session-btn-malam',
    infoCls:  'session-info-malam',
    infoText: 'Sesi Malam: pukul 16.00 – 21.00 WIB',
  },
];

// ── Opsi tombol export — format harus cocok dengan endpointMap di apiService ──
const EXPORT_OPTIONS = [
  { format: 'excel',  label: 'Excel',        cls: 'export-btn-excel'  },
  { format: 'detail', label: 'Excel Detail',  cls: 'export-btn-detail' },
  { format: 'pdf',    label: 'PDF',           cls: 'export-btn-pdf'    },
  { format: 'csv',    label: 'CSV',           cls: 'export-btn-csv'    },
];

// ==================== KOMPONEN UTAMA ====================
const FilterPanel = ({
  activeTab,          // 'dosen' | 'karyawan'
  activeSession,      // 'all' | 'pagi' | 'malam'
  onSessionChange,    // (session: string) => void
  selectedPeriod,     // 'today' | 'week' | 'month'
  dateRange,          // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
  onDateRangeChange,  // (range) => void
  onPeriodChange,     // (period: string) => void
  permissions,        // objek dari ROLE_PERMISSIONS — pakai .canExport untuk guard
}) => {
  const [exportLoading, setExportLoading]   = useState(null);
  const [exportMessage, setExportMessage]   = useState({ text: '', isError: false });

  const isDosen = activeTab === 'dosen';

  // Cari info sesi yang sedang aktif untuk banner informasi
  const activeSessionInfo = SESSION_OPTIONS.find(s => s.key === activeSession);

  // ── Handler export ──
  const handleExport = async (format) => {
    if (exportLoading) return; // cegah double-click
    setExportLoading(format);
    setExportMessage({ text: '', isError: false });
    try {
      const jabatan = isDosen ? 'DOSEN' : 'KARYAWAN';
      const result  = await apiService.exportData(format, jabatan, dateRange.start, dateRange.end);
      setExportMessage({ text: result.message || '✅ Export berhasil!', isError: false });
    } catch (err) {
      setExportMessage({ text: err.message || '❌ Export gagal.', isError: true });
    } finally {
      setExportLoading(null);
      setTimeout(() => setExportMessage({ text: '', isError: false }), 4000);
    }
  };

  // ── Handler perubahan tanggal kustom ──
  const handleStartChange = (e) => {
    onDateRangeChange({ ...dateRange, start: e.target.value });
  };
  const handleEndChange = (e) => {
    onDateRangeChange({ ...dateRange, end: e.target.value });
  };

  return (
    <div className="filter-panel">

      {/* ═══════════════════════════════════════════════
          SEKSI 1 — PERIODE
      ═══════════════════════════════════════════════ */}
      <div className="filter-section">
        <p className="filter-section-title">
          <span className="filter-section-icon">📅</span>
          Periode
        </p>

        <div className="filter-row">

          {/* Tombol cepat: Hari Ini / Minggu Ini / Bulan Ini */}
          <div className="filter-field" style={{ gridColumn: 'span 2' }}>
            <label className="filter-label">Pilih Periode Cepat</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {PERIOD_OPTIONS.map(({ value, label }) => {
                const isActive = selectedPeriod === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onPeriodChange(value)}
                    style={{
                      padding:      '7px 14px',
                      borderRadius: '7px',
                      border:       isActive ? '1.5px solid #1d4ed8' : '1.5px solid #e2e8f0',
                      background:   isActive ? '#eff6ff' : 'white',
                      color:        isActive ? '#1d4ed8' : '#4a5568',
                      fontSize:     '13px',
                      fontWeight:   isActive ? '700' : '500',
                      cursor:       'pointer',
                      transition:   'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date range kustom */}
          <div className="filter-field">
            <label className="filter-label">Dari Tanggal</label>
            <input
              type="date"
              className="filter-input"
              value={dateRange.start}
              max={dateRange.end || undefined}
              onChange={handleStartChange}
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Sampai Tanggal</label>
            <input
              type="date"
              className="filter-input"
              value={dateRange.end}
              min={dateRange.start || undefined}
              onChange={handleEndChange}
            />
          </div>

        </div>
      </div>

      {isDosen && (
        <>
          <div className="filter-divider" />
          <div className="filter-section">
            <p className="filter-section-title">
              <span className="filter-section-icon">🕐</span>
              Sesi Kelas
            </p>

            <div className="session-toggle-group">
              {SESSION_OPTIONS.map(({ key, label, sub, Icon, cls }) => (
                <button
                  key={key}
                  type="button"
                  className={`session-toggle-btn ${cls}${activeSession === key ? ' active' : ''}`}
                  onClick={() => onSessionChange(key)}
                >
                  <span className="session-btn-icon">
                    <Icon size={16} />
                  </span>
                  <span className="session-btn-content">
                    <span className="session-btn-label">{label}</span>
                    <span className="session-btn-sublabel">{sub}</span>
                  </span>
                  {activeSession === key && <span className="session-active-dot" />}
                </button>
              ))}
            </div>

            {/* Banner info sesi aktif */}
            {activeSessionInfo && (
              <div
                className={`session-info-banner ${activeSessionInfo.infoCls}`}
                style={{ marginTop: '10px' }}
              >
                <span className="session-info-icon" style={{ fontSize: '14px' }}>ℹ️</span>
                <span>{activeSessionInfo.infoText}</span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="filter-divider" />
      <div className="filter-section">
        <p className="filter-section-title">
          <span className="filter-section-icon">📥</span>
          Export Data
        </p>

        {permissions?.canExport ? (
          /* ── User punya akses export ── */
          <>
            <div className="export-btn-group">
              {EXPORT_OPTIONS.map(({ format, label, cls }) => (
                <button
                  key={format}
                  type="button"
                  className={`export-btn ${cls}`}
                  onClick={() => handleExport(format)}
                  disabled={exportLoading !== null}
                >
                  <Download size={13} />
                  {exportLoading === format ? 'Mengunduh...' : label}
                </button>
              ))}
            </div>

            {/* Pesan sukses / error setelah export */}
            {exportMessage.text && (
              <p style={{
                marginTop:  '8px',
                fontSize:   '12px',
                fontWeight: '600',
                color:      exportMessage.isError ? '#dc2626' : '#059669',
              }}>
                {exportMessage.text}
              </p>
            )}
          </>
        ) : (
          /* ── User tidak punya akses export ── */
          <div style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '8px',
            padding:      '10px 14px',
            background:   '#f8fafc',
            borderRadius: '8px',
            border:       '1px dashed #e2e8f0',
            color:        '#9ca3af',
            fontSize:     '13px',
            fontWeight:   '500',
          }}>
            <Lock size={14} style={{ flexShrink: 0 }} />
            Fitur export hanya tersedia untuk Admin dan Pimpinan.
          </div>
        )}
      </div>

    </div>
  );
};

export default FilterPanel;