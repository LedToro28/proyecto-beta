Aquí tienes el contenido completo y actualizado de `progreso.md`. Cópialo y pégalo directamente en tu archivo `progreso.md`, reemplazando todo el contenido existente:

---

```markdown
# Registro de Progreso - Proyecto Beta (InmoYa / Inmonacional)

Este documento registra el progreso paso a paso de la migración a React (Vite) y cualquier cambio importante en el proyecto.

## [2026-06-22] - Inicio de la Migración

- **Análisis Inicial:** Completado. Se determinó que `proyecto-beta` es el candidato ideal para migrar gracias a su estructura de API REST existente en `server.js`.
- **Sincronización:** Verificación con el repositorio remoto completada exitosamente.
- **Documentación:** Creación de `agent.md` y `progreso.md` para iniciar el control de cambios.
- **Configuración Frontend:** Iniciando la configuración del entorno React con Vite en la carpeta `frontend-react`.
- **Configuración Backend:** Servidor Node.js (API) levantado exitosamente en el puerto `3001` evadiendo conflictos con Docker.
- **Conexión API-Proxy:** Configurado el proxy de Vite en `vite.config.js` para conectar de forma transparente con `localhost:3001`.
- **Primer Componente (Completado):** Modificación exitosa de `App.jsx` logrando la conexión con el Backend para mostrar un estado vacío correcto. Base de datos inicializada correctamente.
- **Transición de Entorno:** El usuario apagará los procesos del servidor en Antigravity (Laptop) para continuar la programación en Cursor (PC de Mesa) vía SSH en el mismo VPS. Al llegar a Cursor, se deberán prender los motores abriendo dos terminales:
  *   **Terminal 1:** `node server.js` (en la raíz `/proyecto-beta`)
  *   **Terminal 2:** `pnpm dev` (dentro de `/proyecto-beta/frontend-react`)

---

## [2026-06-22 Noche] - Migración Completa a React (Frontend Profesional)

### Paso 1: Instalación de dependencias
- `react-router-dom` v7.18 para navegación SPA
- `react-icons` v5.6 para iconografía profesional (FontAwesome 6)

### Paso 2: Estructura del proyecto React
Creada la arquitectura completa de carpetas:
```
frontend-react/src/
├── components/
│   ├── Layout.jsx      → Layout principal (sidebar + contenido + footer)
│   └── Sidebar.jsx     → Navegación lateral con links activos y sesión
├── pages/
│   ├── Home.jsx         → Inicio con hero, buscador y propiedades destacadas
│   ├── Properties.jsx   → Listado con filtros (Todas/Venta/Alquiler) + modal detalle
│   ├── Agencies.jsx     → Grid de agencias con logos y covers
│   ├── About.jsx        → Nosotros: misión, visión, valores, equipo, estadísticas
│   ├── Contact.jsx      → Formulario de contacto + info lateral
│   ├── Login.jsx        → Pantalla de login (sin sidebar, pantalla completa)
│   ├── AdminDashboard.jsx  → Panel admin: stats, tabla agencias, crear agencia
│   └── AgencyDashboard.jsx → Panel agencia: props, mensajes, crear propiedad
├── hooks/
│   └── useSession.jsx   → Context + hook para gestión de sesión (login/logout)
├── services/
│   └── api.js           → Servicio centralizado de llamadas al backend
└── index.css            → CSS global unificado (estilos responsivos)
```

### Paso 3: CSS Global Profesional
- Diseño con variables CSS para consistencia de colores y espaciado
- Paleta: púrpura primario (#6c5ce7), fondo claro (#f7fafc), dark sidebar (#1e1e2f)
- Componentes: cards con hover/sombras, modales animados, tablas, empty states
- **Responsive completo**: breakpoints en 768px y 480px
- Hamburger menu para mobile con overlay

### Paso 4: Sistema de Rutas
- React Router v7 con rutas protegidas por rol (admin/agency)
- Redirección automática a login si no hay sesión
- Layout compartido con Sidebar para todas las páginas excepto Login

### Paso 5: Funcionalidades implementadas
| Funcionalidad | Estado |
|---|---|
| Sidebar con navegación activa | ✅ |
| Hero con buscador de propiedades | ✅ |
| Grid de propiedades con imágenes y tags | ✅ |
| Filtro por operación (Venta/Alquiler) | ✅ |
| Modal detalle propiedad con carrusel | ✅ |
| Formulario de mensaje a agencia (desde modal) | ✅ |
| Listado de agencias con cards | ✅ |
| Página Nosotros (misión/visión/valores/equipo) | ✅ |
| Formulario de contacto | ✅ |
| Login/Logout con sesión persistente | ✅ |
| Dashboard Admin (estadísticas + CRUD agencias) | ✅ |
| Dashboard Agencia (CRUD propiedades + mensajes) | ✅ |
| Diseño responsive (mobile/tablet/desktop) | ✅ |
| Empty states cuando no hay datos | ✅ |
| Loading spinners | ✅ |

### Paso 6: Datos de demostración
- Ejecutado `node seedDemo.js` para insertar datos de demo
- **3 agencias**: Inversiones Caracas, Hogar Premium Valencia, Tu Casa Maracaibo
- **9 propiedades**: variedad de casas, apartamentos, locales (venta y alquiler)
- Credenciales de prueba:
  - Admin: `admin` / `Admin123!`
  - Agencias: `invcaracas`, `hogarpremium`, `tucasamcbo` / `Agency123!`

---

## Arquitectura del Proyecto

```
[Browser] → localhost:5173 (Vite React)
              │
              ├── proxy /api → localhost:3001 (Express Node.js)
              │                    │
              │                    └── SQLite (inmobiliaria.db)
              │
              └── React SPA (client-side routing)

