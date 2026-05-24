import React, { useMemo } from 'react';

const HOURS = [8,9,10,11,12,13,14,16,17,18,19];

const HourlyBarChart = ({ items = [] }) => {
  const counts = useMemo(() => {
    const map = {};
    items.forEach(it => {
      const d = new Date((it.waktu || it.lastCheckIn || '').replace(' ', 'T'));
      if (!isNaN(d)) {
        const h = d.getHours();
        map[h] = (map[h] || 0) + 1;
      }
    });
    return map;
  }, [items]);

  const max = Math.max(...HOURS.map(h => counts[h] || 0), 1);

  return (
    <div className="rt-bar-chart">
      {HOURS.map(h => {
        const v = counts[h] || 0;
        const pct = Math.round((v / max) * 100);
        const color = h < 16 ? '#f59e0b' : '#6366f1';
        return (
          <div key={h} className="rt-bar-row">
            <span className="rt-bar-label">{h}:00</span>
            <div className="rt-bar-track">
              <div className="rt-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="rt-bar-val">{v}</span>
          </div>
        );
      })}
    </div>
  );
};

export default HourlyBarChart;