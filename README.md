# Tareas del equipo

Plataforma colaborativa de tareas para ~9 personas: **las tareas son compartidas**,
pero **el progreso de cada usuario es completamente independiente**.

## Cómo funciona la parte importante (tareas compartidas + progreso individual)

Hay dos tablas separadas en la base de datos:

- `tasks`: la tarea global (título, descripción, fecha límite, prioridad). Una sola fila por tarea, visible para todos.
- `task_progress`: una fila **por usuario y por tarea** (`user_id`, `task_id`, `status`). Aquí vive el checkbox de cada quien.

Cuando se crea una tarea nueva, un trigger en la base de datos (`fn_create_progress_for_new_task`)
genera automáticamente una fila `pendiente` en `task_progress` para cada uno de los 9 usuarios.
Cuando alguien marca su checkbox, solo se actualiza **su propia fila** — nunca la de los demás.
Row Level Security (RLS) refuerza esto en el servidor: un usuario solo puede leer/escribir
las filas de `task_progress` donde `user_id = auth.uid()`.

Solo los perfiles con `is_admin = true` ("usuarios autorizados") pueden crear, editar o eliminar
tareas globales; esto también se aplica con políticas RLS, no solo en la interfaz.

## 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta el contenido completo de [`supabase/schema.sql`](./supabase/schema.sql).
   Esto crea las tablas, las políticas de seguridad (RLS), los triggers automáticos y activa Realtime.
3. Ve a **Authentication → Providers** y confirma que el login por Email/Password está habilitado.
   Para pruebas internas, puedes desactivar "Confirm email" en **Authentication → Settings**.
4. Crea las 9 cuentas del equipo desde la propia app (pantalla "Crear cuenta"), o invítalas
   desde **Authentication → Users → Invite user**.
5. Convierte a una o más personas en "usuario autorizado" (puede crear/editar/eliminar tareas):
   ```sql
   update public.profiles set is_admin = true where email = 'correo-de-la-persona@ejemplo.com';
   ```
6. Copia tu **Project URL** y **anon public key** desde **Project Settings → API**.

## 2. Configurar el proyecto localmente

```bash
cp .env.example .env
# Pega tu VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env

npm install
npm run dev
```

Abre `http://localhost:5173`.

## 3. Desplegar

Cualquier hosting de sitios estáticos sirve (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build
```

Sube el contenido de `dist/` y configura las mismas variables de entorno
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en el panel del hosting.

## Estructura del proyecto

```
src/
  context/AuthContext.jsx    # sesión + perfil del usuario actual
  hooks/useTasks.js          # tareas globales + progreso individual + realtime
  components/
    Login.jsx                # inicio de sesión / registro
    Sidebar.jsx               # navegación lateral
    Dashboard.jsx              # panel personal con estadísticas
    TaskList.jsx / TaskItem.jsx  # listado con checkbox individual y filtros
    TaskFormModal.jsx          # crear/editar tarea (solo usuarios autorizados)
    ProfilePage.jsx             # perfil y progreso individual
supabase/schema.sql          # tablas, RLS, triggers, realtime
```

## Funcionalidades incluidas

- Tareas compartidas visibles para todos los usuarios en tiempo real (Supabase Realtime).
- Estado de cada tarea (pendiente/completada) 100% independiente por usuario.
- Crear, editar y eliminar tareas globalmente (solo usuarios autorizados vía `is_admin`).
- Marcar/desmarcar como completada, ocultar una tarea completada solo de la propia vista.
- Dashboard personal: total, pendientes, completadas, % de progreso, próximas a vencer.
- Filtros por prioridad y búsqueda por título.
- Diseño responsivo (barra lateral colapsable en móvil).

## Notas y siguientes pasos sugeridos

- El registro de cuentas está abierto en este scaffold; si prefieres controlarlo tú,
  crea las cuentas desde el panel de Supabase y desactiva la pestaña "Crear cuenta" en `Login.jsx`.
- Si quieres notificaciones (correo/Slack) al vencer una tarea, se puede añadir con
  Supabase Edge Functions + un cron (`pg_cron`), no incluido en este scaffold.
