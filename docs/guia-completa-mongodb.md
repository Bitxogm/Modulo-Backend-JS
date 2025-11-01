# 📚 Guía Completa de MongoDB para Desarrolladores

## 🎯 1) ¿Qué es MongoDB y cuándo usarlo?

MongoDB es una **base de datos NoSQL orientada a documentos**. En lugar de tablas con filas y columnas (como SQL), guarda datos en **documentos BSON** (JSON binario) dentro de **colecciones**.

### 🔄 NoSQL vs SQL: La diferencia clave
```
SQL (Relacional)               →  MongoDB (Documentos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tablas                         →  Colecciones
Filas                          →  Documentos
Columnas                       →  Campos (fields)
Esquema rígido                 →  Esquema flexible
JOINs entre tablas             →  Documentos embebidos/referencias
```

### ✅ Usa MongoDB cuando:
- 📈 **Esquema evolutivo**: tu modelo de datos cambia frecuentemente
- 🌳 **Datos jerárquicos/anidados**: productos con variantes, perfiles de usuario, carritos de compra, logs estructurados
- 🚀 **Escalabilidad horizontal**: necesitas distribuir datos en múltiples servidores
- ⚡ **Alto rendimiento en lectura/escritura**: aplicaciones en tiempo real
- 📊 **Prototipado rápido**: no quieres definir esquemas complejos desde el inicio

### ❌ NO uses MongoDB cuando:
- 💰 **Transacciones complejas multi-entidad** son críticas (banca, finanzas)
- 🔗 **JOINs pesados y frecuentes** entre múltiples entidades
- 📐 **Esquema estable y relaciones complejas** que no cambian
- 🎯 **Consultas ad-hoc complejas** sobre datos altamente relacionales

---

## 🐳 2) Instalación rápida

### Opción A: Docker (⭐ Recomendada para desarrollo)
```bash
# Levanta MongoDB en local (usuario/clave: root/secret)
docker run -d --name mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  mongo:7

# Verifica que esté corriendo
docker ps
```

**Conecta con mongosh:**
```bash
# Si tienes mongosh instalado localmente
mongosh "mongodb://root:secret@localhost:27017"

# O usa Docker para ejecutar mongosh
docker exec -it mongodb mongosh -u root -p secret
```

### Opción B: Instalación nativa
- 🖥️ **Servidor**: `mongod` (el daemon de MongoDB)
- 💻 **Cliente CLI**: `mongosh` (shell moderna, reemplaza a `mongo`)
- 🎨 **GUI opcional**: MongoDB Compass (interfaz gráfica oficial)

**Instalar en Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

---

## 🧩 3) Conceptos básicos (Arquitectura de MongoDB)

```
MongoDB Server
    │
    ├─── 📂 Base de Datos (tienda)
    │       │
    │       ├─── 📋 Colección (productos)
    │       │       ├─── 📄 Documento { _id: 1, nombre: "Camiseta", precio: 19.99 }
    │       │       ├─── 📄 Documento { _id: 2, nombre: "Pantalón", precio: 39.90 }
    │       │       └─── 📄 Documento { _id: 3, ... }
    │       │
    │       └─── 📋 Colección (pedidos)
    │               └─── 📄 Documentos...
    │
    └─── 📂 Base de Datos (usuarios)
```

### 🔑 Conceptos clave:

- **🗄️ Base de datos (db)**: Contenedor lógico de colecciones. Puedes tener múltiples bases de datos en un servidor.

- **📋 Colección**: Conjunto de documentos (similar a una tabla SQL, pero sin esquema fijo). No necesitas crearla explícitamente.

- **📄 Documento**: Objeto BSON (JSON binario). Cada documento tiene un campo `_id` único (autoasignado si no lo proporcionas).

- **🔍 Índice**: Estructura de datos que acelera las consultas (similar a SQL). Sin índices, MongoDB hace un COLLSCAN (escaneo completo).

- **⚙️ Agregación**: Pipeline de operaciones para transformar, filtrar y agrupar datos (similar a GROUP BY + funciones de agregación en SQL).

- **💾 BSON**: Formato binario de JSON que soporta más tipos de datos (Date, ObjectId, Binary, etc.) y es más eficiente.

---

## 🚀 4) Tu primera conexión y base de datos

Abre `mongosh` y prueba:

```javascript
// 📊 Muestra todas las bases de datos
show dbs

// 🎯 Cambia a una base de datos (la crea si no existe)
use tienda

// ✅ Comprueba dónde estás
db.getName()  // → "tienda"

// 📋 Lista las colecciones de la BD actual
show collections

// ℹ️ Info del servidor
db.version()
db.serverStatus()
```

> 💡 **Nota**: La base de datos no se crea realmente hasta que insertes el primer documento.

---

## ✍️ 5) Crear una colección y documentos (C de CRUD)

### Insertar UN documento
```javascript
// La colección 'productos' se crea automáticamente si no existe
db.productos.insertOne({
  nombre: "Camiseta básica",
  precio: 19.99,
  categorias: ["ropa", "camisetas"],  // 📦 Array
  stock: 120,
  activo: true,
  variantes: [                        // 🌳 Subdocumentos anidados
    { color: "negro", talla: "M", sku: "CAM-NEG-M" },
    { color: "blanco", talla: "L", sku: "CAM-BLA-L" }
  ],
  metadata: {                         // 🗂️ Objeto embebido
    proveedor: "TextilCorp",
    paisOrigen: "España"
  },
  creadoEn: new Date()
})

// Respuesta:
// {
//   acknowledged: true,
//   insertedId: ObjectId('507f1f77bcf86cd799439011')
// }
```

