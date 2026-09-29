import {
  findDocumentsByUser,
  insertDocument,
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
