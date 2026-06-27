// ==================== USER MANAGEMENT PAGE ====================//

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Pencil, Search, X,
  UserCheck, UserX, AlertCircle, Save, Briefcase,
  ChevronDown, RefreshCw
} from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { ROLE_PERMISSIONS, ROLES } from '../context/AuthContext';

// ==================== JABATAN BADGE ====================
function JabatanBadge({ jabatan }) {
  const isDosen = jabatan?.toUpperCase() === 'DOSEN';
  return (
    <span style={{
      background:   isDosen ? '#dbeafe' : '#d1fae5',
      color:        isDosen ? '#1d4ed8' : '#059669',
      borderRadius: '6px',
      padding:      '2px 9px',
      fontSize:     '11px',
      fontWeight:   '700',
      border:       `1px solid ${isDosen ? '#93c5fd' : '#6ee7b7'}`,
    }}>
      {jabatan ? jabatan.charAt(0).toUpperCase() + jabatan.slice(1).toLowerCase() : '—'}
    </span>
  );
}

// ==================== STATUS BADGE ====================
function StatusBadge({ status, isActive }) {
  const aktif = isActive && status === 'AKTIF';
  const colorMap = {
    AKTIF:    { bg: '#dcfce7', color: '#166534' },
    CUTI:     { bg: '#fef9c3', color: '#854d0e' },
    RESIGN:   { bg: '#fee2e2', color: '#991b1b' },
    NON_AKTIF:{ bg: '#f1f5f9', color: '#64748b' },
  };
  const cfg = colorMap[status] || colorMap['NON_AKTIF'];
  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          '4px',
      padding:      '2px 8px',
      borderRadius: '6px',
      fontSize:     '11px',
      fontWeight:   '700',
      background:   cfg.bg,
      color:        cfg.color,
    }}>
      {aktif ? <UserCheck size={11} /> : <UserX size={11} />}
      {status ? status.replace('_', ' ') : 'NON AKTIF'}
    </span>
  );
}

// ==================== MODAL ====================
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         1000,
        background:     'rgba(0,0,0,0.45)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '20px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background:    'white',
        borderRadius:  '16px',
        width:         '100%',
        maxWidth:      '460px',
        boxShadow:     '0 24px 48px rgba(0,0,0,0.2)',
        maxHeight:     '90vh',
        overflowY:     'auto',
      }}>
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '20px 24px',
          borderBottom:   '1px solid #f1f5f9',
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827' }}>
            {title}
          </h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', padding: '4px', borderRadius: '6px',
          }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ==================== FORM FIELD ====================
function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display:      'block',
        fontSize:     '13px',
        fontWeight:   '600',
        color:        '#374151',
        marginBottom: '6px',
      }}>
        {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0' }}>{hint}</p>}
    </div>
  );
}

const INPUT_STYLE = {
  width:        '100%',
  padding:      '9px 12px',
  border:       '1.5px solid #e5e7eb',
  borderRadius: '8px',
  fontSize:     '13px',
  outline:      'none',
  boxSizing:    'border-box',
};

