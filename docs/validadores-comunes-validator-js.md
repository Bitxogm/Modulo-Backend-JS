# Validadores Comunes - Validator.js

Resumen de los validadores más utilizados en controladores con la librería `validator.js`.

## 📦 Instalación

```bash
npm install express-validator
# o
yarn add validator
```

## 🔧 Importación

```javascript
//En las routes
// CommonJS 
const validator = require('validator');

// ES6 Modules
import validator from 'express-validator';

//En controladores
import { matchedData, validationResult } from 'express-validator';

// Importar validadores específicos
import isEmail from 'validator/lib/isEmail';
```

---

## 📋 Validadores Más Comunes

### 1. **isEmail()**

Valida direcciones de correo electrónico.

```javascript
import validator from 'validator';

// Validación básica
validator.isEmail('usuario@ejemplo.com'); // true
validator.isEmail('correo-invalido'); // false

// Con opciones avanzadas
validator.isEmail('Usuario@ejemplo.com', {
  allow_display_name: false,      // No permite "Nombre <email@ejemplo.com>"
  require_display_name: false,    // No requiere nombre
  allow_utf8_local_part: true,    // Permite UTF-8 en el local part
  require_tld: true,              // Requiere dominio de nivel superior (.com, .es, etc)
  allow_ip_domain: false,         // No permite IPs como dominio
  domain_specific_validation: true // Validación específica (ej: reglas de Gmail)
});
```

**Ejemplo en controlador:**
```javascript
async crearUsuario(req, res) {
  const { email } = req.body;
  
  if (!validator.isEmail(email)) {
    return res.status(400).json({ 
      error: 'Email inválido' 
    });
  }
  
  // Continuar con la lógica...
}
```

---

### 2. **isURL()**

Valida URLs (direcciones web).

```javascript
// Validación básica
validator.isURL('https://www.ejemplo.com'); // true
validator.isURL('ejemplo.com'); // false (sin protocolo)

// Con opciones
validator.isURL('https://ejemplo.com/ruta', {
  protocols: ['http', 'https', 'ftp'],  // Protocolos permitidos
  require_tld: true,                     // Requiere dominio (.com, .es, etc)
  require_protocol: true,                // Requiere http:// o https://
  require_valid_protocol: true,          // Protocolo debe estar en la lista
  allow_underscores: false,              // Permite guiones bajos
  allow_trailing_dot: false,             // Permite punto al final
  allow_protocol_relative_urls: false,   // Permite URLs como //ejemplo.com
  validate_length: true                  // Valida longitud (máx 2084)
});
```

**Ejemplo en controlador:**
```javascript
async agregarEnlace(req, res) {
  const { url } = req.body;
  
  if (!validator.isURL(url, { require_protocol: true })) {
    return res.status(400).json({ 
      error: 'URL inválida. Debe incluir http:// o https://' 
    });
  }
  
  // Guardar enlace...
}
```

---

### 3. **isAlpha() / isAlphanumeric()**

Valida que solo contenga letras o letras y números.

```javascript
// Solo letras
validator.isAlpha('Hola'); // true
validator.isAlpha('Hola123'); // false

// Con locale (idioma)
validator.isAlpha('Héctor', 'es-ES'); // true
validator.isAlpha('José', 'es-ES', { 
  ignore: ' -' // Ignora espacios y guiones
}); // true

// Letras y números
validator.isAlphanumeric('Usuario123'); // true
validator.isAlphanumeric('Usuario_123'); // false
```

**Ejemplo en controlador:**
```javascript
async crearUsuario(req, res) {
  const { username } = req.body;
  
  if (!validator.isAlphanumeric(username)) {
    return res.status(400).json({ 
      error: 'El nombre de usuario solo puede contener letras y números' 
    });
  }
  
  // Crear usuario...
}
```

---

### 4. **isInt() / isFloat() / isNumeric()**

Valida números enteros, decimales o numéricos.

```javascript
// Enteros
validator.isInt('42'); // true
validator.isInt('42.5'); // false

// Con rangos
validator.isInt('25', { 
  min: 18, 
  max: 100 
}); // true

validator.isInt('15', { 
  gt: 10,  // Greater than (mayor que)
  lt: 20   // Less than (menor que)
}); // true

// Decimales
validator.isFloat('42.5'); // true
validator.isFloat('42.5', { 
  min: 0.0, 
  max: 99.99 
}); // true

// Numéricos (enteros o decimales)
validator.isNumeric('123'); // true
validator.isNumeric('123.45'); // true
validator.isNumeric('123abc'); // false
```

