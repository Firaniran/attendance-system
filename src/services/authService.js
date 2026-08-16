// ==================== AUTH SERVICE ====================
// File: src/services/authService.js

const BASE_URL = 'http://localhost:3333/api';

export const authService = {

  // ==================== LOGIN ====================
  async login(email, password, expectedRole) {
  if (!email || !password) {
    throw new Error('Email dan password wajib diisi');
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Login gagal');
  }

  const user = data.data?.user;
  const tokens = data.data?.tokens;

  if (!user || !tokens?.access_token) {
    throw new Error('Respons login dari server tidak lengkap');
  }

  const backendRole = (user.role || '').toUpperCase();
  const selectedRole = (expectedRole || '').toUpperCase();

  if (selectedRole && backendRole !== selectedRole) {
    throw new Error(
      `Akun ini memiliki role ${backendRole}, bukan ${selectedRole}.`
    );
  }

  const normalizedUser = {
    ...user,
    role: backendRole.toLowerCase(),
  };

  // Simpan dengan beberapa nama agar kompatibel dengan seluruh service
  localStorage.setItem('token', tokens.access_token);
  localStorage.setItem('access_token', tokens.access_token);

  if (tokens.refresh_token) {
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  localStorage.setItem('user', JSON.stringify(normalizedUser));

  return {
    token: tokens.access_token,
    user: normalizedUser,
  };
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
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
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