// ==================== APP.JSX WITH ROUTING ====================
// File: src/App.jsx
// Dashboard sekarang sudah terintegrasi — tidak perlu route /realtime terpisah.

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import { authService } from './services/authService';

// ==================== PROTECTED ROUTE ====================
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ==================== PUBLIC ROUTE ====================
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// ==================== MAIN APP ====================
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"       element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
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