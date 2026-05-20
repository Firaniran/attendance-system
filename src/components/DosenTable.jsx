// ==================== DOSEN TABLE ====================
// File: src/components/DosenTable.jsx

import React from 'react';
import { XCircle, Sun, Moon } from 'lucide-react';

// ==================== HELPER: SESI DARI JAM ====================
// Dipakai jika backend tidak mengirim field 'sesi'
function getSesiFromTime(timeStr) {
  if (!timeStr) return null;
  // Format: "2025-01-07 14:30" atau ISO string
  const date = new Date(timeStr.replace(' ', 'T'));
  if (isNaN(date)) return null;
  const hour = date.getHours();
  if (hour >= 8 && hour < 16) return 'pagi';
  if (hour >= 16 && hour <= 21) return 'malam';
  return null;
}

// ==================== BADGE SESI ====================
function SesiBadge({ sesi }) {
  if (sesi === 'pagi') {
    return (
      <span className="badge badge-pagi">
        <Sun size={11} />
        Pagi
      </span>
    );
  }
  if (sesi === 'malam') {
    return (
      <span className="badge badge-malam">
        <Moon size={11} />
        Malam
      </span>
    );
  }
  return <span className="badge badge-neutral">—</span>;
}

// ==================== DOSEN TABLE COMPONENT ====================
const DosenTable = ({ data, searchTerm }) => {
  const filteredData = data.filter((dosen) =>
    (dosen.nama || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (dosen.nip || '').includes(searchTerm || '')
  );

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
            <th style={{ textAlign: 'center' }}>Sesi</th>
            <th style={{ textAlign: 'center' }}>Hadir</th>
            <th style={{ textAlign: 'center' }}>Total Hari Kerja</th>
            <th style={{ textAlign: 'center' }}>Waktu Kehadiran</th>
            <th style={{ textAlign: 'center' }}>Check In Terakhir</th>
            <th style={{ textAlign: 'center' }}>Check Out Terakhir</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((dosen, index) => {
            // Tentukan sesi: utamakan field dari backend, fallback ke jam check-in
            const sesi = dosen.sesi || getSesiFromTime(dosen.lastCheckIn);

            return (
              <tr key={dosen.id || dosen.nip || index}>
                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                <td style={{ textAlign: 'center', fontWeight: '600' }}>
                  {dosen.nama || 'N/A'}
                </td>
                <td style={{ textAlign: 'center' }}>{dosen.nip || 'N/A'}</td>
                <td style={{ textAlign: 'center' }}>
                  <SesiBadge sesi={sesi} />
                </td>
                <td style={{ textAlign: 'center' }}>{dosen.totalHadir || 0}</td>
                <td style={{ textAlign: 'center' }}>{dosen.totalHariKerja || 0}</td>
                <td style={{ textAlign: 'center' }}>
                  {dosen.attendanceDates || 'Belum ada data'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {dosen.lastCheckIn || 'Belum ada data'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {dosen.lastCheckOut || 'Belum ada data'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DosenTable;