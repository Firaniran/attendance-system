// ==================== FILTER PANEL WITH EXPORT ====================
// File: src/components/FilterPanel.jsx

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { exportService } from '../services/exportService';

const FilterPanel = ({ activeTab, dateRange, onDateRangeChange, onPeriodChange }) => {
  const [exporting, setExporting] = useState(null); // Track which export is in progress

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

      // Show success notification
      if (result.success) {
        alert(`✅ ${result.message}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`❌ ${error.message || 'Gagal mengexport data. Silakan coba lagi.'}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Periode Dropdown */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#374151', 
            marginBottom: '8px' 
          }}>
            Periode
          </label>
          <select 
            onChange={(e) => onPeriodChange(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        {/* Tanggal Mulai */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#374151', 
            marginBottom: '8px' 
          }}>
            Tanggal Mulai
          </label>
          <input 
            type="date" 
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px'
            }}
          />
        </div>
        
        {/* Tanggal Akhir */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#374151', 
            marginBottom: '8px' 
          }}>
            Tanggal Akhir
          </label>
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px'
            }}
          />
        </div>
        
        {/* Export Buttons */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#374151', 
            marginBottom: '8px' 
          }}>
            Export dari Fingerspot
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Excel Button */}
            <button
              onClick={() => handleExport('excel')}
              disabled={exporting !== null}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                backgroundColor: exporting === 'excel' ? '#9ca3af' : '#16a34a',
                color: 'white',
                padding: '8px 8px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '500',
                cursor: exporting !== null ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              title="Export ke Excel"
            >
              {exporting === 'excel' ? (
                <>⏳</>
              ) : (
                <>
                  <FileSpreadsheet size={16} />
                  <span>Excel</span>
                </>
              )}
            </button>

            {/* PDF Button */}
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                backgroundColor: exporting === 'pdf' ? '#9ca3af' : '#dc2626',
                color: 'white',
                padding: '8px 8px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '500',
                cursor: exporting !== null ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              title="Export ke PDF"
            >
              {exporting === 'pdf' ? (
                <>⏳</>
              ) : (
                <>
                  <FileText size={16} />
                  <span>PDF</span>
                </>
              )}
            </button>

            {/* Detail Button */}
            <button
              onClick={() => handleExport('detail')}
              disabled={exporting !== null}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                backgroundColor: exporting === 'detail' ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '8px 8px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '500',
                cursor: exporting !== null ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              title="Export Detail per Hari"
            >
              {exporting === 'detail' ? (
                <>⏳</>
              ) : (
                <>
                  <Database size={16} />
                  <span>Detail</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Text */}
      <div style={{
        marginTop: '12px',
        padding: '8px 12px',
        backgroundColor: '#eff6ff',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Download size={16} style={{ color: '#2563eb' }} />
        <p style={{ 
          margin: 0, 
          fontSize: '12px', 
          color: '#1e40af' 
        }}>
          Data akan diambil langsung dari Fingerspot.io sesuai periode yang dipilih
        </p>
      </div>
    </div>
  );
};

export default FilterPanel;