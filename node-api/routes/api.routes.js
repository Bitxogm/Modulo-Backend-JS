import express from 'express';
import { param, query } from 'express-validator'

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

import { userController } from '../controllers/userController.js';
import { todoController } from '../controllers/todosController.js';

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
router.get('/users/:id', userController.getuserById); //<--   Paramentros en la url , req.params contien lsos parametros
router.post('/users', userController.add);

//:TODOS
router.get('/todos',
  //validaciones
  query('completed', 'Must be a boolean')
    //Vaslida opcional
    .optional()
    //Valida a boolean
    .isBoolean()
    //Sanitiza a booleano
    .toBoolean(),

  // !Validar skip y lilmit
  query('limit', 'Must be a pòsitive number')
    .optional()
    .isNumeric({
      min: 1
    })
    .toInt(),

  query('skip', 'Must be a positive number')
    .optional()
    .isNumeric({
      min: 1,
    })
    .toInt(),

  //!Validar userId
  query('userID', 'Must be a nuimber')
    .notEmpty()
    .isNumeric()
    .toInt(),
  //Controlador
  todoController.getAllTodos);

router.get('/todos/:id',
  param('id', 'Must be a number')
    .notEmpty()
    .isNumeric()
    .toInt(),
  todoController.getOneById);

router.post('/todos', todoController.add);
router.put('/todos/:id', todoController.update);
router.delete('/todos/:id', todoController.delete);