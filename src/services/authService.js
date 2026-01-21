// File: src/services/authService.js

const API_CONFIG = {
  BASE_URL: 'https://api-kampus-anda.com',
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_CODE: '/api/auth/verify-code',
    RESET_PASSWORD: '/api/auth/reset-password',
    LOGOUT: '/api/auth/logout',
    VERIFY_TOKEN: '/api/auth/verify-token'
  }
};

export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login gagal');
      }

      const data = await response.json();
      
      // Simpan token ke localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register
  async register(userData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registrasi gagal');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Forgot Password - Kirim kode ke email
  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal mengirim kode');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Verify Code - Verifikasi kode reset password
  async verifyResetCode(email, code) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY_CODE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Kode tidak valid');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Verify code error:', error);
      throw error;
    }
  },

  // Reset Password
  async resetPassword(email, code, newPassword) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code, newPassword })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Reset password gagal');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verify token validity (optional)
  async verifyToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY_TOKEN}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }
};