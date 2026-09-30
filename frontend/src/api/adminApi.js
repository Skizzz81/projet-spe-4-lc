const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}/api/admin${path}`, {
    method: options.method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? 'Impossible de traiter cette demande.');
  }

  return data;
}

export function listUsers() {
  return request('/users');
}

export function createUser(user) {
  return request('/users', { method: 'POST', body: user });
}

export function updateUserRole(userId, role) {
  return request(`/users/${userId}/role`, { method: 'PATCH', body: { role } });
}

export function blockUser(userId) {
  return request(`/users/${userId}/block`, { method: 'PATCH' });
}

export function unblockUser(userId) {
  return request(`/users/${userId}/unblock`, { method: 'PATCH' });
}