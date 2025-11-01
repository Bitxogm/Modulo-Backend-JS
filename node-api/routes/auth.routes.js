// routes/auth.routes.js
import { Router } from 'express';
import { body, param } from 'express-validator';
import { validarResultados } from '../controllers/validarResultados.js';
import { authController } from '../controllers/authController.js';
import { loginLimiter, strictLimiter } from '../lib/middlewares/rateLimiter.js';

export const authRouter = Router();

/**
 * POST /api/auth/login
 * Login de usuario
 */
authRouter.post('/login',
  loginLimiter,  // ✅ Rate limiting: 5 intentos cada 15 minutos
  
  body('email', 'Valid email is required')
    .notEmpty()
    .bail()
    .isEmail()
    .normalizeEmail(),

  body('password', 'Password is required')
    .notEmpty(),

  validarResultados,
  authController.login
);

authRouter.post('/logout',
  authController.logout
);
/**
 * POST /api/auth/unlock-account
 * Desbloquear cuenta (solo admins)
 */
authRouter.post('/unlock-account',
  strictLimiter,  // ✅ Rate limiting estricto: 3 intentos por hora
  
  body('email', 'Valid email is required')
    .notEmpty()
    .bail()
    .isEmail()
    .normalizeEmail(),

  validarResultados,
  authController.unlockAccount
);

/**
 * GET /api/auth/security-logs/:userId
 * Obtener logs de seguridad (solo admins)
 */
authRouter.get('/security-logs/:userId',
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),

  validarResultados,
  authController.getSecurityLogs
);