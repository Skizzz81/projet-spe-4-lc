import {
  findDocumentsByUser,
  findUserByEmail,
  insertDocument,
  insertDocumentMember,
  isDocumentOwner,
  removeDocument,
  updateDocumentContent,
} from '../repositories/documentRepository.js';

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

    const documentId = await insertDocument(req.user.id, title);

    res.status(201).json({
      document: {
        id: documentId,
        title,
        content: '',
        ownerId: req.user.id,
        access: 'owner',
        lastModifiedBy: 'Vous',
        updatedAt: new Date(),
      },
    });
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
