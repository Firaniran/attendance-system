// ==================== AUTH LAYOUT COMPONENT ====================
import React from 'react';
import { GraduationCap } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #cacad9ff 0%, #ffffffff 100%)',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '450px',
        overflow: 'hidden',
        margin: 'auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          padding: '32px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              padding: '16px',
              display: 'inline-flex'
            }}>
              <GraduationCap size={48} />
            </div>
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '8px',
            margin: 0
          }}>
            Sistem Absensi Kampus
          </h1>
          <p style={{
            fontSize: '14px',
            opacity: 0.9,
            margin: 0
          }}>
            {subtitle || 'Monitoring Kehadiran Dosen & Karyawan'}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;