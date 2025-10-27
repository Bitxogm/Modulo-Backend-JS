import express from 'express';

export const router = express.Router();

//Controllers.
import { todosController } from '../controllers/todosController.js';

// /todos => Devuelve todos los todos
router.get('/', todosController.getAllTodos);
router.post('/', todosController.add);
router.delete('/', todosController.delete);
