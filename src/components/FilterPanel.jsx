// ==================== FILTER PANEL WITH SESSION TOGGLE ====================
// File: src/components/FilterPanel.jsx

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Database, Sun, Moon, LayoutGrid } from 'lucide-react';
import { exportService } from '../services/exportService';

// ==================== SESSION INFO CONFIG ====================
const SESSION_CONFIG = {
  all: {
    label: 'Semua Sesi',
    icon: LayoutGrid,
    description: 'Menampilkan semua sesi — pagi (08.00–15.00) dan malam (16.00–21.00)',
    className: 'session-btn-all',
    infoClassName: 'session-info-all',
  },
  pagi: {
    label: 'Kelas Pagi',
    sublabel: '08.00 – 15.00',
    icon: Sun,
    description: 'Menampilkan kelas pagi — jam masuk antara 08.00 hingga 15.00',
    className: 'session-btn-pagi',
    infoClassName: 'session-info-pagi',
  },
  malam: {
    label: 'Kelas Malam',
    sublabel: '16.00 – 21.00',
    icon: Moon,
    description: 'Menampilkan kelas malam — jam masuk antara 16.00 hingga 21.00',
    className: 'session-btn-malam',
    infoClassName: 'session-info-malam',
  },
};

// ==================== FILTER PANEL COMPONENT ====================
const FilterPanel = ({
  activeTab,
  activeSession,
  onSessionChange,
  selectedPeriod,
  dateRange,
  onDateRangeChange,
  onPeriodChange,
}) => {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      let result;
      switch (format) {
        case 'excel':
          result = await exportService.exportToExcel(activeTab, dateRange.start, dateRange.end);
          break;
        case 'pdf':
          result = await exportService.exportToPDF(activeTab, dateRange.start, dateRange.end);
          break;
        case 'csv':
          result = await exportService.exportToCSV(activeTab, dateRange.start, dateRange.end);
          break;
        case 'detail':
          result = await exportService.exportDetailedToExcel(activeTab, dateRange.start, dateRange.end);
          break;
        default:
          throw new Error('Format tidak didukung');
      }
      if (result.success) alert(`✅ ${result.message}`);
    } catch (error) {
      console.error('Export error:', error);
      alert(`❌ ${error.message || 'Gagal mengexport data. Silakan coba lagi.'}`);
    } finally {
      setExporting(null);
    }
  };

  const currentSession = SESSION_CONFIG[activeSession];

  return (
    <div className="filter-panel">
      {/* ===== BARIS 1: PERIODE & TANGGAL ===== */}
      <div className="filter-section">
        <h3 className="filter-section-title">
          <span className="filter-section-icon">📅</span>
          Periode &amp; Tanggal
        </h3>
        <div className="filter-row">
          <div className="filter-field">
            <label className="filter-label">Periode</label>
            <select
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="filter-select"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label">Tanggal Mulai</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="filter-input"
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">Tanggal Akhir</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      {/* ===== DIVIDER ===== */}
      <div className="filter-divider" />

      {/* ===== BARIS 2: FILTER SESI (hanya untuk dosen) ===== */}
      {activeTab === 'dosen' && (
        <>
          <div className="filter-section">
            <h3 className="filter-section-title">
              <span className="filter-section-icon">🕐</span>
              Sesi Kelas
            </h3>

            <div className="session-toggle-group">
              {Object.entries(SESSION_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isActive = activeSession === key;
                return (
                  <button
                    key={key}
                    onClick={() => onSessionChange(key)}
                    className={`session-toggle-btn ${cfg.className} ${isActive ? 'active' : ''}`}
                  >
                    <span className="session-btn-icon">
                      <Icon size={18} />
                    </span>
                    <span className="session-btn-content">
                      <span className="session-btn-label">{cfg.label}</span>
                      {cfg.sublabel && (
                        <span className="session-btn-sublabel">{cfg.sublabel}</span>
                      )}
                    </span>
                    {isActive && <span className="session-active-dot" />}
                  </button>
                );
              })}
            </div>

            {/* Info sesi aktif */}
            <div className={`session-info-banner ${currentSession.infoClassName}`}>
              <span className="session-info-icon">
                {activeSession === 'pagi' ? <Sun size={15} /> : activeSession === 'malam' ? <Moon size={15} /> : <LayoutGrid size={15} />}
              </span>
              <span className="session-info-text">{currentSession.description}</span>
            </div>
          </div>

          <div className="filter-divider" />
        </>
      )}

      {/* ===== BARIS 3: EXPORT ===== */}
      <div className="filter-section">
        <h3 className="filter-section-title">
          <span className="filter-section-icon">📤</span>
          Export Laporan dari Fingerspot
        </h3>
        <div className="export-btn-group">
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting !== null}
            className="export-btn export-btn-excel"
            title="Export ke Excel"
          >
            <FileSpreadsheet size={16} />
            {exporting === 'excel' ? 'Mengexport...' : 'Excel'}
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="export-btn export-btn-pdf"
            title="Export ke PDF"
          >
            <FileText size={16} />
            {exporting === 'pdf' ? 'Mengexport...' : 'PDF'}
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="export-btn export-btn-csv"
            title="Export ke CSV"
          >
            <Download size={16} />
            {exporting === 'csv' ? 'Mengexport...' : 'CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;