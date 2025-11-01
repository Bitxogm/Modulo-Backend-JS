# 🎓 CONTEXTO PROYECTO BACKEND - Node.js/Express/MongoDB

## 📋 INFORMACIÓN DEL ESTUDIANTE

- **Nivel:** Intermedio-avanzado
- **Bootcamp:** Desarrollo Backend con Node.js
- **SO:** Linux Ubuntu
- **Node.js:** v22.20.0
- **IDE:** VS Code
- **Ubicación:** Madrid, España
- **Fecha:** Octubre 2024

---

## 🛠️ STACK TECNOLÓGICO

### Dependencias de Producción
```json
{
  "express": "^4.21.1",
  "mongodb": "^6.10.0",
  "mongoose": "^8.8.3",
  "express-validator": "^7.2.0",
  "bcrypt": "^5.1.1",
  "express-rate-limit": "^7.4.1",
  "dotenv": "^16.4.5",
  "morgan": "^1.10.0",
  "ejs": "^3.1.10"
}
```

### Dependencias de Desarrollo
```json
{
  "nodemon": "^3.1.7",
  "cross-env": "^7.0.3"
}
```

### Configuración package.json
```json
{
  "type": "module",
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon bin/www",
    "start": "node bin/www"
  }
}
```

---

## 📁 ESTRUCTURA DE PROYECTO ESTABLECIDA
```
proyecto-backend/
├── bin/
│   └── www                          # Punto de entrada - Arranque del servidor
├── lib/
│   ├── connectMongo.js              # Conexión MongoDB (driver nativo)
│   ├── connectMongoose.js           # Conexión Mongoose
│   └── middlewares/
│       ├── authMiddleware.js        # Autenticación y autorización
│       ├── errorMiddleware.js       # Manejo de errores
│       ├── validarResultados.js     # Validación express-validator
│       ├── rateLimiter.js           # Rate limiting
│       └── checkAccountLock.js      # Verificación cuenta bloqueada
├── models/
│   ├── User.js                      # Schema Usuario con seguridad
│   ├── Agent.js                     # Ejemplo relaciones (ref: User)
│   └── SecurityLog.js               # Logs de auditoría
├── controllers/
│   ├── todosController.js           # Controlador Todos
│   ├── userController.js            # Controlador Usuarios
│   ├── agentController.js           # Controlador Agentes
│   └── authController.js            # Login, logout, seguridad
├── routes/
│   ├── web.routes.js                # Rutas web (EJS)
│   ├── api.routes.js                # Rutas API REST
│   └── auth.routes.js               # Rutas autenticación
├── views/                           # Plantillas EJS
├── public/                          # Archivos estáticos (CSS, JS, imágenes)
├── data/                            # Datos JSON (opcional)
├── .env                             # Variables de entorno
├── .gitignore                       # Archivos ignorados por Git
├── app.js                           # Configuración Express
└── package.json                     # Dependencias y scripts
```

---

## ✅ PATRÓN 1: VALIDACIONES CON EXPRESS-VALIDATOR

### Middleware Reutilizable: `validarResultados.js`
```javascript
import { validationResult } from 'express-validator';

export const validarResultados = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errors: errors.array().map(error => ({
        campo: error.path,
        mensaje: error.msg,
        valor: error.value,
        ubicacion: error.location
      }))
    });
  }
  
  next();
};
```

### Uso en Rutas
```javascript
import { body, param, query } from 'express-validator';
import { matchedData } from 'express-validator';
import { validarResultados } from '../lib/middlewares/validarResultados.js';

// Ejemplo: POST /api/users
router.post('/users',
  body('name', 'Name is required')
    .notEmpty()
    .bail()  // ✅ Detiene validación si falla
    .trim()
    .isLength({ min: 2, max: 100 }),

  body('email', 'Valid email is required')
    .notEmpty()
    .bail()
    .isEmail()
    .normalizeEmail(),

  body('password', 'Password is required')
    .notEmpty()
    .bail()
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
    .withMessage('Password must contain: uppercase, lowercase, number, special character'),

  validarResultados,  // ✅ Middleware de validación
  userController.add
);
```

### En el Controlador
```javascript
export const userController = {
  add: async (req, res) => {
    try {
      // ✅ Usar matchedData() - NUNCA req.body directamente
      const data = matchedData(req);
      
      // data contiene SOLO los campos validados
      const user = new User({
        name: data.name,
        email: data.email,
        password: data.password
      });
      
      await user.save();
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
      
    } catch (error) {
      console.error('[ERROR]', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};
```

