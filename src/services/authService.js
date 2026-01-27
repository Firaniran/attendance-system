const BASE_URL = 'http://localhost:5000/api';

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

    // Backend returns: { success, message, token, user }
    const { token, user } = data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  },

  // ==================== REGISTER ====================
  async register(userData) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registrasi gagal');
    return data;
  },

  // ==================== FORGOT PASSWORD ====================
  async forgotPassword(email) {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengirim kode reset');
    return data;
  },

  // ==================== VERIFY RESET CODE ====================
  async verifyResetCode(email, code) {
    const res = await fetch(`${BASE_URL}/auth/verify-reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Kode verifikasi tidak valid');
    return data;
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

    // No token = not authenticated
    if (!token) return false;

    // Auto-clean old mock tokens or invalid tokens
    // Valid JWT format: xxx.yyy.zzz (3 parts separated by dots)
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