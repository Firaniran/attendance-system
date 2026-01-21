import React from 'react';
import { XCircle } from 'lucide-react';

const KaryawanTable = ({ data, searchTerm }) => {
  const filteredData = data.filter(karyawan =>
    karyawan.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    karyawan.nip.includes(searchTerm) ||
    karyawan.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
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
            <th>No</th>
            <th>Nama Karyawan</th>
            <th>NIP</th>
            <th>Jabatan</th>
            <th style={{ textAlign: 'center' }}>Hadir</th>
            <th style={{ textAlign: 'center' }}>Total Hari Kerja</th>
            <th style={{ textAlign: 'center' }}>Terlambat</th>
            <th style={{ textAlign: 'center' }}>Persentase</th>
            <th>Check In Terakhir</th>
            <th>Check Out Terakhir</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((karyawan, index) => (
            <tr key={karyawan.id}>
              <td>{index + 1}</td>
              <td style={{ fontWeight: '600' }}>{karyawan.nama}</td>
              <td>{karyawan.nip}</td>
              <td>{karyawan.jabatan}</td>
              <td style={{ textAlign: 'center' }}>{karyawan.totalHadir}</td>
              <td style={{ textAlign: 'center' }}>{karyawan.totalHariKerja}</td>
              <td style={{ textAlign: 'center' }}>
                <span className={karyawan.totalTerlambat > 3 ? 'percentage-low' : 'percentage-medium'}>
                  {karyawan.totalTerlambat}x
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                <span className={getPercentageClass(karyawan.persentase)}>
                  {karyawan.persentase.toFixed(1)}%
                </span>
              </td>
              <td>{karyawan.lastCheckIn}</td>
              <td>{karyawan.lastCheckOut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KaryawanTable;