const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request(path = '', options = {}) {
  const response = await fetch(`${API_URL}/api/documents${path}`, {
    method: options.method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? 'Une erreur est survenue');
  }

  return data;
}

export function listDocuments() {
  // GET /api/documents
  return request();
}

export function createDocument(title, folderId = null) {
  // POST /api/documents
  return request('', { method: 'POST', body: { title, folderId } });
}

export function updateDocument(documentId, updates) {
  // PATCH /api/documents/:documentId
  return request(`/${documentId}`, { method: 'PATCH', body: updates });
}

export function deleteDocument(documentId) {
  // DELETE /api/documents/:documentId
  return request(`/${documentId}`, { method: 'DELETE' });
}

export function inviteDocumentMember(documentId, email) {
  // POST /api/documents/:documentId/members
  return request(`/${documentId}/members`, { method: 'POST', body: { email } });
}
