import express from 'express';
import {
  createDocument,
  deleteDocument,
  downloadFile,
  getDocumentAccess,
  inviteDocumentMember,
  listDocuments,
  replaceFile,
  updateDocument,
  uploadDocument,
} from '../controllers/documentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listDocuments);
router.get('/:documentId/access', getDocumentAccess);
router.get('/:documentId/file', downloadFile);
router.post('/', createDocument);
router.post('/upload', uploadDocument);
router.post('/:documentId/members', inviteDocumentMember);
router.put('/:documentId/file', replaceFile);
router.patch('/:documentId', updateDocument);
router.delete('/:documentId', deleteDocument);

export default router;
