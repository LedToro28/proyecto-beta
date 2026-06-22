# Agent Workspace - Proyecto Beta

Este archivo sirve como registro de las directrices, decisiones arquitectónicas y notas del agente para la migración de Inmonacional a React.

## Reglas y Metas del Proyecto
1. **Desacoplamiento:** Mantener la API actual en Node.js/Express y construir el nuevo Frontend en React (con Vite).
2. **Registro Constante:** Todo cambio mayor será documentado en `progreso.md`.
3. **Control de Versiones:** Mantener el repositorio sincronizado con el compañero de equipo usando `git fetch` y `git pull`.
9. **Entorno de Trabajo Distribuido:** El usuario opera en un único VPS mediante conexiones SSH desde dos clientes: su Laptop (Editor Antigravity) y su PC de Mesa (Editor Cursor). *Nota Operativa:* Los servidores (Node/Vite) solo deben estar iniciados en un editor a la vez para evitar conflictos de puertos (`EADDRINUSE`).

### Comandos de Arranque (Startup)
Al cambiar de entorno o reiniciar el editor, prender los motores abriendo dos terminales:
*   **Terminal 1 (Backend):** Estando en la raíz (`/proyecto-beta`), ejecutar `node server.js`
*   **Terminal 2 (Frontend):** Estando en la subcarpeta (`/proyecto-beta/frontend-react`), ejecutar `pnpm dev`
