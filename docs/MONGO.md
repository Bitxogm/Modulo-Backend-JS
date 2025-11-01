### 1) ¿Qué es MongoDB y cuándo usarlo?
MongoDB es una base de datos NoSQL orientada a documentos. Guarda datos en documentos BSON (JSON binario), flexibles y anidados, dentro de colecciones. Es ideal cuando:
- El esquema evoluciona con frecuencia o no quieres esquemas rígidos.
- Trabajas con datos jerárquicos/anidados (p. ej., carritos, productos con variantes, perfiles, logs).
- Necesitas escalar en lectura/escritura y alta disponibilidad.
No es la mejor opción cuando necesitas transacciones complejas multi‑entidad a gran escala, joins pesados o lógica estrictamente relacional.
### 2) Instalación rápida
#### Opción A: Docker (recomendada para pruebas)
```# Levanta MongoDB en local (usuario/clave: root/secret)
docker run -d --name mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  mongo:7
```
Conecta con mongosh:
```# Instala mongosh según tu SO o usa un contenedor interactivo
mongosh "mongodb://root:secret@localhost:27017"
```
#### Opción B: Instalar servidor y mongosh nativos
- Servidor: mongod (servicio)
- Cliente: mongosh (shell moderna)
- GUI opcional: MongoDB Compass
### 3) Conceptos básicos
- Base de datos (db) → contenedor lógico de colecciones.
- Colección → conjunto de documentos (equivalente a una tabla, pero sin esquema rígido).
- Documento → objeto BSON (similar a JSON). Cada documento tiene un _id único.
- Índice → estructura para acelerar consultas.
- Agregación → tuberías (pipeline) para transformar y resumir datos.
### 4) Tu primera conexión y base de datos
Abre mongosh y prueba:
```// Muestra bases de datos
show dbs

// Cambia/crea base de datos
use tienda

// Comprueba dónde estás
db.getName()
```
### 5) Crear una colección y documentos (C de CRUD)
```// Inserta un documento en la colección productos
 db.productos.insertOne({
   nombre: "Camiseta básica",
   precio: 19.99,
   categorias: ["ropa", "camisetas"],
   stock: 120,
   variantes: [
     { color: "negro", talla: "M", sku: "CAM-NEG-M" },
     { color: "blanco", talla: "L", sku: "CAM-BLA-L" }
   ],
   creadoEn: new Date()
 })

// Inserta múltiples
db.productos.insertMany([
  { nombre: "Pantalón chino", precio: 39.9, categorias:["ropa"], stock: 55 },
  { nombre: "Sudadera capucha", precio: 34.5, categorias:["ropa", "sudaderas"], stock: 20 },
  { nombre: "Zapatillas running", precio: 59.0, categorias:["calzado"], stock: 5 }
])
```
Verifica:
```// Cuenta documentos
 db.productos.countDocuments()

// Lista algunos
db.productos.find().limit(3)
```
### 6) Leer/consultar (R de CRUD)
```// Búsquedas simples
 db.productos.find({ stock: { $gt: 10 } })

// Proyección de campos (solo nombre y precio)
db.productos.find({}, { nombre: 1, precio: 1 })

// Filtros compuestos
 db.productos.find({
   categorias: "ropa",
   precio: { $lte: 40 }
 })

// Búsqueda por elemento dentro de un array anidado
 db.productos.find({ "variantes.color": "negro" })

// Ordenar y limitar
db.productos.find({ categorias: "ropa" })
  .sort({ precio: -1 })
  .limit(5)
```
### 7) Actualizar (U de CRUD)
```// Actualiza un campo
 db.productos.updateOne({ nombre: "Pantalón chino" }, {
   $set: { stock: 60 }
 })

// Incrementa campos numéricos
db.productos.updateMany({ categorias: "ropa" }, {
  $inc: { stock: 5 }
})

// Añade un elemento a un array (evitando duplicados)
db.productos.updateOne({ nombre: "Camiseta básica" }, {
  $addToSet: { categorias: "básicos" }
})

// Actualización de documentos anidados (positional operator)
db.productos.updateOne(
  { nombre: "Camiseta básica", "variantes.color": "negro" },
  { $set: { "variantes.$.talla": "XL" } }
)
```
### 8) Borrar (D de CRUD)
```// Borra uno
db.productos.deleteOne({ nombre: "Zapatillas running" })

// Borra varios (¡ojo!)
db.productos.deleteMany({ stock: { $lte: 5 } })
```
### 9) Índices: cuándo y cómo
Los índices aceleran lecturas a costa de almacenamiento y coste en escritura.
```// Índice simple
db.productos.createIndex({ precio: 1 })

// Índice compuesto: coincide con los campos que usas para filtrar/ordenar
db.productos.createIndex({ categorias: 1, precio: -1 })

// Ver índices
db.productos.getIndexes()

// Eliminar índice por nombre
db.productos.dropIndex("categorias_1_precio_-1")
```
Consejo: al diseñar un índice compuesto, pon primero los campos más selectivos por los que filtras; deja el campo de sort al final si es posible.
### 10) Agregaciones (pipeline)
La Aggregation Framework te permite filtrar, transformar y agrupar datos eficientemente.
```// Ventas de ejemplo
use tienda
 db.ventas.insertMany([
  { producto: "Camiseta básica", unidades: 2, precioUnit: 19.99, fecha: ISODate("2025-10-01") },
  { producto: "Camiseta básica", unidades: 1, precioUnit: 19.99, fecha: ISODate("2025-10-02") },
  { producto: "Sudadera capucha", unidades: 3, precioUnit: 34.5,  fecha: ISODate("2025-10-03") }
])

// Ingresos por producto
 db.ventas.aggregate([
  { $addFields: { ingreso: { $multiply: ["$unidades", "$precioUnit"] } } },
  { $group: { _id: "$producto", totalUnidades: { $sum: "$unidades" }, totalIngreso: { $sum: "$ingreso" } } },
  { $sort: { totalIngreso: -1 } }
])

// Ventas por día (YYYY-MM-DD)
db.ventas.aggregate([
  { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } }, ingreso: { $multiply: ["$unidades", "$precioUnit"] } } },
  { $group: { _id: "$day", ingresoDia: { $sum: "$ingreso" } } },
  { $sort: { _id: 1 } }
])
```
### 11) Modelado de datos (pensar en consultas, no en tablas)
- Diseña para las consultas más frecuentes (lecturas). Evita joins caros.
- Embebe (subdocumentos/arrays) cuando el dato se lee junto con su padre y crece moderadamente.
- Referencia (guardar solo _id) cuando el conjunto crece mucho o se reutiliza en muchos documentos.
- Mantén documentos por debajo de 16 MB (límite BSON).
- Evalúa precalcular información agregada (denormalizar) con update/triggers (Change Streams) si lo necesitas para lecturas rápidas.
Ejemplo de embebido vs referencia:
```// Embebido: rápido para leer el pedido completo
pedido = {
  _id: ObjectId(),
  clienteId: ObjectId("..."),
  items: [ { productoId: ObjectId("..."), nombre: "Camiseta", precio: 19.99, uds: 2 } ],
  total: 39.98
}

// Referencia: mejor si items son enormes o compartidos
item = { _id: ObjectId(), productoId: ObjectId("..."), precio: 19.99, atributos: {...} }
pedido = { _id: ObjectId(), clienteId: ObjectId("..."), items: [ObjectId("item1"), ObjectId("item2")] }
```
### 12) Transacciones
Desde MongoDB 4.0 hay transacciones ACID multi‑documento (en réplicas). Úsalas cuando debas mantener invariantes fuertes entre colecciones.
```session = db.getMongo().startSession();
session.startTransaction();

try {
  sdb = session.getDatabase("tienda");
  sdb.productos.updateOne({ _id: ObjectId("..."), stock: { $gte: 1 } }, { $inc: { stock: -1 } });
  sdb.ventas.insertOne({ productoId: ObjectId("..."), unidades: 1, precioUnit: 19.99, fecha: new Date() });
  session.commitTransaction();
} catch (e) {
  session.abortTransaction();
  throw e;
} finally {
  session.endSession();
}
```
### 13) Alta disponibilidad, réplicas y sharding (visión general)
- Replica Set: varias copias de los datos (primario + secundarios) para tolerancia a fallos y lecturas escalables.
- Sharding: particiona los datos horizontalmente por una clave de shard para escalar escritura/almacenamiento.
Para desarrollo local:
```# (Avanzado) Iniciar un replica set de un nodo
mongod --replSet rs0 --port 27017 --dbpath /data/db

mongosh --eval 'rs.initiate()'
```
### 14) Herramientas útiles
- mongosh: shell interactiva moderna.
- MongoDB Compass: GUI para explorar colecciones, crear índices y pipelines de agregación.
- MongoDB Atlas: servicio gestionado en la nube (despliegue en minutos).
- Bibliotecas de aplicación: drivers oficiales (Node.js, Python, Go, etc.).
### 15) Ejemplo con Node.js (driver oficial)
```npm init -y
npm install mongodb

// index.js
const { MongoClient } = require("mongodb");

async function main() {
  const uri = "mongodb://root:secret@localhost:27017";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("tienda");
    const productos = db.collection("productos");

    // CREATE
    await productos.insertOne({ nombre: "Gorra", precio: 14.9, stock: 30 });

    // READ
    const barata = await productos.find({ precio: { $lt: 20 } }).toArray();
    console.log("Baratas:", barata);

    // UPDATE
    await productos.updateOne({ nombre: "Gorra" }, { $inc: { stock: 10 } });

    // DELETE
    await productos.deleteOne({ nombre: "Gorra" });
  } finally {
    await client.close();
  }
}

main().catch(console.error);
```
### 16) Buenas prácticas rápidas
- Define índices acorde a tus consultas reales; revisa con explain().
- Evita updateMany/deleteMany sin filtros claros.
- Valida datos en la capa de aplicación o usa validation rules de colección.
- Mantén nombres de campos claros y consistentes; usa camelCase o snake_case.
- Monitoriza con Atlas/Profiler o logs locales; mira tamaño de índices.
- Haz backups y prueba restores.
### 17) Depuración de rendimiento (muy breve)
``` Ver plan de ejecución
db.productos.find({ categorias: "ropa", precio: { $lte: 40 } })
  .sort({ precio: -1 })
  .explain("executionStats")
```
Revisa: COLLSCAN (mal), IXSCAN (bien), número de documentos examinados vs devueltos.
### 18) Reglas de validación (opcional pero recomendable)
``` Asegura que precio sea número > 0 y stock entero >= 0
db.createCollection("catalogo", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "precio", "stock"],
      properties: {
        nombre: { bsonType: "string" },
        precio: { bsonType: "number", minimum: 0 },
        stock: { bsonType: "int", minimum: 0 }
      }
    }
  }
})
```
### 19) Errores comunes
- Diseñar como SQL: evita normalizar en exceso.
- No medir: índices mal definidos o faltantes.
- Documentos gigantes: recuerda el límite de 16 MB.
- No pensar en la clave de shard (si escalas): elige una que distribuya la carga.
### 20) Mini‑cheatsheet (mongosh)
```use <db>; show dbs; show collections;
db.<col>.insertOne({...}); db.<col>.find(<filtro>, <proyección>);
db.<col>.updateOne(<filtro>, {$set: {...}}); db.<col>.deleteOne(<filtro>);
db.<col>.createIndex({ campo: 1 }); db.<col>.getIndexes();
db.<col>.aggregate([{ $match: {...} }, { $group: {...} }]);
