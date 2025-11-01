// models/SecurityLog.js
import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      'login_success',
      'login_failed',
      'password_reset_request',
      'password_changed',
      'account_locked',
      'account_unlocked'
    ],
    required: true,
    index: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  reason: {
    type: String  // Razón del fallo (email no existe, password incorrecto, etc.)
  },
  metadata: {
    type: Object  // Información adicional
  }
}, {
  timestamps: true
});

// Índice compuesto para consultas eficientes
securityLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
securityLogSchema.index({ email: 1, action: 1, createdAt: -1 });

export const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);