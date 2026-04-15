create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null check (role in ('editor', 'admin')) default 'editor',
  created_at timestamptz not null default now()
);

create table if not exists public.features (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  feature_id uuid not null references public.features(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (feature_id, slug)
);

create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  is_active boolean not null default true
);

create table if not exists public.strings (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  key text unique not null,
  default_language_code text not null,
  description text,
  tags text[] not null default '{}',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  string_id uuid not null references public.strings(id) on delete cascade,
  language_id uuid not null references public.languages(id) on delete cascade,
  value text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  unique (string_id, language_id)
);

create table if not exists public.string_history (
  id uuid primary key default gen_random_uuid(),
  string_id uuid not null references public.strings(id) on delete cascade,
  language_id uuid references public.languages(id),
  old_value text,
  new_value text,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_strings_updated_at on public.strings;
create trigger set_strings_updated_at
before update on public.strings
for each row execute function public.handle_updated_at();

create or replace function public.is_editor_or_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role in ('editor', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

alter table public.features enable row level security;
alter table public.modules enable row level security;
alter table public.languages enable row level security;
alter table public.strings enable row level security;
alter table public.translations enable row level security;
alter table public.string_history enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "public read features" on public.features;
create policy "public read features" on public.features for select using (true);
drop policy if exists "editor manage features" on public.features;
create policy "editor manage features" on public.features for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

drop policy if exists "public read modules" on public.modules;
create policy "public read modules" on public.modules for select using (true);
drop policy if exists "editor manage modules" on public.modules;
create policy "editor manage modules" on public.modules for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

drop policy if exists "public read languages" on public.languages;
create policy "public read languages" on public.languages for select using (true);
drop policy if exists "admin manage languages" on public.languages;
create policy "admin manage languages" on public.languages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read strings" on public.strings;
create policy "public read strings" on public.strings for select using (true);
drop policy if exists "editor manage strings" on public.strings;
create policy "editor manage strings" on public.strings for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

drop policy if exists "public read translations" on public.translations;
create policy "public read translations" on public.translations for select using (true);
drop policy if exists "editor manage translations" on public.translations;
create policy "editor manage translations" on public.translations for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

drop policy if exists "admin read history" on public.string_history;
create policy "admin read history" on public.string_history for select using (public.is_admin());
drop policy if exists "editor insert history" on public.string_history;
create policy "editor insert history" on public.string_history for insert with check (public.is_editor_or_admin());

drop policy if exists "admin read profiles" on public.profiles;
create policy "admin read profiles" on public.profiles for select using (public.is_admin());
drop policy if exists "admin manage profiles" on public.profiles;
create policy "admin manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
