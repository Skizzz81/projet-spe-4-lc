import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireRole from '../middlewares/requireRole.js';
import { listUsers, createUser, updateUserRole, blockUser, unblockUser } from '../controllers/adminController.js';

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/users", listUsers);
router.post("/users", createUser);
router.patch("/users/:userId/role", updateUserRole);
router.patch("/users/:userId/block", blockUser);
router.patch("/users/:userId/unblock", unblockUser);

export default router;