### Conversiones y Validaciones Útiles
```javascript
// Números
query('limit').optional().isInt({ min: 1 }).toInt()

// Booleanos
query('completed').optional().isBoolean().toBoolean()

// ObjectId de MongoDB
param('id').isMongoId().withMessage('Invalid MongoDB ObjectId')

// Trim y normalización
body('name').trim()
body('email').normalizeEmail()

// Validación personalizada
body('age').custom((value) => {
  if (value < 18) {
    throw new Error('Must be 18 or older');
  }
  return true;
})
```

---

## ✅ PATRÓN 2: CONEXIÓN A BASE DE DATOS

### Opción Híbrida (Recomendada)

#### lib/connectMongo.js (MongoDB Driver Nativo)
```javascript
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

let db;
let client;
let isConnected = false;

export const connectDB = async () => {
  if (isConnected && db) {
    console.log('✅ MongoDB already connected, reusing connection');
    return db;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    const url = new URL(MONGO_URI);
    const dbName = url.pathname.slice(1) || 'nodeapi';
    db = client.db(dbName);
    isConnected = true;
    
    console.log(`✅ MongoDB Connected`);
    console.log(`📦 Database: ${db.databaseName}`);
    console.log(`🔗 Host: ${url.host}`);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    isConnected = false;
    throw error;
  }
};

export const getDB = () => {
  if (!db || !isConnected) {
    throw new Error('❌ Database not initialized. Call connectDB() first.');
  }
  return db;
};

export const closeDB = async () => {
  if (client && isConnected) {
    await client.close();
    console.log('👋 MongoDB connection closed');
    db = null;
    client = null;
    isConnected = false;
  }
};

export const checkConnection = () => {
  return isConnected && db !== null && client !== null;
};

process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});
```

#### bin/www (Punto de Entrada)
```javascript
import http from 'node:http';
import dotenv from 'dotenv';
import app from '../app.js';
import { connectDB, checkConnection } from '../lib/connectMongo.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    console.log('🔄 Starting application...');
    console.log(`📦 Environment: ${NODE_ENV}`);
    
    // ✅ Conectar a MongoDB ANTES de arrancar servidor
    if (!checkConnection()) {
      await connectDB();
    }
    
    console.log('🚀 Starting HTTP server...');
    const server = http.createServer(app);
    
    server.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log(`✅ [${NODE_ENV.toUpperCase()}] Server Ready`);
      console.log(`🚀 Server: http://localhost:${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`☠️  Press CTRL + C to Stop`);
      console.log('='.repeat(60) + '\n');
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('\n❌ STARTUP ERROR:', error.message);
    process.exit(1);
  }
};

startServer();
```

#### Uso en Controladores
```javascript
import { getDB } from '../lib/connectMongo.js';

// ✅ Obtener DB una sola vez
let db;
try {
  db = getDB();
  console.log('✅ Controller: DB initialized');
} catch (error) {
  console.error('⚠️ Controller: DB not initialized');
}

export const todoController = {
  getAll: async (req, res) => {
    try {
      const todos = await db.collection('todos').find().toArray();
      res.status(200).json({ success: true, data: todos });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
```

---

## ✅ PATRÓN 3: MODELOS MONGOOSE CON SEGURIDAD

### Modelo User con Seguridad Completa
```javascript
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
    select: false,  // ✅ 1ª protección: no se carga por defecto
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(password) {
        if (password.startsWith('$2b$') || password.startsWith('$2a$')) {
          return true;  // Ya hasheado
        }
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return regex.test(password);
      },
      message: 'Password must contain: uppercase, lowercase, number, special character'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // ✅ Campos de seguridad
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

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

userSchema.statics.hashPassword = async function(password) {
  if (!password) {
    throw new Error('Password is required');
  }
  return await bcrypt.hash(password, 10);
};

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isAccountLocked = function() {
  if (this.accountLocked && !this.accountLockedUntil) {
    return true;
  }
  if (this.accountLockedUntil && this.accountLockedUntil > new Date()) {
    return true;
  }
  if (this.accountLockedUntil && this.accountLockedUntil <= new Date()) {
    this.accountLocked = false;
    this.accountLockedUntil = null;
    this.failedLoginAttempts = 0;
  }
  return false;
};

userSchema.methods.lockAccount = async function(minutes = 30) {
  this.accountLocked = true;
  this.accountLockedUntil = new Date(Date.now() + minutes * 60 * 1000);
  await this.save();
};

userSchema.methods.unlockAccount = async function() {
  this.accountLocked = false;
  this.accountLockedUntil = null;
  this.failedLoginAttempts = 0;
  await this.save();
};

userSchema.methods.recordSuccessfulLogin = async function(ip) {
  this.lastLoginAt = new Date();
  this.lastLoginIp = ip;
  this.failedLoginAttempts = 0;
  this.accountLocked = false;
  this.accountLockedUntil = null;
  await this.save();
};

userSchema.methods.incrementFailedAttempts = async function() {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) {
    await this.lockAccount(30);
  }
  await this.save();
};

// ========================================
// PRE-SAVE HOOK: Hashear password automáticamente
// ========================================

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    if (!this.password.startsWith('$2b$') && !this.password.startsWith('$2a$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// ========================================
// ✅ 2ª protección: Ocultar password en JSON
// ========================================

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.failedLoginAttempts;
  return user;
};

export const User = mongoose.model('User', userSchema);
```

### Relaciones: Modelo con Referencias
```javascript
import mongoose, { Schema } from "mongoose";

const agentSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Must be 18 or older'],
    max: [130, 'Age cannot exceed 130']
  },
  // ✅ Relación con User
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',  // Referencia al modelo User
    required: [true, 'Owner is required'],
    index: true
  }
}, {
  timestamps: true
});

