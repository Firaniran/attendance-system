// ==================== NOTIFICATION SERVICE ====================
// File: src/services/notificationService.js

const notificationService = {
  // Meminta izin notifikasi dari browser
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Browser tidak mendukung Notification API');
      return false;
    }

    const permission = await Notification.requestPermission();

    return permission === 'granted';
  },

  // Mengecek apakah notifikasi sudah diizinkan
  isPermissionGranted() {
    return (
      'Notification' in window &&
      Notification.permission === 'granted'
    );
  },

  // Menampilkan notifikasi
  show(title, options = {}) {
    if (!this.isPermissionGranted()) {
      console.warn('Izin notifikasi belum diberikan');
      return null;
    }

    return new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options,
    });
  },

  // Notifikasi berhasil
  success(message) {
    return this.show('Attendance System', {
      body: message,
    });
  },

  // Notifikasi error
  error(message) {
    return this.show('Attendance System', {
      body: message,
    });
  },

  // Notifikasi informasi
  info(message) {
    return this.show('Attendance System', {
      body: message,
    });
  },
};

export default notificationService;