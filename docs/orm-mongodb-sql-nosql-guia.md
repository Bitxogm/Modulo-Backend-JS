# Guía Completa: ORM, MongoDB y Bases de Datos

## 📑 Índice
1. [ORM - Object Relational Mapping](#orm---object-relational-mapping)
2. [Comandos MongoDB Shell](#comandos-mongodb-shell)
3. [SQL vs NoSQL - Diferencias](#sql-vs-nosql---diferencias)

---

# ORM - Object Relational Mapping

## 🔍 ¿Qué es un ORM?

Un **ORM (Object-Relational Mapping)** es una técnica de programación que permite convertir datos entre sistemas de tipos incompatibles usando programación orientada a objetos.

### Definición Simple:
> Un ORM es un "traductor" entre tu código orientado a objetos y tu base de datos relacional.

**Sin ORM:**
```javascript
// Consulta SQL directa
const query = "SELECT * FROM usuarios WHERE edad > 18";
db.query(query, (error, results) => {
  // Manejar resultados...
});
```

**Con ORM:**
```javascript
// Usando objetos y métodos
const usuarios = await Usuario.findAll({
  where: { edad: { gt: 18 } }
});
```

---

## 🎯 ¿Para qué se usan los ORM?

### Ventajas principales:

1. **Abstracción de la base de datos**
   - Escribes código en tu lenguaje de programación, no SQL
   - Cambiar de base de datos es más fácil

2. **Productividad**
   - Menos código repetitivo
   - Desarrollo más rápido

3. **Seguridad**
   - Protección contra SQL Injection
   - Validación automática de datos

4. **Mantenibilidad**
   - Código más limpio y organizado
   - Fácil de entender y mantener

5. **Validaciones y Relaciones**
   - Define relaciones entre modelos fácilmente
   - Validaciones automáticas

### Desventajas:

1. **Performance**
   - Consultas complejas pueden ser más lentas
   - Overhead adicional

2. **Curva de aprendizaje**
   - Necesitas aprender el ORM específico

3. **Pérdida de control**
   - Menos control sobre consultas SQL exactas
   - Queries complejas pueden ser difíciles de optimizar

---

## 📦 Principales ORM por Lenguaje

### JavaScript/TypeScript (Node.js)

#### 1. **Sequelize** (SQL)
```bash
npm install sequelize
```

**Características:**
- Soporta: PostgreSQL, MySQL, MariaDB, SQLite, SQL Server
- ORM maduro y estable
- Muy utilizado en la industria

**Ejemplo básico:**
```javascript
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

// Definir modelo
const Usuario = sequelize.define('Usuario', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  edad: {
    type: DataTypes.INTEGER,
    defaultValue: 18
  }
});

// Sincronizar con la base de datos
await sequelize.sync();

// Crear registro
const usuario = await Usuario.create({
  nombre: 'Juan',
  email: 'juan@example.com',
  edad: 25
});

// Consultar
const usuarios = await Usuario.findAll({
  where: { edad: { [Op.gte]: 18 } }
});

// Actualizar
await Usuario.update(
  { edad: 26 },
  { where: { email: 'juan@example.com' } }
);

// Eliminar
await Usuario.destroy({
  where: { email: 'juan@example.com' }
});
```

#### 2. **TypeORM** (SQL)
```bash
npm install typeorm reflect-metadata
```

**Características:**
- Soporta: MySQL, PostgreSQL, MariaDB, SQLite, MongoDB
- Escrito en TypeScript
- Decoradores para definir modelos
- Excelente para proyectos TypeScript

**Ejemplo básico:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class Usuario extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 18 })
  edad: number;
}

// Crear
const usuario = new Usuario();
usuario.nombre = "Juan";
usuario.email = "juan@example.com";
usuario.edad = 25;
await usuario.save();

// Consultar
const usuarios = await Usuario.find({
  where: { edad: MoreThanOrEqual(18) }
});

// Actualizar
await Usuario.update({ email: "juan@example.com" }, { edad: 26 });

// Eliminar
await Usuario.delete({ email: "juan@example.com" });
```

#### 3. **Prisma** (SQL)
```bash
npm install @prisma/client
```

**Características:**
- Soporta: PostgreSQL, MySQL, SQLite, SQL Server, MongoDB
- Type-safe (seguridad de tipos)
- Auto-completado excelente
- Schema declarativo
- Migraciones automáticas

**Ejemplo básico:**
```prisma
// schema.prisma
model Usuario {
  id    Int     @id @default(autoincrement())
  nombre String
  email String  @unique
  edad  Int     @default(18)
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  titulo    String
  contenido String?
  autorId   Int
  autor     Usuario  @relation(fields: [autorId], references: [id])
}
```

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Crear
const usuario = await prisma.usuario.create({
  data: {
    nombre: 'Juan',
    email: 'juan@example.com',
    edad: 25
  }
});

// Consultar
const usuarios = await prisma.usuario.findMany({
  where: { edad: { gte: 18 } }
});

// Consultar con relaciones
const usuarioConPosts = await prisma.usuario.findUnique({
  where: { email: 'juan@example.com' },
  include: { posts: true }
});

// Actualizar
await prisma.usuario.update({
  where: { email: 'juan@example.com' },
  data: { edad: 26 }
});

// Eliminar
await prisma.usuario.delete({
  where: { email: 'juan@example.com' }
});
```

