import express from 'express';
import morgan from 'morgan';
import { renderFile } from 'ejs';

// Middlewares.
import {  filterAdminPath, filterFirefox, filterFirefoxModern,  } from './lib/middlewares/authMiddleware.js'; 
import { serverErrorHandler, notFoundErrorHandler } from './lib/middlewares/errorMiddleware.js'; 

// Routes
import { router } from './routes/web.routes.js';
import {  router as apiRouter }  from './routes/api.routes.js';

const app = express();
app.use(express.json());

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.engine('html', renderFile); // Con esto escribimos nustros templatescon .html
app.set('views', './views');

// 3rd Party middlewares
app.use(morgan('dev'));

/**
 * Middlewares
 ********/
app.use((req, res, next) => {
  next();
});

// Settings Enviroment
app.use((req, res, next) => {
  res.locals.env = process.env.NODE_ENV;
  next();
})

/**
 * Filter middlewares
 */

app.use(filterFirefoxModern);
app.use( filterAdminPath); 

// ROUTES
app.use('/', router);
app.use('/api', apiRouter);

// Error Handlers
app.use(serverErrorHandler);

// 404 Error handler ttinene que estar al final.
app.use(notFoundErrorHandler);
export default app;