Roles:
  - admin    → Dashboard admin (gestionar agencias)
  - agency   → Dashboard agencia (gestionar propiedades y mensajes)
  - invitado → Navegar propiedades/agencias, contactar
```

## Base de Datos (SQLite)

La base de datos es **SQLite** (archivo `inmobiliaria.db`). Está **100% conectada y funcional**: el backend Express (`server.js`) lee y escribe en ella para todas las operaciones (propiedades, agencias, usuarios, mensajes, sesiones).

- El archivo `inmobiliaria.db` se genera localmente al ejecutar `initDB.js` y **no se sube al repositorio** (está en `.gitignore`), lo cual es correcto: cada entorno genera su propia DB.
- `initDB.js` crea las tablas necesarias (agencies, users, properties, messages) y un usuario administrador por defecto.
- `seedDemo.js` inserta datos de demostración (3 agencias y 9 propiedades) para que la página no se vea vacía.

### Verificación de la conexión

Cuando se probó el login con `admin` / `Admin123!` en el navegador, redirigió al Dashboard Admin mostrando **3 agencias, 9 propiedades, 3 usuarios**. Esos datos vienen directamente de la base de datos SQLite, confirmando que la conexión backend ↔ DB funciona correctamente.

---

## Clonar y Levantar el Proyecto (para compañeros de equipo)

Si alguien clona el repositorio desde cero, debe ejecutar estos comandos en orden:

```bash
# 1. Clonar el repositorio
git clone git@github.com:LedToro28/proyecto-beta.git
cd proyecto-beta

# 2. Instalar dependencias del backend
npm install

# 3. Crear la base de datos y el usuario admin
node initDB.js

# 4. Insertar datos de demostración (agencias y propiedades)
node seedDemo.js

# 5. Instalar dependencias del frontend React
cd frontend-react
pnpm install    # o npm install

# 6. Levantar los servidores (en dos terminales separadas)
# Terminal 1 - Backend (desde /proyecto-beta):
node server.js

# Terminal 2 - Frontend (desde /proyecto-beta/frontend-react):
pnpm dev
```

Luego acceder a `http://localhost:5173` en el navegador.

### Credenciales de acceso

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `Admin123!` |
| Agencia (Caracas) | `invcaracas` | `Agency123!` |
| Agencia (Valencia) | `hogarpremium` | `Agency123!` |
| Agencia (Maracaibo) | `tucasamcbo` | `Agency123!` |

---

## Comandos de Arranque (desarrollo diario)

Al iniciar el entorno de desarrollo (la DB ya existe):
1. **Terminal 1 (Backend):** `cd /root/proyecto-beta && node server.js`
2. **Terminal 2 (Frontend):** `cd /root/proyecto-beta/frontend-react && pnpm dev`

Acceder a: `http://localhost:5173`

## [2026-06-22 ~23:00] - Build de Producción y Deploy en Render

