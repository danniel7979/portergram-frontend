# Portergram

Portergram es un proyecto personal de red social Full Stack desarrollado por
Daniel Porteiro Rodríguez. Este repositorio contiene el **frontend** en Angular.
La interfaz está adaptada a escritorio, tablet y móvil.

## Funciones del frontend

- Acceso, recuperación de contraseña y configuración del perfil.
- Perfiles, publicaciones, comentarios e interacciones.
- Seguidores y usuarios seguidos.
- Mensajería con Socket.IO cuando está disponible la API.
- Mundos visuales interactivos, incluido «Mi Mundo».
- Navegación y controles adaptados a pantallas táctiles.

## Tecnologías

Angular 21, TypeScript, CSS, RxJS y Socket.IO Client. La aplicación completa
utiliza además un backend independiente desarrollado con Node.js, Express
y MongoDB.

## Ejecutar el frontend

Se necesitan Node.js y npm compatibles con Angular 21. Desde esta carpeta:

    npm ci
    npm start

Después, abre http://localhost:4200/. Para compilar:

    npm run build

## API y modo de demostración

El backend **no está incluido en este repositorio**. En local, el frontend
utiliza la API en http://localhost:3800/api/ y Socket.IO en
http://localhost:3800.

Para explorar la interfaz con datos simulados, añade `?privatePreview=1` a
la URL del login. Fuera de `localhost` y `127.0.0.1`, esta versión también
activa el modo de demostración automáticamente. Las cuentas y publicaciones
mostradas en ese modo se guardan en el navegador: no son datos reales de
un servidor.

## Derechos de uso

Código disponible para evaluación profesional. Se permite examinarlo y
probarlo localmente con ese fin. Su reutilización, modificación, distribución
o explotación comercial requiere autorización previa por escrito. Consulta
[LICENSE](LICENSE) para conocer las condiciones completas.
