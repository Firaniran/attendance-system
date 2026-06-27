// ==================== EMPLOYEE SERVICE ====================

const BASE_URL = 'http://localhost:3001/api';

const getAuthHeader = () => ({
  Authorization:  `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

// Tangani 401/403 dengan redirect ke login; lempar error untuk status lain yang tidak OK
const handleResponse = async (res) => {
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    // Coba parse body untuk pesan error lebih informatif
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || res.statusText || 'API Error');
  }
  return res.json();
};

export const employeeService = {
  // ── GET /api/employees ──────────────────────────────────────────────────────
  // Mengembalikan { employees: [], meta: { total, page, limit, total_pages } }
  // sesuai struktur yang dipakai UserManagement.jsx.
  async getAll({ page = 1, limit = 50, search = '', jabatan = '', status = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search)  params.append('search',  search);
    if (jabatan) params.append('jabatan', jabatan);

    const res  = await fetch(
      `${BASE_URL}/employees?${params.toString()}`,
      { method: 'GET', headers: getAuthHeader() }
    );
    const data = await handleResponse(res);

    // Normalisasi response — backend bisa mengembalikan salah satu dari:
    //   { success, data: { employees: [...], meta: {...} } }
    //   { success, data: [...], meta: {...} }
    //   { employees: [...], meta: {...} }
    const inner     = data?.data;
    const employees = Array.isArray(inner)
      ? inner
      : (inner?.employees ?? data?.employees ?? []);
    const meta      = inner?.meta ?? data?.meta ?? null;

    return { employees, meta };
  },

  // ── PUT /api/employees/{user_id} ────────────────────────────────────────────
  // form: { nama, jabatan, status, shift_id }
  async update(userId, form) {
    const res = await fetch(
      `${BASE_URL}/employees/${userId}`,
      {
        method:  'PUT',
        headers: getAuthHeader(),
        body:    JSON.stringify(form),
      }
    );
    return handleResponse(res);
  },

  // ── DELETE /api/employees/{user_id} ─────────────────────────────────────────
  // Soft delete — hanya menonaktifkan, tidak menghapus permanen.
  async deactivate(userId) {
    const res = await fetch(
      `${BASE_URL}/employees/${userId}`,
      { method: 'DELETE', headers: getAuthHeader() }
    );
    return handleResponse(res);
  },
};