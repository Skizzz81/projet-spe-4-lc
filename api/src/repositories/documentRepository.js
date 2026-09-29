import { database } from '../config/database.js';

export async function findDocumentsByUser(userId) {
  const [documents] = await database.query(
    `SELECT
       d.id,
       d.title,
       d.content,
       d.owner_id AS ownerId,
       CASE WHEN d.owner_id = ? THEN 'owner' ELSE dm.permission END AS access,
       COALESCE(modifier.nom, owner.nom) AS lastModifiedBy,
       d.updated_at AS updatedAt
     FROM documents d
     JOIN users owner ON owner.id = d.owner_id
     LEFT JOIN users modifier ON modifier.id = d.last_modified_by
     LEFT JOIN document_members dm
       ON dm.document_id = d.id AND dm.user_id = ?
     WHERE d.owner_id = ? OR dm.user_id IS NOT NULL
     ORDER BY d.updated_at DESC`,
    [userId, userId, userId],
  );

  return documents;
}

export async function findDocumentAccess(documentId, userId) {
  const [documents] = await database.query(
    `SELECT
       CASE WHEN d.owner_id = ? THEN 'owner' ELSE dm.permission END AS access
     FROM documents d
     LEFT JOIN document_members dm
       ON dm.document_id = d.id AND dm.user_id = ?
     WHERE d.id = ? AND (d.owner_id = ? OR dm.user_id IS NOT NULL)
     LIMIT 1`,
    [userId, userId, documentId, userId],
  );

  return documents[0]?.access ?? null;
}

export async function insertDocument(userId, title) {
  const [result] = await database.query(
    `INSERT INTO documents (owner_id, last_modified_by, title, content)
     VALUES (?, ?, ?, '')`,
    [userId, userId, title],
  );

  return result.insertId;
}

export async function updateDocumentContent(documentId, userId, content) {
  const [result] = await database.query(
    `UPDATE documents d
     LEFT JOIN document_members dm
       ON dm.document_id = d.id AND dm.user_id = ?
     SET d.content = ?, d.last_modified_by = ?, d.updated_at = CURRENT_TIMESTAMP
     WHERE d.id = ? AND (d.owner_id = ? OR dm.permission = 'editor')`,
    [userId, content, userId, documentId, userId],
  );

  return result.affectedRows;
}

export async function removeDocument(documentId, userId) {
  const [result] = await database.query(
    'DELETE FROM documents WHERE id = ? AND owner_id = ?',
    [documentId, userId],
  );

  return result.affectedRows;
}

export async function findUserByEmail(email) {
  const [users] = await database.query(
    'SELECT id, nom, email FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  return users[0] ?? null;
}

export async function isDocumentOwner(documentId, userId) {
  const [documents] = await database.query(
    'SELECT id FROM documents WHERE id = ? AND owner_id = ? LIMIT 1',
    [documentId, userId],
  );

  return documents.length > 0;
}

export async function insertDocumentMember(documentId, userId) {
  await database.query(
    `INSERT INTO document_members (document_id, user_id, permission)
     VALUES (?, ?, 'editor')`,
    [documentId, userId],
  );
}