**Ejemplo en controlador:**
```javascript
async crearProducto(req, res) {
  const { precio, stock } = req.body;
  
  if (!validator.isFloat(precio, { min: 0.01 })) {
    return res.status(400).json({ 
      error: 'El precio debe ser mayor a 0' 
    });
  }
  
  if (!validator.isInt(stock, { min: 0 })) {
    return res.status(400).json({ 
      error: 'El stock debe ser un número entero positivo' 
    });
  }
  
  // Crear producto...
}
```

---

### 5. **isLength()**

Valida la longitud de una cadena de texto.

```javascript
// Validación básica
validator.isLength('Hola', { min: 2, max: 10 }); // true
validator.isLength('Hi', { min: 3 }); // false

// Solo mínimo
validator.isLength('password123', { min: 8 }); // true

// Solo máximo
validator.isLength('Texto', { max: 10 }); // true

// Longitudes discretas (exactas)
validator.isLength('12345', { 
  discreteLengths: [5, 10, 15] 
}); // true
```

**Ejemplo en controlador:**
```javascript
async cambiarPassword(req, res) {
  const { password } = req.body;
  
  if (!validator.isLength(password, { min: 8, max: 50 })) {
    return res.status(400).json({ 
      error: 'La contraseña debe tener entre 8 y 50 caracteres' 
    });
  }
  
  // Cambiar contraseña...
}
```

---

### 6. **isEmpty()**

Verifica si una cadena está vacía (sin espacios en blanco).

```javascript
validator.isEmpty(''); // true
validator.isEmpty('   '); // true (espacios se consideran vacío)
validator.isEmpty('texto'); // false

// Con opciones
validator.isEmpty('   ', { 
  ignore_whitespace: false 
}); // false (no ignora espacios)
```

**Ejemplo en controlador:**
```javascript
async crearPost(req, res) {
  const { titulo, contenido } = req.body;
  
  if (validator.isEmpty(titulo) || validator.isEmpty(contenido)) {
    return res.status(400).json({ 
      error: 'El título y contenido son obligatorios' 
    });
  }
  
  // Crear post...
}
```

---

### 7. **isDate()**

Valida fechas en diversos formatos.

```javascript
// Validación básica
validator.isDate('2024-01-15'); // true
validator.isDate('31/12/2024'); // true
validator.isDate('fecha-invalida'); // false

// Con formato específico
validator.isDate('15-01-2024', {
  format: 'DD-MM-YYYY',      // Formato esperado
  strictMode: true,          // Modo estricto
  delimiters: ['-', '/']     // Delimitadores permitidos
}); // true

// Formatos válidos por defecto: YYYY/MM/DD, DD/MM/YYYY, DD-MM-YYYY, etc.
```

**Ejemplo en controlador:**
```javascript
async crearReserva(req, res) {
  const { fechaInicio, fechaFin } = req.body;
  
  if (!validator.isDate(fechaInicio) || !validator.isDate(fechaFin)) {
    return res.status(400).json({ 
      error: 'Fechas inválidas' 
    });
  }
  
  // Crear reserva...
}
```

---

### 8. **isMobilePhone()**

Valida números de teléfono móvil según el país.

```javascript
// Con locale específico
validator.isMobilePhone('+34612345678', 'es-ES'); // true (España)
validator.isMobilePhone('+521234567890', 'es-MX'); // true (México)
validator.isMobilePhone('+5491123456789', 'es-AR'); // true (Argentina)

// Cualquier locale
validator.isMobilePhone('+34612345678', 'any'); // true

// Con opciones
validator.isMobilePhone('+34612345678', 'es-ES', {
  strictMode: true  // Debe incluir código de país (+34)
});

// Locales disponibles: 'es-ES', 'es-MX', 'es-AR', 'en-US', 'fr-FR', etc.
```

**Ejemplo en controlador:**
```javascript
async actualizarPerfil(req, res) {
  const { telefono } = req.body;
  
  if (!validator.isMobilePhone(telefono, 'es-ES')) {
    return res.status(400).json({ 
      error: 'Número de teléfono inválido para España' 
    });
  }
  
  // Actualizar perfil...
}
```

---

### 9. **isStrongPassword()**

Valida la fortaleza de una contraseña.

```javascript
// Validación con opciones por defecto
validator.isStrongPassword('MiPassword123!'); // true

// Personalizar requisitos
validator.isStrongPassword('password', {
  minLength: 8,           // Longitud mínima
  minLowercase: 1,        // Mínimo de minúsculas
  minUppercase: 1,        // Mínimo de mayúsculas
  minNumbers: 1,          // Mínimo de números
  minSymbols: 1,          // Mínimo de símbolos (!@#$%^&*)
  returnScore: false      // Si es true, devuelve puntuación
}); // false

// Obtener puntuación de fortaleza
const score = validator.isStrongPassword('MiPassword123!', {
  returnScore: true
}); // Devuelve número (puntuación)
```