### Insertar MÚLTIPLES documentos
```javascript
db.productos.insertMany([
  { 
    nombre: "Pantalón chino", 
    precio: 39.9, 
    categorias: ["ropa"], 
    stock: 55,
    creadoEn: new Date()
  },
  { 
    nombre: "Sudadera capucha", 
    precio: 34.5, 
    categorias: ["ropa", "sudaderas"], 
    stock: 20 
  },
  { 
    nombre: "Zapatillas running", 
    precio: 59.0, 
    categorias: ["calzado"], 
    stock: 5,
    descuento: 10  // ✨ Campos diferentes entre documentos (esquema flexible)
  }
])
```

### ✅ Verificar datos
```javascript
// 🔢 Cuenta documentos
db.productos.countDocuments()  // → 4

// 📋 Lista algunos (devuelve un cursor)
db.productos.find().limit(3)

// 🎯 Primer documento que cumple el filtro
db.productos.findOne({ nombre: "Camiseta básica" })

// 📊 Muestra de forma legible (pretty print)
db.productos.find().limit(2).pretty()
```

> 💡 **Tip**: `_id` se genera automáticamente como ObjectId si no lo proporcionas. Es único, ordenado temporalmente e incluye timestamp.

---

## 🔍 6) Leer/consultar (R de CRUD)

### Operadores de comparación más comunes
```javascript
$eq    // igual (=)
$ne    // no igual (!=)
$gt    // mayor que (>)
$gte   // mayor o igual (>=)
$lt    // menor que (<)
$lte   // menor o igual (<=)
$in    // en array de valores
$nin   // no en array de valores
```

### 🎯 Búsquedas básicas
```javascript
// Todos los documentos
db.productos.find()

// Con filtro simple
db.productos.find({ stock: 120 })

// Operador de comparación
db.productos.find({ stock: { $gt: 10 } })  // stock > 10

// Filtro con IN
db.productos.find({ 
  nombre: { $in: ["Camiseta básica", "Pantalón chino"] } 
})
```

### 📊 Proyección (seleccionar campos específicos)
```javascript
// Solo nombre y precio (incluye _id por defecto)
db.productos.find({}, { nombre: 1, precio: 1 })

// Excluir _id explícitamente
db.productos.find({}, { nombre: 1, precio: 1, _id: 0 })

// Excluir campo (mostrar todos menos stock)
db.productos.find({}, { stock: 0 })
```

### 🔗 Filtros compuestos (AND implícito)
```javascript
// AND: ambas condiciones deben cumplirse
db.productos.find({
  categorias: "ropa",      // Está en el array categorias
  precio: { $lte: 40 }     // Y precio <= 40
})

// OR: al menos una condición debe cumplirse
db.productos.find({
  $or: [
    { precio: { $lt: 20 } },
    { stock: { $lt: 10 } }
  ]
})

// Combinación AND + OR
db.productos.find({
  categorias: "ropa",
  $or: [
    { precio: { $lt: 25 } },
    { descuento: { $exists: true } }
  ]
})
```

### 🌳 Búsqueda en subdocumentos y arrays
```javascript
// Búsqueda en array de objetos (notación punto)
db.productos.find({ "variantes.color": "negro" })

// Elemento exacto en array
db.productos.find({ categorias: "ropa" })  // "ropa" está en el array

// Todas las condiciones en elementos del array
db.productos.find({ 
  categorias: { $all: ["ropa", "camisetas"] } 
})

// Tamaño del array
db.productos.find({ 
  categorias: { $size: 2 } 
})

// Búsqueda en objeto embebido
db.productos.find({ "metadata.paisOrigen": "España" })
```

### 📈 Ordenar, limitar y saltar
```javascript
// Ordenar por precio descendente (-1), nombre ascendente (1)
db.productos.find({ categorias: "ropa" })
  .sort({ precio: -1, nombre: 1 })
  .limit(5)

// Paginación: saltar los primeros 10 resultados
db.productos.find()
  .sort({ precio: -1 })
  .skip(10)
  .limit(10)  // Página 2 (resultados 11-20)
```

### 🔎 Operadores útiles adicionales
```javascript
// Expresiones regulares (búsqueda por patrón)
db.productos.find({ nombre: /^Cam/i })  // Empieza con "Cam" (case-insensitive)

// Campo existe
db.productos.find({ descuento: { $exists: true } })

// Tipo de dato
db.productos.find({ precio: { $type: "number" } })

// Negación
db.productos.find({ stock: { $not: { $lt: 10 } } })  // stock >= 10
```

---

## ✏️ 7) Actualizar (U de CRUD)

### Operadores de actualización comunes
```javascript
$set       // Establece valor
$unset     // Elimina campo
$inc       // Incrementa valor numérico
$mul       // Multiplica valor
$rename    // Renombra campo
$min/$max  // Actualiza solo si es menor/mayor
$currentDate  // Establece fecha actual
```

### Operadores de array
```javascript
$push      // Añade elemento al array
$addToSet  // Añade si no existe (evita duplicados)
$pop       // Elimina primer/último elemento
$pull      // Elimina elementos que cumplen condición
$pullAll   // Elimina múltiples valores específicos
```

### 🎯 Actualizaciones básicas
```javascript
// Actualiza UN documento (el primero que encuentra)
db.productos.updateOne(
  { nombre: "Pantalón chino" },     // Filtro
  { $set: { stock: 60, activo: true } }  // Actualización
)

// Actualiza MÚLTIPLES documentos
db.productos.updateMany(
  { categorias: "ropa" },
  { $inc: { stock: 5 } }  // Incrementa stock en 5
)

// Reemplaza TODO el documento (cuidado!)
db.productos.replaceOne(
  { nombre: "Camiseta básica" },
  { nombre: "Camiseta premium", precio: 29.99, stock: 50 }
)
```

