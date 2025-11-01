// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
 password: {
  type: String,
  select: false,
  required: [true, 'Password is required'],
  minlength: [8, 'Password must be at least 8 characters'],  // ✅ De 6 a 8
  validate: {
    validator: function(password) {
      // Skip validación si ya está hasheado
      if (password.startsWith('$2b$') || password.startsWith('$2a$')) {
        return true;
      }
      
      // Validar password en texto plano
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      return regex.test(password);
    },
    message: 'Password must contain: uppercase, lowercase, number, and special character (@$!%*?&#)'
  }
},
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // ✅ NUEVO: Campos para seguridad
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  accountLockedUntil: {
    type: Date,
    default: null
  },
  lastLoginAt: {
    type: Date
  },
  lastLoginIp: {
    type: String
  }
}, {
  timestamps: true
});

// MÉTODO ESTÁTICO: Hashear password
userSchema.statics.hashPassword = async function(password) {
  if (!password) {
    throw new Error('Password is required');
  }
  return await bcrypt.hash(password, 10);
};

// MÉTODO DE INSTANCIA: Comparar password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ NUEVO: Método para verificar si la cuenta está bloqueada
userSchema.methods.isAccountLocked = function() {
  // Si la cuenta está bloqueada indefinidamente
  if (this.accountLocked && !this.accountLockedUntil) {
    return true;
  }
  
  // Si tiene un tiempo de bloqueo y aún no ha expirado
  if (this.accountLockedUntil && this.accountLockedUntil > new Date()) {
    return true;
  }
  
  // Si el tiempo de bloqueo ya expiró, desbloquear automáticamente
  if (this.accountLockedUntil && this.accountLockedUntil <= new Date()) {
    this.accountLocked = false;
    this.accountLockedUntil = null;
    this.failedLoginAttempts = 0;
  }
  
  return false;
};

// ✅ NUEVO: Método para bloquear cuenta temporalmente
userSchema.methods.lockAccount = async function(minutes = 30) {
  this.accountLocked = true;
  this.accountLockedUntil = new Date(Date.now() + minutes * 60 * 1000);
  await this.save();
};

// ✅ NUEVO: Método para desbloquear cuenta
userSchema.methods.unlockAccount = async function() {
  this.accountLocked = false;
  this.accountLockedUntil = null;
  this.failedLoginAttempts = 0;
  await this.save();
};

// ✅ NUEVO: Método para registrar login exitoso
userSchema.methods.recordSuccessfulLogin = async function(ip) {
  this.lastLoginAt = new Date();
  this.lastLoginIp = ip;
  this.failedLoginAttempts = 0;
  this.accountLocked = false;
  this.accountLockedUntil = null;
  await this.save();
};

// ✅ NUEVO: Método para incrementar intentos fallidos
userSchema.methods.incrementFailedAttempts = async function() {
  this.failedLoginAttempts += 1;
  
  // Bloquear cuenta después de 5 intentos fallidos (30 minutos)
  if (this.failedLoginAttempts >= 5) {
    await this.lockAccount(30);
  }
  
  await this.save();
};

// PRE-SAVE HOOK: Hashear password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// OCULTAR PASSWORD en JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.failedLoginAttempts;  // ✅ También ocultar info sensible
  return user;
};

export const User = mongoose.model('User', userSchema);