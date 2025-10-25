
export function filterAdminPath(req, res, next) {
  // prefijo (incluye /admin/* y /admin?...)
  if (req.url?.startsWith('/admin')) {
    return res.status(403).send('Forbidden access to admin path');
  }
  next();
};

// Opción 1: La forma más segura y explícita (Doble Condición).
export function filterFirefox(req, res, next) {
  // 1. CONDICIÓN DE SEGURIDAD: Verifica si 'user-agent' existe. 
  //    Esto previene que la aplicación se caiga si la cabecera falta.
  // 2. CONDICIÓN LÓGICA: Solo si existe, verifica si incluye 'Firefox'.
  if (req.headers['user-agent'] && req.headers['user-agent'].includes('Firefox')) {
    // Si cumple la condición, termina la respuesta aquí.
    return res.status(403).send(`Forbidden  for firefox`);
  }
  // Si no es Firefox o la cabecera no existe, continúa al siguiente middleware/ruta.
  next();
};

// Opción 2: Usando Encadenamiento Opcional (?.), la sintaxis moderna.
// Es la más limpia y concisa, y hace exactamente lo mismo que la Opción 1.
export function filterFirefoxModern(req, res, next) {
  // 1. El '?' verifica la existencia de req.headers['user-agent'].
  // 2. Si existe, llama a .includes().
  // 3. Si NO existe (es undefined), la expresión completa devuelve undefined (falso), 
  //    evitando el crash y saltando al 'next()'.
  if (req.headers['user-agent']?.includes('Firefox')) {
    // Si cumple la condición, termina la respuesta aquí.
    return res.status(403).send(`Forbidden for firefox`);
  }
  next();
};

// Opción 3: ¡PELIGROSA! (No usar)
// Esta opción causará que tu servidor falle si la cabecera 'user-agent' está ausente.
/*
export function filterFirefoxDANGEROUS(req, res, next) {
  // ERROR: Si req.headers['user-agent'] es undefined, intentar llamar a .includes() 
  // sobre 'undefined' genera un TypeError y crashea el proceso de Node.js.
  if (req.headers['user-agent'].includes('Firefox')) { 
    return res.status(403).send(`Forbidden for firefox`);
  }
  next();
};
*/