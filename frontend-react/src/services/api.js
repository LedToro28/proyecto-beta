const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Public
  getProperties: (agencyId) =>
    request(`/properties${agencyId ? `?agency_id=${agencyId}` : ''}`),
  getAgencies: () => request('/agencies'),
  sendMessage: (data) =>
    request('/send-message', { method: 'POST', body: JSON.stringify(data) }),

  // Auth
  login: (username, password) =>
    request('/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => fetch(`${API_BASE}/logout`, { credentials: 'include' }).then(() => true),
  getSession: () => request('/session'),

  // Agency
  getAgencyProfile: () => request('/agency/profile'),
  getAgencyProperties: () => request('/agency/properties'),
  createProperty: (formData) =>
    fetch(`${API_BASE}/agency/properties`, { method: 'POST', body: formData }),
  deleteProperty: (id) =>
    request(`/agency/properties/${id}`, { method: 'DELETE' }),
  getAgencyMessages: () => request('/agency/messages'),

  // Admin
  getAdminAgencies: () => request('/admin/agencies'),
  createAgency: (formData) =>
    fetch(`${API_BASE}/admin/agencies`, { method: 'POST', body: formData }),
  deleteAgency: (id) =>
    request(`/admin/agencies/${id}`, { method: 'DELETE' }),
  getAdminStats: () => request('/admin/stats'),
};
