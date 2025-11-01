# Guía Completa: Express-Validator

## 📑 Índice
1. [Introducción](#introducción)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Conceptos Básicos](#conceptos-básicos)
4. [Validaciones](#validaciones)
5. [Sanitizaciones](#sanitizaciones)
6. [Manejo de Errores](#manejo-de-errores)
7. [Validaciones Personalizadas](#validaciones-personalizadas)
8. [Patrones y Mejores Prácticas](#patrones-y-mejores-prácticas)
9. [Ejemplos Completos](#ejemplos-completos)

---

# Introducción

## ¿Qué es Express-Validator?

**Express-validator** es un conjunto de middlewares para Express.js que permite validar y sanitizar datos de las peticiones HTTP. Internamente usa **validator.js**, pero proporciona una API mucho más conveniente y específica para Express.

### Características principales:

✅ Validación de `body`, `params`, `query`, `headers`, `cookies`
✅ Encadenamiento de validaciones
✅ Sanitización automática de datos
✅ Mensajes de error personalizables
✅ Validaciones condicionales
✅ Validaciones personalizadas
✅ TypeScript support

---

# Instalación y Configuración

## Instalación

```bash
npm install express-validator

# o
yarn add express-validator

# o
pnpm add express-validator
```

## Configuración Básica

```javascript
// app.js o server.js
import express from 'express';
import { body, validationResult } from 'express-validator';

const app = express();

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ejemplo básico de ruta con validación
app.post('/usuario',
  // Middleware de validación
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  
  // Controlador
  (req, res) => {
    // Obtener errores de validación
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Si llegamos aquí, los datos son válidos
    res.json({ mensaje: 'Usuario creado' });
  }
);

app.listen(3000);
```

---

# Conceptos Básicos

## Fuentes de Datos

Express-validator puede validar datos de diferentes fuentes:

```javascript
import { body, param, query, header, cookie } from 'express-validator';

// body - req.body
body('email').isEmail()

// param - req.params
param('id').isInt()

// query - req.query
query('page').isInt()

// header - req.headers
header('authorization').notEmpty()

// cookie - req.cookies
cookie('session').notEmpty()

// check - valida en todas las fuentes
check('email').isEmail()
```

## Estructura Básica

```javascript
app.post('/ruta',
  // 1. Middlewares de validación
  body('campo').validador().validador().sanitizador(),
  
  // 2. Middleware para manejar errores (opcional)
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  
  // 3. Controlador
  (req, res) => {
    // Datos validados y sanitizados
  }
);
```

---

# Validaciones

## 📋 Validaciones Básicas

### **notEmpty()** - No puede estar vacío

```javascript
body('nombre').notEmpty()
// Error si: '', undefined, null

body('nombre')
  .notEmpty()
  .withMessage('El nombre es obligatorio')
```

### **exists()** - Campo debe existir

```javascript
body('email').exists()
// Valida que el campo exista, aunque esté vacío

body('email')
  .exists()
  .withMessage('El email es requerido')
```

### **optional()** - Campo opcional

```javascript
body('telefono').optional().isMobilePhone()
// Solo valida si el campo está presente
// Si no está, no da error

body('descripcion')
  .optional({ checkFalsy: true })  // También trata '', 0, false como ausentes
  .isLength({ min: 10 })
```

---

## 📧 Validaciones de Strings

### **isEmail()** - Validar emails

```javascript
body('email').isEmail()

// Con opciones
body('email')
  .isEmail({
    allow_display_name: false,
    require_tld: true,
    allow_utf8_local_part: true,
    require_tld: true,
    ignore_max_length: false
  })
  .withMessage('Email inválido')
```

### **isLength()** - Longitud de string

```javascript
// Longitud exacta
body('codigo').isLength({ min: 6, max: 6 })

// Solo mínimo
body('password').isLength({ min: 8 })

// Solo máximo
body('nombre').isLength({ max: 50 })

// Ejemplo completo
body('username')
  .isLength({ min: 3, max: 20 })
  .withMessage('Username debe tener entre 3 y 20 caracteres')
```

### **isAlpha()** - Solo letras

```javascript
body('nombre').isAlpha()
// Solo a-z, A-Z

body('nombre').isAlpha('es-ES')
// Incluye ñ, acentos, etc.

body('nombre')
  .isAlpha('es-ES', { ignore: ' -' })  // Ignora espacios y guiones
  .withMessage('Solo letras permitidas')
```

### **isAlphanumeric()** - Letras y números

```javascript
body('username').isAlphanumeric()

body('username')
  .isAlphanumeric('es-ES', { ignore: '_-' })
  .withMessage('Solo letras, números, _ y -')
```

### **matches()** - Expresión regular

```javascript
// Código postal español
body('codigoPostal')
  .matches(/^\d{5}$/)
  .withMessage('Código postal inválido')

// Teléfono con formato específico
body('telefono')
  .matches(/^(\+34|0034|34)?[6789]\d{8}$/)
  .withMessage('Teléfono español inválido')

// Solo letras y espacios
body('nombre')
  .matches(/^[a-záéíóúñ\s]+$/i)
  .withMessage('Solo letras y espacios')
```

### **contains()** - Contiene texto

```javascript
body('descripcion')
  .contains('importante')
  .withMessage('Debe contener la palabra "importante"')
```

### **isIn()** - Valor está en lista

```javascript
body('rol')
  .isIn(['admin', 'usuario', 'moderador'])
  .withMessage('Rol inválido')

body('pais')
  .isIn(['ES', 'MX', 'AR', 'CO'])
  .withMessage('País no soportado')
```

---

## 🔢 Validaciones Numéricas

### **isInt()** - Número entero

```javascript
body('edad').isInt()

// Con rango
body('edad')
  .isInt({ min: 18, max: 120 })
  .withMessage('Edad debe estar entre 18 y 120')

// Mayor que / menor que
body('cantidad')
  .isInt({ gt: 0, lt: 100 })  // gt = greater than, lt = less than
  .withMessage('Cantidad entre 1 y 99')

// Sin ceros al inicio
body('codigo')
  .isInt({ allow_leading_zeroes: false })
```

### **isFloat()** - Número decimal

```javascript
body('precio').isFloat()

// Con rango
body('precio')
  .isFloat({ min: 0.01, max: 9999.99 })
  .withMessage('Precio inválido')

// Con locale para separador decimal
body('precio')
  .isFloat({ locale: 'es-ES' })  // Acepta 10,50 y 10.50
```

### **isNumeric()** - String numérico

```javascript
body('codigoPostal')
  .isNumeric()
  .withMessage('Solo números')

body('telefono')
  .isNumeric({ no_symbols: true })  // No permite +, -, .
```

---

## 🔗 Validaciones de URLs y Dominios

### **isURL()** - Validar URLs

```javascript
body('website').isURL()

// Con opciones
body('website')
  .isURL({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
    require_host: true,
    require_tld: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false
  })
  .withMessage('URL inválida')
```

### **isFQDN()** - Dominio válido

```javascript
body('dominio')
  .isFQDN({
    require_tld: true,
    allow_underscores: false,
    allow_trailing_dot: false
  })
  .withMessage('Dominio inválido')
```

---

## 📅 Validaciones de Fechas

### **isDate()** - Validar fecha

```javascript
body('fechaNacimiento').isDate()

// Con formato específico
body('fecha')
  .isDate({ format: 'DD/MM/YYYY' })
  .withMessage('Formato debe ser DD/MM/YYYY')

body('fecha')
  .isDate({ 
    format: 'YYYY-MM-DD',
    strictMode: true,
    delimiters: ['-', '/']
  })
```

### **isISO8601()** - Fecha ISO

```javascript
body('fechaCreacion')
  .isISO8601()
  .withMessage('Debe ser formato ISO 8601')

// Ejemplo: 2024-01-15T10:30:00Z
```

### **isBefore() / isAfter()** - Comparar fechas

```javascript
body('fechaInicio')
  .isBefore()  // Antes de hoy
  .withMessage('Fecha debe ser anterior a hoy')

body('fechaFin')
  .isAfter('2024-01-01')
  .withMessage('Fecha debe ser posterior al 01/01/2024')
```

---

## 🔒 Validaciones de Seguridad

### **isStrongPassword()** - Contraseña fuerte

```javascript
body('password').isStrongPassword()

// Con opciones personalizadas
body('password')
  .isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  .withMessage('Contraseña débil: mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos')

// Obtener puntuación
body('password')
  .isStrongPassword({ returnScore: true })
```

### **isJWT()** - Token JWT

```javascript
header('authorization')
  .isJWT()
  .withMessage('Token inválido')
```

---

## 💳 Validaciones Especializadas

### **isCreditCard()** - Tarjeta de crédito

```javascript
body('tarjeta').isCreditCard()

// Proveedor específico
body('tarjeta')
  .isCreditCard()
  .custom((value) => {
    // Validar proveedor manualmente si es necesario
    return true;
  })
```

### **isMobilePhone()** - Teléfono móvil

```javascript
body('telefono').isMobilePhone()

// Con locale específico
body('telefono')
  .isMobilePhone('es-ES')
  .withMessage('Teléfono español inválido')

// Múltiples locales
body('telefono')
  .isMobilePhone(['es-ES', 'es-MX', 'es-AR'])

// Con código de país obligatorio
body('telefono')
  .isMobilePhone('es-ES', { strictMode: true })  // Requiere +34
```

### **isPostalCode()** - Código postal

```javascript
body('codigoPostal')
  .isPostalCode('ES')
  .withMessage('Código postal español inválido')

body('codigoPostal')
  .isPostalCode('any')  // Cualquier formato válido
```

### **isIP()** - Dirección IP

```javascript
body('ip').isIP()

// Versión específica
body('ipv4').isIP(4)
body('ipv6').isIP(6)
```

### **isMACAddress()** - Dirección MAC

```javascript
body('mac')
  .isMACAddress()
  .withMessage('Dirección MAC inválida')
```

---

## 🆔 Validaciones de Identificadores

### **isUUID()** - UUID

```javascript
param('id').isUUID()

// Versión específica
param('id')
  .isUUID(4)
  .withMessage('UUID v4 inválido')
```

### **isMongoId()** - MongoDB ObjectId

```javascript
param('id')
  .isMongoId()
  .withMessage('ID de MongoDB inválido')
```

### **isISBN()** - ISBN de libro

```javascript
body('isbn')
  .isISBN()  // Cualquier versión

body('isbn')
  .isISBN(13)  // ISBN-13 específicamente
```

---

## 🎨 Validaciones de Formato

### **isHexColor()** - Color hexadecimal

```javascript
body('color')
  .isHexColor()
  .withMessage('Color hexadecimal inválido')  // #FFF o #FFFFFF
```

### **isJSON()** - JSON válido

```javascript
body('configuracion')
  .isJSON()
  .withMessage('JSON inválido')
```

### **isBase64()** - Base64

```javascript
body('imagen')
  .isBase64()
  .withMessage('Base64 inválido')
```

---

## ✅ Validaciones Booleanas

### **isBoolean()** - Valor booleano

```javascript
body('activo').isBoolean()

// Modo estricto (solo true/false)
body('activo')
  .isBoolean({ strict: true })

// Modo flexible (acepta 'yes', 'no', '1', '0')
body('activo')
  .isBoolean({ loose: true })
```

---

# Sanitizaciones

Las sanitizaciones limpian y transforman los datos **antes** de que lleguen al controlador.

## 🧹 Sanitizaciones de Strings

### **trim()** - Eliminar espacios

```javascript
body('nombre').trim()
// "  Juan  " → "Juan"

body('email')
  .trim()
  .isEmail()  // Valida después de limpiar
```

### **escape()** - Escapar HTML

```javascript
body('comentario').escape()
// "<script>alert('XSS')</script>" → "&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;&#x2F;script&gt;"

body('descripcion')
  .trim()
  .escape()
```

### **unescape()** - Revertir escape

```javascript
body('texto').unescape()
// "&lt;div&gt;" → "<div>"
```

### **normalizeEmail()** - Normalizar email

```javascript
body('email')
  .normalizeEmail()
  .isEmail()

// "USUARIO+tag@GMAIL.COM" → "usuario@gmail.com"

body('email')
  .normalizeEmail({
    gmail_remove_dots: true,
    gmail_remove_subaddress: true,
    outlookdotcom_remove_subaddress: true,
    yahoo_remove_subaddress: true,
    icloud_remove_subaddress: true
  })
```

### **toLowerCase()** - A minúsculas

```javascript
body('username').toLowerCase()
// "JuanPerez" → "juanperez"
```

### **toUpperCase()** - A mayúsculas

```javascript
body('codigo').toUpperCase()
// "abc123" → "ABC123"
```

---

## 🔢 Sanitizaciones Numéricas

### **toInt()** - Convertir a entero

```javascript
body('edad').toInt()
// "25" → 25

body('edad')
  .toInt()
  .isInt({ min: 18 })
```

### **toFloat()** - Convertir a decimal

```javascript
body('precio').toFloat()
// "19.99" → 19.99

body('precio')
  .toFloat()
  .isFloat({ min: 0 })
```

---

## ✅ Sanitizaciones Booleanas

### **toBoolean()** - Convertir a booleano

```javascript
body('activo').toBoolean()
// "true" → true
// "false" → false
// "1" → true
// "0" → false
// "" → false

body('activo')
  .toBoolean(true)  // Modo estricto: solo '1' y 'true' → true
```

---

## 📅 Sanitizaciones de Fechas

### **toDate()** - Convertir a fecha

```javascript
body('fecha').toDate()
// "2024-01-15" → Date object

body('fechaNacimiento')
  .toDate()
  .custom((value) => {
    // Validar que sea mayor de 18
    const edad = new Date().getFullYear() - value.getFullYear();
    if (edad < 18) throw new Error('Debe ser mayor de 18');
    return true;
  })
```

---

## 🧹 Sanitizaciones Personalizadas

### **customSanitizer()** - Sanitizador personalizado

```javascript
body('telefono')
  .customSanitizer((value) => {
    // Eliminar espacios, guiones y paréntesis
    return value.replace(/[\s\-()]/g, '');
  })
  .isMobilePhone('es-ES')

// "+34 612 34 56 78" → "+34612345678"

body('nombre')
  .customSanitizer((value) => {
    // Primera letra de cada palabra en mayúscula
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  })

// "juan pérez" → "Juan Pérez"
```

---

## 📋 Sanitizaciones de Arrays

### **toArray()** - Convertir a array

```javascript
body('tags').toArray()
// "tag1" → ["tag1"]
// ["tag1", "tag2"] → ["tag1", "tag2"]

body('tags')
  .toArray()
  .customSanitizer((tags) => {
    // Limpiar cada tag
    return tags.map(tag => tag.trim().toLowerCase());
  })
```

---

## ⛓️ Encadenamiento de Sanitizaciones

```javascript
body('email')
  .trim()              // 1. Eliminar espacios
  .toLowerCase()       // 2. A minúsculas
  .normalizeEmail()    // 3. Normalizar
  .isEmail()           // 4. Validar

body('username')
  .trim()
  .toLowerCase()
  .customSanitizer((value) => value.replace(/\s+/g, ''))
  .isAlphanumeric()

body('descripcion')
  .trim()
  .escape()
  .isLength({ max: 500 })
```

---

# Manejo de Errores

## Básico con validationResult

```javascript
import { validationResult } from 'express-validator';

app.post('/usuario',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  
  (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array() 
      });
    }
    
    res.json({ mensaje: 'Datos válidos' });
  }
);
```

## Formato de Errores

```javascript
// errors.array() devuelve:
[
  {
    "msg": "Invalid value",
    "param": "email",
    "location": "body",
    "value": "email-invalido"
  },
  {
    "msg": "Invalid value",
    "param": "password",
    "location": "body",
    "value": "123"
  }
]
```

## Middleware Personalizado para Errores

```javascript
// middleware/validarResultados.js
import { validationResult } from 'express-validator';

export const validarResultados = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        campo: err.param,
        mensaje: err.msg,
        valor: err.value
      }))
    });
  }
  
  next();
};

// Uso
app.post('/usuario',
  body('email').isEmail(),
  validarResultados,  // Middleware reutilizable
  crearUsuario
);
```

## Mensajes Personalizados con withMessage()

```javascript
body('email')
  .isEmail()
  .withMessage('El email no es válido')

body('password')
  .isLength({ min: 8 })
  .withMessage('La contraseña debe tener al menos 8 caracteres')
  .isStrongPassword()
  .withMessage('La contraseña debe incluir mayúsculas, minúsculas, números y símbolos')

body('edad')
  .isInt({ min: 18, max: 120 })
  .withMessage('La edad debe estar entre 18 y 120 años')
```

## Errores Agrupados por Campo

```javascript
// middleware/validarResultados.js
export const validarResultadosAgrupados = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const erroresAgrupados = {};
    
    errors.array().forEach(err => {
      if (!erroresAgrupados[err.param]) {
        erroresAgrupados[err.param] = [];
      }
      erroresAgrupados[err.param].push(err.msg);
    });
    
    return res.status(400).json({
      success: false,
      errors: erroresAgrupados
    });
  }
  
  next();
};

// Respuesta:
// {
//   "success": false,
//   "errors": {
//     "email": ["El email no es válido"],
//     "password": [
//       "La contraseña debe tener al menos 8 caracteres",
//       "La contraseña debe incluir mayúsculas, minúsculas, números y símbolos"
//     ]
//   }
// }
```

## matchedData() - Obtener solo datos validados

```javascript
import { matchedData } from 'express-validator';

app.post('/usuario',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('nombre').optional().trim(),
  validarResultados,
  
  (req, res) => {
    // matchedData solo devuelve los campos que pasaron la validación
    const datosValidados = matchedData(req);
    
    console.log(datosValidados);
    // { email: "...", password: "...", nombre: "..." }
    
    // req.body puede tener campos adicionales no validados
    console.log(req.body);
    // { email: "...", password: "...", nombre: "...", campoExtra: "..." }
    
    res.json(datosValidados);
  }
);
```

---

# Validaciones Personalizadas

## custom() - Validación personalizada

```javascript
// Validar que el email no esté registrado
body('email')
  .isEmail()
  .custom(async (email) => {
    const usuario = await Usuario.findOne({ email });
    if (usuario) {
      throw new Error('El email ya está registrado');
    }
    return true;
  })

// Validar que las contraseñas coincidan
body('confirmarPassword')
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Las contraseñas no coinciden');
    }
    return true;
  })

// Validar edad mínima desde fecha de nacimiento
body('fechaNacimiento')
  .isDate()
  .custom((value) => {
    const hoy = new Date();
    const fechaNac = new Date(value);
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    
    if (edad < 18) {
      throw new Error('Debes ser mayor de 18 años');
    }
    
    return true;
  })

// Validar con base de datos asíncrona
body('username')
  .isAlphanumeric()
  .custom(async (username) => {
    const existe = await Usuario.findOne({ username });
    if (existe) {
      throw new Error('Username no disponible');
    }
    return true;
  })

// Validar formato personalizado
body('telefono')
  .custom((value) => {
    const regexTelefono = /^(\+34|0034|34)?[6789]\d{8}$/;
    if (!regexTelefono.test(value)) {
      throw new Error('Formato de teléfono español inválido');
    }
    return true;
  })
```

## Validaciones con Acceso a req

```javascript
// Validar que el usuario sea el propietario
param('id')
  .isMongoId()
  .custom(async (id, { req }) => {
    const recurso = await Recurso.findById(id);
    
    if (!recurso) {
      throw new Error('Recurso no encontrado');
    }
    
    if (recurso.propietarioId.toString() !== req.usuario.id) {
      throw new Error('No tienes permiso para modificar este recurso');
    }
    
    return true;
  })

// Validar rol del usuario
body('rol')
  .isIn(['usuario', 'admin', 'moderador'])
  .custom((value, { req }) => {
    // Solo admins pueden crear otros admins
    if (value === 'admin' && req.usuario.rol !== 'admin') {
      throw new Error('No tienes permisos para crear administradores');
    }
    return true;
  })
```

---

# Validaciones Condicionales

## if() - Validar condicionalmente

```javascript
// Validar código postal solo si el país es España
body('codigoPostal')
  .if(body('pais').equals('ES'))
  .matches(/^\d{5}$/)
  .withMessage('Código postal español inválido')

// Validar teléfono solo si se proporciona
body('telefono')
  .if(body('telefono').exists())
  .isMobilePhone('es-ES')

// Diferentes validaciones según el tipo
body('valor')
  .if(body('tipo').equals('email'))
    .isEmail()
  .if(body('tipo').equals('telefono'))
    .isMobilePhone()

// Validar campos de dirección solo si envío a domicilio
body('direccion')
  .if(body('tipoEnvio').equals('domicilio'))
  .notEmpty()
  .withMessage('Dirección requerida para envío a domicilio')

body('ciudad')
  .if(body('tipoEnvio').equals('domicilio'))
  .notEmpty()

body('codigoPostal')
  .if(body('tipoEnvio').equals('domicilio'))
  .isPostalCode('ES')
```

## Validaciones basadas en otros campos

```javascript
// Fecha fin debe ser posterior a fecha inicio
body('fechaFin')
  .custom((value, { req }) => {
    if (new Date(value) <= new Date(req.body.fechaInicio)) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
    return true;
  })

// Precio con descuento debe ser menor que precio original
body('precioDescuento')
  .optional()
  .isFloat({ min: 0 })
  .custom((value, { req }) => {
    if (parseFloat(value) >= parseFloat(req.body.precio)) {
      throw new Error('El precio con descuento debe ser menor que el precio original');
    }
    return true;
  })
```

---

# Patrones y Mejores Prácticas

## 🏗️ Organización de Validadores

### Estructura recomendada:

```
proyecto/
├── middleware/
│   ├── validarResultados.js
│   └── autenticacion.js
├── validators/
│   ├── usuarioValidator.js
│   ├── productoValidator.js
│   ├── pedidoValidator.js
│   └── index.js
├── routes/
│   ├── usuarioRoutes.js
│   ├── productoRoutes.js
│   └── pedidoRoutes.js
└── controllers/
    ├── usuarioController.js
    ├── productoController.js
    └── pedidoController.js
```

### validators/usuarioValidator.js

```javascript
import { body, param } from 'express-validator';
import Usuario from '../models/Usuario.js';

// Validaciones reutilizables
const emailValidation = body('email')
  .trim()
  .toLowerCase()
  .normalizeEmail()
  .isEmail()
  .withMessage('Email inválido');

const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Mínimo 8 caracteres')
  .isStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  .withMessage('Contraseña débil: debe incluir mayúsculas, minúsculas, números y símbolos');

// Validador para registro
export const validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('Nombre requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-záéíóúñ\s]+$/i)
    .withMessage('Solo letras y espacios permitidos'),
  
  emailValidation
    .custom(async (email) => {
      const existe = await Usuario.findOne({ email });
      if (existe) {
        throw new Error('Email ya registrado');
      }
      return true;
    }),
  
  passwordValidation,
  
  body('confirmarPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  
  body('edad')
    .optional()
    .isInt({ min: 18, max: 120 })
    .withMessage('Edad debe estar entre 18 y 120'),
  
  body('telefono')
    .optional()
    .isMobilePhone('es-ES')
    .withMessage('Teléfono inválido'),
  
  body('aceptaTerminos')
    .isBoolean()
    .custom((value) => {
      if (!value) {
        throw new Error('Debes aceptar los términos y condiciones');
      }
      return true;
    })
];

// Validador para login
export const validarLogin = [
  emailValidation,
  
  body('password')
    .notEmpty()
    .withMessage('Contraseña requerida')
];

// Validador para actualización
export const validarActualizacion = [
  param('id')
    .isMongoId()
    .withMessage('ID inválido'),
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const usuario = await Usuario.findOne({ 
        email,
        _id: { $ne: req.params.id }
      });
      if (usuario) {
        throw new Error('Email ya en uso');
      }
      return true;
    }),
  
  body('telefono')
    .optional()
    .isMobilePhone('es-ES')
];

// Validador para cambio de contraseña
export const validarCambioPassword = [
  param('id')
    .isMongoId()
    .withMessage('ID inválido'),
  
  body('passwordActual')
    .notEmpty()
    .withMessage('Contraseña actual requerida'),
  
  passwordValidation,
  
  body('confirmarPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// Validador para eliminar
export const validarEliminar = [
  param('id')
    .isMongoId()
    .withMessage('ID inválido')
    .custom(async (id, { req }) => {
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      // Solo puede eliminar su propia cuenta o ser admin
      if (usuario._id.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
        throw new Error('No tienes permisos');
      }
      return true;
    })
];
```

### validators/productoValidator.js

```javascript
import { body, param, query } from 'express-validator';
import Producto from '../models/Producto.js';

export const validarCrearProducto = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('Nombre requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nombre debe tener entre 3 y 100 caracteres'),
  
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('Descripción requerida')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descripción debe tener entre 10 y 1000 caracteres'),
  
  body('precio')
    .isFloat({ min: 0.01 })
    .withMessage('Precio debe ser mayor a 0')
    .toFloat(),
  
  body('precioDescuento')
    .optional()
    .isFloat({ min: 0 })
    .toFloat()
    .custom((value, { req }) => {
      if (value >= req.body.precio) {
        throw new Error('Precio con descuento debe ser menor que el precio original');
      }
      return true;
    }),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock debe ser un número entero positivo')
    .toInt(),
  
  body('categoria')
    .isIn(['electronica', 'ropa', 'hogar', 'deportes', 'libros'])
    .withMessage('Categoría inválida'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags debe ser un array')
    .custom((tags) => {
      if (tags.some(tag => typeof tag !== 'string')) {
        throw new Error('Todos los tags deben ser strings');
      }
      return true;
    }),
  
  body('activo')
    .optional()
    .isBoolean()
    .toBoolean()
];

export const validarActualizarProducto = [
  param('id')
    .isMongoId()
    .withMessage('ID de producto inválido'),
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }),
  
  body('precio')
    .optional()
    .isFloat({ min: 0.01 })
    .toFloat(),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .toInt()
];

export const validarBuscarProductos = [
  query('categoria')
    .optional()
    .isIn(['electronica', 'ropa', 'hogar', 'deportes', 'libros']),
  
  query('precioMin')
    .optional()
    .isFloat({ min: 0 })
    .toFloat(),
  
  query('precioMax')
    .optional()
    .isFloat({ min: 0 })
    .toFloat()
    .custom((value, { req }) => {
      if (req.query.precioMin && parseFloat(value) < parseFloat(req.query.precioMin)) {
        throw new Error('Precio máximo debe ser mayor que precio mínimo');
      }
      return true;
    }),
  
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero mayor a 0')
    .toInt(),
  
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100')
    .toInt()
];

export const validarObtenerProducto = [
  param('id')
    .isMongoId()
    .withMessage('ID de producto inválido')
    .custom(async (id) => {
      const producto = await Producto.findById(id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      return true;
    })
];
```

### middleware/validarResultados.js

```javascript
import { validationResult } from 'express-validator';

export const validarResultados = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const erroresFormateados = errors.array().map(err => ({
      campo: err.param,
      mensaje: err.msg,
      valor: err.value,
      ubicacion: err.location
    }));
    
    return res.status(400).json({
      success: false,
      mensaje: 'Errores de validación',
      errors: erroresFormateados
    });
  }
  
  next();
};

// Versión con errores agrupados
export const validarResultadosAgrupados = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const erroresAgrupados = {};
    
    errors.array().forEach(err => {
      if (!erroresAgrupados[err.param]) {
        erroresAgrupados[err.param] = [];
      }
      erroresAgrupados[err.param].push(err.msg);
    });
    
    return res.status(400).json({
      success: false,
      mensaje: 'Errores de validación',
      errors: erroresAgrupados
    });
  }
  
  next();
};
```

### routes/usuarioRoutes.js

```javascript
import express from 'express';
import { 
  validarRegistro,
  validarLogin,
  validarActualizacion,
  validarCambioPassword,
  validarEliminar
} from '../validators/usuarioValidator.js';
import { validarResultados } from '../middleware/validarResultados.js';
import * as usuarioController from '../controllers/usuarioController.js';
import { autenticar, esAdmin } from '../middleware/autenticacion.js';

const router = express.Router();

// Rutas públicas
router.post('/registro', 
  validarRegistro,
  validarResultados,
  usuarioController.registrar
);

router.post('/login',
  validarLogin,
  validarResultados,
  usuarioController.login
);

// Rutas protegidas
router.get('/perfil',
  autenticar,
  usuarioController.obtenerPerfil
);

router.put('/:id',
  autenticar,
  validarActualizacion,
  validarResultados,
  usuarioController.actualizar
);

router.put('/:id/password',
  autenticar,
  validarCambioPassword,
  validarResultados,
  usuarioController.cambiarPassword
);

router.delete('/:id',
  autenticar,
  validarEliminar,
  validarResultados,
  usuarioController.eliminar
);

// Rutas de admin
router.get('/',
  autenticar,
  esAdmin,
  usuarioController.obtenerTodos
);

export default router;
```

---

## 🎯 Validaciones Comunes Reutilizables

### validators/validacionesComunes.js

```javascript
import { body, param } from 'express-validator';

// Email
export const emailValidation = () => 
  body('email')
    .trim()
    .toLowerCase()
    .normalizeEmail()
    .isEmail()
    .withMessage('Email inválido');

// Password fuerte
export const strongPasswordValidation = () =>
  body('password')
    .isLength({ min: 8 })
    .withMessage('Mínimo 8 caracteres')
    .isStrongPassword({
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage('Contraseña débil');

// MongoDB ID
export const mongoIdValidation = (paramName = 'id') =>
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} inválido`);

// Teléfono español
export const telefonoEspañolValidation = (fieldName = 'telefono') =>
  body(fieldName)
    .optional()
    .isMobilePhone('es-ES')
    .withMessage('Teléfono español inválido');

// URL
export const urlValidation = (fieldName = 'url') =>
  body(fieldName)
    .optional()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true
    })
    .withMessage('URL inválida');

// Fecha
export const fechaValidation = (fieldName, opciones = {}) =>
  body(fieldName)
    .isISO8601()
    .withMessage(`${fieldName} debe ser una fecha válida`)
    .custom((value) => {
      if (opciones.minDate && new Date(value) < new Date(opciones.minDate)) {
        throw new Error(`${fieldName} debe ser posterior a ${opciones.minDate}`);
      }
      if (opciones.maxDate && new Date(value) > new Date(opciones.maxDate)) {
        throw new Error(`${fieldName} debe ser anterior a ${opciones.maxDate}`);
      }
      return true;
    });

// Uso:
// import { emailValidation, strongPasswordValidation } from './validacionesComunes.js';
// 
// export const validarRegistro = [
//   emailValidation(),
//   strongPasswordValidation(),
//   ...
// ];
```

---

# Ejemplos Completos

## 📝 Sistema de Registro y Login

```javascript
// validators/authValidator.js
import { body } from 'express-validator';
import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';

export const validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('Nombre requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre entre 2 y 50 caracteres')
    .matches(/^[a-záéíóúñ\s]+$/i)
    .withMessage('Solo letras y espacios'),
  
  body('email')
    .trim()
    .toLowerCase()
    .normalizeEmail()
    .isEmail()
    .withMessage('Email inválido')
    .custom(async (email) => {
      const usuario = await Usuario.findOne({ email });
      if (usuario) {
        throw new Error('Email ya registrado');
      }
    }),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Mínimo 8 caracteres')
    .isStrongPassword()
    .withMessage('Contraseña débil'),
  
  body('confirmarPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Las contraseñas no coinciden')
];

export const validarLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .custom(async (email, { req }) => {
      const usuario = await Usuario.findOne({ email });
      if (!usuario) {
        throw new Error('Credenciales incorrectas');
      }
      req.usuario = usuario; // Guardar para el controlador
    }),
  
  body('password')
    .notEmpty()
    .withMessage('Contraseña requerida')
    .custom(async (password, { req }) => {
      if (req.usuario) {
        const esValido = await bcrypt.compare(password, req.usuario.password);
        if (!esValido) {
          throw new Error('Credenciales incorrectas');
        }
      }
    })
];

// routes/authRoutes.js
import express from 'express';
import { validarRegistro, validarLogin } from '../validators/authValidator.js';
import { validarResultados } from '../middleware/validarResultados.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/registro', 
  validarRegistro,
  validarResultados,
  authController.registrar
);

router.post('/login',
  validarLogin,
  validarResultados,
  authController.login
);

export default router;
```

## 🛒 Sistema de E-Commerce

```javascript
// validators/pedidoValidator.js
import { body } from 'express-validator';
import Producto from '../models/Producto.js';

export const validarCrearPedido = [
  body('productos')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un producto'),
  
  body('productos.*.productoId')
    .isMongoId()
    .withMessage('ID de producto inválido')
    .custom(async (productoId) => {
      const producto = await Producto.findById(productoId);
      if (!producto) {
        throw new Error(`Producto ${productoId} no encontrado`);
      }
      if (!producto.activo) {
        throw new Error(`Producto ${producto.nombre} no disponible`);
      }
    }),
  
  body('productos.*.cantidad')
    .isInt({ min: 1 })
    .withMessage('Cantidad debe ser mayor a 0')
    .custom(async (cantidad, { req, path }) => {
      const index = path.split('[')[1].split(']')[0];
      const productoId = req.body.productos[index].productoId;
      const producto = await Producto.findById(productoId);
      
      if (producto && cantidad > producto.stock) {
        throw new Error(`Stock insuficiente para ${producto.nombre}`);
      }
    }),
  
  body('direccionEnvio.calle')
    .trim()
    .notEmpty()
    .withMessage('Calle requerida'),
  
  body('direccionEnvio.ciudad')
    .trim()
    .notEmpty()
    .withMessage('Ciudad requerida'),
  
  body('direccionEnvio.codigoPostal')
    .isPostalCode('ES')
    .withMessage('Código postal español inválido'),
  
  body('metodoPago')
    .isIn(['tarjeta', 'paypal', 'transferencia'])
    .withMessage('Método de pago inválido'),
  
  body('tarjeta.numero')
    .if(body('metodoPago').equals('tarjeta'))
    .isCreditCard()
    .withMessage('Número de tarjeta inválido'),
  
  body('tarjeta.titular')
    .if(body('metodoPago').equals('tarjeta'))
    .trim()
    .notEmpty()
    .withMessage('Titular requerido'),
  
  body('tarjeta.vencimiento')
    .if(body('metodoPago').equals('tarjeta'))
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('Formato de vencimiento inválido (MM/YY)')
    .custom((value) => {
      const [mes, año] = value.split('/');
      const vencimiento = new Date(`20${año}`, mes - 1);
      if (vencimiento < new Date()) {
        throw new Error('Tarjeta vencida');
      }
      return true;
    }),
  
  body('tarjeta.cvv')
    .if(body('metodoPago').equals('tarjeta'))
    .matches(/^\d{3,4}$/)
    .withMessage('CVV inválido')
];
```

## 📝 Sistema de Blog

```javascript
// validators/postValidator.js
import { body, param, query } from 'express-validator';

export const validarCrearPost = [
  body('titulo')
    .trim()
    .notEmpty()
    .withMessage('Título requerido')
    .isLength({ min: 5, max: 200 })
    .withMessage('Título entre 5 y 200 caracteres'),
  
  body('contenido')
    .trim()
    .notEmpty()
    .withMessage('Contenido requerido')
    .isLength({ min: 50 })
    .withMessage('Contenido mínimo 50 caracteres'),
  
  body('resumen')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Resumen máximo 300 caracteres'),
  
  body('categoria')
    .isIn(['tecnologia', 'viajes', 'cocina', 'deportes', 'opinion'])
    .withMessage('Categoría inválida'),
  
  body('tags')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Máximo 5 tags'),
  
  body('tags.*')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Tags entre 2 y 20 caracteres'),
  
  body('publicado')
    .optional()
    .isBoolean()
    .toBoolean(),
  
  body('fechaPublicacion')
    .optional()
    .isISO8601()
    .custom((value, { req }) => {
      if (req.body.publicado && new Date(value) > new Date()) {
        throw new Error('No puedes publicar con fecha futura');
      }
      return true;
    })
];

export const validarBuscarPosts = [
  query('categoria')
    .optional()
    .isIn(['tecnologia', 'viajes', 'cocina', 'deportes', 'opinion']),
  
  query('autor')
    .optional()
    .isMongoId(),
  
  query('buscar')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Búsqueda mínimo 3 caracteres'),
  
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .toInt(),
  
  query('limite')
    .optional()
    .isInt({ min: 1, max: 50 })
    .toInt(),
  
  query('ordenar')
    .optional()
    .isIn(['recientes', 'populares', 'antiguos'])
];

export const validarComentario = [
  param('postId')
    .isMongoId()
    .withMessage('ID de post inválido'),
  
  body('texto')
    .trim()
    .notEmpty()
    .withMessage('Comentario requerido')
    .isLength({ min: 5, max: 500 })
    .withMessage('Comentario entre 5 y 500 caracteres')
    .customSanitizer((value) => {
      // Eliminar HTML
      return value.replace(/<[^>]*>/g, '');
    })
];
```

---

## 🎯 Resumen de Mejores Prácticas

### ✅ DO (Hacer):

1. **Siempre sanitiza antes de validar**
```javascript
body('email')
  .trim()              // Primero sanitizar
  .toLowerCase()
  .normalizeEmail()
  .isEmail()           // Luego validar
```

2. **Usa mensajes descriptivos**
```javascript
body('edad')
  .isInt({ min: 18 })
  .withMessage('Debes ser mayor de 18 años')
```

3. **Agrupa validaciones relacionadas**
```javascript
// validators/usuarioValidator.js
export const validarRegistro = [...]
export const validarLogin = [...]
export const validarActualizacion = [...]
```

4. **Usa middleware reutilizable**
```javascript
import { validarResultados } from '../middleware/validarResultados.js';

router.post('/ruta', 
  validaciones,
  validarResultados,  // Reutilizar
  controlador
);
```

5. **Valida con base de datos cuando sea necesario**
```javascript
body('email')
  .custom(async (email) => {
    const existe = await Usuario.findOne({ email });
    if (existe) throw new Error('Email ya registrado');
  })
```

### ❌ DON'T (No hacer):

1. **No repitas código de validación**
```javascript
// ❌ Malo
router.post('/ruta1', body('email').isEmail(), ...)
router.post('/ruta2', body('email').isEmail(), ...)

// ✅ Bueno
const emailValidation = body('email').isEmail()
router.post('/ruta1', emailValidation, ...)
router.post('/ruta2', emailValidation, ...)
```

2. **No confíes solo en validación frontend**
```javascript
// Siempre valida en el backend
```

3. **No olvides sanitizar**
```javascript
// ❌ Malo
body('comentario').isLength({ max: 500 })

// ✅ Bueno
body('comentario')
  .trim()
  .escape()  // Previene XSS
  .isLength({ max: 500 })
```

4. **No uses validaciones genéricas**
```javascript
// ❌ Malo
body('campo').notEmpty()

// ✅ Bueno
body('email')
  .notEmpty()
  .withMessage('El email es obligatorio')
```

---

## 📚 Recursos Adicionales

- **Documentación oficial:** [express-validator.github.io](https://express-validator.github.io/)
- **validator.js (funciones base):** [github.com/validatorjs/validator.js](https://github.com/validatorjs/validator.js)
- **Ejemplos oficiales:** [github.com/express-validator/express-validator/tree/master/examples](https://github.com/express-validator/express-validator/tree/master/examples)

---

**Creado:** 2024
**Versión:** Express-Validator v7.x
