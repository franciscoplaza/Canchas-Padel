# Canchas-Padel

- Instalar Node.js
- Clonar repositorio y elegir la rama/branch a trabajar.

**BACKEND (NEST con TypeScript)**
1. Dentro de la carpeta Backend pegar el archivo .env (para ir a la carpeta del repositorio hay un botón que dice Show in Explorer en Github Desktop - fijarse de estar en la rama/branch).
2. Desde CMD o Terminal de Visual, dentro de la carpeta Backend escribir "npm install" (debería verse del tipo C:\.....\backend> npm install) (Hacerlo dentro de la carpeta backend necesariamente, no en cualquier otro lugar del CMD)

**FRONTEND (REACT con TypeScript)**
1. Desde CMD o Terminal de Visual, dentro de la carpeta Frontend escribir "npm install" (debería verse del tipo C:\.....\frontend> npm install) (Hacerlo dentro de la carpeta frontend necesariamente, no en cualquier otro lugar del CMD)

- Luego de esto ya se puede comenzar a trabajar :D


**Importante**
La base de datos está en una nube en MongoDB Atlas, a la cual se accede mediante el enlace que está en el .env. Para ver la estructura de la base de datos hay que ver los .schema.ts dentro de /backend/cancha, /backend/usuario, /backend/reserva.
Hay que especificar cuando se busca info que se está trabajando con Nest con TypeScript para Backend y React con TypeScript para Frontend.

Para correr el Backend se debe escribir en CMD, dentro de la carpeta Backend "npm run start"

Para correr el Frontend se debe escribir en CMD, dentro de la carpeta Frontend "npm run dev"

(Si se quieren correr ambos abrir 2 CMD y primero correr el Backend y luego el Frontend)

Para visualizar el Frontend y probarlo pegar el enlace que te da en algún navegador.
