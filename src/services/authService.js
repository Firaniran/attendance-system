// ==================== AUTH SERVICE (MOCK) ====================
// File: src/services/authService.js

export const authService = {
  // ==================== LOGIN (FAKE) ====================
  async login(email, password) {
    // simulasi delay API
    await new Promise(res => setTimeout(res, 500));

    // validasi ala-ala
    if (!email || !password) {
      throw new Error('Email dan password wajib diisi');
    }

    // USER PALSU
    const fakeUser = {
      id: 1,
      nama: 'Admin Kampus',
      email,
      role: 'ADMIN'
    };

    // TOKEN PALSU
    const fakeToken = 'FAKE_JWT_TOKEN_FE_ONLY';

    localStorage.setItem('token', fakeToken);
    localStorage.setItem('user', JSON.stringify(fakeUser));

    return {
      token: fakeToken,
      user: fakeUser
    };
  },

  // ==================== LOGOUT ====================
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // ==================== AUTH CHECK ====================
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // ==================== GET USER ====================
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};