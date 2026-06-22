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

## Próximos pasos (opcionales para mejoras)

- [x] Build de producción (`pnpm build`) y servir desde Express
- [ ] Mejorar SEO con títulos dinámicos por página
- [ ] Agregar más propiedades de demo con imágenes reales subidas
- [ ] Implementar búsqueda funcional en el hero
- [ ] Agregar edición de propiedades (además de crear/eliminar)
- [ ] Notificaciones por email al recibir mensajes (nodemailer ya instalado)
- [ ] Migrar a PostgreSQL para persistencia en Render (producción real)