**Ejemplo en controlador:**
```javascript
async registrarUsuario(req, res) {
  const { password } = req.body;
  
  if (!validator.isStrongPassword(password, { minLength: 8 })) {
    return res.status(400).json({ 
      error: 'La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y símbolos' 
    });
  }
  
  // Registrar usuario...
}
```

---

### 10. **isCreditCard()**

Valida números de tarjeta de crédito.

```javascript
// Validación básica (cualquier proveedor)
validator.isCreditCard('4111111111111111'); // true (Visa)
validator.isCreditCard('5500000000000004'); // true (Mastercard)

// Validar proveedor específico
validator.isCreditCard('378282246310005', {
  provider: 'amex'  // 'visa', 'mastercard', 'amex', 'discover', etc.
}); // true
```

**Ejemplo en controlador:**
```javascript
async procesarPago(req, res) {
  const { numeroTarjeta } = req.body;
  
  if (!validator.isCreditCard(numeroTarjeta)) {
    return res.status(400).json({ 
      error: 'Número de tarjeta inválido' 
    });
  }
  
  // Procesar pago...
}
```

---

### 11. **isPostalCode()**

Valida códigos postales según el país.

```javascript
// Con locale específico
validator.isPostalCode('28001', 'ES'); // true (España)
validator.isPostalCode('06600', 'MX'); // true (México)
validator.isPostalCode('C1000', 'AR'); // true (Argentina)
validator.isPostalCode('10001', 'US'); // true (Estados Unidos)

// Validar cualquier formato
validator.isPostalCode('28001', 'any'); // true
```

**Ejemplo en controlador:**
```javascript
async crearDireccion(req, res) {
  const { codigoPostal, pais } = req.body;
  
  if (!validator.isPostalCode(codigoPostal, pais)) {
    return res.status(400).json({ 
      error: `Código postal inválido para ${pais}` 
    });
  }
  
  // Guardar dirección...
}
```

---

### 12. **isJSON()**

Valida si una cadena es JSON válido.

```javascript
validator.isJSON('{"nombre": "Juan"}'); // true
validator.isJSON('{"nombre": Juan}'); // false (falta comillas)
validator.isJSON('texto'); // false

// Permite primitivos
validator.isJSON('true', { 
  allow_primitives: true 
}); // true
validator.isJSON('null', { 
  allow_primitives: true 
}); // true
```

**Ejemplo en controlador:**
```javascript
async procesarConfiguracion(req, res) {
  const { configuracion } = req.body;
  
  if (!validator.isJSON(configuracion)) {
    return res.status(400).json({ 
      error: 'Configuración debe ser un JSON válido' 
    });
  }
  
  const config = JSON.parse(configuracion);
  // Procesar configuración...
}
```

---

### 13. **isBoolean()**

Valida valores booleanos.

```javascript
// Modo estricto (solo 'true', 'false', '0', '1')
validator.isBoolean('true'); // true
validator.isBoolean('false'); // true
validator.isBoolean('1'); // true
validator.isBoolean('0'); // true
validator.isBoolean('yes'); // false

// Modo flexible
validator.isBoolean('yes', { loose: true }); // true
validator.isBoolean('no', { loose: true }); // true
validator.isBoolean('TRUE', { loose: true }); // true
```

**Ejemplo en controlador:**
```javascript
async actualizarConfiguracion(req, res) {
  const { notificaciones } = req.body;
  
  if (!validator.isBoolean(notificaciones, { loose: true })) {
    return res.status(400).json({ 
      error: 'El valor de notificaciones debe ser booleano' 
    });
  }
  
  // Actualizar configuración...
}
```

---

### 14. **matches()**

Valida que una cadena coincida con una expresión regular.

```javascript
// Validación con regex
validator.matches('abc123', /^[a-z0-9]+$/); // true
validator.matches('ABC123', /^[a-z0-9]+$/); // false

// Con string y flags
validator.matches('ABC123', '[a-z0-9]+', 'i'); // true (ignora mayúsculas)

// Ejemplos comunes
// Solo letras y espacios
validator.matches('Juan Pérez', /^[a-záéíóúñ\s]+$/i); // true

// Formato específico (ej: código)
validator.matches('ABC-123', /^[A-Z]{3}-\d{3}$/); // true
```

**Ejemplo en controlador:**
```javascript
async validarCodigo(req, res) {
  const { codigoProducto } = req.body;
  
  // Formato: 3 letras mayúsculas + guión + 4 números
  if (!validator.matches(codigoProducto, /^[A-Z]{3}-\d{4}$/)) {
    return res.status(400).json({ 
      error: 'Formato de código inválido. Debe ser XXX-0000' 
    });
  }
  
  // Procesar código...
}
```

