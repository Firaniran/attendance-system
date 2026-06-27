// ==================== LOGIN PAGE ====================
// File: src/pages/Login.jsx

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import { authService } from '../services/authService';
import '../styles/auth.css';

const ROLE_OPTIONS = [
  {
    value: 'admin',
    label: 'Admin / Staf',
    description: 'Akses penuh ke semua fitur',
    Icon: ShieldCheck,
    activeColor: '#1d4ed8',
    activeBg: '#eff6ff',
    activeBorder: '#93c5fd',
  },
  {
    value: 'pimpinan',
    label: 'Pimpinan',
    description: 'Akses laporan & rekap',
    Icon: Crown,
    activeColor: '#7c3aed',
    activeBg: '#f5f3ff',
    activeBorder: '#c4b5fd',
  },
];

const Login = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedRole) {
        throw new Error('Silakan pilih role terlebih dahulu');
      }
      if (!formData.email || !formData.password) {
        throw new Error('Email dan password harus diisi');
      }

      // authService.login() akan melempar error jika role tidak cocok
      await authService.login(formData.email, formData.password, selectedRole);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login ke Akun Anda">
      <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>

        {/* ── Error Message ── */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border:          '1px solid #fecaca',
            borderRadius:    '8px',
            padding:         '12px',
            marginBottom:    '16px',
            display:         'flex',
            alignItems:      'flex-start',
            gap:             '8px',
          }}>
            <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Role Selector ── */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display:      'block',
            fontSize:     '14px',
            fontWeight:   '600',
            color:        '#374151',
            marginBottom: '10px',
          }}>
            Login sebagai
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {ROLE_OPTIONS.map(({ value, label, description, Icon, activeColor, activeBg, activeBorder }) => {
              const isActive = selectedRole === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setSelectedRole(value); setError(''); }}
                  style={{
                    flex:           1,
                    padding:        '12px 10px',
                    border:         isActive ? `2px solid ${activeBorder}` : '1.5px solid #d1d5db',
                    borderRadius:   '10px',
                    background:     isActive ? activeBg : '#f9fafb',
                    color:          isActive ? activeColor : '#4b5563',
                    cursor:         'pointer',
                    textAlign:      'left',
                    transition:     'all 0.15s ease',
                    display:        'flex',
                    flexDirection:  'column',
                    gap:            '4px',
                    // Override auth.css button:hover transform for role buttons
                    transform:      'none',
                    boxShadow:      isActive ? `0 0 0 3px ${activeBorder}40` : 'none',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                    <Icon size={15} />
                    {label}
                  </span>
                  <span style={{ fontSize: '11px', opacity: 0.75, paddingLeft: '21px' }}>
                    {description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Email Input ── */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display:      'block',
            fontSize:     '14px',
            fontWeight:   '500',
            color:        '#374151',
            marginBottom: '8px',
          }}>
            Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{
              position:  'absolute',
              left:      '12px',
              top:       '50%',
              transform: 'translateY(-50%)',
              color:     '#9ca3af',
            }} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              style={{
                width:        '100%',
                padding:      '10px 12px 10px 44px',
                border:       '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize:     '14px',
              }}
              required
            />
          </div>
        </div>

        {/* ── Password Input ── */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display:      'block',
            fontSize:     '14px',
            fontWeight:   '500',
            color:        '#374151',
            marginBottom: '8px',
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{
              position:  'absolute',
              left:      '12px',
              top:       '50%',
              transform: 'translateY(-50%)',
              color:     '#9ca3af',
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              style={{
                width:        '100%',
                padding:      '10px 44px 10px 44px',
                border:       '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize:     '14px',
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position:   'absolute',
                right:      '12px',
                top:        '50%',
                transform:  'translateY(-50%)',
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                color:      '#9ca3af',
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* ── Forgot Password ── */}
        <div style={{ textAlign: 'right', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => navigate('/reset-password')}
            style={{
              background:     'none',
              border:         'none',
              color:          '#2563eb',
              fontSize:       '14px',
              cursor:         'pointer',
              textDecoration: 'underline',
            }}
          >
            Lupa Password?
          </button>
        </div>

        {/* ── Submit Button ── */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width:           '100%',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            color:           'white',
            padding:         '12px',
            borderRadius:    '8px',
            border:          'none',
            fontSize:        '16px',
            fontWeight:      '600',
            cursor:          loading ? 'not-allowed' : 'pointer',
            transition:      'background-color 0.2s',
          }}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;