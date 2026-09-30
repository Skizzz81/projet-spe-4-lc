const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}/api/auth${path}`, {
    method: options.method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? data.errors?.[0]?.msg ?? "Une erreur est survenue");
  }

  return data;
}

export function register({ nom, email, password }) {
  return request('/register', { method: 'POST', body: { nom, email, password } });
}

export function login({ email, password }) {
  return request('/login', { method: 'POST', body: { email, password } });
}

export function verifyLogin2fa({ code }) {
  return request('/2fa/verify-login', { method: 'POST', body: { code } });
}

export function logout() {
  return request('/logout', { method: 'POST' });
}

export function getProfile() {
  return request('/profile');
}

export function updateProfile({ nom, email }) {
  return request('/profile', { method: 'PATCH', body: { nom, email } });
}

export function setup2fa() {
  return request('/2fa/setup', { method: 'POST' });
}

export function enable2fa({ code }) {
  return request('/2fa/enable', { method: 'POST', body: { code } });
}

export function disable2fa() {
  return request('/2fa/disable', { method: 'POST' });
}
