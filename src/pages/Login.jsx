import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Crown,
  GraduationCap,
  Briefcase,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AuthLayout from '../components/auth/AuthLayout';
import { authService } from '../services/authService';
import '../styles/auth.css';

const ROLE_OPTIONS = [
  {
    value: 'ADMIN',
    label: 'Admin / Staf',
    description: 'Akses penuh ke semua fitur',
    Icon: ShieldCheck,
  },
  {
    value: 'PIMPINAN',
    label: 'Pimpinan',
    description: 'Akses laporan dan rekap',
    Icon: Crown,
  },
  {
    value: 'PERSONAL',
    label: 'Dosen / Karyawan',
    description: 'Akses rekap data personal',
    Icon: Users,
  },
];

const Login = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Silakan pilih role terlebih dahulu.');
      return;
    }

    if (!formData.email || !formData.password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    try {
      setLoading(true);

      await authService.login(
        formData.email,
        formData.password,
        selectedRole
      );

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login ke Akun Anda">
      {error && (
        <div className="login-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label className="login-label">Login sebagai</label>

        <div className="role-grid">
          {ROLE_OPTIONS.map(
            ({ value, label, description, Icon }) => {
              const isActive = selectedRole === value;

              return (
                <button
                  key={value}
                  type="button"
                  className={`role-card ${
                    isActive ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedRole(value);
                    setError('');
                  }}
                >
                  <span className="role-card-title">
                    <Icon size={17} />
                    {label}
                  </span>

                  <span className="role-card-description">
                    {description}
                  </span>
                </button>
              );
            }
          )}
        </div>

        <div className="login-field">
          <label htmlFor="email">Email</label>

          <div className="login-input-wrapper">
            <Mail size={19} />

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              className="login-input"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>

          <div className="login-input-wrapper">
            <Lock size={19} />

            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              className="login-input password-input"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword((current) => !current)
              }
              aria-label={
                showPassword
                  ? 'Sembunyikan password'
                  : 'Tampilkan password'
              }
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </div>

        <div className="forgot-password">
          <button
            type="button"
            onClick={() => navigate('/reset-password')}
          >
            Lupa Password?
          </button>
        </div>

        <button
          type="submit"
          className="login-submit"
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;