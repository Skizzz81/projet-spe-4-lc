import express from 'express';
import { register, login, logout, verifyLogin2fa, setup2fa, enable2fa, disable2fa, getProfile } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateRegister, validateLogin, handleValidationErrors } from '../middlewares/authValidation.js';
import authRateLimiter from '../middlewares/authRateLimiter.js';
import registerRateLimiter from '../middlewares/registerRateLimiter.js';

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);

router.post("/register", registerRateLimiter, validateRegister, handleValidationErrors, register);
router.post("/login", authRateLimiter, validateLogin, handleValidationErrors, login);
router.post("/logout", authMiddleware, logout);

router.post("/2fa/verify-login", authRateLimiter, verifyLogin2fa);
router.post("/2fa/setup", authMiddleware, setup2fa);
router.post("/2fa/enable", authMiddleware, authRateLimiter, enable2fa);
router.post("/2fa/disable", authMiddleware, disable2fa);

export default router;