---

### 15. **isUUID()**

Valida identificadores UUID.

```javascript
// Cualquier versión
validator.isUUID('550e8400-e29b-41d4-a716-446655440000'); // true

// Versión específica
validator.isUUID('550e8400-e29b-41d4-a716-446655440000', 4); // true (v4)
validator.isUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 1); // true (v1)

// Versiones: 1, 2, 3, 4, 5, 'all'
```

**Ejemplo en controlador:**
```javascript
async obtenerUsuario(req, res) {
  const { id } = req.params;
  
  if (!validator.isUUID(id, 4)) {
    return res.status(400).json({ 
      error: 'ID de usuario inválido' 
    });
  }
  
  // Buscar usuario...
}
```

---

## 🧹 Sanitizadores Comunes

Los sanitizadores limpian y normalizan datos:

```javascript
import validator from 'validator';

// Escapar HTML
validator.escape('<script>alert("XSS")</script>');
// Resultado: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'

// Normalizar email
validator.normalizeEmail('USUARIO+tag@GMAIL.COM');
// Resultado: 'usuario@gmail.com'

// Trim (eliminar espacios)
validator.trim('  texto  '); // 'texto'

// Convertir a booleano
validator.toBoolean('yes', true); // true

// Convertir a entero
validator.toInt('42'); // 42

// Convertir a float
validator.toFloat('42.5'); // 42.5
```

**Ejemplo en controlador:**
```javascript
async crearUsuario(req, res) {
  let { email, nombre } = req.body;
  
  // Sanitizar datos
  email = validator.normalizeEmail(email);
  nombre = validator.trim(validator.escape(nombre));
  
  // Validar
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  
  // Crear usuario con datos limpios...
}
```

---

## 💡 Mejores Prácticas

### 1. **Combinación de validaciones**

```javascript
async crearUsuario(req, res) {
  const { email, password, username } = req.body;
  
  // Múltiples validaciones
  const errores = [];
  
  if (!validator.isEmail(email)) {
    errores.push('Email inválido');
  }
  
  if (!validator.isLength(username, { min: 3, max: 20 })) {
    errores.push('El username debe tener entre 3 y 20 caracteres');
  }
  
  if (!validator.isAlphanumeric(username)) {
    errores.push('El username solo puede contener letras y números');
  }
  
  if (!validator.isStrongPassword(password)) {
    errores.push('La contraseña no es lo suficientemente fuerte');
  }
  
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }
  
  // Continuar con la creación...
}
```

### 2. **Middleware de validación**

```javascript
// middleware/validacion.js
import validator from 'validator';

export const validarEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ 
      error: 'Email inválido o faltante' 
    });
  }
  
  next();
};

export const validarPassword = (req, res, next) => {
  const { password } = req.body;
  
  if (!password || !validator.isStrongPassword(password, { minLength: 8 })) {
    return res.status(400).json({ 
      error: 'La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas, números y símbolos' 
    });
  }
  
  next();
};

// Uso en rutas
import { validarEmail, validarPassword } from './middleware/validacion.js';

app.post('/registro', validarEmail, validarPassword, registrarUsuario);
```

### 3. **Sanitización antes de validación**

```javascript
async procesarFormulario(req, res) {
  // Primero sanitizar
  const email = validator.normalizeEmail(validator.trim(req.body.email));
  const nombre = validator.escape(validator.trim(req.body.nombre));
  
  // Luego validar
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  
  if (!validator.isLength(nombre, { min: 2, max: 50 })) {
    return res.status(400).json({ error: 'Nombre inválido' });
  }
  
  // Procesar con datos limpios y validados...
}
```

---

## 📚 Recursos Adicionales

- **Documentación oficial:** [https://github.com/validatorjs/validator.js](https://github.com/validatorjs/validator.js)
- **Lista completa de validadores:** Ver README del repositorio
- **Lista completa de locales:** Cada validador tiene su lista específica de locales soportados

---

## ⚠️ Notas Importantes

1. **Validator.js solo valida strings:** Si recibes otros tipos de datos, conviértelos a string primero: `input + ''`
2. **No reemplaza validación de negocio:** Estas son validaciones de formato, no de lógica de negocio
3. **Combinar con otros validadores:** Para validaciones complejas, considera usar librerías como `Joi` o `express-validator` que internamente usan `validator.js`
4. **Seguridad:** Siempre sanitiza los datos de entrada, especialmente si se mostrarán en HTML o se usarán en consultas SQL

---

**Fecha de creación:** 2024
**Versión de Validator.js:** Latest
