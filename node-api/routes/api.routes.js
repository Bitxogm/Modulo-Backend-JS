import express from 'express';

// Controllers
import { healthCall } from '../controllers/healthController.js';
import {
  getDemo,
  getDownload,
  getFile,
  getRedirection,
  getEnd,
  getMultipleParams,
  getOneParamOptional,
  getParams,
} from '../controllers/demoController.js';

import { userController  } from '../controllers/userController.js';
import { router as todosRouter } from './todos.routes.js';

export const router = express.Router();

//Health endpoint
// Puedes acceder a este endpoint en /api/health o /api/ping
router.get(['/health', '/ping'], healthCall);

// Demo endpoint & Params
router.get('/demo', getDemo);

router.get('/download', getDownload);

router.get('/file', getFile);

router.get('/redirect', getRedirection);

router.get('/end', getEnd);

router.get('/params/:id', getParams);

router.get('/params/:company/:username/:number/:id', getMultipleParams);

// Optional parameters
router.get('/params/{:id}', getOneParamOptional);

//Users 
// /api/user => Devuelve todos los users
router.get('/users', userController.getAll);

//Como devolver un unico usuario.
router.get('/users/:id', userController.getuserById); 
router.post('/users', userController.add);

router.use('/todos', todosRouter);