### 📦 Operaciones con arrays
```javascript
// Añade elemento al array (permite duplicados)
db.productos.updateOne(
  { nombre: "Camiseta básica" },
  { $push: { categorias: "nueva-colección" } }
)

// Añade solo si NO existe (sin duplicados)
db.productos.updateOne(
  { nombre: "Camiseta básica" },
  { $addToSet: { categorias: "básicos" } }
)

// Elimina elemento específico del array
db.productos.updateOne(
  { nombre: "Camiseta básica" },
  { $pull: { categorias: "nueva-colección" } }
)

// Elimina el último elemento del array
db.productos.updateOne(
  { nombre: "Camiseta básica" },
  { $pop: { categorias: 1 } }  // 1 = último, -1 = primero
)
```

### 🌳 Actualizar subdocumentos en arrays
```javascript
// Operador posicional $ (actualiza primer elemento que coincide)
db.productos.updateOne(
  { 
    nombre: "Camiseta básica", 
    "variantes.color": "negro"  // Filtro: encuentra variante negra
  },
  { 
    $set: { "variantes.$.talla": "XL" }  // $ se reemplaza por índice encontrado
  }
)

// Actualizar TODOS los elementos del array (operador $[])
db.productos.updateOne(
  { nombre: "Camiseta básica" },
  { $set: { "variantes.$[].disponible": true } }
)

// Actualizar elementos filtrados (arrayFilters)
db.productos.updateOne(
  { nombre: "Camiseta básica" },
  { $set: { "variantes.$[elem].descuento": 10 } },
  { arrayFilters: [{ "elem.color": "blanco" }] }
)
```

### 🆕 Upsert (Update + Insert)
```javascript
// Si no existe, lo crea; si existe, lo actualiza
db.productos.updateOne(
  { sku: "CAM-AZUL-S" },
  { 
    $set: { nombre: "Camiseta azul S", precio: 19.99 },
    $setOnInsert: { creadoEn: new Date() }  // Solo en insert
  },
  { upsert: true }  // ⭐ Clave: habilita upsert
)
```

### 🕐 Fecha actual
```javascript
db.productos.updateOne(
  { nombre: "Camiseta básica" },
  { 
    $currentDate: { 
      modificadoEn: true,           // Tipo Date
      "metadata.ultimaRevision": { $type: "timestamp" }  // Tipo timestamp
    }
  }
)
```

---

## 🗑️ 8) Borrar (D de CRUD)

```javascript
// ❌ Borra UN documento (el primero que encuentra)
db.productos.deleteOne({ nombre: "Zapatillas running" })

// ❌❌ Borra MÚLTIPLES documentos
db.productos.deleteMany({ stock: { $lte: 5 } })

// ⚠️ PELIGRO: Borra TODOS los documentos de la colección
db.productos.deleteMany({})  // ¡Filtro vacío!

// 🗑️ Elimina toda la colección (estructura y datos)
db.productos.drop()
```

> ⚠️ **ADVERTENCIA**: No hay papelera de reciclaje. Las eliminaciones son permanentes. Usa filtros precisos.

---

## 🚀 9) Índices: cuándo y cómo

### ¿Por qué usar índices?
Los índices aceleran las consultas pero:
- ✅ **Pro**: Búsquedas mucho más rápidas (IXSCAN vs COLLSCAN)
- ❌ **Contra**: Ocupan espacio en disco y ralentizan escrituras (insert/update/delete)

### 🎯 Tipos de índices

```javascript
// 🔹 Índice simple (un campo)
db.productos.createIndex({ precio: 1 })  // 1 = ascendente, -1 = descendente

// 🔹 Índice compuesto (múltiples campos)
// ⚠️ ORDEN IMPORTA: usa los campos en el orden de tus queries
db.productos.createIndex({ categorias: 1, precio: -1 })

// 🔹 Índice único (no permite duplicados)
db.usuarios.createIndex({ email: 1 }, { unique: true })

// 🔹 Índice de texto (búsquedas full-text)
db.productos.createIndex({ nombre: "text", descripcion: "text" })

// Buscar con índice de texto
db.productos.find({ $text: { $search: "camiseta algodón" } })

// 🔹 Índice TTL (time-to-live, expira documentos automáticamente)
db.sesiones.createIndex({ creadoEn: 1 }, { expireAfterSeconds: 3600 })  // Expira en 1h

// 🔹 Índice parcial (solo indexa documentos que cumplen condición)
db.productos.createIndex(
  { stock: 1 },
  { partialFilterExpression: { stock: { $lt: 10 } } }
)

// 🔹 Índice sparse (ignora documentos sin el campo)
db.productos.createIndex({ descuento: 1 }, { sparse: true })
```

### 📊 Gestionar índices
```javascript
// Ver todos los índices de una colección
db.productos.getIndexes()

// Eliminar índice por nombre
db.productos.dropIndex("categorias_1_precio_-1")

// Eliminar por definición
db.productos.dropIndex({ precio: 1 })

// Eliminar TODOS los índices (excepto _id)
db.productos.dropIndexes()

// Estadísticas de uso de índices
db.productos.aggregate([{ $indexStats: {} }])
```

### 💡 Reglas de oro para índices compuestos (ESR)

**ESR = Equality, Sort, Range**

```javascript
// ❌ MAL (orden incorrecto)
db.productos.createIndex({ precio: -1, categorias: 1 })

// Query típica:
db.productos.find({ 
  categorias: "ropa",      // E: Equality
  precio: { $gte: 20, $lte: 40 }  // R: Range
}).sort({ nombre: 1 })     // S: Sort

// ✅ BIEN (orden ESR)
db.productos.createIndex({ 
  categorias: 1,   // E: Equality primero
  nombre: 1,       // S: Sort segundo
  precio: 1        // R: Range último
})
```

