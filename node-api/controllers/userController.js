import users from '../users.json' with {type: 'json'};

export const userController = {

  getAll: (req, res, next) => {
    // 1. OBTENER TODOS LOS USUARIOS por su role
    let retUsers = users;
    if (req.query.role) {
      retUsers = users.filter(u => u.role === req.query.role);
    }

    // TODO => PAginacion skip y limit
    // if(req.query.skip){
    //   retUsers = retUsers.slice(skip);
    // }
    // if(req.query.limit){
    //   retUsers = retUsers.slice(0, limit);
    // }

    if (req.query.skip || req.query.limit) {
      const skip = parseInt(req.query.skip) || 0;
      const limit = parseInt(req.query.limit);
      console.log(skip, limit)
      retUsers = retUsers.slice(
        skip,
        isNaN(limit) ? undefined : skip + limit
      );
    }
    res.status(200).json(retUsers);
  },

  getuserById: (req, res, next) => {

    // 1. OBTENER Y CONVERTIR DE FORMA ESTRICTA
    // Usamos Number() para convertir la cadena completa. Si contiene letras, devuelve NaN.
    const id = Number(req.params.id);

    // 2. VALIDACIÓN DE ERROR (ESTRICTA)
    // Si la conversión resulta en NaN O si el número no es un entero, devolvemos 400.
    // if (isNaN(id) || !Number.isInteger(id)) ;

    // 2. VALIDACIÓN DE ERROR (MENOS ESTRICTA) , si el ID no es un número entrar por el 404 de la validacion de mas abajo  
    if (isNaN(id)) {
      // Devolvemos un error 400 (Bad Request)
      // return res.status(400).json({
      //   message: `El ID proporcionado ('${req.params.id}') no es un número entero válido.`
      // });
      //! Usamos next() para pasar el control al siguiente middleware (que maneja 404)
      return next();
    }

    // 3. LÓGICA DE BÚSQUEDA (Solo se ejecuta si el ID es válido)
    const user = users.find(u => u.id === id);

    if (!user) {
      // return res.status(404).json({Errormessage: `Usuario con ID ${id} no encontrado.` });
      //! Usamos next() para pasar el control al siguiente middleware (que maneja 404)
      return next()
    }
    res.status(200).json(user);
  },

  add: (req, res, next) => {
    console.log(req.body);
    res.end();
  },




}