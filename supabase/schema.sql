-- ============================================================
-- ESQUEMA: Plataforma de tareas compartidas / progreso individual
-- ============================================================
-- Ejecutar en el SQL Editor de tu proyecto Supabase.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 0. PERMISOS BASE
-- ------------------------------------------------------------
-- IMPORTANTE: las políticas RLS (más abajo) solo filtran FILAS.
-- Sin este GRANT, Postgres bloquea el acceso a la tabla incluso
-- si la política RLS lo permitiría (error 42501 / insufficient_privilege).
grant usage on schema public to authenticated;

-- ------------------------------------------------------------
-- 1. PERFILES (un registro por usuario autenticado)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  is_admin boolean not null default false, -- "usuario autorizado" para crear/editar/eliminar tareas globales
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select, insert, update, delete on public.profiles to authenticated;

create policy "los perfiles son visibles para cualquier usuario autenticado"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "un usuario solo edita su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- ------------------------------------------------------------
-- 2. TAREAS GLOBALES (compartidas entre todo el equipo)
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  due_date date,
  priority text not null default 'media' check (priority in ('baja', 'media', 'alta')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
grant select, insert, update, delete on public.tasks to authenticated;

create policy "todas las tareas son visibles para cualquier usuario autenticado"
  on public.tasks for select
  using (auth.role() = 'authenticated');

create policy "solo usuarios autorizados crean tareas"
  on public.tasks for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "solo usuarios autorizados editan tareas"
  on public.tasks for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "solo usuarios autorizados eliminan tareas"
  on public.tasks for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ------------------------------------------------------------
-- 3. PROGRESO INDIVIDUAL (una fila por usuario + tarea)
-- ------------------------------------------------------------
-- Esta es la tabla clave: cada usuario tiene SU PROPIO estado
-- para la MISMA tarea. Nunca se comparte entre usuarios.
create table if not exists public.task_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  status text not null default 'pendiente' check (status in ('pendiente', 'completada')),
  hidden boolean not null default false, -- ocultar de "mi vista" sin afectar a otros
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, task_id)
);

alter table public.task_progress enable row level security;
grant select, insert, update, delete on public.task_progress to authenticated;

create policy "un usuario solo ve su propio progreso"
  on public.task_progress for select
  using (auth.uid() = user_id);

create policy "un usuario solo inserta su propio progreso"
  on public.task_progress for insert
  with check (auth.uid() = user_id);

create policy "un usuario solo actualiza su propio progreso"
  on public.task_progress for update
  using (auth.uid() = user_id);

create policy "un usuario solo elimina su propio progreso"
  on public.task_progress for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. TRIGGERS: mantener sincronizadas las filas de progreso
-- ------------------------------------------------------------

-- 4a. Cuando se crea una tarea nueva, se genera automáticamente
--     una fila de progreso "pendiente" para CADA usuario existente.
create or replace function public.fn_create_progress_for_new_task()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_progress (user_id, task_id, status)
  select p.id, new.id, 'pendiente'
  from public.profiles p
  on conflict (user_id, task_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_new_task on public.tasks;
create trigger trg_new_task
  after insert on public.tasks
  for each row execute function public.fn_create_progress_for_new_task();

-- 4b. Cuando se registra un usuario nuevo (via Supabase Auth),
--     se crea su perfil y se le generan filas "pendiente" para
--     todas las tareas globales ya existentes.
create or replace function public.fn_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );

  insert into public.task_progress (user_id, task_id, status)
  select new.id, t.id, 'pendiente'
  from public.tasks t
  on conflict (user_id, task_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_new_user on auth.users;
create trigger trg_new_user
  after insert on auth.users
  for each row execute function public.fn_handle_new_user();

-- 4c. Mantener updated_at al día en tasks y task_progress.
create or replace function public.fn_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tasks_touch on public.tasks;
create trigger trg_tasks_touch
  before update on public.tasks
  for each row execute function public.fn_touch_updated_at();

drop trigger if exists trg_progress_touch on public.task_progress;
create trigger trg_progress_touch
  before update on public.task_progress
  for each row execute function public.fn_touch_updated_at();

-- ------------------------------------------------------------
-- 5. REALTIME: permite que la UI reciba cambios en vivo
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.task_progress;

-- ------------------------------------------------------------
-- 6. Primer usuario autorizado (opcional)
-- ------------------------------------------------------------
-- Después de crear tu primera cuenta desde la app, ejecuta:
-- update public.profiles set is_admin = true where email = 'tu-correo@ejemplo.com';
