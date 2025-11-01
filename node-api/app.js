// app.js
import express from 'express';
import session from 'express-session';        // ✅ NUEVO
import MongoStore from 'connect-mongo';       // ✅ NUEVO
import morgan from 'morgan';
import { renderFile } from 'ejs';

// Middlewares
import { filterAdminPath, filterFirefoxModern } from './lib/middlewares/authMiddleware.js'; 
import { serverErrorHandler, notFoundErrorHandler } from './lib/middlewares/errorMiddleware.js';
import { apiLimiter } from './lib/middlewares/rateLimiter.js';

// Routes
import { router } from './routes/web.routes.js';
import { router as apiRouter } from './routes/api.routes.js';
import { authRouter } from './routes/auth.routes.js';

const app = express();

// ========================================
// MIDDLEWARES DE PARSEO
// ========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// ✅ CONFIGURAR SESIONES
// ========================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'mi-secreto-super-seguro-cambiar-en-produccion',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/nodeapi',
    touchAfter: 24 * 3600,
    crypto: {
      secret: process.env.SESSION_SECRET || 'mi-secreto-super-seguro-cambiar-en-produccion'
    }
  })
}));

// ========================================
// STATIC FILES
// ========================================
app.use(express.static('public'));

// ========================================
// VIEW ENGINE
// ========================================
app.set('view engine', 'ejs');
app.engine('html', renderFile);
app.set('views', './views');

// ========================================
// VARIABLES GLOBALES
// ========================================
app.locals.appName = 'Node API';
app.locals.year = new Date().getFullYear();

// ========================================
// 3RD PARTY MIDDLEWARES
// ========================================
app.use(morgan('dev'));

// ========================================
// SETTINGS ENVIRONMENT
// ========================================
app.use((req, res, next) => {
  res.locals.env = process.env.NODE_ENV || 'development';
  res.locals.currentPath = req.path;
  res.locals.session = req.session || {};  // ✅ Pasar sesión a las vistas
  next();
});

// ========================================
// FILTER MIDDLEWARES
// ========================================
app.use(filterFirefoxModern);
app.use(filterAdminPath);

// ========================================
// RATE LIMITING
// ========================================
app.use('/api', apiLimiter);

// ========================================
// ROUTES
// ========================================
app.use('/', router);
app.use('/api', apiRouter);
app.use('/api/auth', authRouter);

// ========================================
// ERROR HANDLERS
// ========================================
app.use(notFoundErrorHandler);
app.use(serverErrorHandler);

export default app;