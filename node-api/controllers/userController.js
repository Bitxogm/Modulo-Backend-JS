// controllers/userController.js
import { matchedData } from 'express-validator';
import { User } from '../models/User.js';

export const userController = {

  /**
   * GET /api/users
   * Obtener todos los usuarios
   */
  getAll: async (req, res, next) => {
    try {
      // ✅ Query para filtrar
      const query = {};
      if (req.query.role) {
        query.role = req.query.role;
      }

      // ✅ Obtener usuarios de MongoDB
      let users = await User.find(query).select('-password');

      // ✅ Paginación
      if (req.query.skip || req.query.limit) {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit);

        users = users.slice(skip, isNaN(limit) ? undefined : skip + limit);
      }

      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });

    } catch (error) {
      console.error('[ERROR] getAll:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/users/:id
   * Obtener un usuario por ID
   */
  getuserById: async (req, res, next) => {
    try {
      const data = matchedData(req);

      // ✅ Buscar en MongoDB por ObjectId
      const user = await User.findById(data.id).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('[ERROR] getuserById:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * POST /api/users
   * Crear un nuevo usuario
   */
  add: async (req, res, next) => {
    try {
      const data = matchedData(req);
      console.log('Datos validados:', data);

      // ✅ Verificar si el email ya existe
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // ✅ Crear usuario (password se hasheará automáticamente con pre-save hook)
      // 1️⃣ Crear instancia de User con password en texto plano
      const user = new User({
        name: data.name,
        email: data.email,
        password: data.password   // ⚠️ AÚN EN TEXTO PLANO: "secreto123"
      });
      
      // ✅ Guardar (el pre-save hook hasheará el password automáticamente)
      // 2️⃣ Llamar a save() - AQUÍ SE DISPARA EL PRE-SAVE HOOK
      
      console.log('Antes de save:', user.password);
      const savedUser = await user.save(); // 🔐 El pre-save hook hashea automáticamente

      console.log('Después de save:', user.password);

      console.log('✅ Usuario creado:', savedUser._id);

      // ✅ toJSON() oculta automáticamente el password
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: savedUser
      });

    } catch (error) {
      console.error('[ERROR] add:', error.message);

      // ✅ Manejo de error de email duplicado (código 11000 de MongoDB)
      if (error.code && error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // ✅ Errores de validación de Mongoose
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      // ✅ Otros errores
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * PUT /api/users/:id
   * Actualizar un usuario
   */
  update: async (req, res, next) => {
    try {
      const data = matchedData(req);

      // ✅ Construir objeto de actualización
      const updateData = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;

      // ✅ Si se actualiza el password, hashearlo
      if (data.password !== undefined) {
        updateData.password = await User.hashPassword(data.password);
      }

      const user = await User.findByIdAndUpdate(
        data.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('✅ Usuario actualizado:', user._id);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
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
   * DELETE /api/users/:id
   * Eliminar un usuario
   */
  delete: async (req, res, next) => {
    try {
      const data = matchedData(req);

      const user = await User.findByIdAndDelete(data.id).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('✅ Usuario eliminado:', user._id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: user
      });

    } catch (error) {
      console.error('[ERROR] delete:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

};