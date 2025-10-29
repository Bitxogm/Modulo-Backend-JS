import express from 'express';
import { param, query, body } from 'express-validator';

// Controllers
import { todoController } from '../controllers/todosController.js';
import { userController } from '../controllers/userController.js';
import { agentController } from '../controllers/agentController.js';
import { validarResultados } from '../controllers/validarResultados.js';

export const router = express.Router();

// ============================================
// TODOS
// ============================================

/**
 * GET /todos
 * Query params: completed, userId, limit, skip
 */
router.get('/todos',
  query('completed', 'Must be a boolean')
    .optional()
    .isBoolean()
    .toBoolean(),

  query('limit', 'Must be a positive number')
    .optional()
    .isInt({ min: 1 })
    .toInt(),

  query('skip', 'Must be zero or positive')
    .optional()
    .isInt({ min: 0 })
    .toInt(),

  query('userId', 'Must be a positive number')
    .optional()
    .isInt({ min: 1 })
    .toInt(),

  validarResultados,
  todoController.getAllTodos
);

/**
 * GET /todos/:id
 * Param: id
 */
router.get('/todos/:id',
  param('id', 'Invalid ID')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive number')
    .toInt(),

  validarResultados,
  todoController.getOneById
);

/**
 * POST /todos
 * Body: { todo, userId, completed? }
 */
router.post('/todos',
  body('todo', 'Todo is required')
    .notEmpty()
    .bail()  // ✅ Detiene si falla
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Todo must be between 3 and 100 characters'),

  body('userId', 'User ID is required')
    .notEmpty()
    .bail()  // ✅ Detiene si falla
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive number')
    .toInt(),

  body('completed', 'Must be a boolean')
    .optional()
    .isBoolean()
    .toBoolean(),

  validarResultados,
  todoController.add
);

/**
 * PUT /todos/:id
 * Param: id
 * Body: { todo?, completed?, userId? }
 */
router.put('/todos/:id',
  param('id', 'Invalid ID')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive number')
    .toInt(),

  body('todo')
    .optional()
    .trim()
    .bail()  // ✅ Detiene si falla
    .isLength({ min: 3, max: 100 })
    .withMessage('Todo must be between 3 and 100 characters'),

  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Must be a boolean')
    .toBoolean(),

  body('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive number')
    .toInt(),

  body()
    .custom((_value, { req }) => {
      const hasField = 
        req.body.todo !== undefined || 
        req.body.completed !== undefined || 
        req.body.userId !== undefined;
      
      if (!hasField) {
        throw new Error('At least one field must be provided');
      }
      return true;
    }),

  validarResultados,
  todoController.update
);

/**
 * DELETE /todos/:id
 * Param: id
 */
router.delete('/todos/:id',
  param('id', 'Invalid ID')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive number')
    .toInt(),

  validarResultados,
  todoController.delete
);

// ============================================
// USERS
// ============================================

router.get('/users', userController.getAll);

router.get('/users/:id',
  param('id', 'Invalid user ID')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive number')
    .toInt(),
  validarResultados,
  userController.getuserById
);

router.post('/users',
  body('name', 'Name is required')
    .notEmpty()
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email', 'Email is required')
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),
  
  validarResultados,
  userController.add
);

// ============================================
// AGENTS
// ============================================

router.post('/agents',
  body('name', 'Name is required')
    .notEmpty()
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email', 'Email is required')
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),
  
  validarResultados,
  agentController.add
);