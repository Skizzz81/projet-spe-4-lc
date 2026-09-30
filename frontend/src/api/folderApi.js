const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request(options = {}) {
  const response = await fetch(`${API_URL}/api/folders`, {
    method: options.method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? 'Une erreur est survenue');
  }

  return data;
}

export function listFolders() {
  return request();
}

export function createFolder(name) {
  return request({ method: 'POST', body: { name } });
}
