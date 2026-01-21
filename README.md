# 🎓 Sistem Rekap Absensi Kampus

Dashboard monitoring kehadiran dosen dan karyawan berbasis fingerspot dengan tampilan yang modern dan user-friendly.

## ✨ Fitur

### 🔐 Authentication
- ✅ Login dengan email & password
- ✅ Register akun baru
- ✅ Reset password via email (kode verifikasi)
- ✅ Protected routes & JWT authentication

### 📊 Dashboard
- ✅ Rekap absensi dosen (tanpa jam telat)
- ✅ Rekap absensi karyawan (dengan jam telat)
- ✅ Filter periode (minggu/bulan/custom)
- ✅ Export data (Excel, PDF, CSV)
- ✅ Search & filter real-time
- ✅ Statistik kehadiran

## 🛠️ Tech Stack

**Frontend:**
- React.js 18
- React Router DOM (routing)
- Lucide React (icons)
- CSS3 (styling)

**Backend Integration:**
- RESTful API
- JWT Authentication
- Fetch API

## 📁 Struktur Project

```
attendance-system/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthLayout.jsx
│   │   ├── DosenTable.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── Header.jsx
│   │   ├── KaryawanTable.jsx
│   │   └── StatsCard.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ResetPassword.jsx
│   ├── services/
│   │   ├── apiService.js
│   │   └── authService.js
│   ├── styles/
│   │   ├── auth.css
│   │   └── main.css
│   ├── utils/
│   │   └── dateUtils.js
│   ├── App.jsx
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Cara Install & Jalankan

### Prerequisites
- Node.js v14+ 
- npm atau yarn

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/username/attendance-system.git
   cd attendance-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Buat file `.env` di root folder (opsional):
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Jalankan development server**
   ```bash
   npm start
   ```
   
   Aplikasi akan berjalan di `http://localhost:3000`

5. **Build untuk production**
   ```bash
   npm run build
   ```

## 🔧 Konfigurasi Backend

Update URL backend di file `src/services/apiService.js` dan `src/services/authService.js`:

```javascript
const API_CONFIG = {
  BASE_URL: 'https://your-backend-api.com', // Ganti dengan URL backend Anda
  ENDPOINTS: {
    // ...
  }
};
```

## 📝 API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/forgot-password
POST /api/auth/verify-code
POST /api/auth/reset-password
POST /api/auth/logout
```

### Attendance
```
GET  /api/attendance/dosen?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
GET  /api/attendance/karyawan?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
GET  /api/attendance/export?type=dosen&format=excel&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

## 📸 Screenshots

### Login Page
![Login Page](screenshots/login.png)

### Dashboard - Rekap Dosen
![Dashboard Dosen](screenshots/dashboard-dosen.png)

### Dashboard - Rekap Karyawan
![Dashboard Karyawan](screenshots/dashboard-karyawan.png)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Developed by [Your Name]

## 📧 Contact

- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

⭐ Jangan lupa kasih star jika project ini membantu!