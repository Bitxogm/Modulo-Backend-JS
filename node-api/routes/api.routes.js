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
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage('ID must be 24 characters')
    .matches(/^[a-f0-9]{24}$/i)
    .withMessage('ID must be a valid MongoDB ObjectId'),

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
    .bail()
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
  // Validar ID en URL
  param('id', 'Invalid MongoDB ObjectId')
    .isMongoId()
    .withMessage('Must be a valid MongoDB ObjectId'),

  // Validar body (todos opcionales)
  body('todo')
    .optional()
    .trim()
    .bail()
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

  // Validar que al menos un campo esté presente
  body()
    .custom((value, { req }) => {
      const hasField =
        req.body.todo !== undefined ||
        req.body.completed !== undefined ||
        req.body.userId !== undefined;

      if (!hasField) {
        throw new Error('At least one field (todo, completed, userId) must be provided');
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
  // Validar name
  body('name', 'Name is required')
    .notEmpty()
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  // Validar email
  body('email', 'Valid email is required')
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),

  // ✅ Validar password (esto faltaba)
  body('password', 'Password is required')
    .notEmpty()
    .bail()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  validarResultados,
  userController.add
);
// ============================================
// AGENTS
// ============================================

/**
 * AGENTS routes
 *
 * Routes for managing agents; controller implementations should live in
 * ../controllers/agentController.js — this file only defines the routes and validations.
 */

// GET /agents
router.get('/agents',
  validarResultados,
  agentController.getAll
);

// GET /agents/:id
router.get('/agents/:id',
  param('id', 'Invalid agent ID')
    .isMongoId()
    .withMessage('Must be a valid MongoDB ObjectId'),

  validarResultados,
  agentController.getOneById
);

// POST /agents
router.post('/agents',
  body('name', 'Name is required')
    .notEmpty()
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email', 'Valid email is required')
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),

  body('age', 'Age must be a non-negative integer')
    .optional()
    .isInt({ min: 0 })
    .toInt(),

  validarResultados,
  agentController.add
);

// PUT /agents/:id
router.put('/agents/:id',
  param('id', 'Invalid agent ID')
    .isMongoId()
    .withMessage('Must be a valid MongoDB ObjectId'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),

  body('age')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Age must be a non-negative integer')
    .toInt(),

  // Require at least one field to update
  body()
    .custom((value, { req }) => {
      const hasField =
        req.body.name !== undefined ||
        req.body.email !== undefined ||
        req.body.age !== undefined;

      if (!hasField) {
        throw new Error('At least one field (name, email, age) must be provided');
      }
      return true;
    }),

  validarResultados,
  agentController.update
);

// DELETE /agents/:id
router.delete('/agents/:id',
  param('id', 'Invalid agent ID')
    .isMongoId()
    .withMessage('Must be a valid MongoDB ObjectId'),

  validarResultados,
  agentController.delete
);