---

## 📊 10) Agregaciones (Aggregation Pipeline)

Las agregaciones procesan documentos a través de etapas (stages) en un pipeline.

### 🔧 Etapas comunes del pipeline

```javascript
$match      // Filtra documentos (como find)
$project    // Selecciona/transforma campos
$group      // Agrupa y calcula (SUM, AVG, COUNT, etc.)
$sort       // Ordena resultados
$limit      // Limita número de documentos
$skip       // Salta documentos
$unwind     // Descompone arrays en documentos individuales
$lookup     // LEFT JOIN con otra colección
$addFields  // Añade campos calculados
$count      // Cuenta documentos
$sample     // Obtiene muestra aleatoria
```

### 📈 Ejemplo: Sistema de ventas

```javascript
// Insertamos datos de ejemplo
use tienda
db.ventas.insertMany([
  { producto: "Camiseta básica", unidades: 2, precioUnit: 19.99, fecha: ISODate("2025-10-01") },
  { producto: "Camiseta básica", unidades: 1, precioUnit: 19.99, fecha: ISODate("2025-10-02") },
  { producto: "Sudadera capucha", unidades: 3, precioUnit: 34.5, fecha: ISODate("2025-10-03") },
  { producto: "Pantalón chino", unidades: 1, precioUnit: 39.9, fecha: ISODate("2025-10-01") },
  { producto: "Sudadera capucha", unidades: 2, precioUnit: 34.5, fecha: ISODate("2025-10-05") }
])
```

### 💰 Ingresos totales por producto
```javascript
db.ventas.aggregate([
  // 1️⃣ Calcular ingreso por venta
  { 
    $addFields: { 
      ingreso: { $multiply: ["$unidades", "$precioUnit"] } 
    } 
  },
  
  // 2️⃣ Agrupar por producto
  { 
    $group: { 
      _id: "$producto",
      totalUnidades: { $sum: "$unidades" },
      totalIngreso: { $sum: "$ingreso" },
      numVentas: { $sum: 1 }
    } 
  },
  
  // 3️⃣ Ordenar por ingreso descendente
  { $sort: { totalIngreso: -1 } },
  
  // 4️⃣ Renombrar _id a producto
  {
    $project: {
      _id: 0,
      producto: "$_id",
      totalUnidades: 1,
      totalIngreso: { $round: ["$totalIngreso", 2] },
      numVentas: 1
    }
  }
])

// Resultado:
// [
//   { producto: "Sudadera capucha", totalUnidades: 5, totalIngreso: 172.5, numVentas: 2 },
//   { producto: "Camiseta básica", totalUnidades: 3, totalIngreso: 59.97, numVentas: 2 },
//   { producto: "Pantalón chino", totalUnidades: 1, totalIngreso: 39.9, numVentas: 1 }
// ]
```

### 📅 Ventas por día
```javascript
db.ventas.aggregate([
  // 1️⃣ Proyectar fecha formateada e ingreso
  { 
    $project: { 
      dia: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } },
      ingreso: { $multiply: ["$unidades", "$precioUnit"] }
    } 
  },
  
  // 2️⃣ Agrupar por día
  { 
    $group: { 
      _id: "$dia",
      ingresoDia: { $sum: "$ingreso" },
      ventasDia: { $sum: 1 }
    } 
  },
  
  // 3️⃣ Ordenar por fecha
  { $sort: { _id: 1 } }
])
```

### 🔍 Estadísticas avanzadas
```javascript
db.ventas.aggregate([
  {
    $group: {
      _id: "$producto",
      promedioUnidades: { $avg: "$unidades" },
      maxUnidades: { $max: "$unidades" },
      minPrecio: { $min: "$precioUnit" },
      primeraVenta: { $min: "$fecha" },
      ultimaVenta: { $max: "$fecha" }
    }
  }
])
```

### 🔗 $lookup (JOIN entre colecciones)
```javascript
// Productos con sus ventas
db.productos.aggregate([
  {
    $lookup: {
      from: "ventas",              // Colección a unir
      localField: "nombre",        // Campo local
      foreignField: "producto",    // Campo en 'ventas'
      as: "historialVentas"        // Array de resultados
    }
  },
  {
    $addFields: {
      totalVendido: { $size: "$historialVentas" }
    }
  }
])
```

### 📦 $unwind (descomponer arrays)
```javascript
// Expandir variantes de productos
db.productos.aggregate([
  { $match: { nombre: "Camiseta básica" } },
  { $unwind: "$variantes" },  // Crea un documento por cada variante
  {
    $project: {
      nombre: 1,
      color: "$variantes.color",
      talla: "$variantes.talla",
      sku: "$variantes.sku"
    }
  }
])
```

---

## 🏗️ 11) Modelado de datos (diseño orientado a consultas)

### 🎯 Principio fundamental
**En MongoDB diseñas para OPTIMIZAR LECTURAS, no para normalizar datos.**

### ⚖️ Embebido vs Referencias

#### 📦 EMBEBIDO (Subdocumentos)
**Usa cuando:**
- Los datos se leen/escriben juntos
- Relación 1:1 o 1:pocos
- Los subdocumentos no crecen indefinidamente
- Baja duplicación de datos

```javascript
// ✅ EMBEBIDO: Pedido con items
{
  _id: ObjectId("..."),
  numeroPedido: "PED-2025-001",
  cliente: {
    id: ObjectId("..."),
    nombre: "Juan Pérez",
    email: "juan@email.com"
  },
  items: [
    { productoId: ObjectId("..."), nombre: "Camiseta", precio: 19.99, cantidad: 2 },
    { productoId: ObjectId("..."), nombre: "Pantalón", precio: 39.9, cantidad: 1 }
  ],
  total: 79.88,
  estado: "completado",
  fecha: ISODate("2025-10-15")
}

// ✅ Ventajas:
// - Una sola query para todo el pedido
// - Atomicidad en escritura
// - Mejor rendimiento en lectura
```