### Paso 7: Preparación para producción
- **Build de React:** Ejecutado `pnpm build` en `frontend-react/`, generando los archivos estáticos optimizados en `frontend-react/dist/` (HTML + CSS + JS minificados).
- **URLs corregidas:** Se eliminaron todas las referencias hardcodeadas a `http://localhost:3001` en los componentes React (Home, Properties, Agencies). En producción, las imágenes de propiedades y agencias se sirven desde el mismo servidor con rutas relativas.
- **Cookies/Sesión:** Se agregó `credentials: 'include'` a todas las llamadas `fetch` en `api.js` para que las cookies de sesión se envíen correctamente tanto en desarrollo (a través del proxy de Vite) como en producción.
- **Reset de contraseña admin:** Se reseteó el hash de la contraseña del admin en la DB local para asegurar que `Admin123!` funcione correctamente.

### Paso 8: Configuración de Express para servir React
Se modificó `server.js` para detectar automáticamente el entorno:
- **Si existe `frontend-react/dist/`** → Express sirve el build de React (producción/Render).
- **Si no existe** → Express sirve el frontend legacy HTML (fallback).

Esto permite que el mismo `server.js` funcione tanto en desarrollo local como en Render sin cambios manuales.

### Paso 9: Configuración de scripts y deploy
- **`package.json` actualizado** con nuevos scripts:
  - `build`: instala deps del frontend y ejecuta el build de Vite
  - `render-start`: inicializa DB + seed + arranca servidor (para Render)
  - `seed`: ejecuta seedDemo.js por separado
- **`.gitignore` actualizado**: se removió `dist/` para incluir el build en el repositorio, así Render no necesita ejecutar el build.
- **Push a GitHub:** Todos los cambios subidos a `git@github.com:LedToro28/proyecto-beta.git`.

### Paso 10: Deploy en Render
- El frontend React se desplegó exitosamente en https://proyecto-beta-2.onrender.com/
- El diseño nuevo (sidebar, hero, buscador, cards) se muestra correctamente.
- **Pendiente del compañero (LedToro28):** Cambiar el **Start Command** en Render a:
  ```
  node initDB.js && node seedDemo.js && node server.js
  ```
  Esto es necesario porque Render (tier gratuito) tiene disco efímero: la DB SQLite se borra en cada redeploy, así que debe recrearse al arrancar.

### Estado actual verificado en local (localhost:5173)
- Login como admin: ✅ funciona
- Dashboard admin mostrando 4 agencias, 9 propiedades, 4 usuarios: ✅
- Se creó agencia adicional "Solana" desde el panel admin: ✅
- Propiedades con imágenes, tags, filtros: ✅
- Todas las páginas navegables y responsive: ✅

---

## Despliegue en Render (Producción)

**URL:** https://proyecto-beta-2.onrender.com/

**Configuración requerida en Render Dashboard:**
| Campo | Valor |
|-------|-------|
| Build Command | `npm install` |
| Start Command | `node initDB.js && node seedDemo.js && node server.js` |
| Branch | `main` |

**Nota sobre SQLite en Render:** El tier gratuito de Render tiene almacenamiento efímero. La base de datos `inmobiliaria.db` se pierde en cada redeploy/reinicio. Por eso el Start Command ejecuta `initDB.js` y `seedDemo.js` antes de arrancar el servidor, recreando la DB con datos frescos cada vez. Para una aplicación de producción real se usaría PostgreSQL (Render lo ofrece), pero para la entrega universitaria SQLite con seed automático es suficiente.

---

## [2026-06-23] - Migración a TypeScript (Fase 1 y 2)

### Fase 1: Configuración inicial TypeScript ✅
- **Instalación de dependencias:**
  - `typescript`, `ts-node`, `tsx` (ejecutor de archivos TS)
  - `@types/express`, `@types/node`, `@types/multer`, `@types/sqlite3`
  
- **Configuración:**
  - Creado `tsconfig.json` con configuración estricta para backend
  - Actualizado `package.json`: agregado `"type": "module"` para soportar ES6 imports
  - Renombrado `server.js` → `server.ts` (sin cambios en el código)
  - Actualizado script `"start": "tsx server.ts"`

- **Resultado:** Servidor funciona igual que antes, pero ahora entiende TypeScript

