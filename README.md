# Proyecto Backend con NodeJS - KeepCoding Web Bootcamp XV

Proyecto final del módulo de Backend con NodeJS del Bootcamp de Desarrollo Web de KeepCoding. Se trata de una API RESTful construida con Node.js y Express.

## Tabla de Contenidos

1.  [Características](#características)
2.  [Tecnologías](#tecnologías)
3.  [Instalación](#instalación)
4.  [Uso](#uso)

## Características

El proyecto implementa las siguientes funcionalidades, cubriendo los objetivos del módulo:

-   **Servidor API RESTful**: Creado con Node.js y el framework Express.
-   **Gestión de Asincronía**: Uso de `async/await` para un manejo limpio de operaciones asíncronas.
-   **Arquitectura Modular**: Código organizado en rutas, controladores y middlewares.
-   **Base de Datos NoSQL**: Conexión con MongoDB a través de Mongoose para el modelado de datos.
-   **Autenticación y Autorización**: Implementación de JSON Web Tokens (JWT) para proteger rutas y gestionar el acceso.
-   **Buenas Prácticas**: Estructura de proyecto escalable y mantenible.

## Tecnologías

Este proyecto utiliza las siguientes tecnologías y herramientas:

-   **Backend**: Node.js, Express.js
-   **Base de Datos**: MongoDB, Mongoose
-   **Autenticación**: JSON Web Token (jsonwebtoken)
-   **Entorno de Desarrollo**:
    -   Visual Studio Code
    -   NPM
    -   Git

## Instalación

Sigue estos pasos para configurar el entorno de desarrollo local.

1.  **Clona el repositorio**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

2.  **Instala las dependencias**
    ```bash
    npm install
    ```

## Uso

Para iniciar el servidor en modo de desarrollo, ejecuta el siguiente comando:

```bash
npm start
```