#### 🔗 REFERENCIAS (IDs)
**Usa cuando:**
- Datos se acceden independientemente
- Relación 1:muchos o muchos:muchos
- Los subdocumentos crecen mucho
- Alta reutilización de datos
- Límite de 16MB por documento

```javascript
// ✅ REFERENCIADO: Posts con comentarios
// Colección: posts
{
  _id: ObjectId("post123"),
  titulo: "Mi primer post",
  contenido: "...",
  autor: ObjectId("user456"),  // Referencia a usuarios
  tags: ["mongodb", "nodejs"],
  fecha: ISODate("2025-10-15")
}

// Colección: comentarios
{
  _id: ObjectId("comment789"),
  postId: ObjectId("post123"),  // Referencia a posts
  autorId: ObjectId("user789"),
  texto: "Gran artículo!",
  fecha: ISODate("2025-10-16")
}

// ✅ Ventajas:
// - Evita documento gigante con miles de comentarios
// - Comentarios se pueden consultar independientemente
// - Fácil de paginar
```

### 🎨 Patrones de diseño comunes

#### 1️⃣ **Patrón Subset** (Subconjunto)
Embebe solo lo esencial, referencia el resto.

```javascript
// Producto con reviews top
{
  _id: ObjectId("..."),
  nombre: "iPhone 15",
  precio: 999,
  reviewsDestacadas: [  // Solo las 5 mejores
    { usuario: "Ana", puntuacion: 5, texto: "Excelente!" },
    { usuario: "Carlos", puntuacion: 5, texto: "Increíble!" }
  ],
  totalReviews: 1247,  // Contador total
  promedioScore: 4.7
}

// Todas las reviews en colección separada
// Colección: reviews
{ _id: ObjectId("..."), productoId: ObjectId("..."), usuario: "...", ... }
```

#### 2️⃣ **Patrón Bucket** (Cubetas)
Agrupa datos relacionados por tiempo/categoría.

```javascript
// Métricas de sensor (1 documento por hora)
{
  _id: ObjectId("..."),
  sensorId: "sensor-01",
  fecha: ISODate("2025-10-15T10:00:00Z"),  // Hora de inicio
  mediciones: [
    { minuto: 0, temperatura: 22.5, humedad: 65 },
    { minuto: 1, temperatura: 22.6, humedad: 64 },
    // ... 60 mediciones
  ],
  stats: {
    tempMedia: 22.8,
    tempMax: 23.5,
    tempMin: 22.1
  }
}
```

#### 3️⃣ **Patrón Extended Reference** (Referencia extendida)
Duplica campos críticos para evitar lookups.

```javascript
// Pedido con info mínima del producto (denormalización controlada)
{
  _id: ObjectId("..."),
  items: [
    {
      productoId: ObjectId("..."),
      nombre: "Camiseta",    // ✨ Duplicado desde productos
      precio: 19.99,         // ✨ Snapshot del precio al momento
      cantidad: 2
    }
  ]
}

// ✅ No necesitas lookup cada vez para mostrar el pedido
// ⚠️ Si cambia el nombre del producto, no afecta pedidos históricos (es correcto!)
```

### 📏 Límites a considerar

- 📄 **Documento**: 16 MB máximo
- 🔢 **Anidación**: 100 niveles máximo
- 🏷️ **Nombre de campo**: 128 bytes máximo (UTF-8)
- 📑 **Índice compuesto**: 32 campos máximo
- 📊 **Pipeline de agregación**: 100 MB RAM por defecto (usa `allowDiskUse: true` si necesitas más)

---

## 🔒 12) Transacciones ACID

Desde MongoDB 4.0+ (solo en Replica Sets).

### ¿Cuándo usar transacciones?
- 💰 Transferencias bancarias
- 🛒 Procesar pedido (reducir stock + crear pedido)
- 📊 Actualizar múltiples colecciones atómicamente

```javascript
// Iniciar sesión y transacción
const session = db.getMongo().startSession();
session.startTransaction();

try {
  const sdb = session.getDatabase("tienda");
  
  // 1️⃣ Reducir stock (solo si hay suficiente)
  const resultado = sdb.productos.updateOne(
    { 
      _id: ObjectId("64abc123..."), 
      stock: { $gte: 1 }  // ⚠️ Validación: stock >= 1
    },
    { $inc: { stock: -1 } },
    { session }  // ⚠️ Importante: pasar la sesión
  );
  
  if (resultado.modifiedCount === 0) {
    throw new Error("Stock insuficiente");
  }
  
  // 2️⃣ Crear venta
  sdb.ventas.insertOne({
    productoId: ObjectId("64abc123..."),
    unidades: 1,
    precioUnit: 19.99,
    fecha: new Date()
  }, { session });
  
  // ✅ Todo OK: confirmar transacción
  session.commitTransaction();
  print("✅ Transacción completada");
  
} catch (error) {
  // ❌ Error: revertir cambios
  session.abortTransaction();
  print("❌ Transacción cancelada:", error);
} finally {
  session.endSession();
}
```

### ⚠️ Consideraciones de transacciones
- 📉 Penalizan rendimiento (evítalas si puedes con buen diseño)
- ⏱️ Límite de 60 segundos por defecto
- 🔄 Solo funcionan en Replica Sets (no en standalone)
- 💡 Diseña para minimizar su uso (modelo embebido bien hecho evita transacciones)

---

