import React from 'react';
import { XCircle } from 'lucide-react';

const DosenTable = ({ data, searchTerm }) => {
  const filteredData = data.filter(dosen =>
    (dosen.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dosen.nip || '').includes(searchTerm)
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
        <p className="no-data-text">Tidak ada data dosen yang ditemukan</p>
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
            <th style={{ textAlign: 'center' }}>NIP</th>
            <th style={{ textAlign: 'center' }}>Hadir</th>
            <th style={{ textAlign: 'center' }}>Total Hari Kerja</th>
            <th style={{ textAlign: 'center' }}>Waktu Kehadiran</th>
            <th style={{ textAlign: 'center' }}>Check In Terakhir</th>
            <th style={{ textAlign: 'center' }}>Check Out Terakhir</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((dosen, index) => (
            <tr key={dosen.id || dosen.nip || index}>
              <td style={{ textAlign: 'center' }}>{index + 1}</td>
              <td style={{ textAlign: 'center', fontWeight: '600' }}>{dosen.nama || 'N/A'}</td>
              <td style={{ textAlign: 'center' }}>{dosen.nip || 'N/A'}</td>
              <td style={{ textAlign: 'center' }}>{dosen.totalHadir || 0}</td>
              <td style={{ textAlign: 'center' }}>{dosen.totalHariKerja || 0}</td>
              <td style={{ textAlign: 'center' }}>{dosen.attendanceDates || 'Belum ada data'}</td>
              <td style={{ textAlign: 'center' }}>{dosen.lastCheckIn || 'Belum ada data'}</td>
              <td style={{ textAlign: 'center' }}>{dosen.lastCheckOut || 'Belum ada data'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DosenTable;