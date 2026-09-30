import express from 'express';
import { createFolder, listFolders } from '../controllers/folderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listFolders);
router.post('/', createFolder);

export default router;
