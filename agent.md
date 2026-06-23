# Agent Workspace - Proyecto Beta (InmoYa)

Este archivo sirve como registro de las directrices, decisiones arquitectónicas y notas del agente para el proyecto InmoYa.

## Reglas y Metas del Proyecto
1. **Desacoplamiento:** API en Node.js/Express (TypeScript) + Frontend en React (Vite).
2. **Registro Constante:** Todo cambio mayor se documenta en `progreso.md`.
3. **Control de Versiones:** Repositorio sincronizado con el compañero usando `git fetch` y `git pull`.
4. **Package Manager:** Usar **pnpm** exclusivamente. NO usar npm (por seguridad).
5. **Base de datos:** PostgreSQL (no SQLite). Conexión via `DATABASE_URL` en `.env`.
6. **Entorno de Trabajo Distribuido:** El usuario opera en un VPS (Contabo) mediante SSH desde su PC (Cursor) o Laptop (Antigravity). Los servidores solo deben estar iniciados en un editor a la vez para evitar conflictos de puertos (`EADDRINUSE`).

---

## Infraestructura de Producción (VPS)

| Componente | Detalle |
|-----------|---------|
| **URL Producción** | https://inmoya.pedroservicios.xyz |
| **VPS** | Contabo, Ubuntu 24.04, 4 vCPU, 8GB RAM |
| **IP** | 109.199.117.161 |
| **Base de datos** | PostgreSQL 16 (nativo, localhost:5432) |
| **DB nombre** | `inmoya_db` |
| **DB usuario** | `inmoya` |
| **Reverse Proxy** | Traefik (via EasyPanel/Docker) |
| **SSL** | Let's Encrypt automático via Traefik |
| **Process Manager** | PM2 (`ecosystem.config.cjs`) |
| **Node** | v22.22.2 |
| **pnpm** | v11.5.2 |

### Comandos PM2 (producción)
```bash
pm2 status              # ver estado
pm2 logs inmoya         # ver logs en vivo
pm2 restart inmoya      # reiniciar tras cambios
pm2 stop inmoya         # detener
```

### Deploy manual (tras git pull)
```bash
cd /root/proyecto-beta
git pull origin main

# Si cambió el frontend:
cd frontend-react && pnpm install && pnpm run build && cd ..

# Si cambió el backend:
pnpm install
pm2 restart inmoya
```

### Nota técnica: Traefik → Host
- Traefik está en Docker (red `easypanel`), no puede acceder directamente al host
- Se usa `docker_gwbridge` gateway: `172.18.0.1:3001`
- Reglas iptables abiertas para Docker → host en puerto 3001
- Config en `/etc/easypanel/traefik/config/main.yaml`

---

## Deploy antiguo (Render)

| Detalle | Valor |
|---------|-------|
| **URL** | https://proyecto-beta-2.onrender.com |
| **Estado** | Activo pero con SQLite efímero |
| **Autodeploy** | Sí (al hacer push a GitHub) |

**Nota:** Render sigue funcionando de forma independiente con SQLite. No interfiere con el VPS. Los cambios que se pushean a GitHub se reflejan automáticamente en Render, pero NO en el VPS (el VPS requiere `git pull` manual).

---

## Flujo de trabajo del equipo

```
Compañero hace cambios → git push → GitHub
                                       │
                         ┌─────────────┼──────────────┐
                         ▼                            ▼
                  Render (auto)              VPS (manual)
                  SQLite efímero        git pull + pm2 restart
                  proyecto-beta-2...    inmoya.pedroservicios.xyz
```

### Para reflejar cambios del compañero en el VPS:
1. `cd /root/proyecto-beta && git pull`
2. Si tocó frontend: `cd frontend-react && pnpm install && pnpm run build`
3. Si tocó backend: `pnpm install && pm2 restart inmoya`

---

## Comandos de Arranque (Desarrollo local)

Al iniciar el entorno de desarrollo:
- **Terminal 1 (Backend):** `cd /root/proyecto-beta && pnpm run start`
- **Terminal 2 (Frontend):** `cd /root/proyecto-beta/frontend-react && pnpm dev`
- Acceder a: `http://localhost:5173`