## 🌐 13) Alta disponibilidad y escalabilidad

### 🔄 Replica Set (HA)
Conjunto de servidores MongoDB que mantienen copias de los datos.

```
┌─────────────┐
│  PRIMARY    │ ← Escrituras
│  (RW)       │
└──────┬──────┘
       │ replicación
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ SECONDARY   │ │ SECONDARY   │ │ SECONDARY   │
│ (Read only) │ │ (Read only) │ │ (Read only) │
└─────────────┘ └─────────────┘ └─────────────┘
```

**Beneficios:**
- 🛡️ **Tolerancia a fallos**: si cae el primary, se elige otro automáticamente
- 📊 **Lecturas escalables**: puedes leer de secundarios
- 🔄 **Backups sin downtime**

### ⚙️ Sharding (Escalabilidad horizontal)
Distribuye datos entre múltiples servidores.

```
Aplicación
    ↓
Router (mongos)
    ↓
┌─────────────┬─────────────┬─────────────┐
│  Shard 1    │  Shard 2    │  Shard 3    │
│ Docs 1-1000 │ Docs 1001-  │ Docs 2001-  │
│             │ 2000        │ 3000        │
└─────────────┴─────────────┴─────────────┘
```

**Cuándo usarlo:**
- 💾 Datos superan capacidad de un solo servidor
- ✍️ Alto volumen de escrituras
- 🗺️ Datos geográficamente distribuidos

---

## 🛠️ 14) Herramientas útiles

### 💻 mongosh (Shell)
```bash
# Conectar a BD remota
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/mydb"

# Ejecutar script
mongosh --file miScript.js

# Ejecutar comando directamente
mongosh --eval "db.productos.countDocuments()"
```

### 🎨 MongoDB Compass (GUI oficial)
- 📊 Explorador visual de datos
- 📈 Creador de agregaciones con preview
- 🔍 Analizador de queries y performance
- 📥 Importar/exportar datos

### ☁️ MongoDB Atlas (Cloud)
- 🚀 Deploy en minutos (AWS, Azure, GCP)
- 🔒 Backups automáticos
- 📊 Monitoring integrado
- 🌍 Clusters distribuidos globalmente

### 📦 Drivers oficiales
- Node.js: `mongodb`
- Python: `pymongo`
- Java: `mongodb-driver-sync`
- Go: `mongo-go-driver`
- C#: `MongoDB.Driver`

---

## 🔌 15) Ejemplo con Node.js (Driver oficial)

```bash
npm init -y
npm install mongodb
```

```javascript
// index.js
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  // 1️⃣ Conectar
  const uri = "mongodb://root:secret@localhost:27017";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB");
    
    const db = client.db("tienda");
    const productos = db.collection("productos");
    
    // 2️⃣ CREATE
    const resultado = await productos.insertOne({ 
      nombre: "Gorra", 
      precio: 14.9, 
      stock: 30,
      categorias: ["accesorios"],
      creadoEn: new Date()
    });
    console.log("Insertado:", resultado.insertedId);
    
    // 3️⃣ READ
    const baratos = await productos
      .find({ precio: { $lt: 20 } })
      .sort({ precio: 1 })
      .toArray();
    console.log("Productos baratos:", baratos);
    
    // 4️⃣ UPDATE
    await productos.updateOne(
      { nombre: "Gorra" },
      { 
        $inc: { stock: 10 },
        $set: { modificadoEn: new Date() }
      }
    );
    
    // 5️⃣ AGGREGATION
    const stats = await productos.aggregate([
      { $group: {
        _id: null,
        precioMedio: { $avg: "$precio" },
        total: { $sum: 1 }
      }}
    ]).toArray();
    console.log("Estadísticas:", stats);
    
    // 6️⃣ DELETE
    await productos.deleteOne({ nombre: "Gorra" });
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("🔌 Desconectado");
  }
}

main().catch(console.error);
```

### 🔧 Con Mongoose (ODM)
```javascript
npm install mongoose

const mongoose = require('mongoose');

// Schema
const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0 },
  categorias: [String],
  creadoEn: { type: Date, default: Date.now }
});

const Producto = mongoose.model('Producto', productoSchema);

// Usar
await mongoose.connect('mongodb://localhost/tienda');
const producto = new Producto({ nombre: "Gorra", precio: 14.9 });
await producto.save();
```

---

## ✅ 16) Buenas prácticas

### 🎯 Diseño
- ✅ Diseña según tus queries más frecuentes
- ✅ Desnormaliza estratégicamente (duplicate lo que lees junto)
- ✅ Mantén documentos < 1MB para mejor performance
- ✅ Usa referencias para datos que crecen indefinidamente

### 🔍 Índices
- ✅ Crea índices para queries frecuentes
- ✅ Usa índices compuestos (orden ESR)
- ✅ Revisa con `explain()` antes de producción
- ❌ No crees índices innecesarios (penalizan writes)

### 🔒 Seguridad
- ✅ **Nunca** uses usuario root en producción
- ✅ Crea usuarios con permisos mínimos
```javascript
use admin
db.createUser({
  user: "appUser",
  pwd: "strongPassword",
  roles: [{ role: "readWrite", db: "tienda" }]
})
```
- ✅ Habilita autenticación
- ✅ Usa TLS/SSL en producción
- ✅ Limita acceso por IP (firewall)

### 📊 Validación
```javascript
// Schema validation a nivel de colección
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "nombre", "edad"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^.+@.+$",
          description: "Email válido requerido"
        },
        edad: {
          bsonType: "int",
          minimum: 18,
          maximum: 120
        },
        estado: {
          enum: ["activo", "inactivo", "suspendido"]
        }
      }
    }
  },
  validationLevel: "strict",  // strict | moderate
  validationAction: "error"   // error | warn
})
```

