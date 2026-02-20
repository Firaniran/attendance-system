// ==================== EXPORT SERVICE ====================
// File: src/services/exportService.js

import { fingerspotService } from './fingerspotService';

export const exportService = {
  // Export to Excel
  async exportToExcel(type, startDate, endDate) {
    try {
      // Get data from Fingerspot
      const rawData = await fingerspotService.getAttendanceReport(startDate, endDate, type);
      const processedData = fingerspotService.calculateStatistics(rawData, startDate, endDate);

      // Create CSV content (Excel compatible)
      let csvContent = '';

      if (type === 'dosen') {
        // Header untuk Dosen
        csvContent = 'ID,Nama Dosen,Mata Kuliah,Total Hadir,Total Mengajar,Persentase,Absensi Terakhir\n';

        processedData.forEach(dosen => {
          csvContent += `"${dosen.nip}","${dosen.nama}","${dosen.position || '-'}",${dosen.totalHadir},${dosen.totalHariKerja},${dosen.persentase}%,"${dosen.lastAttendance}"\n`;
        });
      } else {
        // Header untuk Karyawan
        csvContent = 'ID,Nama Karyawan,Jabatan,Total Hadir,Total Hari Kerja,Total Terlambat,Persentase,Absensi Terakhir\n';

        processedData.forEach(karyawan => {
          csvContent += `"${karyawan.nip}","${karyawan.nama}","${karyawan.position || karyawan.department}",${karyawan.totalHadir},${karyawan.totalHariKerja},${karyawan.totalTerlambat},${karyawan.persentase}%,"${karyawan.lastAttendance}"\n`;
        });
      }

      // Download file
      this.downloadFile(csvContent, `rekap-absensi-${type}-${startDate}-${endDate}.csv`, 'text/csv');

      return { success: true, message: 'Data berhasil diexport ke Excel' };
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Gagal export data ke Excel');
    }
  },

  // Export to CSV
  async exportToCSV(type, startDate, endDate) {
    // CSV sama dengan Excel format
    return await this.exportToExcel(type, startDate, endDate);
  },

  // Export to PDF
  async exportToPDF(type, startDate, endDate) {
    try {
      // Get data from Fingerspot
      const rawData = await fingerspotService.getAttendanceReport(startDate, endDate, type);
      const processedData = fingerspotService.calculateStatistics(rawData, startDate, endDate);

      // Create HTML content for PDF
      const htmlContent = this.generateHTMLReport(type, processedData, startDate, endDate);

      // Convert HTML to PDF (using browser print)
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      return { success: true, message: 'Data berhasil diexport ke PDF' };
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Gagal export data ke PDF');
    }
  },

  // Generate HTML Report for PDF
  generateHTMLReport(type, data, startDate, endDate) {
    const title = type === 'dosen' ? 'Rekap Absensi Dosen' : 'Rekap Absensi Karyawan';

    let tableRows = '';

    if (type === 'dosen') {
      data.forEach((dosen, index) => {
        tableRows += `
          <tr>
            <td>${index + 1}</td>
            <td>${dosen.nip}</td>
            <td>${dosen.nama}</td>
            <td>${dosen.position || '-'}</td>
            <td style="text-align: center;">${dosen.totalHadir}</td>
            <td style="text-align: center;">${dosen.totalHariKerja}</td>
            <td style="text-align: center;">${dosen.persentase}%</td>
            <td>${dosen.lastAttendance}</td>
          </tr>
        `;
      });
    } else {
      data.forEach((karyawan, index) => {
        tableRows += `
          <tr>
            <td>${index + 1}</td>
            <td>${karyawan.nip}</td>
            <td>${karyawan.nama}</td>
            <td>${karyawan.position || karyawan.department}</td>
            <td style="text-align: center;">${karyawan.totalHadir}</td>
            <td style="text-align: center;">${karyawan.totalHariKerja}</td>
            <td style="text-align: center;">${karyawan.totalTerlambat}</td>
            <td style="text-align: center;">${karyawan.persentase}%</td>
            <td>${karyawan.lastAttendance}</td>
          </tr>
        `;
      });
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 20mm;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            color: #2563eb;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px 8px;
            font-size: 11px;
          }
          th {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 10px;
            color: #666;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sistem Absensi Kampus</h1>
          <h2>${title}</h2>
          <p>Periode: ${this.formatDate(startDate)} - ${this.formatDate(endDate)}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>Nama</th>
              <th>${type === 'dosen' ? 'Mata Kuliah' : 'Jabatan'}</th>
              <th>Hadir</th>
              <th>${type === 'dosen' ? 'Total Mengajar' : 'Hari Kerja'}</th>
              ${type === 'karyawan' ? '<th>Terlambat</th>' : ''}
              <th>Persentase</th>
              <th>Absensi Terakhir</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
          <p>Data dari Fingerspot.io</p>
        </div>
      </body>
      </html>
    `;
  },

  // Helper: Download File
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Helper: Format Date
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  },

  // Export with Detail Records (Excel dengan detail per hari)
  async exportDetailedToExcel(type, startDate, endDate) {
    try {
      const rawData = await fingerspotService.getAttendanceReport(startDate, endDate, type);
      const processedData = fingerspotService.calculateStatistics(rawData, startDate, endDate);

      let csvContent = '';

      // Header
      csvContent = 'Tanggal,ID,Nama,Jam Masuk,Jam Keluar,Status\n';

      // Detail per record
      processedData.forEach(user => {
        const recordsByDate = new Map();

        // Group by date
        user.records.forEach(record => {
          if (!recordsByDate.has(record.date)) {
            recordsByDate.set(record.date, { checkIn: '-', checkOut: '-' });
          }

          const dateRecords = recordsByDate.get(record.date);
          if (record.status === 'Check In' && dateRecords.checkIn === '-') {
            dateRecords.checkIn = record.time;
          } else if (record.status === 'Check Out') {
            dateRecords.checkOut = record.time;
          }
        });

        // Add to CSV
        recordsByDate.forEach((times, date) => {
          const status = times.checkIn !== '-' ? 'Hadir' : 'Tidak Hadir';
          csvContent += `"${date}","${user.nip}","${user.nama}","${times.checkIn}","${times.checkOut}","${status}"\n`;
        });
      });

      this.downloadFile(csvContent, `rekap-detail-${type}-${startDate}-${endDate}.csv`, 'text/csv');

      return { success: true, message: 'Data detail berhasil diexport' };
    } catch (error) {
      console.error('Error exporting detailed data:', error);
      throw new Error('Gagal export data detail');
    }
  }
};

export default exportService;