import { validationResult } from 'express-validator';

export const validarResultados = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        campo: err.param,
        mensaje: err.msg,
        valor: err.value,
        ubicacion: err.location
      }))
    });
  }
  
  next();
};