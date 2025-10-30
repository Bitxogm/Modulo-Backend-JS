// controllers/agentController.js
import { matchedData } from 'express-validator';
import { Agent } from '../models/Agent.js';

export const agentController = {

  /**
   * GET /api/agents
   * Obtener todos los agentes
   */
  getAll: async (req, res) => {
    try {
      const agents = await Agent.find();
      
      res.status(200).json({
        success: true,
        count: agents.length,
        data: agents
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
   * GET /api/agents/:id
   * Obtener un agente por ID
   */
  getOneById: async (req, res) => {
    try {
      const data = matchedData(req);

      const agent = await Agent.findById(data.id);

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      res.status(200).json({
        success: true,
        data: agent
      });

    } catch (error) {
      console.error('[ERROR] getOneById:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * POST /api/agents
   * Crear un nuevo agente
   */
  add: async (req, res) => {
    try {
      // ✅ Usar matchedData en lugar de req.body
      const data = matchedData(req);
      console.log('Datos validados:', data);

      // ✅ Verificar si el email ya existe
      const existingEmail = await Agent.findOne({ email: data.email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // ✅ Verificar si el nombre ya existe
      const existingName = await Agent.findOne({ name: data.name });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: 'Name already exists'
        });
      }

      // ✅ Crear agente con datos validados
      const agent = new Agent({
        name: data.name,
        email: data.email,
        age: data.age
      });

      const savedAgent = await agent.save();

      console.log('✅ Agente creado:', savedAgent._id);

      res.status(201).json({
        success: true,
        message: 'Agent created successfully',
        data: savedAgent
      });

    } catch (error) {
      console.error('[ERROR] add:', error.message);

      // ✅ Manejar error de duplicado (código 11000)
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      // ✅ Manejar errores de validación de Mongoose
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
   * PUT /api/agents/:id
   * Actualizar un agente
   */
  update: async (req, res) => {
    try {
      const data = matchedData(req);

      // Construir objeto de actualización
      const updateData = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.age !== undefined) updateData.age = data.age;

      const agent = await Agent.findByIdAndUpdate(
        data.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      console.log('✅ Agente actualizado:', agent._id);

      res.status(200).json({
        success: true,
        message: 'Agent updated successfully',
        data: agent
      });

    } catch (error) {
      console.error('[ERROR] update:', error.message);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * DELETE /api/agents/:id
   * Eliminar un agente
   */
  delete: async (req, res) => {
    try {
      const data = matchedData(req);

      const agent = await Agent.findByIdAndDelete(data.id);

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      console.log('✅ Agente eliminado:', agent._id);

      res.status(200).json({
        success: true,
        message: 'Agent deleted successfully',
        data: agent
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