### 📝 Naming conventions
```javascript
// ✅ BIEN
{
  firstName: "Juan",           // camelCase
  createdAt: new Date(),
  isActive: true,
  address: {
    streetName: "Main St",
    postalCode: "28001"
  }
}

// ❌ EVITAR
{
  first_name: "Juan",          // Mezclando snake_case
  CreatedAt: new Date(),       // PascalCase
  active: true,                // Inconsistente con isActive
  "Dirección": "...",          // Caracteres especiales
  __id: 123                    // Prefijos innecesarios
}
```

### 💾 Backups
```bash
# Backup completo
mongodump --uri="mongodb://localhost:27017" --out=/backup/$(date +%Y%m%d)

# Backup de una BD específica
mongodump --db=tienda --out=/backup/tienda

# Restaurar
mongorestore --uri="mongodb://localhost:27017" /backup/20251029

# Backup en Atlas (automático con point-in-time recovery)
```

---

## 🔬 17) Depuración de rendimiento

### 📊 explain() - Tu mejor amigo
```javascript
// Analiza el plan de ejecución
db.productos.find({ categorias: "ropa", precio: { $lte: 40 } })
  .sort({ precio: -1 })
  .explain("executionStats")
```

**Métricas clave:**
```javascript
{
  "executionStats": {
    "executionSuccess": true,
    "executionTimeMillis": 2,         // ⏱️ Tiempo total
    "totalDocsExamined": 150,         // 📄 Documentos escaneados
    "totalKeysExamined": 45,          // 🔑 Keys de índice examinadas
    "nReturned": 12,                  // 📤 Documentos devueltos
    "executionStages": {
      "stage": "IXSCAN",              // ✅ Usando índice
      // vs "COLLSCAN"                 // ❌ Escaneo completo
      "indexName": "categorias_1_precio_-1",
      "keysExamined": 45,
      "docsExamined": 12
    }
  }
}
```

### 🎯 Qué buscar:
- ✅ **IXSCAN** (Index Scan) = Bien
- ❌ **COLLSCAN** (Collection Scan) = Mal (necesitas índice)
- ✅ **totalDocsExamined ≈ nReturned** = Eficiente
- ❌ **totalDocsExamined >> nReturned** = Ineficiente

### 📈 Profiler (queries lentas)
```javascript
// Habilitar profiler (nivel 1 = solo slow queries)
db.setProfilingLevel(1, { slowms: 100 })  // > 100ms

// Ver queries lentas
db.system.profile.find().sort({ ts: -1 }).limit(5).pretty()

// Deshabilitar
db.setProfilingLevel(0)
```

### 📊 Estadísticas de colección
```javascript
db.productos.stats()

// Información útil:
// - size: tamaño de datos
// - storageSize: espacio en disco
// - totalIndexSize: tamaño de índices
// - nindexes: número de índices
```

---

## 🔐 18) Reglas de validación avanzadas

```javascript
db.createCollection("pedidos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cliente", "items", "total", "estado"],
      properties: {
        cliente: {
          bsonType: "object",
          required: ["id", "email"],
          properties: {
            id: { bsonType: "objectId" },
            email: { 
              bsonType: "string",
              pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            }
          }
        },
        items: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["productoId", "cantidad", "precio"],
            properties: {
              productoId: { bsonType: "objectId" },
              cantidad: { bsonType: "int", minimum: 1 },
              precio: { bsonType: "number", minimum: 0 }
            }
          }
        },
        total: {
          bsonType: "number",
          minimum: 0
        },
        estado: {
          enum: ["pendiente", "procesando", "enviado", "entregado", "cancelado"]
        },
        fecha: {
          bsonType: "date"
        }
      }
    }
  }
})
```

---

## ⚠️ 19) Errores comunes (y cómo evitarlos)

### 1️⃣ Diseñar como SQL
```javascript
// ❌ MAL: Normalización excesiva (penaliza lecturas)
// Colección: usuarios
{ _id: 1, nombre: "Juan" }

// Colección: direcciones
{ _id: 1, usuarioId: 1, calle: "Main St" }

// Colección: telefonos
{ _id: 1, usuarioId: 1, numero: "123456" }

// ✅ BIEN: Embeber datos que se leen juntos
{
  _id: 1,
  nombre: "Juan",
  direccion: { calle: "Main St", ciudad: "Madrid" },
  telefonos: ["123456", "789012"]
}
```

### 2️⃣ Olvidar índices
```javascript
// ❌ Sin índice: escanea 1 millón de docs
db.productos.find({ sku: "CAM-NEG-M" })  // 850ms

// ✅ Con índice: acceso directo
db.productos.createIndex({ sku: 1 }, { unique: true })
db.productos.find({ sku: "CAM-NEG-M" })  // 2ms
```

### 3️⃣ Documentos gigantes
```javascript
// ❌ MAL: Array crece indefinidamente
{
  _id: 1,
  usuario: "juan",
  logs: [  // Puede llegar a 16MB
    { fecha: ISODate("..."), accion: "..." },
    // ... 100,000 logs
  ]
}

// ✅ BIEN: Colección separada
{ _id: ObjectId(), usuarioId: 1, fecha: ISODate("..."), accion: "..." }
```

### 4️⃣ No usar $set en updates
```javascript
// ❌ MAL: Reemplaza todo el documento
db.productos.updateOne({ _id: 1 }, { stock: 50 })

// ✅ BIEN: Solo actualiza el campo
db.productos.updateOne({ _id: 1 }, { $set: { stock: 50 } })
```

