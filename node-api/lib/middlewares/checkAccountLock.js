// lib/middlewares/checkAccountLock.js

/**
 * Middleware para verificar si la cuenta está bloqueada
 * Usar DESPUÉS de obtener el usuario pero ANTES de comparar password
 */
export const checkAccountLock = (user) => {
  if (!user) {
    return null;  // Usuario no existe, dejar que el controlador maneje el error
  }

  if (user.isAccountLocked()) {
    const lockTime = user.accountLockedUntil;
    
    if (lockTime) {
      const minutesLeft = Math.ceil((lockTime - new Date()) / (1000 * 60));
      return {
        locked: true,
        message: `Account is locked due to multiple failed login attempts. Please try again in ${minutesLeft} minutes.`,
        lockedUntil: lockTime
      };
    } else {
      return {
        locked: true,
        message: 'Account is locked. Please contact support.',
        lockedUntil: null
      };
    }
  }

  return null;  // Cuenta no está bloqueada
};