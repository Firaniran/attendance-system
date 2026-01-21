// ==================== RESET PASSWORD PAGE ====================
// File: src/pages/ResetPassword.jsx

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import { authService } from '../services/authService';
import '../styles/auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password, 4: Success
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Step 1: Send reset code to email
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email) {
        throw new Error('Email harus diisi');
      }

      await authService.forgotPassword(formData.email);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Gagal mengirim kode. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.code) {
        throw new Error('Kode verifikasi harus diisi');
      }

      await authService.verifyResetCode(formData.email, formData.code);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Kode tidak valid. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.newPassword || !formData.confirmPassword) {
        throw new Error('Password harus diisi');
      }

      if (formData.newPassword.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Password dan konfirmasi password tidak cocok');
      }

      await authService.resetPassword(formData.email, formData.code, formData.newPassword);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Reset password gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Email Input
  if (step === 1) {
    return (
      <AuthLayout title="Lupa Password">
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          Masukkan email Anda dan kami akan mengirimkan kode verifikasi
        </p>

        <form onSubmit={handleSendCode}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={20} style={{ color: '#dc2626' }} />
              <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={20}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 44px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Mengirim...' : 'Kirim Kode'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: '#2563eb',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #2563eb',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={16} />
            Kembali ke Login
          </button>
        </form>
      </AuthLayout>
    );
  }

  // Step 2: Code Verification
  if (step === 2) {
    return (
      <AuthLayout title="Verifikasi Kode">
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          Kode verifikasi telah dikirim ke <strong>{formData.email}</strong>
        </p>

        <form onSubmit={handleVerifyCode}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={20} style={{ color: '#dc2626' }} />
              <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Kode Verifikasi
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Masukkan 6 digit kode"
              maxLength={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '4px',
                fontWeight: '600'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi Kode'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: '#6b7280',
              padding: '8px',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Kirim ulang kode
          </button>
        </form>
      </AuthLayout>
    );
  }

  // Step 3: New Password
  if (step === 3) {
    return (
      <AuthLayout title="Buat Password Baru">
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          Masukkan password baru untuk akun Anda
        </p>

        <form onSubmit={handleResetPassword}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={20} style={{ color: '#dc2626' }} />
              <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password Baru
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={20}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                style={{
                  width: '100%',
                  padding: '10px 44px 10px 44px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Konfirmasi Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={20}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }}
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Masukkan ulang password"
                style={{
                  width: '100%',
                  padding: '10px 44px 10px 44px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Menyimpan...' : 'Reset Password'}
          </button>
        </form>
      </AuthLayout>
    );
  }

  // Step 4: Success
  return (
    <AuthLayout title="Password Berhasil Direset!">
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{
          display: 'inline-flex',
          backgroundColor: '#dcfce7',
          borderRadius: '50%',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <CheckCircle size={48} style={{ color: '#16a34a' }} />
        </div>
        <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '24px' }}>
          Password Anda telah berhasil direset. Silakan login dengan password baru Anda.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Kembali ke Login
        </button>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;