export const Agent = mongoose.model('Agent', agentSchema);

// Uso con populate:
// const agents = await Agent.find().populate('owner', 'name email');
```

---

## ✅ PATRÓN 4: SEGURIDAD COMPLETA

### A) Rate Limiting
```javascript
// lib/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,  // 5 intentos
  message: {
    success: false,
    message: 'Too many login attempts, try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests'
  }
});
```

### B) Security Logs
```javascript
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
      'account_locked',
      'account_unlocked',
      'password_changed'
    ],
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: String,
  reason: String,
  metadata: Object
}, {
  timestamps: true
});

export const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);
```

### C) Controlador de Autenticación
```javascript
// controllers/authController.js
import { matchedData } from 'express-validator';
import { User } from '../models/User.js';
import { SecurityLog } from '../models/SecurityLog.js';
import { checkAccountLock } from '../lib/middlewares/checkAccountLock.js';

export const authController = {
  login: async (req, res) => {
    try {
      const data = matchedData(req);
      const { email, password } = data;

      // 1. Buscar usuario
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
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

      // 2. Verificar bloqueo
      const lockStatus = checkAccountLock(user);
      if (lockStatus) {
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

      // 3. Verificar password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        await user.incrementFailedAttempts();
        
        await SecurityLog.create({
          userId: user._id,
          email,
          action: 'login_failed',
          ip: req.ip,
          userAgent: req.get('user-agent'),
          reason: 'Invalid password',
          metadata: { failedAttempts: user.failedLoginAttempts + 1 }
        });

        const attemptsLeft = 5 - (user.failedLoginAttempts + 1);
        let message = 'Invalid email or password';
        
        if (attemptsLeft > 0 && attemptsLeft <= 2) {
          message += `. ${attemptsLeft} attempt(s) remaining.`;
        }

        return res.status(401).json({
          success: false,
          message
        });
      }

      // 4. Login exitoso
      await user.recordSuccessfulLogin(req.ip);
      
      await SecurityLog.create({
        userId: user._id,
        email,
        action: 'login_success',
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user }
      });

    } catch (error) {
      console.error('[ERROR] login:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};
```

---

## ✅ PATRÓN 5: ESTRUCTURA DE RESPUESTAS

### Consistencia en TODAS las respuestas API
```javascript
// ✅ Éxito con datos
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "673a1234...",
    "name": "Juan",
    "email": "juan@example.com"
  }
}

// ✅ Éxito con lista
{
  "success": true,
  "count": 25,
  "data": [...]
}

// ❌ Error de validación
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "campo": "email",
      "mensaje": "Must be a valid email",
      "valor": "invalid",
      "ubicacion": "body"
    }
  ]
}

// ❌ Error general
{
  "success": false,
  "message": "User not found"
}

// ❌ Error de servidor
{
  "success": false,
  "error": "Database connection failed"
}
```

---

## 🚨 ERRORES COMUNES A EVITAR

### ❌ NO HACER:
```javascript
// ❌ Usar req.body directamente
const user = new User({
  name: req.body.name,
  email: req.body.email
});

// ❌ Olvidar async/await
getAll: (req, res) => {  // Sin async
  const users = User.find();  // Sin await
  res.json(users);  // Retorna Promise, no datos
}

// ❌ No usar try/catch
getAll: async (req, res) => {
  const users = await User.find();  // Puede lanzar error
  res.json(users);  // Sin manejo de errores
}

