import { matchedData } from 'express-validator';
import { todos } from '../data/Todos.js';

//Importaer conexion a la base de datos
import { getDB } from '../lib/connectMongo.js';
export const todoController = {

  /**
   * GET /todos
   * Query params: completed, userId, limit, skip
   */
  getAllTodos: async (req, res) => {
    // ✅ Ya no necesitas validar errores aquí
    // El middleware validarResultados ya lo hizo

    const data = matchedData(req);
    const filter = {}
    console.log('Query params validados:', data);

    let retTodos = [...todos]; // Copia para no mutar el original


    // Filtrar por completed
    if (data.completed !== undefined) {
      filter.completed = data.completed;
      // { completed : true || false}
      retTodos = retTodos.filter(t => t.completed === data.completed);
    }

    // Filtrar por userId
    if (data.userId !== undefined) {
      // {userId: data.userId}
      filter.userId = data.userId;
      retTodos = retTodos.filter(t => t.userId === data.userId);
    }

    // Aplicar skip y limit
    // if (data.skip !== undefined || data.limit !== undefined) {
    //   const skip = data.skip || 0;
    //   const end = data.limit ? skip + data.limit : undefined;
    //   retTodos = retTodos.slice(skip, end);
    // }

    //Otener de db
    const db = await getDB();
    const todosDB = await db.collection('todos')
      .find(filter)
      .skip(data.skip || 0)
      .limit(data.limit || 100)
      .toArray();
    console.log({ filter, todosDB })


    res.status(200).json({
      success: true,
      count: retTodos.length,
      data: todosDB
    });
  },

  /**
   * GET /todos/:id
   * Param: id
   */
  getOneById: (req, res) => {
    const data = matchedData(req);
    console.log('ID validado:', data);

    const todo = todos.find(t => t.id === data.id);

    if (!todo) {
      return res.status(404).json({
        success: false,  // ✅ Corregido el typo
        message: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      data: todo
    });
  },

  /**
   * POST /todos
   * Body: todo, userId, completed (opcional)
   */
  add: (req, res) => {
    const data = matchedData(req);
    console.log('Datos validados:', data);

    // Calcular siguiente ID
    const lastId = todos.length > 0
      ? Math.max(...todos.map(t => t.id))
      : 0;
    const nextId = lastId + 1;

    // ✅ Usar data en lugar de req.body
    const newTodo = {
      id: nextId,
      todo: data.todo,              // ✅ Corregido
      completed: data.completed || false,
      userId: data.userId
    };

    todos.push(newTodo);

    res.status(201).json({
      success: true,
      message: 'Todo creado con éxito',
      data: newTodo
    });
  },

  /**
   * PUT /todos/:id
   * Param: id
   * Body: todo, completed, userId (todos opcionales)
   */
  update: (req, res) => {
    const data = matchedData(req);
    console.log('Datos validados:', data);

    // Buscar todo
    const todoIndex = todos.findIndex(t => t.id === data.id);

    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,  // ✅ Corregido el typo
        message: 'Todo no encontrado'
      });
    }

    // ✅ Actualizar SOLO los campos que se enviaron
    const updatedTodo = {
      ...todos[todoIndex],  // Mantener datos existentes
      // Solo actualizar si el campo existe en data
      ...(data.todo !== undefined && { todo: data.todo }),
      ...(data.completed !== undefined && { completed: data.completed }),
      ...(data.userId !== undefined && { userId: data.userId })
    };

    todos[todoIndex] = updatedTodo;

    res.status(200).json({
      success: true,  // ✅ Corregido el typo
      message: 'Todo actualizado con éxito',
      data: updatedTodo
    });
  },

  /**
   * DELETE /todos/:id
   * Param: id
   */
  delete: (req, res) => {
    const data = matchedData(req);
    console.log('ID validado:', data);

    // Buscar todo
    const todoIndex = todos.findIndex(t => t.id === data.id);

    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,  // ✅ Corregido el typo
        message: 'Todo no encontrado'
      });
    }

    // Guardar el todo antes de eliminar (para la respuesta)
    const deletedTodo = todos[todoIndex];

    // Eliminar
    todos.splice(todoIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Todo eliminado con éxito',
      data: deletedTodo
    });
  }

};