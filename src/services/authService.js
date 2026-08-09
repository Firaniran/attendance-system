// ==================== AUTH SERVICE ====================
// File: src/services/authService.js

const BASE_URL = 'http://localhost:3333/api';

export const authService = {

  // ==================== LOGIN ====================
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email dan password wajib diisi');
    }

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login gagal');

    // Backend returns: { success, message, data: { user, tokens } }
    const { data: responseData } = data;
    const { user, tokens } = responseData;

    // Normalisasi role ke lowercase agar cocok dengan ROLES di AuthContext
    // Backend mengirim "ADMIN", "PIMPINAN", dll → simpan "admin", "pimpinan"
    const normalizedUser = {
      ...user,
      role: user.role ? user.role.toLowerCase() : 'karyawan',
    };

    localStorage.setItem('token', tokens.access_token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));

    return { token: tokens.access_token, user: normalizedUser };
  },

  // ==================== RESET PASSWORD ====================
  async resetPassword(email, code, newPassword) {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mereset password');
    return data;
  },

  // ==================== LOGOUT ====================
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // ==================== AUTH CHECK ====================
  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Valid JWT: 3 bagian dipisahkan titik
    const isValidJWTFormat = token.split('.').length === 3;
    if (!isValidJWTFormat || token === 'FAKE_JWT_TOKEN_FE_ONLY') {
      console.warn('Invalid or mock token detected, clearing authentication...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }

    return true;
  },

  // ==================== GET USER ====================
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};