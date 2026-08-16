// src/components/auth/AuthLayout.jsx

import React from 'react';

const AuthLayout = ({
  children,
  title = 'Login ke Akun Anda',
  subtitle = 'Monitoring Kehadiran Dosen & Karyawan',
}) => {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-header">
          <img
            src="/logo512.png"
            alt="Logo Politeknik Baja Tegal"
            className="auth-logo"
          />

          <h1>Sistem Absensi Kampus</h1>

          <p>{subtitle}</p>
        </header>

        <div className="auth-content">
          <h2>{title}</h2>
          {children}
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;