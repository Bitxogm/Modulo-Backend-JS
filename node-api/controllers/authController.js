// controllers/authController.js
import { matchedData } from 'express-validator';
import { User } from '../models/User.js';
import { SecurityLog } from '../models/SecurityLog.js';
import { checkAccountLock } from '../lib/middlewares/checkAccountLock.js';

export const authController = {

  /**
   * POST /api/auth/login
   * Login de usuario
   */
  login: async (req, res) => {
    try {
      const data = matchedData(req);
      const { email, password } = data;

      console.log(`🔐 Login attempt for: ${email}`);

      // 1️⃣ Buscar usuario por email (incluir password)
      const user = await User.findOne({ email }).select('+password');

      // 2️⃣ Si el usuario no existe (NO revelar esto al cliente)
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        
        await SecurityLog.create({
          email,
          action: 'login_failed',
          ip: req.ip,
          userAgent: req.get('user-agent'),
          reason: 'User not found'
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // 3️⃣ Verificar si la cuenta está bloqueada
      const lockStatus = checkAccountLock(user);
      if (lockStatus) {
        console.log(`🔒 Account locked: ${email}`);
        
        await SecurityLog.create({
          userId: user._id,
          email,
          action: 'login_failed',
          ip: req.ip,
          userAgent: req.get('user-agent'),
          reason: 'Account locked'
        });

        return res.status(423).json({
          success: false,
          message: lockStatus.message,
          lockedUntil: lockStatus.lockedUntil
        });
      }

      // 4️⃣ Verificar password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        console.log(`❌ Invalid password for: ${email}`);
        
        await user.incrementFailedAttempts();

        await SecurityLog.create({
          userId: user._id,
          email,
          action: 'login_failed',
          ip: req.ip,
          userAgent: req.get('user-agent'),
          reason: 'Invalid password',
          metadata: {
            failedAttempts: user.failedLoginAttempts + 1
          }
        });

        const attemptsLeft = 5 - (user.failedLoginAttempts + 1);
        let message = 'Invalid email or password';
        
        if (attemptsLeft > 0 && attemptsLeft <= 2) {
          message += `. ${attemptsLeft} attempt(s) remaining before account lock.`;
        }

        return res.status(401).json({
          success: false,
          message
        });
      }

      // 5️⃣ Login exitoso
      console.log(`✅ Login successful: ${email}`);

      await user.recordSuccessfulLogin(req.ip);

      await SecurityLog.create({
        userId: user._id,
        email,
        action: 'login_success',
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      // ✅✅✅ AÑADIR ESTAS LÍNEAS (Crear sesión) ✅✅✅
      req.session.userId = user._id.toString();
      req.session.userEmail = user.email;
      req.session.userName = user.name;
      req.session.userRole = user.role;
      // ✅✅✅ FIN DE LAS LÍNEAS NUEVAS ✅✅✅

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: user
        }
      });

    } catch (error) {
      console.error('[ERROR] login:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // ✅✅✅ AÑADIR ESTE MÉTODO COMPLETO (Logout) ✅✅✅
  /**
   * POST /api/auth/logout
   * Cerrar sesión
   */
  logout: async (req, res) => {
    try {
      const userId = req.session?.userId;
      const userEmail = req.session?.userEmail;
      
      console.log(`👋 Logout attempt for: ${userEmail || 'unknown'}`);
      
      // Destruir sesión
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Error destroying session:', err);
          return res.status(500).json({
            success: false,
            message: 'Error logging out'
          });
        }
        
        console.log(`✅ Logout successful: ${userEmail}`);
        
        res.status(200).json({
          success: true,
          message: 'Logged out successfully'
        });
      });
      
      // Log de seguridad (después de responder)
      if (userId) {
        SecurityLog.create({
          userId,
          email: userEmail,
          action: 'logout',
          ip: req.ip,
          userAgent: req.get('user-agent')
        }).catch(err => console.error('Error logging logout:', err));
      }
      
    } catch (error) {
      console.error('[ERROR] logout:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
  // ✅✅✅ FIN DEL MÉTODO NUEVO ✅✅✅

  /**
   * POST /api/auth/unlock-account
   * Desbloquear cuenta (solo para admins)
   */
  unlockAccount: async (req, res) => {
    try {
      const data = matchedData(req);
      const { email } = data;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.accountLocked) {
        return res.status(400).json({
          success: false,
          message: 'Account is not locked'
        });
      }

      await user.unlockAccount();

      await SecurityLog.create({
        userId: user._id,
        email: user.email,
        action: 'account_unlocked',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          unlockedBy: 'admin'
        }
      });

      console.log(`🔓 Account unlocked: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Account unlocked successfully',
        data: user
      });

    } catch (error) {
      console.error('[ERROR] unlockAccount:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/auth/security-logs/:userId
   * Obtener logs de seguridad de un usuario (solo admins)
   */
  getSecurityLogs: async (req, res) => {
    try {
      const data = matchedData(req);
      const { userId } = data;

      const logs = await SecurityLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
      });

    } catch (error) {
      console.error('[ERROR] getSecurityLogs:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

};