// ❌ Olvidar conversiones
query('limit').isInt()  // Sin .toInt()

// ❌ Exponer passwords
res.json(user);  // Sin toJSON() ni select: false
```

### ✅ HACER:
```javascript
// ✅ Usar matchedData
const data = matchedData(req);
const user = new User({
  name: data.name,
  email: data.email
});

// ✅ Siempre async/await
getAll: async (req, res) => {
  const users = await User.find();
  res.json(users);
}

// ✅ Siempre try/catch
getAll: async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// ✅ Conversiones explícitas
query('limit').isInt().toInt()

// ✅ Proteger passwords
password: { type: String, select: false }
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
}
```

---

## 📚 OPERACIONES CRUD COMPLETAS

### MongoDB Driver Nativo
```javascript
// CREATE
await db.collection('users').insertOne(newUser);

// READ (uno)
await db.collection('users').findOne({ _id: new ObjectId(id) });

// READ (todos)
await db.collection('users').find(query).toArray();

// UPDATE
await db.collection('users').findOneAndUpdate(
  { _id: new ObjectId(id) },
  { $set: updateData },
  { returnDocument: 'after' }
);

// DELETE
await db.collection('users').findOneAndDelete({ _id: new ObjectId(id) });
```

### Mongoose
```javascript
// CREATE
await User.create(data);
// O: const user = new User(data); await user.save();

// READ (uno)
await User.findById(id);
await User.findOne({ email });

// READ (todos)
await User.find(query);

// UPDATE
await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });

// DELETE
await User.findByIdAndDelete(id);

// POPULATE (relaciones)
await Agent.find().populate('owner', 'name email');
```

---

## 🎯 METODOLOGÍA DE TRABAJO

### Paso a Paso

1. **Leer enunciado completo** sin saltar nada
2. **Analizar y desglosar** en tareas pequeñas
3. **Crear estructura** de carpetas/archivos vacíos
4. **Implementar en orden:**
   - package.json y .env
   - Conexión a BD
   - Modelos (schemas)
   - Rutas con validaciones
   - Controladores
   - Middlewares
   - Testing
5. **Testing incremental** (probar cada endpoint con Postman)
6. **Debugging** cuando sea necesario
7. **Documentar** decisiones importantes

### Testing con Postman

**Colecciones organizadas:**
```
📁 Mi API
  📁 Auth
    - POST Login
    - POST Logout
  📁 Users
    - GET All Users
    - GET User by ID
    - POST Create User
    - PUT Update User
    - DELETE Delete User
  📁 Agents
    - ...
```

**Variables de entorno:**
```json
{
  "base_url": "http://localhost:4000",
  "user_id": "",
  "token": ""
}
```

**Scripts útiles:**
```javascript
// Guardar token después de login
pm.environment.set("token", pm.response.json().data.token);

// Guardar ID después de crear
pm.environment.set("user_id", pm.response.json().data._id);
```

---

## 📖 REFERENCIAS RÁPIDAS

### Express Validator

- **body()** - Valida campos del body
- **param()** - Valida parámetros de URL (:id)
- **query()** - Valida query strings (?page=1)
- **.bail()** - Detiene si falla la validación actual
- **.optional()** - Campo no requerido
- **.custom()** - Validación personalizada
- **matchedData()** - Obtiene SOLO campos validados

### Mongoose

- **Schema.Types.ObjectId** - Tipo para referencias
- **ref: 'Model'** - Define referencia a otro modelo
- **.populate()** - Cargar datos de referencia
- **.select()** - Incluir/excluir campos
- **.lean()** - Retornar objetos JS planos (más rápido)
- **pre('save')** - Middleware antes de guardar
- **methods** - Métodos de instancia
- **statics** - Métodos estáticos

### MongoDB Operadores

- **$set** - Actualizar campos
- **$inc** - Incrementar valor
- **$push** - Añadir a array
- **$pull** - Eliminar de array
- **$in** - Buscar en lista
- **$gt, $lt** - Mayor/menor que
- **$regex** - Búsqueda por patrón

---

## 🎬 LISTO PARA EMPEZAR

**Ahora pega el enunciado de tu ejercicio y comenzaremos:**

1. ✅ Análisis de requisitos
2. ✅ Estructura de archivos específica
3. ✅ Implementación paso a paso
4. ✅ Código completo de cada archivo
5. ✅ Ejemplos de testing
6. ✅ Debugging si es necesario

---

**ENUNCIADO DEL EJERCICIO:**

[PEGAR AQUÍ EL ENUNCIADO]