### Fase 2: Migración con tipos reales ✅
- **Backend completamente convertido a TypeScript con tipos:**

  1. **server.ts** - Convertido a módulos ES6 con tipos
     - Imports: `import express from 'express'` (en lugar de `require`)
     - Tipos: `const app: Express = express()`
     - Tipos: `const PORT: number = parseInt(...)`
     - Tipos: `const db: sqlite3.Database = new (...).Database(dbPath)`
     - Tipos en funciones middleware: `(req: Request, res: Response, next: NextFunction)`
     - TypeScript ahora valida tipos en tiempo de desarrollo

  2. **initDB.ts** - Convertido a módulos ES6 con tipos
     - Interfaces: `interface ColumnInfo { name: string; type: string; }`
     - Tipos de callbacks: `(err: Error | null, columns: ColumnInfo[])`
     - Manejo de `__dirname` en módulos ES6 usando `fileURLToPath`
     - Probado: ✅ `npm run init-db` funciona correctamente

  3. **seedDemo.ts** - Convertido a módulos ES6 con tipos
     - Interfaces: `interface Agency`, `interface Property`
     - Tipos: `op: 'venta' | 'alquiler'` (literal types)
     - Async/await con tipos: `async function seed(): Promise<void>`
     - Probado: ✅ Listo para usar

- **package.json actualizado:**
  ```json
  "scripts": {
    "start": "tsx server.ts",
    "init-db": "tsx initDB.ts",
    "seed": "tsx seedDemo.ts",
    "render-start": "tsx initDB.ts && tsx seedDemo.ts && tsx server.ts"
  }
  ```

### Ventajas logradas
- ✅ **Type Safety:** TypeScript valida tipos en tiempo de desarrollo
- ✅ **IDE Autocomplete:** Mejor sugerencias y documentación en el editor
- ✅ **Errores tempranos:** Los bugs se detectan antes de ejecutar
- ✅ **Documentación viva:** Los tipos documentan el código
- ✅ **Compatibilidad:** JavaScript viejo sigue funcionando

### Archivos actualizados
| Archivo | Estado | Antes | Después |
|---------|--------|-------|---------|
| server.ts | ✅ Con tipos | JavaScript (require) | TypeScript (import) + tipos |
| initDB.ts | ✅ Con tipos | JavaScript (require) | TypeScript (import) + interfaces |
| seedDemo.ts | ✅ Con tipos | JavaScript (require) | TypeScript (import) + interfaces |
| initDB.js | 🟡 Existente | - | Reemplazado por initDB.ts |
| seedDemo.js | 🟡 Existente | - | Reemplazado por seedDemo.ts |

### Frontend (sin cambios necesarios por ahora)
- React ya tiene `@types/react` y `@types/react-dom` instalados
- Vite maneja TypeScript nativamente
- Cuando se necesite: renombrar `.jsx` → `.tsx` (cambio mínimo)

---

## [2026-06-23] - Migración a PostgreSQL + Deploy en VPS Propio

### Contexto
Se decidió migrar de SQLite a PostgreSQL y alojar el proyecto en el VPS de Contabo (109.199.117.161) con dominio propio, eliminando la dependencia de Render y su almacenamiento efímero.

### Paso 1: Infraestructura del VPS ✅
- **PostgreSQL 16** instalado en Ubuntu 24.04 (nativo, no Docker)
- **Traefik** (ya existente vía EasyPanel) configurado como reverse proxy
- **PM2** instalado globalmente con pnpm para gestión de procesos
- **Certbot / Let's Encrypt** instalado para certificados SSL

### Paso 2: Base de datos PostgreSQL ✅
- Base de datos: `inmoya_db`
- Usuario: `inmoya`
- Conexión: `postgresql://inmoya:***@localhost:5432/inmoya_db`
- Variable de entorno `DATABASE_URL` en `.env`

### Paso 3: Migración del código SQLite → PostgreSQL ✅
Archivos migrados:

| Archivo | Cambios principales |
|---------|-------------------|
| `server.ts` | `sqlite3` → `pg.Pool`, callbacks → `async/await`, `?` → `$1,$2...`, `this.lastID` → `RETURNING id`, `this.changes` → `result.rowCount` |
| `initDB.ts` | Tablas con `SERIAL PRIMARY KEY`, `TIMESTAMP DEFAULT NOW()`, transacciones con `BEGIN/COMMIT` |
| `seedDemo.ts` | `INSERT OR IGNORE` → `ON CONFLICT DO NOTHING/UPDATE`, IDs con `RETURNING id` |

**Dependencias actualizadas:**
- Agregado: `pg`, `@types/pg`
- Removido: `sqlite3`, `@types/sqlite3`
- Package manager: **pnpm** (exclusivo, NO npm por seguridad)

