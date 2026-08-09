// ==================== FINGERSPOT SERVICE ====================
// File: src/services/fingerspotService.js

const FINGERSPOT_CONFIG = {
  BASE_URL: 'https://api.fingerspot.io/v1', // Ganti
  CLIENT_ID: process.env.REACT_APP_FINGERSPOT_CLIENT_ID || 'YOUR_CLIENT_ID',
  CLIENT_SECRET: process.env.REACT_APP_FINGERSPOT_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
  CLOUD_ID: process.env.REACT_APP_FINGERSPOT_CLOUD_ID || 'YOUR_CLOUD_ID'
};

export const fingerspotService = {
  // Get Access Token
  async getAccessToken() {
    try {
      const response = await fetch(`${FINGERSPOT_CONFIG.BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: FINGERSPOT_CONFIG.CLIENT_ID,
          client_secret: FINGERSPOT_CONFIG.CLIENT_SECRET
        })
      });

      if (!response.ok) throw new Error('Failed to get access token');

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  },

  // Get Attendance Data
  async getAttendanceData(startDate, endDate, userId = null) {
    try {
      const token = await this.getAccessToken();
      
      const params = new URLSearchParams({
        cloud_id: FINGERSPOT_CONFIG.CLOUD_ID,
        start_date: startDate,
        end_date: endDate,
        ...(userId && { user_id: userId })
      });

      const response = await fetch(
        `${FINGERSPOT_CONFIG.BASE_URL}/attendance?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch attendance data');

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      throw error;
    }
  },

  // Get User List (Dosen & Karyawan)
  async getUserList() {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${FINGERSPOT_CONFIG.BASE_URL}/users?cloud_id=${FINGERSPOT_CONFIG.CLOUD_ID}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch user list');

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching user list:', error);
      throw error;
    }
  },

  // Get Detailed Attendance Report
  async getAttendanceReport(startDate, endDate, userType = 'all') {
    try {
      const attendanceData = await this.getAttendanceData(startDate, endDate);
      const userList = await this.getUserList();

      // Process data berdasarkan tipe user (dosen/karyawan)
      const processedData = this.processAttendanceData(attendanceData, userList, userType);
      
      return processedData;
    } catch (error) {
      console.error('Error generating attendance report:', error);
      throw error;
    }
  },

  // Process & Transform Data
  processAttendanceData(attendanceData, userList, userType) {
    const userMap = new Map(userList.map(user => [user.pin, user]));
    const attendanceByUser = new Map();

    // Group attendance by user
    attendanceData.forEach(record => {
      const user = userMap.get(record.pin);
      if (!user) return;

      // Filter by user type if needed
      if (userType !== 'all') {
        const isDosen = user.department?.toLowerCase().includes('dosen') || 
                       user.position?.toLowerCase().includes('dosen');
        const isKaryawan = !isDosen;

        if ((userType === 'dosen' && !isDosen) || (userType === 'karyawan' && !isKaryawan)) {
          return;
        }
      }

      if (!attendanceByUser.has(record.pin)) {
        attendanceByUser.set(record.pin, {
          pin: record.pin,
          nama: user.name,
          nip: user.pin,
          department: user.department || '',
          position: user.position || '',
          records: []
        });
      }

      attendanceByUser.get(record.pin).records.push({
        date: record.scan_date,
        time: record.scan_time,
        status: record.status,
        type: record.verify_type
      });
    });

    return Array.from(attendanceByUser.values());
  },

  // Calculate Statistics
  calculateStatistics(attendanceRecords, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    return attendanceRecords.map(user => {
      const uniqueDates = new Set(user.records.map(r => r.date));
      const totalHadir = uniqueDates.size;
      const persentase = (totalHadir / totalDays) * 100;

      // Calculate late arrivals (untuk karyawan)
      const lateArrivals = user.records.filter(record => {
        const time = record.time;
        const [hours, minutes] = time.split(':').map(Number);
        return hours > 8 || (hours === 8 && minutes > 0); // Telat jika > 08:00
      }).length;

      // Get last attendance
      const sortedRecords = user.records.sort((a, b) => 
        new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
      );
      const lastAttendance = sortedRecords[0];

      return {
        ...user,
        totalHadir,
        totalHariKerja: totalDays,
        totalTerlambat: lateArrivals,
        persentase: parseFloat(persentase.toFixed(2)),
        lastAttendance: lastAttendance ? 
          `${lastAttendance.date} ${lastAttendance.time}` : '-',
        records: user.records
      };
    });
  }
};

// ==================== FORMAT DATA FINGERSPOT ====================
/*
Expected Fingerspot API Response Format:

GET /attendance
{
  "data": [
    {
      "pin": "198501012010011001",
      "scan_date": "2025-01-07",
      "scan_time": "08:15:30",
      "status": "Check In",
      "verify_type": "Fingerprint",
      "work_code": "1"
    }
  ]
}

GET /users
{
  "data": [
    {
      "pin": "198501012010011001",
      "name": "Dr. Ahmad Budiman, M.Kom",
      "department": "Teknik Informatika",
      "position": "Dosen",
      "email": "ahmad@kampus.ac.id"
    }
  ]
}
*/