#### 4. **Mongoose** (MongoDB - ODM)
```bash
npm install mongoose
```

**Características:**
- Específico para MongoDB
- ODM (Object Document Mapping) no ORM
- Schemas flexibles
- Middleware y hooks
- Validación incorporada

**Ejemplo básico:**
```javascript
const mongoose = require('mongoose');

// Conectar
await mongoose.connect('mongodb://localhost:27017/miapp');

// Definir Schema
const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  edad: {
    type: Number,
    default: 18,
    min: 0
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

// Crear modelo
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Crear
const usuario = new Usuario({
  nombre: 'Juan',
  email: 'juan@example.com',
  edad: 25
});
await usuario.save();

// O usando create
const usuario2 = await Usuario.create({
  nombre: 'María',
  email: 'maria@example.com'
});

// Consultar
const usuarios = await Usuario.find({ edad: { $gte: 18 } });
const unUsuario = await Usuario.findOne({ email: 'juan@example.com' });
const porId = await Usuario.findById('507f1f77bcf86cd799439011');

// Actualizar
await Usuario.updateOne(
  { email: 'juan@example.com' },
  { edad: 26 }
);

await Usuario.findByIdAndUpdate(
  '507f1f77bcf86cd799439011',
  { edad: 26 },
  { new: true } // Devuelve el documento actualizado
);

// Eliminar
await Usuario.deleteOne({ email: 'juan@example.com' });
await Usuario.findByIdAndDelete('507f1f77bcf86cd799439011');
```

---

### Python

#### 1. **SQLAlchemy** (SQL)
```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Usuario(Base):
    __tablename__ = 'usuarios'
    
    id = Column(Integer, primary_key=True)
    nombre = Column(String)
    email = Column(String, unique=True)
    edad = Column(Integer, default=18)

# Crear
usuario = Usuario(nombre='Juan', email='juan@example.com', edad=25)
session.add(usuario)
session.commit()

# Consultar
usuarios = session.query(Usuario).filter(Usuario.edad >= 18).all()
```

#### 2. **Django ORM** (SQL)
```python
from django.db import models

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    edad = models.IntegerField(default=18)

# Crear
usuario = Usuario.objects.create(
    nombre='Juan',
    email='juan@example.com',
    edad=25
)

# Consultar
usuarios = Usuario.objects.filter(edad__gte=18)
```

---

### PHP

#### 1. **Eloquent** (Laravel - SQL)
```php
class Usuario extends Model {
    protected $fillable = ['nombre', 'email', 'edad'];
}

// Crear
$usuario = Usuario::create([
    'nombre' => 'Juan',
    'email' => 'juan@example.com',
    'edad' => 25
]);

// Consultar
$usuarios = Usuario::where('edad', '>=', 18)->get();
```

#### 2. **Doctrine** (PHP - SQL)
```php
/** @Entity @Table(name="usuarios") */
class Usuario {
    /** @Id @Column(type="integer") @GeneratedValue */
    private $id;
    
    /** @Column(type="string") */
    private $nombre;
}
```

---

### Java

#### 1. **Hibernate** (SQL)
```java
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(unique = true)
    private String email;
}
```

---

## 🔗 Relaciones entre Modelos

### Tipos de Relaciones

#### 1. **One-to-One (Uno a Uno)**
Un usuario tiene un perfil.

```javascript
// Sequelize
Usuario.hasOne(Perfil);
Perfil.belongsTo(Usuario);

// Mongoose
const usuarioSchema = new mongoose.Schema({
  nombre: String,
  perfil: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Perfil'
  }
});
```

#### 2. **One-to-Many (Uno a Muchos)**
Un autor tiene muchos posts.

```javascript
// Sequelize
Autor.hasMany(Post);
Post.belongsTo(Autor);

// Mongoose
const autorSchema = new mongoose.Schema({
  nombre: String,
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }]
});
```

#### 3. **Many-to-Many (Muchos a Muchos)**
Estudiantes tienen muchos cursos, cursos tienen muchos estudiantes.

```javascript
// Sequelize
Estudiante.belongsToMany(Curso, { through: 'EstudianteCurso' });
Curso.belongsToMany(Estudiante, { through: 'EstudianteCurso' });

// Mongoose
const estudianteSchema = new mongoose.Schema({
  nombre: String,
  cursos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso'
  }]
});

const cursoSchema = new mongoose.Schema({
  nombre: String,
  estudiantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estudiante'
  }]
});
```

---

## 🎓 Ejemplo Completo con Sequelize