### Paso 4: Dominio y SSL ✅
- **Subdominio:** `inmoya.pedroservicios.xyz`
- **DNS:** Ya resuelve vía wildcard `*` en Dynadot → 109.199.117.161
- **SSL:** Certificado Let's Encrypt automático vía Traefik (`certResolver: letsencrypt`)
- **HTTPS:** Redirección automática HTTP → HTTPS

### Paso 5: Routing con Traefik ✅
Se agregaron rutas en `/etc/easypanel/traefik/config/main.yaml`:
- Router HTTP (`http-inmoya-0`): redirige a HTTPS
- Router HTTPS (`https-inmoya-0`): con certificado Let's Encrypt
- Servicio (`inmoya-0`): proxy a `http://172.18.0.1:3001/` (docker_gwbridge → host)

### Paso 6: PM2 - Proceso permanente ✅
- Archivo `ecosystem.config.cjs` creado para PM2
- Servidor arranca automáticamente con `pm2 startup + pm2 save`
- Comandos útiles:
  ```bash
  pm2 status           # ver estado
  pm2 logs inmoya      # ver logs en vivo
  pm2 restart inmoya   # reiniciar
  pm2 stop inmoya      # detener
  ```

### URLs de acceso
| Entorno | URL |
|---------|-----|
| **Producción (VPS)** | https://inmoya.pedroservicios.xyz |
| **Render (legacy)** | https://proyecto-beta-2.onrender.com |
| **Desarrollo local** | http://localhost:5173 (Vite) |

### Credenciales de acceso
| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `Admin123!` |
| Agencia (Caracas) | `invcaracas` | `Agency123!` |
| Agencia (Valencia) | `hogarpremium` | `Agency123!` |
| Agencia (Maracaibo) | `tucasamcbo` | `Agency123!` |

### Arquitectura actual
```
[Browser] → https://inmoya.pedroservicios.xyz
                │
                └─ Traefik (SSL/HTTPS) → localhost:3001
                                            │
                                  Express (server.ts con tsx)
                                            │
                              ┌─────────────┼─────────────┐
                              │             │             │
                        React SPA     REST API     PostgreSQL
                     (dist/ estático)  /api/*     (inmoya_db)
```

---

## Clonar y Levantar el Proyecto (desarrollo local)

```bash
# 1. Clonar
git clone git@github.com:LedToro28/proyecto-beta.git
cd proyecto-beta

# 2. Instalar dependencias (USAR PNPM, NO npm)
pnpm install

# 3. Configurar .env
echo "PORT=3001" > .env
echo "DATABASE_URL=postgresql://inmoya:PASSWORD@localhost:5432/inmoya_db" >> .env

# 4. Inicializar DB y seed
pnpm run init-db
pnpm run seed

# 5. Frontend
cd frontend-react && pnpm install && pnpm dev

# 6. Backend (otra terminal)
cd proyecto-beta && pnpm run start
```

---

## Instrucciones para el compañero de equipo

### Cambios importantes que debes saber:

1. **Base de datos migrada:** Ya NO usamos SQLite. Ahora usamos **PostgreSQL** en el VPS. Los datos son persistentes (no se pierden al reiniciar).

2. **Package manager:** Usar **pnpm** en vez de npm. Si no lo tienes:
   ```bash
   npm install -g pnpm
   ```

3. **Deploy principal:** La página ahora vive en **https://inmoya.pedroservicios.xyz** (VPS propio con SSL). Render sigue activo como backup pero con SQLite efímero.

4. **TypeScript:** El backend está en TypeScript (`server.ts`, `initDB.ts`, `seedDemo.ts`). Se ejecuta con `tsx`.

### Si quieres desarrollar localmente:

**Opción A: Con PostgreSQL local (recomendado)**
```bash
# Instalar PostgreSQL en tu PC
# Crear la DB:
createdb inmoya_db
psql -d inmoya_db -c "CREATE USER inmoya WITH PASSWORD 'tu_password';"
psql -d inmoya_db -c "GRANT ALL ON DATABASE inmoya_db TO inmoya;"
psql -d inmoya_db -c "GRANT ALL ON SCHEMA public TO inmoya;"

# Configurar .env
echo "PORT=3001" > .env
echo "DATABASE_URL=postgresql://inmoya:tu_password@localhost:5432/inmoya_db" >> .env

# Instalar y arrancar
pnpm install
pnpm run init-db
pnpm run seed
pnpm run start
```

