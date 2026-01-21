import React from 'react';
import { Download } from 'lucide-react';

const FilterPanel = ({ activeTab, dateRange, onDateRangeChange, onPeriodChange, onExport }) => {
  return (
    <div className="filter-panel">
      <div className="filter-content">
        {/* Left side - Date filters */}
        <div className="filter-left">
          <div className="filter-group">
            <label className="filter-label">Periode</label>
            <select
              onChange={(e) => onPeriodChange(e.target.value)}
              className="filter-select"
            >
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Tanggal Mulai</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Tanggal Akhir</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="filter-input"
            />
          </div>
        </div>

        {/* Right side - Export buttons */}
        <div className="filter-right">
          <label className="filter-label">Export Data</label>
          <div className="export-buttons">
            <button onClick={() => onExport('excel')} className="export-btn export-btn-excel">
              <Download size={18} />
              Excel
            </button>
            <button onClick={() => onExport('pdf')} className="export-btn export-btn-pdf">
              <Download size={18} />
              PDF
            </button>
            <button onClick={() => onExport('csv')} className="export-btn export-btn-csv">
              <Download size={18} />
              CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;