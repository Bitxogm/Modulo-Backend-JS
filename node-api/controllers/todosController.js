import { matchedData } from 'express-validator';
import { ObjectId } from 'mongodb';
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
  getOneById: async (req, res) => {
    const data = matchedData(req);
    console.log('ID validado:', data);

    // ✅ Obtener base de datos
    const db = getDB();

    // ✅ Validar que el ID sea válido
    if (!ObjectId.isValid(data.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    console.log('Buscando ID:', data.id);

    // const todo = todos.find(t => t.id === data.id);

    // ✅ Buscar en MongoDB
    console.log('Id:', data.id)
    const item = await db.collection('todos')
      .findOne({
        _id: ObjectId.createFromHexString(data.id),
      });

    if (!item) {
      return res.status(404).json({
        success: false,  // ✅ Corregido el typo
        message: 'Todo not found'
      });
    }

    console.log('Todo encontrado:', item);

    res.status(200).json({
      success: true,
      data: item
    });
  },

  /**
   * POST /todos
   * Body: todo, userId, completed (opcional)
   */
  add: async (req, res) => {

    //TODO: migrara a mongo
    try{

      const data = matchedData(req);
      console.log('Datos validados:', data);
      
      // ✅ Crear nuenvo todo
      const newTodo = {
        todo: data.todo,
        userId: data.userId,
        completed: data.completed || false,
        createdAt: new Date(),
      };
      
      // ✅ Obtener base de datos
      const db = await getDB();
      
      // ✅ Guardar en mongodb
      const result = await  db.collection('todos').insertOne(newTodo);
      
      res.status(201).json({
        success: true,
        message: 'Todo creado con éxito',
        data: {
          _id: result.insertId,
          ...newTodo
        }
      });
    }catch(error){
      console.error('Error al crear todo:', error.message);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * PUT /todos/:id
   * Param: id
   * Body: todo, completed, userId (todos opcionales)
   */
update: async (req, res) => {
  try {
    const data = matchedData(req);
    console.log('Datos validados:', data);

    // ✅ Construir objeto de actualización solo con campos proporcionados
    const updateData = {};
    
    if (data.todo !== undefined) {
      updateData.todo = data.todo;
    }
    
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
    }
    
    if (data.userId !== undefined) {
      updateData.userId = data.userId;
    }
    
    // Añadir fecha de actualización
    updateData.updatedAt = new Date();

    console.log('Campos a actualizar:', updateData);

    // ✅ Actualizar en MongoDB usando findOneAndUpdate
    const result = await db.collection('todos').findOneAndUpdate(
      { _id: new ObjectId(data.id) },  // ✅ Buscar por _id
      { $set: updateData },            // ✅ Actualizar campos
      { returnDocument: 'after' }      // ✅ Retornar documento actualizado
    );

    // ✅ Verificar si se encontró el documento
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Todo no encontrado'
      });
    }

    console.log('✅ Todo actualizado:', result._id);

    res.status(200).json({
      success: true,
      message: 'Todo actualizado con éxito',
      data: result
    });

  } catch (error) {
    console.error('[ERROR] update:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
},

  /**
   * DELETE /todos/:id
   * Param: id
   */
delete: (req, res) => {
 param('id', 'Invalid MongoDB ObjectId')
    .isMongoId()
    .withMessage('Must be a valid MongoDB ObjectId'),

  validarResultados,
  todoController.delete
},
};