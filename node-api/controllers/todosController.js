import { todos } from '../data/Todos.js';

export const todosController = {
  getAllTodos: (req, res, next) => {
    let listTodos = todos.todos;

    if (req.query.userId) {
      const userId = Number(req.query.userId);

      if (Number.isNaN(userId)) {
        return res.status(400).json({
          message: "El userId  no es valido .Debe ser un numero"
        })
      }
      listTodos = listTodos.filter(todo => todo.userId === userId)
      console.log('Encontrados:', listTodos.length)
    }

    if (req.query.completed) {
      const completedLower = req.query.completed.toLowerCase();

      if (completedLower !== 'true' && completedLower !== 'false') {
        return res.status(400).json({
          message: " 'completed' deber ser tue o false'",
        })
      }
      const completed = completedLower === 'true'
      listTodos = listTodos.filter(todo => todo.completed === completed);
    }

    if (req.query.skip || req.query.limit) {
      const skip = parseInt(req.query.skip) || 0;
      const limit = parseInt(req.query.limit);

      listTodos = listTodos.slice(
        skip,
        isNaN(limit) ? undefined : skip + limit
      );
    }
    res.status(200).json(listTodos)
  },
  add: (req, res, next) => {

    // Validar el body
    const { todo, completed, userId } = req.body;

    //Comprobar campos
    if (!todo || !userId) {
      return res.status(400).json({
        message: "Faltan campos 'todo' y 'userId' "
      });
    }

    //Comprobar tipos
    if (typeof todo !== 'string') {
      return res.status(400).json({
        message: "El campo 'todo', dedbe ser string valido"
      });
    }
    if (isNaN(userId)) {
      return res.status(400).json({
        message: " El userId debe ser un numero"
      });
    }

    //Geenrar id 

    const ids = todos.todos.map(todo => todo.id);;
    const maxId = Math.max(...ids);
    const newId = maxId +1;

    //Crear el nuevo todo
    const newTodo = {
      id: newId,
      todo,
      completed: false, 
      userId,
    }

    //Añadir al array y actualizar total
    todos.todos.push(newTodo);
    todos.total = todos.todos.length;
    
    res.status(201).json({
      message: "Todo creado y añadido",
      todo: newTodo
    });
  },

  delete: (req, res, next) => {
    const id = Number(req.query.id);

    //Validar id
    if(isNaN(id)) {
      return res.status(400).json({
        message: "El id debe ser numero valido"
      });
    }

    //Encontrar indice
    const index = todos.todos.findIndex(todo => todo.id === id);
    if(index === -1) {
      return res.status(400).json({
        message: `No hay ningun todo con id ${id}`
      });
    }

    //Elimiar
    const deletedTodo = todos.todos.splice(index, 1)[0];

    //actualizar
    todos.total = todos.todos.length

    res.status(200).json({
      message: "Todo eliminado ",
      todo: deletedTodo,
    })


  }
}