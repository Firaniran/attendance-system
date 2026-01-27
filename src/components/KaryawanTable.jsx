import React from 'react';
import { XCircle } from 'lucide-react';

const KaryawanTable = ({ data, searchTerm }) => {
  const filteredData = data.filter(karyawan =>
    (karyawan.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (karyawan.nip || '').includes(searchTerm)
  );

  const getPercentageClass = (percentage) => {
    if (percentage >= 90) return 'percentage-high';
    if (percentage >= 75) return 'percentage-medium';
    return 'percentage-low';
  };

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
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>No</th>
            <th style={{ textAlign: 'center' }}>Nama</th>
            <th style={{ textAlign: 'center' }}>Hadir</th>
            <th style={{ textAlign: 'center' }}>Terlambat</th>
            <th style={{ textAlign: 'center' }}>Total Hari Kerja</th>
            <th style={{ textAlign: 'center' }}>Waktu Kehadiran</th>
            <th style={{ textAlign: 'center' }}>Check In Terakhir</th>
            <th style={{ textAlign: 'center' }}>Check Out Terakhir</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((karyawan, index) => (
            <tr key={karyawan.id || karyawan.nip || index}>
              <td style={{ textAlign: 'center' }}>{index + 1}</td>
              <td style={{ textAlign: 'center', fontWeight: '600' }}>{karyawan.nama || 'N/A'}</td>
              <td style={{ textAlign: 'center' }}>{karyawan.totalHadir || 0}</td>
              <td style={{ textAlign: 'center' }}>
                <span style={{ color: '#EF4444', fontWeight: '600' }}>
                  {karyawan.totalTerlambat || 0}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>{karyawan.totalHariKerja || 0}</td>
              <td style={{ textAlign: 'center' }}>{karyawan.attendanceDates || 'Belum ada data'}</td>
              <td style={{ textAlign: 'center' }}>{karyawan.lastCheckIn || 'Belum ada data'}</td>
              <td style={{ textAlign: 'center' }}>{karyawan.lastCheckOut || 'Belum ada data'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KaryawanTable;