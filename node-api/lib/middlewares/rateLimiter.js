// lib/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para intentos de login
 * Limita a 5 intentos cada 15 minutos por IP
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,  // Máximo 5 intentos
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  // ✅ ELIMINAR keyGenerator - express-rate-limit usa req.ip por defecto
  // que ya maneja IPv4 e IPv6 correctamente
  
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again later',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Rate limiter general para la API
 * Limita a 100 requests cada 15 minutos por IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,  // Máximo 100 requests
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
  // ✅ Sin keyGenerator personalizado
});

/**
 * Rate limiter estricto para endpoints sensibles
 * Limita a 3 intentos cada hora
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hora
  max: 3,  // Máximo 3 intentos
  message: {
    success: false,
    message: 'Too many attempts, please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
  // ✅ Sin keyGenerator personalizado
});