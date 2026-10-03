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

// Lit un fichier et renvoie son contenu en base64 (sans le prefixe "data:...,").
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadFile(title, file, folderId = null) {
  const fileBase64 = await fileToBase64(file);
  return request('/upload', {
    method: 'POST',
    body: {
      title,
      folderId,
      fileName: file.name,
      fileMime: file.type || 'application/octet-stream',
      fileBase64,
    },
  });
}

export async function replaceFile(documentId, file) {
  const fileBase64 = await fileToBase64(file);
  return request(`/${documentId}/file`, {
    method: 'PUT',
    body: {
      fileName: file.name,
      fileMime: file.type || 'application/octet-stream',
      fileBase64,
    },
  });
}

export function fileUrl(documentId) {
  // URL directe du fichier : le navigateur l'ouvre lui-meme (image, PDF, ...).
  return `${API_URL}/api/documents/${documentId}/file`;
}