### 5️⃣ Queries sin filtro
```javascript
// ❌ PELIGRO: Borra/actualiza TODOS los documentos
db.productos.deleteMany({})
db.productos.updateMany({}, { $set: { descuento: 0 } })

// ✅ Siempre usa filtros específicos
db.productos.deleteMany({ stock: { $eq: 0 } })
```

---

## 📋 20) Cheatsheet rápido

### 🗄️ Bases de datos
```javascript
show dbs                    // Listar bases de datos
use miDB                    // Cambiar/crear BD
db.dropDatabase()           // ⚠️ Eliminar BD actual
```

### 📋 Colecciones
```javascript
show collections            // Listar colecciones
db.createCollection("col")  // Crear colección
db.col.drop()               // Eliminar colección
db.col.renameCollection("nuevo")  // Renombrar
```

### 📝 CRUD básico
```javascript
// CREATE
db.col.insertOne({...})
db.col.insertMany([...])

// READ
db.col.find({filtro}, {proyección})
db.col.findOne({filtro})
db.col.countDocuments({filtro})

// UPDATE
db.col.updateOne({filtro}, {$set: {...}})
db.col.updateMany({filtro}, {$set: {...}})
db.col.replaceOne({filtro}, {...})

// DELETE
db.col.deleteOne({filtro})
db.col.deleteMany({filtro})
```

### 🔍 Operadores
```javascript
// Comparación
{ campo: { $eq: valor } }     // =
{ campo: { $ne: valor } }     // !=
{ campo: { $gt: valor } }     // >
{ campo: { $gte: valor } }    // >=
{ campo: { $lt: valor } }     // <
{ campo: { $lte: valor } }    // <=
{ campo: { $in: [v1, v2] } }  // IN
{ campo: { $nin: [v1, v2] } } // NOT IN

// Lógicos
{ $and: [{cond1}, {cond2}] }
{ $or: [{cond1}, {cond2}] }
{ $not: {cond} }
{ $nor: [{cond1}, {cond2}] }

// Elementos
{ campo: { $exists: true } }
{ campo: { $type: "string" } }

// Arrays
{ array: valor }              // Contiene valor
{ array: { $all: [v1, v2] } } // Contiene todos
{ array: { $size: 3 } }       // Tamaño exacto
{ array: { $elemMatch: {cond} } }  // Elemento que cumple
```

### 🔧 Update operators
```javascript
{ $set: { campo: valor } }       // Establecer
{ $unset: { campo: "" } }        // Eliminar
{ $inc: { campo: 5 } }           // Incrementar
{ $mul: { campo: 2 } }           // Multiplicar
{ $rename: { viejo: "nuevo" } }  // Renombrar
{ $currentDate: { campo: true } } // Fecha actual

// Arrays
{ $push: { array: valor } }      // Añadir
{ $addToSet: { array: valor } }  // Añadir sin duplicar
{ $pull: { array: valor } }      // Eliminar
{ $pop: { array: 1 } }           // Eliminar último (-1 = primero)
```

### 📊 Agregación
```javascript
db.col.aggregate([
  { $match: {filtro} },           // Filtrar
  { $project: {campos} },         // Seleccionar campos
  { $group: {_id: "$campo", ...} }, // Agrupar
  { $sort: {campo: 1} },          // Ordenar
  { $limit: 10 },                 // Limitar
  { $skip: 20 },                  // Saltar
  { $unwind: "$array" },          // Descomponer array
  { $lookup: {...} },             // JOIN
  { $addFields: {...} },          // Añadir campos
  { $count: "total" }             // Contar
])
```

### 🚀 Índices
```javascript
db.col.createIndex({ campo: 1 })           // Ascendente
db.col.createIndex({ c1: 1, c2: -1 })      // Compuesto
db.col.createIndex({ campo: 1 }, {unique: true})  // Único
db.col.createIndex({ campo: "text" })      // Texto
db.col.getIndexes()                        // Listar
db.col.dropIndex("nombre_indice")          // Eliminar
```

### 🔬 Performance
```javascript
db.col.find({...}).explain("executionStats")
db.col.stats()
db.setProfilingLevel(1, { slowms: 100 })
```

---

## 🎓 Recursos adicionales

### 📚 Documentación oficial
- 📖 [MongoDB Manual](https://docs.mongodb.com/manual/)
- 🎓 [MongoDB University](https://university.mongodb.com/) - Cursos gratuitos
- 📺 [MongoDB YouTube Channel](https://www.youtube.com/c/MongoDBofficial)

### 🛠️ Herramientas
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI oficial
- [Studio 3T](https://studio3t.com/) - IDE avanzado (comercial)
- [NoSQLBooster](https://nosqlbooster.com/) - GUI con autocompletado

### 📊 Monitoreo
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Servicio cloud con monitoring
- [MongoDB Ops Manager](https://www.mongodb.com/products/ops-manager) - On-premise
- [Datadog](https://www.datadoghq.com/), [New Relic](https://newrelic.com/) - Integraciones

---

## 🎯 Tips finales

1. **🧪 Prueba en local primero**: Usa Docker para experimentar sin miedo
2. **📊 Monitoriza desde día 1**: Configura alertas de queries lentas
3. **💾 Haz backups regulares**: Automatiza con cron o Atlas
4. **📈 Escala cuando lo necesites**: No optimices prematuramente
5. **🔒 Seguridad primero**: Nunca expongas MongoDB sin autenticación
6. **📚 Lee los release notes**: MongoDB evoluciona rápido
7. **🤝 Comunidad**: Stack Overflow, MongoDB Community Forums
8. **📐 Diseña para tus queries**: El modelo relacional no siempre aplica

---

**¡Listo para empezar! 🚀**

¿Tienes dudas? Prueba primero en mongosh y experimenta. MongoDB es muy amigable para aprender haciendo. 💪
