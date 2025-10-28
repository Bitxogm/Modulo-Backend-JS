import { todos } from '../data/Todos.js';
import { matchedData, validationResult } from 'express-validator';


export const todoController = {

  getAllTodos: (req, res, next) => {
    let retTodos = todos;

    const result = validationResult(req);
    const data = matchedData(req);
    console.log({ result, data });
    if (result.errors.length > 0) {
      return res.status(400).json({
        errors: result.errors
      });
    }

    if (data.completed !== undefined) {
      retTodos = retTodos.filter(t => t.completed === data.completed)
    }

    if (data.userId !== undefined) {
      retTodos = retTodos.filter(t => t.userId === userId);
    }
    // Skip & Limit
    if (data.limit || data.skip) {
      const limit = data.limit;
      const skip = data.skip || 0; //Si no llega un skip, lo ponemos en 0.

      retTodos = retTodos.slice(skip, isNaN(limit) ? undefined : skip + limit);
    }
    res.status(200).json(retTodos)
  },

  getOneById: (req, res, next) => {

    const result = validationResult(req);
    const data = matchedData(req);
    console.log({ data, result });
       if ( result.errors.length > 0 ) {
            return res.status(400).json({
                errors: result.errors
            });
        }

    const todo = todos.find(t => t.id === data.id);
    if (!todo) {
      return next();
    }
    res.status(200).json(todo);
  },

  add: (req, res, next) => {

    const lastId = todos.toSorted((a, b) => b.id - a.id)[0].id;
    const nextId = lastId + 1;

    if (!req.body.todo || !req.body.userId) {
      return res.status(400).json({
        error: 'UserId and todo values are required',
      });
    }
    const newTodo = {
      id: nextId,
      todo: req.body.todo,
      completed: req.body.completed || false,
      userId: req.body.userId
    };
    todos.push(newTodo);
    res.status(201).json(
      newTodo
    );
  },

  update: (req, res, next) => {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(t => t.id === id);
    if (isNaN(id) || todoIndex === -1) {
      return next();
    }
    const updatedTodo = {
      id: todos[todoIndex].id,
      todo: req.body.todo,
      completed: req.body.completed || false,
      userId: req.body.userId
    };
    todos[findIndex] = updatedTodo;
    res.status(200).json(updatedTodo);
  },

  delete: (req, res, next) => {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(t => t.id === id);
    if (isNaN(id) || todoIndex === -1) {
      return next();
    }
    todos.splice(todoIndex, 1);
    res.status(200).end();
  }

};