```javascript
const { Sequelize, DataTypes } = require('sequelize');

// Configuración
const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// Modelos
const Usuario = sequelize.define('Usuario', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const Post = sequelize.define('Post', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contenido: {
    type: DataTypes.TEXT
  },
  publicado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Relaciones
Usuario.hasMany(Post, { foreignKey: 'autorId' });
Post.belongsTo(Usuario, { foreignKey: 'autorId' });

// Sincronizar
await sequelize.sync({ force: false });

// CRUD Completo
class UsuarioController {
  // Crear
  async crear(datos) {
    const usuario = await Usuario.create(datos);
    return usuario;
  }
  
  // Leer todos
  async obtenerTodos() {
    const usuarios = await Usuario.findAll({
      include: [Post],
      where: { activo: true }
    });
    return usuarios;
  }
  
  // Leer uno
  async obtenerPorId(id) {
    const usuario = await Usuario.findByPk(id, {
      include: [Post]
    });
    return usuario;
  }
  
  // Actualizar
  async actualizar(id, datos) {
    const [updated] = await Usuario.update(datos, {
      where: { id }
    });
    return updated;
  }
  
  // Eliminar
  async eliminar(id) {
    const deleted = await Usuario.destroy({
      where: { id }
    });
    return deleted;
  }
  
  // Consultas complejas
  async buscar(termino) {
    const usuarios = await Usuario.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${termino}%` } },
          { email: { [Op.like]: `%${termino}%` } }
        ]
      }
    });
    return usuarios;
  }
}
```

---

# Comandos MongoDB Shell

## 🚀 Conexión y Comandos Básicos

### Conectar a MongoDB
```bash
# Conectar localmente
mongosh

# Conectar a host específico
mongosh "mongodb://localhost:27017"

# Conectar con autenticación
mongosh "mongodb://usuario:password@localhost:27017/miBaseDeDatos"

# Conectar a MongoDB Atlas
mongosh "mongodb+srv://cluster.mongodb.net/miBaseDeDatos" --username usuario
```

---

## 📊 Comandos de Base de Datos

```javascript
// Mostrar todas las bases de datos
show dbs
// o
show databases

// Usar/crear una base de datos
use miBaseDeDatos

// Ver base de datos actual
db

// Obtener información de la base de datos
db.stats()

// Eliminar base de datos actual
db.dropDatabase()

// Ver versión de MongoDB
db.version()
```

---

## 📁 Comandos de Colecciones

```javascript
// Mostrar todas las colecciones
show collections

// Crear una colección
db.createCollection("usuarios")

// Crear colección con opciones
db.createCollection("productos", {
  validator: {
    $jsonSchema: {
      required: ["nombre", "precio"],
      properties: {
        nombre: { bsonType: "string" },
        precio: { bsonType: "number" }
      }
    }
  }
})

// Eliminar una colección
db.usuarios.drop()

// Renombrar colección
db.usuarios.renameCollection("users")

// Ver información de la colección
db.usuarios.stats()

// Obtener índices de la colección
db.usuarios.getIndexes()
```

---

## ➕ Operaciones CRUD

### **CREATE (Insertar)**

```javascript
// Insertar un documento
db.usuarios.insertOne({
  nombre: "Juan Pérez",
  email: "juan@example.com",
  edad: 25,
  ciudad: "Madrid"
})

// Insertar múltiples documentos
db.usuarios.insertMany([
  {
    nombre: "María García",
    email: "maria@example.com",
    edad: 28,
    ciudad: "Barcelona"
  },
  {
    nombre: "Pedro López",
    email: "pedro@example.com",
    edad: 32,
    ciudad: "Valencia"
  }
])

// Insertar con validación
db.usuarios.insertOne({
  nombre: "Ana Martínez",
  email: "ana@example.com",
  edad: 30,
  activo: true,
  fechaRegistro: new Date(),
  tags: ["premium", "verificado"],
  direccion: {
    calle: "Gran Vía 1",
    ciudad: "Madrid",
    codigoPostal: "28013"
  }
})
```

### **READ (Consultar)**

```javascript
// Encontrar todos los documentos
db.usuarios.find()

// Encontrar con formato legible
db.usuarios.find().pretty()

// Encontrar uno
db.usuarios.findOne()

// Encontrar con filtro
db.usuarios.find({ ciudad: "Madrid" })

// Múltiples condiciones (AND)
db.usuarios.find({ 
  ciudad: "Madrid", 
  edad: { $gte: 25 } 
})

// Condición OR
db.usuarios.find({
  $or: [
    { ciudad: "Madrid" },
    { ciudad: "Barcelona" }
  ]
})

// Buscar por rango
db.usuarios.find({ 
  edad: { 
    $gte: 18,  // Mayor o igual
    $lte: 30   // Menor o igual
  } 
})

// Buscar en arrays
db.usuarios.find({ 
  tags: "premium" 
})

// Buscar en objetos anidados
db.usuarios.find({ 
  "direccion.ciudad": "Madrid" 
})

// Proyección (seleccionar campos específicos)
db.usuarios.find(
  { ciudad: "Madrid" },
  { nombre: 1, email: 1, _id: 0 }  // 1 = incluir, 0 = excluir
)

// Limitar resultados
db.usuarios.find().limit(5)

// Saltar resultados (paginación)
db.usuarios.find().skip(10).limit(5)

// Ordenar resultados
db.usuarios.find().sort({ edad: 1 })  // 1 = ascendente, -1 = descendente
db.usuarios.find().sort({ nombre: -1 })

// Contar documentos
db.usuarios.countDocuments()
db.usuarios.countDocuments({ ciudad: "Madrid" })

// Verificar si existe
db.usuarios.findOne({ email: "juan@example.com" }) !== null

// Buscar por ID
db.usuarios.findOne({ _id: ObjectId("507f1f77bcf86cd799439011") })

// Búsqueda de texto
db.usuarios.find({ $text: { $search: "Juan" } })

// Expresiones regulares
db.usuarios.find({ 
  nombre: { $regex: /^Juan/, $options: "i" }  // i = case insensitive
})
```

### **UPDATE (Actualizar)**

```javascript
// Actualizar un documento
db.usuarios.updateOne(
  { email: "juan@example.com" },  // Filtro
  { 
    $set: { 
      edad: 26,
      ciudad: "Barcelona"
    } 
  }
)

// Actualizar múltiples documentos
db.usuarios.updateMany(
  { ciudad: "Madrid" },
  { 
    $set: { 
      activo: true 
    } 
  }
)

// Incrementar valor
db.usuarios.updateOne(
  { email: "juan@example.com" },
  { $inc: { edad: 1 } }  // Incrementa en 1
)

// Agregar a un array
db.usuarios.updateOne(
  { email: "juan@example.com" },
  { $push: { tags: "nuevo-tag" } }
)

// Agregar a array sin duplicados
db.usuarios.updateOne(
  { email: "juan@example.com" },
  { $addToSet: { tags: "premium" } }
)

// Eliminar de un array
db.usuarios.updateOne(
  { email: "juan@example.com" },
  { $pull: { tags: "temporal" } }
)

// Remover campo
db.usuarios.updateOne(
  { email: "juan@example.com" },
  { $unset: { campoTemporal: "" } }
)

// Renombrar campo
db.usuarios.updateOne(
  { email: "juan@example.com" },
  { $rename: { "nombreViejo": "nombreNuevo" } }
)

// Actualizar o insertar (upsert)
db.usuarios.updateOne(
  { email: "nuevo@example.com" },
  { 
    $set: { 
      nombre: "Nuevo Usuario",
      edad: 25
    } 
  },
  { upsert: true }  // Crea si no existe
)

// Reemplazar documento completo
db.usuarios.replaceOne(
  { email: "juan@example.com" },
  {
    nombre: "Juan Actualizado",
    email: "juan@example.com",
    edad: 27
  }
)

// Actualizar con fecha actual
db.usuarios.updateOne(
  { email: "juan@example.com" },
  { 
    $set: { 
      ultimaActualizacion: new Date() 
    },
    $currentDate: { 
      lastModified: true 
    }
  }
)
```

### **DELETE (Eliminar)**

```javascript
// Eliminar un documento
db.usuarios.deleteOne({ 
  email: "juan@example.com" 
})

// Eliminar múltiples documentos
db.usuarios.deleteMany({ 
  ciudad: "Madrid" 
})

// Eliminar todos los documentos de la colección
db.usuarios.deleteMany({})

// Encontrar y eliminar (retorna el documento eliminado)
db.usuarios.findOneAndDelete({ 
  email: "juan@example.com" 
})
```

---

## 🔍 Operadores de Consulta

### Operadores de Comparación
```javascript
// $eq - Igual a
db.usuarios.find({ edad: { $eq: 25 } })

// $ne - No igual a
db.usuarios.find({ edad: { $ne: 25 } })

// $gt - Mayor que
db.usuarios.find({ edad: { $gt: 25 } })

// $gte - Mayor o igual que
db.usuarios.find({ edad: { $gte: 25 } })

// $lt - Menor que
db.usuarios.find({ edad: { $lt: 25 } })

// $lte - Menor o igual que
db.usuarios.find({ edad: { $lte: 25 } })

// $in - En un array de valores
db.usuarios.find({ 
  ciudad: { $in: ["Madrid", "Barcelona", "Valencia"] } 
})

// $nin - No en un array de valores
db.usuarios.find({ 
  ciudad: { $nin: ["Madrid", "Barcelona"] } 
})
```

### Operadores Lógicos
```javascript
// $and - Todas las condiciones deben cumplirse
db.usuarios.find({
  $and: [
    { edad: { $gte: 18 } },
    { ciudad: "Madrid" }
  ]
})

// $or - Al menos una condición debe cumplirse
db.usuarios.find({
  $or: [
    { ciudad: "Madrid" },
    { ciudad: "Barcelona" }
  ]
})

// $not - Invierte la condición
db.usuarios.find({ 
  edad: { $not: { $gte: 30 } } 
})

// $nor - Ninguna condición debe cumplirse
db.usuarios.find({
  $nor: [
    { ciudad: "Madrid" },
    { edad: { $lt: 18 } }
  ]
})
```

### Operadores de Elementos
```javascript
// $exists - Campo existe
db.usuarios.find({ 
  telefono: { $exists: true } 
})

// $type - Tipo de dato
db.usuarios.find({ 
  edad: { $type: "number" } 
})
```

### Operadores de Arrays
```javascript
// $all - Contiene todos los elementos
db.usuarios.find({ 
  tags: { $all: ["premium", "verificado"] } 
})

// $size - Tamaño del array
db.usuarios.find({ 
  tags: { $size: 3 } 
})

// $elemMatch - Coincide elemento en array
db.productos.find({
  reviews: {
    $elemMatch: {
      rating: { $gte: 4 },
      autor: "Juan"
    }
  }
})
```

---

## 📈 Agregaciones (Aggregation Pipeline)

```javascript
// Pipeline básico
db.usuarios.aggregate([
  { $match: { ciudad: "Madrid" } },
  { $group: { 
      _id: "$ciudad", 
      total: { $sum: 1 },
      edadPromedio: { $avg: "$edad" }
    } 
  }
])

// Contar por ciudad
db.usuarios.aggregate([
  { $group: { 
      _id: "$ciudad", 
      cantidad: { $sum: 1 } 
    } 
  },
  { $sort: { cantidad: -1 } }
])

// Calcular promedio
db.productos.aggregate([
  { $group: { 
      _id: null, 
      precioPromedio: { $avg: "$precio" } 
    } 
  }
])

// Proyectar campos
db.usuarios.aggregate([
  { $project: { 
      nombre: 1,
      email: 1,
      añoNacimiento: { 
        $subtract: [2024, "$edad"] 
      }
    } 
  }
])

// Unir datos (lookup - JOIN)
db.ordenes.aggregate([
  {
    $lookup: {
      from: "usuarios",
      localField: "usuarioId",
      foreignField: "_id",
      as: "usuario"
    }
  }
])

// Desenrollar arrays
db.usuarios.aggregate([
  { $unwind: "$tags" },
  { $group: { 
      _id: "$tags", 
      count: { $sum: 1 } 
    } 
  }
])

// Pipeline complejo
db.ventas.aggregate([
  { $match: { fecha: { $gte: new Date("2024-01-01") } } },
  { $group: { 
      _id: { 
        mes: { $month: "$fecha" },
        año: { $year: "$fecha" }
      },
      totalVentas: { $sum: "$monto" },
      cantidadVentas: { $sum: 1 }
    } 
  },
  { $sort: { "_id.año": 1, "_id.mes": 1 } },
  { $project: {
      _id: 0,
      mes: "$_id.mes",
      año: "$_id.año",
      totalVentas: 1,
      cantidadVentas: 1,
      promedioVenta: { 
        $divide: ["$totalVentas", "$cantidadVentas"] 
      }
    }
  }
])
```

---

## 🔑 Índices

```javascript
// Crear índice simple
db.usuarios.createIndex({ email: 1 })  // 1 = ascendente, -1 = descendente

// Índice compuesto
db.usuarios.createIndex({ 
  ciudad: 1, 
  edad: -1 
})

// Índice único
db.usuarios.createIndex(
  { email: 1 },
  { unique: true }
)

// Índice de texto (para búsquedas)
db.articulos.createIndex({ 
  titulo: "text", 
  contenido: "text" 
})

// Ver índices
db.usuarios.getIndexes()

// Eliminar índice
db.usuarios.dropIndex("email_1")

// Eliminar todos los índices (excepto _id)
db.usuarios.dropIndexes()

// Analizar rendimiento de consulta
db.usuarios.find({ email: "juan@example.com" }).explain("executionStats")
```

---

## 🛠️ Comandos de Administración

```javascript
// Ver usuarios
db.getUsers()

// Crear usuario
db.createUser({
  user: "miUsuario",
  pwd: "miPassword",
  roles: [
    { role: "readWrite", db: "miBaseDeDatos" }
  ]
})

// Hacer backup de la base de datos (desde terminal bash)
mongodump --db miBaseDeDatos --out /ruta/backup/

// Restaurar backup
mongorestore --db miBaseDeDatos /ruta/backup/miBaseDeDatos/

// Exportar colección a JSON
mongoexport --db miBaseDeDatos --collection usuarios --out usuarios.json

// Importar desde JSON
mongoimport --db miBaseDeDatos --collection usuarios --file usuarios.json

// Ver operaciones en curso
db.currentOp()

// Matar operación
db.killOp(operationId)

// Ver logs
db.adminCommand({ getLog: "global" })

// Reparar base de datos
db.repairDatabase()
```

---

## 💡 Comandos Útiles de MongoDB Compass

MongoDB Compass es la interfaz gráfica oficial de MongoDB. Aquí algunos atajos y características:

### En la Shell de Compass:
```javascript
// Todas las operaciones anteriores funcionan igual

// Ver ayuda
help

// Limpiar consola
cls  // o Ctrl + L

// Salir
exit
```

### Características de la GUI:
- **Explorador de esquemas**: Analiza automáticamente la estructura de tus datos
- **Visual Query Builder**: Construye consultas visualmente sin escribir código
- **Aggregation Pipeline Builder**: Crea pipelines de agregación de forma visual
- **Index Management**: Crea y gestiona índices visualmente
- **Performance**: Analiza el rendimiento de tus consultas
- **Validation**: Define reglas de validación JSON Schema visualmente

---

## 🎯 Ejemplos Prácticos Completos

### Sistema de Blog
```javascript
// Crear colecciones
use blog

// Usuarios
db.usuarios.insertMany([
  {
    nombre: "Juan Pérez",
    email: "juan@blog.com",
    password: "hash123",
    rol: "autor",
    fechaRegistro: new Date(),
    activo: true
  },
  {
    nombre: "María García",
    email: "maria@blog.com",
    password: "hash456",
    rol: "admin",
    fechaRegistro: new Date(),
    activo: true
  }
])

// Posts
db.posts.insertMany([
  {
    titulo: "Introducción a MongoDB",
    contenido: "MongoDB es una base de datos NoSQL...",
    autorId: ObjectId("..."),  // ID del usuario
    tags: ["mongodb", "nosql", "bases-de-datos"],
    categoria: "tutorial",
    publicado: true,
    fechaPublicacion: new Date(),
    vistas: 0,
    likes: 0
  },
  {
    titulo: "Node.js y Express",
    contenido: "Express es un framework...",
    autorId: ObjectId("..."),
    tags: ["nodejs", "express", "backend"],
    categoria: "tutorial",
    publicado: true,
    fechaPublicacion: new Date(),
    vistas: 0,
    likes: 0
  }
])

// Comentarios
db.comentarios.insertMany([
  {
    postId: ObjectId("..."),
    autorId: ObjectId("..."),
    texto: "Excelente artículo!",
    fecha: new Date(),
    likes: 5
  }
])

// Consultas útiles
// Posts más populares
db.posts.find({ publicado: true })
  .sort({ vistas: -1, likes: -1 })
  .limit(10)

// Posts por autor con información del usuario
db.posts.aggregate([
  { $match: { publicado: true } },
  {
    $lookup: {
      from: "usuarios",
      localField: "autorId",
      foreignField: "_id",
      as: "autor"
    }
  },
  { $unwind: "$autor" },
  {
    $project: {
      titulo: 1,
      "autor.nombre": 1,
      "autor.email": 1,
      fechaPublicacion: 1,
      vistas: 1
    }
  }
])

// Incrementar vistas de un post
db.posts.updateOne(
  { _id: ObjectId("...") },
  { $inc: { vistas: 1 } }
)

// Buscar posts por tag
db.posts.find({ 
  tags: "mongodb",
  publicado: true 
})

// Posts con más comentarios
db.comentarios.aggregate([
  {
    $group: {
      _id: "$postId",
      cantidadComentarios: { $sum: 1 }
    }
  },
  { $sort: { cantidadComentarios: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      from: "posts",
      localField: "_id",
      foreignField: "_id",
      as: "post"
    }
  }
])
```

---

# SQL vs NoSQL - Diferencias

## 📊 Tabla Comparativa

| Característica | SQL (Relacional) | NoSQL (No Relacional) |
|---|---|---|
| **Estructura** | Tablas con filas y columnas | Documentos, key-value, grafos, columnas |
| **Esquema** | Rígido (schema-on-write) | Flexible (schema-on-read) |
| **Escalabilidad** | Vertical (más recursos) | Horizontal (más servidores) |
| **Transacciones** | ACID completo | Eventual consistency (depende) |
| **Joins** | Soporta JOINs complejos | Limitado o mediante aplicación |
| **Lenguaje** | SQL estándar | Específico de cada sistema |
| **Ejemplos** | MySQL, PostgreSQL, Oracle | MongoDB, Redis, Cassandra |
| **Mejor para** | Datos estructurados, transacciones | Big Data, escalabilidad, flexibilidad |

---

## 🗃️ SQL (Bases de Datos Relacionales)

### Características:

1. **Estructura de Tablas**
   - Datos organizados en tablas (relaciones)
   - Cada fila es un registro
   - Cada columna es un atributo

2. **Esquema Rígido**
   - Estructura definida antes de insertar datos
   - Tipos de datos estrictos
   - Relaciones entre tablas definidas

3. **ACID**
   - **Atomicity**: Todo o nada
   - **Consistency**: Datos siempre consistentes
   - **Isolation**: Transacciones independientes
   - **Durability**: Cambios permanentes

4. **Normalización**
   - Reduce redundancia
   - Organiza datos eficientemente
   - Múltiples tablas relacionadas

### Ejemplo SQL:

```sql
-- Crear tablas
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    edad INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT,
    autor_id INT,
    fecha_publicacion TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id)
);

-- Insertar datos
INSERT INTO usuarios (nombre, email, edad) 
VALUES ('Juan Pérez', 'juan@example.com', 25);

-- Consultar con JOIN
SELECT 
    u.nombre AS autor,
    p.titulo,
    p.fecha_publicacion
FROM posts p
INNER JOIN usuarios u ON p.autor_id = u.id
WHERE u.edad >= 18
ORDER BY p.fecha_publicacion DESC;

-- Actualizar
UPDATE usuarios 
SET edad = 26 
WHERE email = 'juan@example.com';

-- Eliminar
DELETE FROM usuarios 
WHERE id = 1;
```

### Cuándo usar SQL:

✅ **Usar SQL cuando:**
- Necesitas transacciones ACID
- Datos altamente estructurados
- Relaciones complejas entre datos
- Consultas complejas con múltiples JOINs
- Integridad referencial importante
- Aplicaciones financieras, bancarias
- Sistemas de inventario
- CRM, ERP

❌ **No usar SQL cuando:**
- Datos no estructurados o cambian frecuentemente
- Necesitas escalar horizontalmente
- Prioridad en velocidad de lectura/escritura
- Datos masivos (Big Data)

### Principales Bases de Datos SQL:

1. **MySQL**
   - Open source
   - Muy popular
   - Buena para web

2. **PostgreSQL**
   - Open source
   - Más features avanzados
   - Muy robusto

3. **Oracle**
   - Empresarial
   - Muy potente
   - Costoso

4. **SQL Server**
   - Microsoft
   - Integración con .NET
   - Empresarial

5. **SQLite**
   - Embebido
   - Sin servidor
   - Aplicaciones móviles

---

## 📦 NoSQL (Bases de Datos No Relacionales)

### Tipos de NoSQL:

#### 1. **Documentos (Document Store)**
Almacena datos en documentos (JSON, BSON)

**Ejemplo: MongoDB**
```javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "edad": 25,
  "direccion": {
    "calle": "Gran Vía 1",
    "ciudad": "Madrid"
  },
  "intereses": ["programación", "música", "viajes"],
  "posts": [
    {
      "titulo": "Mi primer post",
      "contenido": "...",
      "fecha": "2024-01-15"
    }
  ]
}
```

**Ventajas:**
- Flexible, esquema dinámico
- Datos anidados
- Fácil de escalar

**Ejemplos:** MongoDB, CouchDB, RavenDB

#### 2. **Key-Value (Clave-Valor)**
Almacena pares clave-valor

**Ejemplo: Redis**
```javascript
SET usuario:1:nombre "Juan Pérez"
SET usuario:1:email "juan@example.com"
GET usuario:1:nombre  // "Juan Pérez"

// Estructuras de datos
LPUSH lista_tareas "Tarea 1"
LPUSH lista_tareas "Tarea 2"
LRANGE lista_tareas 0 -1
```

**Ventajas:**
- Muy rápido
- Simple
- Ideal para caché

**Ejemplos:** Redis, Memcached, DynamoDB

#### 3. **Column-Family (Columnar)**
Organiza datos en columnas

**Ejemplo: Cassandra**
```sql
CREATE TABLE usuarios (
    user_id UUID PRIMARY KEY,
    nombre text,
    email text,
    posts map<timestamp, text>
);
```

**Ventajas:**
- Escalabilidad masiva
- Escrituras muy rápidas
- Bueno para series temporales

**Ejemplos:** Cassandra, HBase, ScyllaDB

#### 4. **Graph (Grafos)**
Datos como nodos y relaciones

**Ejemplo: Neo4j**
```cypher
// Crear nodos
CREATE (juan:Persona {nombre: 'Juan', edad: 25})
CREATE (maria:Persona {nombre: 'Maria', edad: 28})

// Crear relación
CREATE (juan)-[:AMIGO_DE {desde: 2020}]->(maria)

// Consultar
MATCH (p:Persona)-[:AMIGO_DE]->(amigo)
WHERE p.nombre = 'Juan'
RETURN amigo.nombre
```

**Ventajas:**
- Excelente para relaciones complejas
- Consultas de grafo eficientes
- Redes sociales

**Ejemplos:** Neo4j, ArangoDB, OrientDB

---

## ⚖️ Comparación Detallada

### Estructura de Datos

**SQL:**
```
usuarios                posts
+----+--------+        +----+----------+-----------+
| id | nombre |        | id | titulo   | autor_id  |
+----+--------+        +----+----------+-----------+
| 1  | Juan   |        | 1  | Post 1   | 1         |
| 2  | María  |        | 2  | Post 2   | 1         |
+----+--------+        +----+----------+-----------+
```

**NoSQL (MongoDB):**
```javascript
// Todo en un documento
{
  "_id": 1,
  "nombre": "Juan",
  "posts": [
    { "id": 1, "titulo": "Post 1" },
    { "id": 2, "titulo": "Post 2" }
  ]
}
```

### Escalabilidad

**SQL (Vertical):**
```
         [Servidor más potente]
              ↑
         [Más RAM/CPU]
              ↑
         [Servidor único]
