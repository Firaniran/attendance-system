import React from 'react';
import { XCircle } from 'lucide-react';

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function fmtDateTime(str) {
  if (!str) return { time: '—', date: '—' };
  const d = new Date(str.replace(' ', 'T'));
  if (isNaN(d)) return { time: str, date: '' };
  const pad = n => String(n).padStart(2, '0');
  const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return {
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    date: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
  };
}

const STATUS_MAP = {
  masuk:    { label: 'Absen Masuk',  cls: 'feed-status-in'   },
  keluar:   { label: 'Absen Keluar', cls: 'feed-status-out'  },
  terlambat:{ label: 'Terlambat',    cls: 'feed-status-late' },
};

const AVATAR_COLORS = [
  ['#dbeafe','#1d4ed8'], ['#dcfce7','#166534'], ['#fef3c7','#92400e'],
  ['#ede9fe','#5b21b6'], ['#fce7f3','#9d174d'],
];

function getAvatarColor(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

const LiveFeedList = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <div className="loading-text">Memuat live feed...</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="no-data-container">
        <XCircle size={48} className="no-data-icon" />
        <p className="no-data-text">Tidak ada data untuk filter ini</p>
      </div>
    );
  }

  return (
    <div className="rt-feed-list">
      {items.map((item, i) => {
        const { time, date } = fmtDateTime(item.waktu || item.lastCheckIn);
        const status = STATUS_MAP[item.statusAbsen] || STATUS_MAP.masuk;
        const [bg, fg] = getAvatarColor(item.nama);
        return (
          <div key={item.id || i} className={`rt-feed-item${i === 0 ? ' rt-feed-item--new' : ''}`}>
            <div className="rt-avatar" style={{ background: bg, color: fg }}>
              {getInitials(item.nama)}
            </div>
            <div className="rt-feed-info">
              <span className="rt-feed-name">{item.nama || 'N/A'}</span>
              <span className="rt-feed-role">{item.tipe === 'dosen' ? 'Dosen' : 'Karyawan'}</span>
              <span className={`rt-feed-status ${status.cls}`}>✓ {status.label}</span>
            </div>
            <div className="rt-feed-time">
              <span className="rt-time-val">⏰ {time}</span>
              <span className="rt-date-val">📅 {date}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveFeedList;