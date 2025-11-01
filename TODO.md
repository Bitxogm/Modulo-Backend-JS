# Tarea de fin de semana

He creado una carpeta `node-api/data` con un archivo `users.js` que importa datos desde un archivo JSON `users.json`.

De esta forma, podemos simular una base de datos sencilla para practicar operaciones CRUD (Crear, Leer, Actualizar, Borrar) en nuestros endpoints de la API.

Tened en cuenta que los datos importados se clonan en memoria, por lo que cualquier cambio que hagamos no persistirá al reiniciar la aplicación, por lo tanto, cada vez que _nodemon_ reinicie la app, los datos volverán a su estado original.

## Instrucciones

Vamos a crear una api para realizar un CRUD (Crear, Leer, Actualizar, Borrar) de _todos_. Podéis encontrar un json con _todos_ en la URL [DummyJson](https://dummyjson.com/todos).

1. Descarga el JSON de _todos_ desde la URL proporcionada y guárdalo en un archivo llamado `todos.json` dentro de la carpeta `node-api/data`.
2. Crea un archivo `Todos.js` en la carpeta `node-api/data` que importe los datos desde `todos.json` y exporte una copia clonada de los datos para simular una base de datos.
3. Implementa los siguientes endpoints en tu API:
   - `GET /todos`: Devuelve la lista completa de _todos_.
     - Debe soportar parámetros de consulta para paginación, como `limit` y `skip`.
     - Debe soportar un parámetro de consulta `completed` para filtrar _todos_ por su estado (completado o no completado).
     - Debe soportar un parámetro de consulta `userId` para filtrar _todos_ por el ID del usuario.
     - Los filtros deben poder combinarse entre sí.
   - `GET /todos/:id`: Devuelve un _todo_ específico por su ID.
   - `POST /todos`: Crea un nuevo _todo_ y lo añade a la lista.
     - Opcionalmente, podemos validar el objeto _todo_ recibido en el cuerpo de la solicitud.
   - `PUT /todos/:id`: Actualiza un _todo_ existente por su ID.
   - `DELETE /todos/:id`: Elimina un _todo_ por su ID.