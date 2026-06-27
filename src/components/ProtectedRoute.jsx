// ==================== PROTECTED ROUTE ====================
// File: src/components/ProtectedRoute.jsx
// Wrapper untuk route yang butuh autentikasi.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, permissions, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f0f4f8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid #e2e8f0',
            borderTopColor: '#1d4ed8', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: '#4a5568', fontSize: '14px', fontWeight: '600' }}>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !permissions?.[requiredPermission]) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;