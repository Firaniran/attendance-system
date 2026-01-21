import React from 'react';

const StatsCard = ({ icon: Icon, title, value, subtitle, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-content">
        <div 
          className="stat-icon-wrapper"
          style={{
            background: `linear-gradient(135deg, ${color}dd 0%, ${color} 100%)`,
            boxShadow: `0 8px 16px ${color}40`
          }}
        >
          <Icon size={28} strokeWidth={2.5} />
        </div>
        <div className="stat-info">
          <div className="stat-title">{title}</div>
          <div className="stat-value">{value}</div>
          {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;