```

**NoSQL (Horizontal):**
```
[Servidor 1] + [Servidor 2] + [Servidor 3] + ...
     ↓              ↓              ↓
  [Datos]       [Datos]        [Datos]
 distribuidos  distribuidos  distribuidos
```

### Ejemplo Comparativo: Blog

**SQL (Normalizado):**
```sql
-- 3 tablas separadas
usuarios: { id, nombre, email }
posts: { id, titulo, contenido, autor_id }
comentarios: { id, texto, post_id, usuario_id }

-- Consulta con JOINs
SELECT u.nombre, p.titulo, c.texto
FROM comentarios c
JOIN usuarios u ON c.usuario_id = u.id
JOIN posts p ON c.post_id = p.id
WHERE p.id = 1;
```

**NoSQL (Desnormalizado):**
```javascript
// Un documento con todo embebido
{
  "_id": 1,
  "titulo": "Mi Post",
  "contenido": "...",
  "autor": {
    "nombre": "Juan",
    "email": "juan@example.com"
  },
  "comentarios": [
    {
      "texto": "Excelente!",
      "autor": {
        "nombre": "María"
      }
    }
  ]
}

// Consulta simple
db.posts.findOne({ _id: 1 })
// ¡No necesita JOINs!
```

---

## 🎯 Cuándo Usar Cada Una

### Usa SQL cuando:

✅ Necesitas transacciones ACID garantizadas
✅ Datos con estructura clara y estable
✅ Relaciones complejas entre entidades
✅ Necesitas consistencia inmediata
✅ Consultas complejas con múltiples JOINs
✅ Reporting y análisis complejos
✅ Aplicaciones financieras o bancarias

**Ejemplos de aplicaciones:**
- Sistemas bancarios
- E-commerce (transacciones)
- ERP, CRM
- Aplicaciones contables
- Sistemas de reservas

### Usa NoSQL cuando:

✅ Datos no estructurados o semi-estructurados
✅ Esquema puede cambiar frecuentemente
✅ Necesitas escalar horizontalmente
✅ Prioridad en velocidad
✅ Big Data
✅ Lectura/escritura masiva
✅ Toleras consistencia eventual

**Ejemplos de aplicaciones:**
- Redes sociales
- Análisis en tiempo real
- IoT (Internet of Things)
- Aplicaciones móviles
- Sistemas de recomendación
- Logs y métricas
- Catálogos de productos

---

## 🔄 Arquitectura Híbrida (Polyglot Persistence)

Muchas aplicaciones modernas usan **ambas**:

```
Aplicación Web
    ├── PostgreSQL (datos transaccionales)
    ├── MongoDB (catálogo de productos)
    ├── Redis (caché y sesiones)
    └── Elasticsearch (búsqueda full-text)
```

**Ejemplo real:**
```javascript
// Usuario hace login
const usuario = await PostgreSQL.query(
  'SELECT * FROM usuarios WHERE email = $1',
  [email]
);

// Guardar sesión en Redis (rápido)
await Redis.set(`session:${usuario.id}`, sessionData, 'EX', 3600);

// Actualizar perfil de usuario en MongoDB (flexible)
await MongoDB.usuarios.updateOne(
  { _id: usuario.id },
  { 
    $set: { ultimaConexion: new Date() },
    $inc: { visitas: 1 }
  }
);

// Indexar para búsqueda en Elasticsearch
await Elasticsearch.index({
  index: 'usuarios',
  id: usuario.id,
  body: {
    nombre: usuario.nombre,
    skills: usuario.skills
  }
});
```

---

## 📈 Tendencias Actuales

### 1. **NewSQL**
Combinan lo mejor de ambos mundos:
- Escalabilidad de NoSQL
- Garantías ACID de SQL
- Ejemplos: CockroachDB, Google Spanner

### 2. **Multi-Modelo**
Bases de datos que soportan múltiples paradigmas:
- ArangoDB (documentos, grafos, key-value)
- OrientDB (documentos, grafos)

### 3. **Serverless Databases**
- Firebase (Google)
- DynamoDB (AWS)
- Fauna DB

---

## 💡 Conclusión

**No hay una respuesta correcta universal**

- SQL y NoSQL no son enemigos, son complementarios
- La elección depende de tus necesidades específicas
- Muchas aplicaciones usan ambas (arquitectura híbrida)
- Considera: tipo de datos, escalabilidad, consistencia, complejidad

**Regla general:**
- **Datos estructurados + Transacciones** → SQL
- **Datos flexibles + Escalabilidad** → NoSQL
- **Aplicaciones complejas** → Ambas (Polyglot Persistence)

---

## 📚 Recursos Adicionales

### SQL
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [SQL Tutorial - W3Schools](https://www.w3schools.com/sql/)

### NoSQL / MongoDB
- [MongoDB University](https://university.mongodb.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)

### Comparaciones
- [CAP Theorem](https://en.wikipedia.org/wiki/CAP_theorem)
- [ACID vs BASE](https://www.geeksforgeeks.org/acid-vs-base-in-databases/)

---

**Creado:** 2024
**Última actualización:** Octubre 2024
