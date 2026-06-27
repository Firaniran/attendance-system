// ==================== USER SERVICE ====================

import { ROLES } from '../context/AuthContext';

const USERS_KEY = 'app_users';
const JABATAN_KEY = 'app_jabatan';

// ==================== DEFAULT DATA ====================
const DEFAULT_JABATAN = [
  { id: 'j1', nama: 'Dosen', role: ROLES.DOSEN,    createdAt: '2024-01-01', active: true },
  { id: 'j2', nama: 'Karyawan', role: ROLES.KARYAWAN, createdAt: '2024-01-01', active: true },
  { id: 'j3', nama: 'Pimpinan', role: ROLES.PIMPINAN, createdAt: '2024-01-01', active: true },
  { id: 'j4', nama: 'Administrator', role: ROLES.ADMIN, createdAt: '2024-01-01', active: true },
];

const DEFAULT_USERS = [
  { id: 'u1', username: 'admin',    name: 'Administrator',    email: 'admin@kampus.ac.id',    role: ROLES.ADMIN,    jabatanId: 'j4', nip: 'ADM001', active: true, createdAt: '2024-01-01' },
  { id: 'u2', username: 'pimpinan', name: 'Dr. Rektor Kampus', email: 'rektor@kampus.ac.id',  role: ROLES.PIMPINAN, jabatanId: 'j3', nip: 'PIM001', active: true, createdAt: '2024-01-01' },
  { id: 'u3', username: 'dosen1',   name: 'Dr. Ahmad Budiman', email: 'ahmad@kampus.ac.id',   role: ROLES.DOSEN,    jabatanId: 'j1', nip: '198501012010011001', active: true, createdAt: '2024-01-01' },
  { id: 'u4', username: 'karyawan1',name: 'Budi Santoso',      email: 'budi@kampus.ac.id',    role: ROLES.KARYAWAN, jabatanId: 'j2', nip: 'KAR001', active: true, createdAt: '2024-01-01' },
];

// ==================== INIT ====================
function initData() {
  if (!localStorage.getItem(JABATAN_KEY)) {
    localStorage.setItem(JABATAN_KEY, JSON.stringify(DEFAULT_JABATAN));
  }
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }
}

// ==================== JABATAN ====================
export const jabatanService = {
  getAll() {
    initData();
    return JSON.parse(localStorage.getItem(JABATAN_KEY) || '[]');
  },

  add(jabatan) {
    const list = this.getAll();
    const newItem = {
      id: 'j' + Date.now(),
      nama: jabatan.nama,
      role: jabatan.role,
      active: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    list.push(newItem);
    localStorage.setItem(JABATAN_KEY, JSON.stringify(list));
    return newItem;
  },

  update(id, data) {
    const list = this.getAll().map(j => j.id === id ? { ...j, ...data } : j);
    localStorage.setItem(JABATAN_KEY, JSON.stringify(list));
  },

  delete(id) {
    const users = userService.getAll();
    const inUse = users.some(u => u.jabatanId === id);
    if (inUse) throw new Error('Jabatan ini masih digunakan oleh user aktif.');
    const list = this.getAll().filter(j => j.id !== id);
    localStorage.setItem(JABATAN_KEY, JSON.stringify(list));
  },
};

// ==================== USER ====================
export const userService = {
  getAll() {
    initData();
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  getById(id) {
    return this.getAll().find(u => u.id === id) || null;
  },

  add(userData) {
    const list = this.getAll();
    const exists = list.find(u => u.username === userData.username || u.email === userData.email);
    if (exists) throw new Error('Username atau email sudah digunakan.');

    const jabatanList = jabatanService.getAll();
    const jabatan = jabatanList.find(j => j.id === userData.jabatanId);
    if (!jabatan) throw new Error('Jabatan tidak ditemukan.');

    const newUser = {
      id: 'u' + Date.now(),
      username: userData.username,
      name: userData.name,
      email: userData.email,
      nip: userData.nip || '',
      jabatanId: userData.jabatanId,
      role: jabatan.role,
      active: true,
      password: userData.password || 'kampus123',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    list.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
    return newUser;
  },

  update(id, data) {
    const list = this.getAll();
    const jabatanList = jabatanService.getAll();

    const updated = list.map(u => {
      if (u.id !== id) return u;
      const jabatan = data.jabatanId ? jabatanList.find(j => j.id === data.jabatanId) : null;
      return {
        ...u,
        ...data,
        role: jabatan ? jabatan.role : u.role,
      };
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  },

  toggleActive(id) {
    const list = this.getAll().map(u => u.id === id ? { ...u, active: !u.active } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  },

  delete(id) {
    const list = this.getAll().filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  },

  // Simulasi login — di produksi kirim ke API
  authenticate(username, password) {
    initData();
    const users = this.getAll();
    const user = users.find(u =>
      (u.username === username || u.email === username) &&
      u.active
    );
    if (!user) throw new Error('Username tidak ditemukan atau akun nonaktif.');
    // Di produksi: bandingkan hash password via API
    // Untuk demo: password default 'kampus123' atau yang diset saat create
    const validPassword = user.password || 'kampus123';
    if (password !== validPassword) throw new Error('Password salah.');
    const { password: _, ...safeUser } = user;
    return safeUser;
  },
};