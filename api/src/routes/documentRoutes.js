import express from 'express';
import {
  createDocument,
  deleteDocument,
  getDocumentAccess,
  inviteDocumentMember,
  listDocuments,
  updateDocument,
} from '../controllers/documentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listDocuments);
router.get('/:documentId/access', getDocumentAccess);
router.post('/', createDocument);
router.post('/:documentId/members', inviteDocumentMember);
router.patch('/:documentId', updateDocument);
router.delete('/:documentId', deleteDocument);

export default router;
