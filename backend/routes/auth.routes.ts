import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { rateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();

const loginLimiter = rateLimit(15 * 60 * 1000, 10, 'Muitas tentativas de login. Aguarde 15 minutos.');
const registerLimiter = rateLimit(60 * 60 * 1000, 20, 'Muitos cadastros a partir deste IP. Tente mais tarde.');
const emailLimiter = rateLimit(15 * 60 * 1000, 10, 'Muitas solicitações de código. Aguarde alguns minutos.');
const codeLimiter = rateLimit(15 * 60 * 1000, 20, 'Muitas tentativas. Aguarde alguns minutos.');

router.post('/login', loginLimiter, authController.login);
router.post('/register', registerLimiter, authController.register);
router.get('/me', authenticate, authController.me);

router.post('/verify-email', codeLimiter, authController.verifyEmail);
router.post('/resend-code', emailLimiter, authController.resendCode);

router.post('/forgot-password', emailLimiter, authController.forgotPassword);
router.post('/reset-password', codeLimiter, authController.resetPassword);

router.post('/change-password', authenticate, authController.changePassword);

export default router;