// ==================== EDIT FORM ====================
function EditEmployeeForm({ employee, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    nama:     employee.nama     || '',
    jabatan:  employee.jabatan  || 'DOSEN',
    status:   employee.status   || 'AKTIF',
    shift_id: employee.shift_id || null,
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    setError('');
    if (!form.nama.trim()) return setError('Nama pegawai harus diisi.');
    onSave(form);
  };

  return (
    <div>
      {error && (
        <div style={{
          background: '#fee2e2', borderRadius: '8px', padding: '10px 14px',
          marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start',
        }}>
          <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '13px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      <Field label="Nama Lengkap" required>
        <input
          style={INPUT_STYLE}
          value={form.nama}
          onChange={e => set('nama', e.target.value)}
          placeholder="Nama lengkap pegawai"
        />
      </Field>

      <Field label="Jabatan" required>
        <select
          style={{ ...INPUT_STYLE, cursor: 'pointer', background: 'white' }}
          value={form.jabatan}
          onChange={e => set('jabatan', e.target.value)}
        >
          <option value="DOSEN">Dosen</option>
          <option value="KARYAWAN">Karyawan</option>
        </select>
      </Field>

      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button onClick={onClose} style={{
          flex: 1, padding: '10px', border: '1.5px solid #e2e8f0',
          borderRadius: '8px', background: 'white', cursor: 'pointer',
          fontSize: '13px', fontWeight: '600', color: '#374151',
        }}>
          Batal
        </button>
        <button onClick={handleSave} disabled={loading} style={{
          flex: 1, padding: '10px', border: 'none',
          borderRadius: '8px',
          background: loading ? '#9ca3af' : '#1d4ed8',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '13px', fontWeight: '700', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          <Save size={14} /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
const UserManagement = () => {
  const [employees, setEmployees]   = useState([]);
  const [meta, setMeta]             = useState(null);
  const [search, setSearch]         = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]           = useState('');
  const [modal, setModal]           = useState(null); // { type: 'edit', data: employee }
  const [toast, setToast]           = useState('');

  // ---- Load data dari Backend ----
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await employeeService.getAll({
        page,
        limit:   50,
        search,
        jabatan: filterJabatan,
      });
      setEmployees(result.employees);
      setMeta(result.meta);
    } catch (err) {
      setError(err.message || 'Gagal memuat data pegawai.');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterJabatan, ]);

  useEffect(() => { loadData(); }, [loadData]);

  // Reset ke page 1 saat filter berubah
  useEffect(() => { setPage(1); }, [search, filterJabatan]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ---- Edit pegawai ----
  const handleEdit = async (form) => {
    setActionLoading(true);
    try {
      await employeeService.update(modal.data.user_id || modal.data.id, form);
      await loadData();
      setModal(null);
      showToast('✅ Data pegawai berhasil diperbarui');
    } catch (err) {
      showToast('❌ ' + (err.message || 'Gagal memperbarui data'));
    } finally {
      setActionLoading(false);
    }
  };

  // ---- Nonaktifkan pegawai (soft delete) ----
  const handleDeactivate = async (employee) => {
    const nama = employee.nama || employee.user_id;
    if (!window.confirm(`Nonaktifkan pegawai "${nama}"? Tindakan ini dapat diubah kembali oleh admin.`)) return;
    setActionLoading(true);
    try {
      await employeeService.deactivate(employee.user_id || employee.id);
      await loadData();
      showToast('✅ Pegawai berhasil dinonaktifkan');
    } catch (err) {
      showToast('❌ ' + (err.message || 'Gagal menonaktifkan pegawai'));
    } finally {
      setActionLoading(false);
    }
  };

  // ---- Stats ringkasan ----
const totalUserAlat = employees.length;

const totalTerdaftar = employees.filter(
  e => e.jabatan && e.jabatan.trim() !== ''
).length;

const totalBelumTerdaftar = employees.filter(
  e => !e.jabatan || e.jabatan.trim() === ''
).length;

const totalNonAktif = employees.filter(
  e => !e.is_active || e.status === 'NON_AKTIF'
).length;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position:     'fixed',
          bottom:       '24px',
          right:        '24px',
          zIndex:       2000,
          background:   toast.startsWith('❌') ? '#dc2626' : '#1d4ed8',
          color:        'white',
          borderRadius: '10px',
          padding:      '12px 20px',
          fontSize:     '13px',
          fontWeight:   '600',
          boxShadow:    '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}

      {/* Page Header */}
      <div className="page-heading">
        <h2 className="page-title">Manajemen Pengguna — Data Pegawai</h2>
        <p className="page-sub">Kelola data master pegawai (Dosen dan Karyawan) yang terdaftar di sistem</p>
      </div>

      {/* Stats Row */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap:                 '12px',
        marginBottom:        '20px',
      }}>
        {[
  {
    label: 'Total User',
    value: totalUserAlat,
    color: '#1d4ed8'
  },
  {
    label: 'User Terdaftar',
    value: totalTerdaftar,
    color: '#059669'
  },
  {
    label: 'Belum Terdaftar',
    value: totalBelumTerdaftar,
    color: '#d97706'
  },

].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            background:   'white',
            borderRadius: '10px',
            padding:      '14px 16px',
            border:       `1px solid ${color}30`,
            borderLeft:   `3px solid ${color}`,
          }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 180px 180px 120px',
      gap: '10px',
      marginBottom: '14px',
      alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '100px' }}>
          <Search size={16} style={{
            position:  'absolute',
            left:      '12px',
            top:       '50%',
            transform: 'translateY(-50%)',
            color:     '#9ca3af',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama user..."
            style={{ ...INPUT_STYLE, paddingLeft: '38px' }}
          />
        </div>

        {/* Filter Jabatan */}
        <div style={{ position: 'relative' }}>
          <select
            value={filterJabatan}
            onChange={e => setFilterJabatan(e.target.value)}
            style={{ ...INPUT_STYLE, paddingRight: '32px', cursor: 'pointer', minWidth: '140px' }}
          >
            <option value="">Semua Jabatan</option>
            <option value="DOSEN">Dosen</option>
            <option value="KARYAWAN">Karyawan</option>
          </select>
        </div>

        {/* Refresh */}
        <button
          onClick={loadData}
          disabled={loading}
          title="Refresh data"
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         '6px',
            padding:     '9px 14px',
            border:      '1.5px solid #e2e8f0',
            borderRadius:'8px',
            background:  'white',
            cursor:      loading ? 'not-allowed' : 'pointer',
            fontSize:    '13px',
            fontWeight:  '600',
            color:       '#374151',
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background:   '#fee2e2',
          border:       '1px solid #fecaca',
          borderRadius: '8px',
          padding:      '12px 16px',
          marginBottom: '14px',
          display:      'flex',
          gap:          '8px',
          alignItems:   'center',
          color:        '#dc2626',
          fontSize:     '13px',
        }}>
          <AlertCircle size={16} />
          {error}
          <button
            onClick={loadData}
            style={{
              marginLeft:  'auto',
              background:  'none',
              border:      'none',
              color:       '#dc2626',
              cursor:      'pointer',
              fontWeight:  '600',
              fontSize:    '13px',
            }}
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{
        background:    'white',
        borderRadius:  '12px',
        border:        '1px solid #e2e8f0',
        overflow:      'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Nama User', 'Jabatan', 'Aksi'].map(h => (
                  <th key={h} style={{
                    padding:         '11px 14px',
                    textAlign:       'left',
                    fontWeight:      '700',
                    fontSize:        '11px',
                    color:           '#64748b',
                    textTransform:   'uppercase',
                    letterSpacing:   '0.5px',
                    whiteSpace:      'nowrap',
                    borderRight: '1px solid #e5e7eb',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width:        '32px',
                        height:       '32px',
                        border:       '3px solid #e2e8f0',
                        borderTop:    '3px solid #1d4ed8',
                        borderRadius: '50%',
                        animation:    'spin 0.7s linear infinite',
                        borderRight: '1px solid #e5e7eb',
                      }} />
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>Memuat data pegawai...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '56px', color: '#9ca3af', borderRight: '1px solid #e5e7eb', }}>
                    <Users size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>
                      {search || filterJabatan
                        ? 'Tidak ada pegawai yang sesuai filter'
                        : 'Belum ada data pegawai'}
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.user_id || emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Nama */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width:          '32px',
                          height:         '32px',
                          borderRadius:   '50%',
                          background:     emp.jabatan?.toUpperCase() === 'DOSEN' ? '#dbeafe' : '#d1fae5',
                          color:          emp.jabatan?.toUpperCase() === 'DOSEN' ? '#1d4ed8' : '#059669',
                          display:        'flex',
                          alignItems:     'center',
                          justifyContent: 'center',
                          fontSize:       '11px',
                          fontWeight:     '700',
                          flexShrink:     0,
                          borderRight: '1px solid #e5e7eb',
                        }}>
                          {(emp.nama || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1a202c' }}>{emp.nama || '—'}</div>
                          {emp.email && (
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{emp.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Jabatan */}
                    <td style={{ padding: '12px 14px' }}>
                      <JabatanBadge jabatan={emp.jabatan} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 14px' }}>
                      <StatusBadge status={emp.status} isActive={emp.is_active} />
                    </td>

                    {/* Aksi */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {/* Edit */}
                        <button
                          onClick={() => setModal({ type: 'edit', data: emp })}
                          title="Edit data pegawai"
                          style={{
                            padding:     '6px',
                            border:      '1px solid #e2e8f0',
                            borderRadius:'7px',
                            background:  'white',
                            cursor:      'pointer',
                            color:       '#374151',
                            display:     'flex',
                            alignItems:  'center',
                            borderRight: '1px solid #e5e7eb',
                          }}
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Nonaktifkan — hanya tampil jika masih aktif */}
                        {(emp.is_active || emp.status === 'AKTIF') && (
                          <button
                            onClick={() => handleDeactivate(emp)}
                            disabled={actionLoading}
                            title="Nonaktifkan pegawai"
                            style={{
                              padding:     '6px',
                              border:      '1px solid #fecaca',
                              borderRadius:'7px',
                              background:  '#fff5f5',
                              cursor:      actionLoading ? 'not-allowed' : 'pointer',
                              color:       '#dc2626',
                              display:     'flex',
                              alignItems:  'center',
                            }}
                          >
                            <UserX size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '12px 16px',
            borderTop:      '1px solid #f1f5f9',
            fontSize:       '13px',
            color:          '#6b7280',
          }}>
            <span>
              Menampilkan {employees.length} dari {meta.total || '?'} pegawai
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                style={{
                  padding:     '5px 10px',
                  border:      '1px solid #e2e8f0',
                  borderRadius:'6px',
                  background:  page === 1 ? '#f8fafc' : 'white',
                  cursor:      page === 1 ? 'not-allowed' : 'pointer',
                  color:       page === 1 ? '#9ca3af' : '#374151',
                  fontWeight:  '600',
                  fontSize:    '12px',
                }}
              >
                ← Prev
              </button>
              <span style={{ padding: '5px 10px', fontWeight: '600' }}>
                {page} / {meta.total_pages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= meta.total_pages || loading}
                style={{
                  padding:     '5px 10px',
                  border:      '1px solid #e2e8f0',
                  borderRadius:'6px',
                  background:  page >= meta.total_pages ? '#f8fafc' : 'white',
                  cursor:      page >= meta.total_pages ? 'not-allowed' : 'pointer',
                  color:       page >= meta.total_pages ? '#9ca3af' : '#374151',
                  fontWeight:  '600',
                  fontSize:    '12px',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={modal?.type === 'edit'}
        onClose={() => setModal(null)}
        title="Edit Data Pegawai"
      >
        {modal?.data && (
          <EditEmployeeForm
            employee={modal.data}
            onSave={handleEdit}
            onClose={() => setModal(null)}
            loading={actionLoading}
          />
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;