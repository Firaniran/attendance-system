import React from 'react';
import { XCircle } from 'lucide-react';

const DosenTable = ({ data, searchTerm }) => {
  const filteredData = data.filter(dosen =>
    dosen.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dosen.nip.includes(searchTerm) ||
    dosen.matakuliah.toLowerCase().includes(searchTerm.toLowerCase())
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
            <th>No</th>
            <th>Nama Dosen</th>
            <th>NIP</th>
            <th>Mata Kuliah</th>
            <th style={{ textAlign: 'center' }}>Hadir</th>
            <th style={{ textAlign: 'center' }}>Total Mengajar</th>
            <th style={{ textAlign: 'center' }}>Persentase</th>
            <th>Kehadiran Terakhir</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((dosen, index) => (
            <tr key={dosen.id}>
              <td>{index + 1}</td>
              <td style={{ fontWeight: '600' }}>{dosen.nama}</td>
              <td>{dosen.nip}</td>
              <td>{dosen.matakuliah}</td>
              <td style={{ textAlign: 'center' }}>{dosen.totalHadir}</td>
              <td style={{ textAlign: 'center' }}>{dosen.totalMengajar}</td>
              <td style={{ textAlign: 'center' }}>
                <span className={getPercentageClass(dosen.persentase)}>
                  {dosen.persentase.toFixed(1)}%
                </span>
              </td>
              <td>{dosen.lastAttendance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DosenTable;