**Opción B: Conectarse a la DB del VPS (más fácil, necesita internet)**
```bash
# Configurar .env apuntando al VPS
echo "PORT=3001" > .env
echo "DATABASE_URL=postgresql://inmoya:InmoYa2026_Prod!@109.199.117.161:5432/inmoya_db" >> .env

pnpm install
pnpm run start
```
*(Nota: Requiere que PostgreSQL en el VPS acepte conexiones remotas, pedir a Pedro que lo configure)*

### Flujo para subir cambios a producción (VPS):
1. Haz tus cambios normalmente
2. `git add . && git commit -m "descripción" && git push`
3. Avisarle a Pedro para que haga `git pull` en el VPS y reinicie con `pm2 restart inmoya`

### Credenciales
| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Admin | `admin` | `Admin123!` |
| Agencia Caracas | `invcaracas` | `Agency123!` |
| Agencia Valencia | `hogarpremium` | `Agency123!` |
| Agencia Maracaibo | `tucasamcbo` | `Agency123!` |

---

## [2026-06-23 19:00] - CRUD completo de Agencias + Botones profesionales

### Cambios realizados:
1. **Botón Editar agencias (PUT /api/admin/agencies/:id)**
   - Nuevo endpoint `PUT` en `server.ts` para actualizar nombre, email, teléfono, dirección, logo y portada
   - Modal de edición `EditAgencyModal` en `AdminDashboard.jsx` con formulario prellenado con datos actuales
   - Función `updateAgency` agregada en `api.js`

2. **Rediseño de botones de acción en la tabla**
   - Reemplazado el botón rojo con texto "Eliminar" por dos botones compactos de icono:
     - Botón **editar** (icono lapiz): fondo púrpura semitransparente, se llena al hover
     - Botón **eliminar** (icono basura): fondo rojo semitransparente, se llena al hover
   - Clases CSS nuevas: `.actions-group`, `.btn-action`, `.btn-action.edit`, `.btn-action.delete`
   - Animación `transform: scale(0.92)` al click para feedback táctil

3. **Botón "Volver al inicio" en Login**
   - Agregado un link con icono de casita debajo del formulario de login
   - Permite volver a la página principal sin necesidad de usar el navegador

### Corrección de infraestructura:
- **Traefik/EasyPanel sobreescribió la config**: EasyPanel regeneró `main.yaml` borrando las rutas de InmoYa
- **Solución permanente**: Creado archivo independiente `/etc/easypanel/traefik/config/inmoya.yaml` que EasyPanel NO puede sobreescribir. Traefik lee todos los `.yaml` del directorio, así que InmoYa siempre tendrá su configuración disponible.

---

## Stack Tecnológico del Proyecto

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 19.x | Librería UI (componentes, estado, hooks) |
| **Vite** | 8.x | Bundler y dev server (HMR, build de producción) |
| **React Router** | 7.x | Navegación SPA (rutas, rutas protegidas por rol) |
| **React Icons** | 5.x | Iconografía (FontAwesome 6) |
| **CSS puro** | - | Estilos globales con variables CSS, sin frameworks |

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Node.js** | 22.x | Runtime del servidor |
| **Express.js** | 4.x | Framework HTTP (rutas API REST, middlewares) |
| **TypeScript** | 6.x | Tipado estático del backend |
| **tsx** | 4.x | Ejecutor de TypeScript sin compilar (dev + prod) |
| **express-session** | 1.x | Gestión de sesiones (autenticación por cookies) |
| **bcrypt** | 5.x | Hash de contraseñas (seguridad) |
| **multer** | 1.x | Subida de archivos (logos, portadas, fotos de propiedades) |
| **dotenv** | 16.x | Variables de entorno (.env) |
| **nodemailer** | 6.x | Envío de emails (instalado, pendiente de configurar) |

### Base de Datos
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **PostgreSQL** | 16 | Base de datos relacional (producción, datos persistentes) |
| **pg** (node-postgres) | 8.x | Driver de conexión Node.js ↔ PostgreSQL |

