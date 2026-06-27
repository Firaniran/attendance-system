// ==================== KARYAWAN TABLE ====================
// File: src/components/KaryawanTable.jsx

import React from 'react';
import { XCircle } from 'lucide-react';

const KaryawanTable = ({ data, searchTerm }) => {
  const filteredData = data.filter((karyawan) =>
    (karyawan.nama || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (karyawan.nip || '').includes(searchTerm || '')
  );

  if (filteredData.length === 0) {
    return (
      <div className="no-data-container">
        <XCircle size={64} className="no-data-icon" />
        <p className="no-data-text">Tidak ada data karyawan yang ditemukan</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table   style={{
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #e5e7eb'
    }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' , border: '1px solid #e5e7eb', padding: '12px', background: '#f8fafc', color: '#374151',
              fontWeight: '700' }}>No</th>
            <th style={{ textAlign: 'center' , border: '1px solid #e5e7eb', padding: '12px', background: '#f8fafc', color: '#374151',
              fontWeight: '700' }}>Nama</th>
            <th style={{ textAlign: 'center' , border: '1px solid #e5e7eb', padding: '12px', background: '#f8fafc', color: '#374151',
              fontWeight: '700' }}>Hadir</th>
            <th style={{ textAlign: 'center' , border: '1px solid #e5e7eb', padding: '12px', background: '#f8fafc', color: '#374151',
              fontWeight: '700' }}>Terlambat</th>
            <th style={{ textAlign: 'center' , border: '1px solid #e5e7eb', padding: '12px', background: '#f8fafc', color: '#374151',
              fontWeight: '700' }}>Total Hari Kerja</th>
            <th style={{ textAlign: 'center' , border: '1px solid #e5e7eb', padding: '12px', background: '#f8fafc', color: '#374151',
              fontWeight: '700' }}>Waktu Kehadiran</th>
            <th style={{ textAlign: 'center' , border: '1px solid #e5e7eb', padding: '12px', background: '#f8fafc', color: '#374151',
              fontWeight: '700' }}>Check In Terakhir</th>
            <th style={{ textAlign: 'center' , border: '1px solid #e5e7eb', padding: '12px', background: '#f8fafc', color: '#374151',
              fontWeight: '700' }}>Check Out Terakhir</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((karyawan, index) => (
            <tr key={karyawan.id || karyawan.nip || index}>
              <td style={{ textAlign: 'center', border: '1px solid #e5e7eb', padding: '12px'}}>{index + 1}</td>
              <td style={{ textAlign: 'center', border: '1px solid #e5e7eb', padding: '12px',
              fontWeight: '600' }}>
                {karyawan.nama || 'N/A'}
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #e5e7eb', padding: '12px'}}>
                {karyawan.totalHadir || 0}
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #e5e7eb', padding: '12px' }}>
                <span style={{ color: '#EF4444', fontWeight: '600' }}>
                  {karyawan.totalTerlambat || 0}
                </span>
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #e5e7eb', padding: '12px' }}>
                {karyawan.totalHariKerja || 0}
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #e5e7eb', padding: '12px', whiteSpace: 'nowrap' }}>
                {karyawan.attendanceDates || 'Belum ada data'}
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #e5e7eb', padding: '12px', whiteSpace: 'nowrap' }}>
                {karyawan.lastCheckIn || 'Belum ada data'}
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #e5e7eb', padding: '12px', whiteSpace: 'nowrap' }}>
                {karyawan.lastCheckOut || 'Belum ada data'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KaryawanTable;