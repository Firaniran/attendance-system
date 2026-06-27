// ==================== AUTH CONTEXT ====================
// File: src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
export const ROLES = {
  ADMIN:    'admin',
  PIMPINAN: 'pimpinan',
  DOSEN:    'dosen',
  KARYAWAN: 'karyawan',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canEdit:          true,
    canExport:        true,
    canViewAll:       true,
    canManageUsers:   true,
    canManageJabatan: true,
    label:  'Administrator',
    color:  '#dc2626',
    bg:     '#fee2e2',
  },
  [ROLES.PIMPINAN]: {
    canEdit:          false,
    canExport:        true,
    canViewAll:       true,
    canManageUsers:   false,
    canManageJabatan: false,
    label:  'Pimpinan',
    color:  '#7c3aed',
    bg:     '#ede9fe',
  },
  [ROLES.DOSEN]: {
    canEdit:          false,
    canExport:        false,
    canViewAll:       false,
    canManageUsers:   false,
    canManageJabatan: false,
    label:  'Dosen',
    color:  '#1d4ed8',
    bg:     '#dbeafe',
  },
  [ROLES.KARYAWAN]: {
    canEdit:          false,
    canExport:        false,
    canViewAll:       false,
    canManageUsers:   false,
    canManageJabatan: false,
    label:  'Karyawan',
    color:  '#059669',
    bg:     '#d1fae5',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.role) parsed.role = parsed.role.toLowerCase();
        setUser(parsed);
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const normalized = {
      ...userData,
      role: userData.role ? userData.role.toLowerCase() : ROLES.KARYAWAN,
    };
    setUser(normalized);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const permissions = user
    ? (ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS[ROLES.KARYAWAN])
    : null;

  return (
    <AuthContext.Provider value={{ user, login, logout, permissions, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);