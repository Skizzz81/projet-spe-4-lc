import {
  findFoldersByOwner,
  insertFolder,
} from '../repositories/folderRepository.js';

export async function listFolders(req, res, next) {
  try {
    const folders = await findFoldersByOwner(req.user.id);

    res.json({ folders });
  } catch (error) {
    next(error);
  }
}

export async function createFolder(req, res, next) {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!name || name.length > 255) {
      return res.status(400).json({
        message: 'Le nom du dossier doit contenir entre 1 et 255 caractères',
      });
    }

    const folderId = await insertFolder(req.user.id, name);

    res.status(201).json({
      folder: {
        id: folderId,
        name,
      },
    });
  } catch (error) {
    next(error);
  }
}
