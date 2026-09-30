import { database } from '../config/database.js';

export async function findFoldersByOwner(userId) {
  const [folders] = await database.query(
    `SELECT
       id,
       name,
       created_at AS createdAt,
       updated_at AS updatedAt
     FROM folders
     WHERE owner_id = ?
     ORDER BY name`,
    [userId],
  );

  return folders;
}

export async function findFolderByIdAndOwner(folderId, userId) {
  const [folders] = await database.query(
    `SELECT id, name
     FROM folders
     WHERE id = ? AND owner_id = ?
     LIMIT 1`,
    [folderId, userId],
  );

  return folders[0] ?? null;
}

export async function insertFolder(userId, name) {
  const [result] = await database.query(
    `INSERT INTO folders (owner_id, name)
     VALUES (?, ?)`,
    [userId, name],
  );

  return result.insertId;
}
