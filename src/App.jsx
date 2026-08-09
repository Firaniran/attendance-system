// ==================== APP.JSX WITH ROUTING ====================
// File: src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import { authService } from './services/authService';
import { ROLES } from './context/AuthContext';

// ==================== PROTECTED ROUTE ====================
// Cek apakah sudah login (token valid)
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ==================== PUBLIC ROUTE ====================
// Jika sudah login, langsung redirect ke dashboard
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// ==================== ROLE ROUTE ====================
const RoleRoute = ({ children, allowedRoles = [] }) => {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;

  const role = user.role ? user.role.toLowerCase() : '';
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Role tidak diizinkan → kembali ke dashboard
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ==================== MAIN APP ====================
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Legacy /realtime route — redirect ke /dashboard */}
        <Route path="/realtime" element={<Navigate to="/dashboard" replace />} />

        {/* Default */}
        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;