### Infraestructura / DevOps
| Tecnología | Uso |
|-----------|-----|
| **VPS Contabo** | Servidor Ubuntu 24.04 (4 vCPU, 8GB RAM) |
| **Traefik** | Reverse proxy + SSL automático (Let's Encrypt) |
| **EasyPanel** | Panel de gestión Docker (gestiona Traefik) |
| **PM2** | Process manager (auto-restart, logs, startup) |
| **pnpm** | Package manager (seguro, rápido, reemplaza npm) |
| **Git / GitHub** | Control de versiones y repositorio remoto |

### Arquitectura General
```
                    ┌──────────────────────────────────┐
                    │         USUARIO (Browser)        │
                    └──────────────┬───────────────────┘
                                   │ HTTPS
                    ┌──────────────▼───────────────────┐
                    │   Traefik (SSL + Reverse Proxy)   │
                    │   inmoya.pedroservicios.xyz        │
                    └──────────────┬───────────────────┘
                                   │ HTTP :3001
                    ┌──────────────▼───────────────────┐
                    │      Express.js (server.ts)       │
                    │  ┌───────────┬──────────────────┐ │
                    │  │ React SPA │   REST API       │ │
                    │  │ (estático)│   /api/*          │ │
                    │  └───────────┴────────┬─────────┘ │
                    └───────────────────────┼───────────┘
                                            │ SQL
                    ┌───────────────────────▼───────────┐
                    │     PostgreSQL 16 (inmoya_db)      │
                    │  agencies | users | properties     │
                    │  messages                          │
                    └───────────────────────────────────┘
```

### Estructura de Archivos del Proyecto
```
proyecto-beta/
├── server.ts              → Backend Express (API REST + serve React)
├── initDB.ts              → Creación de tablas + usuario admin
├── seedDemo.ts            → Datos de demostración
├── ecosystem.config.cjs   → Configuración PM2
├── package.json           → Dependencias y scripts
├── tsconfig.json          → Configuración TypeScript
├── .env                   → Variables de entorno (PORT, DATABASE_URL)
├── progreso.md            → Este archivo (documentación de progreso)
├── agent.md               → Directrices del agente y deploy info
│
├── frontend-react/        → Frontend React (Vite)
│   ├── src/
│   │   ├── App.jsx           → Rutas y layout principal
│   │   ├── main.jsx          → Entry point React
│   │   ├── index.css          → CSS global (responsive, variables)
│   │   ├── components/
│   │   │   ├── Layout.jsx     → Layout (sidebar + contenido)
│   │   │   └── Sidebar.jsx    → Navegación lateral
│   │   ├── pages/
│   │   │   ├── Home.jsx           → Inicio (hero + propiedades destacadas)
│   │   │   ├── Properties.jsx     → Listado + filtros + modal detalle
│   │   │   ├── Agencies.jsx       → Grid de agencias
│   │   │   ├── About.jsx          → Nosotros
│   │   │   ├── Contact.jsx        → Formulario de contacto
│   │   │   ├── Login.jsx          → Pantalla de login
│   │   │   ├── AdminDashboard.jsx → Panel admin (CRUD agencias)
│   │   │   └── AgencyDashboard.jsx→ Panel agencia (CRUD propiedades)
│   │   ├── hooks/
│   │   │   └── useSession.jsx     → Context de sesión (login/logout)
│   │   └── services/
│   │       └── api.js             → Servicio centralizado de fetch
│   ├── dist/              → Build de producción (generado por Vite)
│   └── vite.config.js     → Proxy dev + configuración Vite
│
└── public/
    ├── uploads/           → Archivos subidos (logos, portadas, fotos)
    └── views/             → Frontend legacy HTML (fallback)
```

---

## [2026-07-11 / 12] - Mejoras en UI, Filtros y Paginación

Esta sección documenta los cambios realizados en julio de 2026 para optimizar la experiencia de usuario y la funcionalidad de búsqueda.

### Cambios realizados:

#### 1. Vista de Inicio (Home)
- **Eliminada la barra de búsqueda** del hero (ciudad, tipo, operación y botón "Buscar").
- El hero ahora solo muestra el título y subtítulo, simplificando la página de inicio.
- Se mantiene la sección de "Propiedades Destacadas" que muestra solo propiedades con `destacada = true`.

#### 2. Vista de Propiedades (Properties)
- **Nueva barra de filtros** con:
  - Campo de texto para buscar por ubicación/ciudad (búsqueda en tiempo real).
  - Selector de tipo de inmueble: Casa, Apartamento, Terreno, Local, Oficina.
  - Selector de operación: Venta, Alquiler.
- **Filtros combinados**: todos los filtros se aplican simultáneamente y la lista se actualiza en tiempo real (sin recargar la página) usando `useMemo`.
- **Botones rápidos**: "Todas", "En Venta", "En Alquiler" que actúan como atajos para el selector de operación.
- **Paginación**: se muestran 9 propiedades por página con controles "Anterior" / "Siguiente" e indicador de página actual. La página se reinicia al cambiar los filtros y se hace scroll suave al inicio de la sección.

#### 3. Dashboard de Agencia (AgencyDashboard)
- **Rediseño completo**: ahora tiene el mismo estilo que la vista de perfil de agencia (`AgencyProfile`), con cabecera que muestra cover, logo, nombre y datos de contacto.
- **Propiedades en tarjetas**: en lugar de tabla, ahora las propiedades se muestran en un grid de tarjetas con imagen, título, ubicación, precio, características y botones de acción.
- **Botones de acción mejorados**:
  - **Destacar / Desdestacar**: botón con estrella que alterna el estado `destacada` de la propiedad. Cambia de color y texto según el estado.
  - **Editar**: abre un modal con los datos precargados para modificar título, descripción, operación, precio, ubicación, habitaciones, baños, área e imágenes (opcional).
  - **Eliminar**: elimina la propiedad con confirmación previa.
- **Funcionalidad de edición completamente funcional**: el modal de edición permite actualizar todos los campos y las imágenes (subiendo nuevas o manteniendo las existentes). Los cambios se reflejan inmediatamente en el dashboard gracias a la recarga automática.

#### 4. Backend (server.ts)
- **Nuevo endpoint `PUT /api/agency/properties/:id/toggle-destacada`**: alterna el valor de `destacada` entre 0 y 1, validando que la propiedad pertenezca a la agencia autenticada.
- **Endpoint de edición `PUT /api/agency/properties/:id`**: actualiza todos los campos de una propiedad, incluyendo imágenes (opcional). Sanitiza los valores numéricos para evitar errores de tipo en PostgreSQL.
- **Corrección de sanitización de números**: se agregó la función `toNumberOrNull` para convertir strings vacíos o `undefined` a `null` en campos como `price`, `rooms`, `baths`, `area`, evitando errores `invalid input syntax for type integer`.
- **Mejora en GET `/api/agency/properties`**: ahora devuelve también el campo `portada` (primera imagen) para facilitar la visualización en el frontend.

#### 5. Archivos modificados
- `frontend-react/src/pages/Home.jsx` → eliminada barra de búsqueda.
- `frontend-react/src/pages/Properties.jsx` → añadidos filtros y paginación.
- `frontend-react/src/pages/AgencyDashboard.jsx` → rediseño completo con tarjetas, botones de destacar/editar/eliminar, y modal de edición.
- `frontend-react/src/services/api.js` → añadido método `updateProperty` para editar propiedades.
- `server.ts` → nuevos endpoints para editar y destacar, y mejoras en sanitización.
- `frontend-react/src/index.css` → se añadieron estilos para los nuevos botones y tarjetas del dashboard, y se ajustaron estilos responsive.

### Funcionalidades actualizadas
| Funcionalidad | Estado |
|---|---|
| Hero sin buscador en Home | ✅ |
| Filtros combinados en Properties | ✅ |
| Paginación en Properties (9 por página) | ✅ |
| Dashboard de agencia con tarjetas | ✅ |
| Botón Destacar/Desdestacar | ✅ |
| Edición de propiedades | ✅ |
| Eliminación de propiedades | ✅ |
| Sanitización de datos en backend | ✅ |

---

## Próximos pasos (pendientes)

- [x] Build de producción (`pnpm build`) y servir desde Express
- [x] Migración a TypeScript (Fase 1 y 2 completadas)
- [x] Migración a PostgreSQL para persistencia real
- [x] Deploy en VPS propio con dominio y SSL
- [x] CRUD completo de agencias (crear, editar, eliminar)
- [x] Hero sin buscador en Home
- [x] Filtros avanzados y paginación en Properties
- [x] Dashboard de agencia con tarjetas, destacar y editar
- [ ] **Modal de propiedades reutilizable**: extraer `PropertyModal` a un componente compartido para usarlo en `Properties`, `AgencyProfile`, `AgencyDashboard` y `Home`.
- [ ] Mejorar SEO con títulos dinámicos por página
- [ ] Agregar más propiedades de demo con imágenes reales subidas
- [ ] Implementar búsqueda funcional en el hero (si se decide restaurar)
- [ ] Notificaciones por email al recibir mensajes (nodemailer ya instalado)
- [ ] Migrar frontend .jsx → .tsx para TypeScript completo
- [ ] Agregar confirmación al eliminar propiedades (ya implementado)
- [ ] Paginación en el backend para optimizar rendimiento (actualmente es frontend)