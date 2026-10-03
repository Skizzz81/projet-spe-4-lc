import {
  findDocumentAccess,
  findDocumentFile,
  findDocumentsByUser,
  findUserByEmail,
  insertDocument,
  insertDocumentMember,
  insertFileDocument,
  isDocumentOwner,
  removeDocument,
  replaceDocumentFile,
  updateDocumentContent,
} from '../repositories/documentRepository.js';
import { findFolderByIdAndOwner } from '../repositories/folderRepository.js';

// Un document fichier arrive en base64 dans du JSON (pas de multer, plus simple).
function decodeFilePayload(body) {
  const fileName = body.fileName?.trim();
  const fileMime = body.fileMime?.trim();
  const fileBase64 = body.fileBase64;

  if (!fileName || !fileMime || typeof fileBase64 !== 'string' || !fileBase64) {
    return null;
  }

  return { fileName, fileMime, buffer: Buffer.from(fileBase64, 'base64') };
}

export async function getDocumentAccess(req, res, next) {
  try {
    const documentId = Number(req.params.documentId);

    if (!Number.isInteger(documentId) || documentId <= 0) {
      return res.status(400).json({ message: 'Identifiant de document invalide' });
    }

    const access = await findDocumentAccess(documentId, req.user.id);

    if (!access) {
      return res.status(404).json({ message: 'Document introuvable' });
    }

    res.json({ access });
  } catch (error) {
    next(error);
  }
}

export async function listDocuments(req, res, next) {
  try {
    const documents = await findDocumentsByUser(req.user.id);

    res.json({ documents });
  } catch (error) {
    next(error);
  }
}

export async function createDocument(req, res, next) {
  try {
    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({ message: 'Le titre est obligatoire' });
    }

    let folderId = null;

    if (req.body.folderId !== undefined && req.body.folderId !== null) {
      folderId = Number(req.body.folderId);

      if (!Number.isInteger(folderId) || folderId <= 0) {
        return res.status(400).json({ message: 'Dossier invalide' });
      }

      const folder = await findFolderByIdAndOwner(folderId, req.user.id);

      if (!folder) {
        return res.status(404).json({ message: 'Dossier introuvable' });
      }
    }

    const documentId = await insertDocument(req.user.id, title, folderId);

    res.status(201).json({
      document: {
        id: documentId,
        title,
        content: '',
        type: 'text',
        ownerId: req.user.id,
        folderId,
        access: 'owner',
        lastModifiedBy: 'Vous',
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadDocument(req, res, next) {
  try {
    const file = decodeFilePayload(req.body);

    if (!file) {
      return res.status(400).json({ message: 'Fichier invalide' });
    }

    let folderId = null;

    if (req.body.folderId !== undefined && req.body.folderId !== null) {
      folderId = Number(req.body.folderId);

      if (!Number.isInteger(folderId) || folderId <= 0) {
        return res.status(400).json({ message: 'Dossier invalide' });
      }

      const folder = await findFolderByIdAndOwner(folderId, req.user.id);

      if (!folder) {
        return res.status(404).json({ message: 'Dossier introuvable' });
      }
    }

    const title = req.body.title?.trim() || file.fileName;
    const documentId = await insertFileDocument(
      req.user.id,
      title,
      folderId,
      file.fileName,
      file.fileMime,
      file.buffer,
    );

    res.status(201).json({
      document: {
        id: documentId,
        title,
        content: '',
        type: 'file',
        fileName: file.fileName,
        fileMime: file.fileMime,
        ownerId: req.user.id,
        folderId,
        access: 'owner',
        lastModifiedBy: 'Vous',
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function replaceFile(req, res, next) {
  try {
    const file = decodeFilePayload(req.body);

    if (!file) {
      return res.status(400).json({ message: 'Fichier invalide' });
    }

    const affectedRows = await replaceDocumentFile(
      req.params.documentId,
      req.user.id,
      file.fileName,
      file.fileMime,
      file.buffer,
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Document introuvable ou modification interdite' });
    }

    res.json({
      document: {
        fileName: file.fileName,
        fileMime: file.fileMime,
        updatedAt: new Date(),
        lastModifiedBy: 'Vous',
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadFile(req, res, next) {
  try {
    const file = await findDocumentFile(req.params.documentId, req.user.id);

    if (!file || !file.fileData) {
      return res.status(404).json({ message: 'Fichier introuvable' });
    }

    res.setHeader('Content-Type', file.fileMime || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.fileName || 'fichier')}"`,
    );
    res.send(file.fileData);
  } catch (error) {
    next(error);
  }
}

export async function updateDocument(req, res, next) {
  try {
    const { content } = req.body;

    if (typeof content !== 'string') {
      return res.status(400).json({ message: 'Le contenu est invalide' });
    }

    const affectedRows = await updateDocumentContent(
      req.params.documentId,
      req.user.id,
      content,
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Document introuvable ou modification interdite' });
    }

    res.json({
      document: {
        updatedAt: new Date(),
        lastModifiedBy: 'Vous',
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const affectedRows = await removeDocument(req.params.documentId, req.user.id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Document introuvable' });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function inviteDocumentMember(req, res, next) {
  try {
    const documentId = Number(req.params.documentId);
    const email = req.body.email?.trim().toLowerCase();

    if (!Number.isInteger(documentId) || documentId <= 0) {
      return res.status(400).json({ message: 'Identifiant de document invalide' });
    }

    if (!email) {
      return res.status(400).json({ message: "L'adresse email est obligatoire" });
    }

    const ownsDocument = await isDocumentOwner(documentId, req.user.id);

    if (!ownsDocument) {
      return res.status(404).json({ message: 'Document introuvable' });
    }

    const invitedUser = await findUserByEmail(email);

    if (!invitedUser) {
      return res.status(404).json({ message: 'Aucun utilisateur ne possède cette adresse email' });
    }

    if (invitedUser.id === req.user.id) {
      return res.status(400).json({ message: 'Tu es déjà propriétaire de ce document' });
    }

    await insertDocumentMember(documentId, invitedUser.id);

    res.status(201).json({
      message: `${invitedUser.nom} a été invité sur le document`,
      member: invitedUser,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Cet utilisateur est déjà invité' });
    }

    next(error);
  }
}
