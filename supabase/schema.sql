-- =====================================================================
-- Euro Ride — Jeddah Chapter — Supabase schema
-- Run this in your Supabase project: SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY guards).
-- =====================================================================

-- ---------------------------------------------------------------------
-- PROFILES  (riders)
--   status: 'pending' | 'approved'      role: 'member' | 'admin'
--   `data` jsonb holds extras (emoji avatar, …)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  name        text not null default 'New Rider',
  status      text not null default 'pending',   -- pending | approved
  role        text not null default 'member',    -- member  | admin
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Shared trip data. Each row stores the full object in `data`, so the
-- React UI keeps its exact shape. id is client-generated (Date.now()).
--   expenses:     { amount, currency, category, note, date, by }
--   reservations: { label, ref, by }
--   completions:  { day, km, by }
--   photos:       { day, url, by }
-- ---------------------------------------------------------------------
create table if not exists public.expenses (
  id numeric primary key,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id numeric primary key,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.completions (
  id numeric primary key,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id numeric primary key,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id numeric primary key,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Direct messages (Inbox). to_id is a real column so RLS can restrict reads
-- to the sender and recipient only.
create table if not exists public.messages (
  id numeric primary key,
  data jsonb not null default '{}'::jsonb,
  to_id uuid references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- INVITE CODES — anyone who signs up with a valid active code is
-- auto-approved (skips the admin queue).
-- ---------------------------------------------------------------------
create table if not exists public.invite_codes (
  code text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed one starter code (change/disable it later in the table editor)
insert into public.invite_codes (code) values ('JEDDAH-2026')
  on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------
create or replace function public.is_approved()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and status = 'approved');
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role = 'admin');
$$;

-- Auto-create a profile when a new auth user signs up.
-- The very first rider becomes an approved admin (that's you).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_first boolean;
begin
  select count(*) = 0 into is_first from public.profiles;
  insert into public.profiles (id, email, name, status, role, data)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case when is_first then 'approved' else 'pending' end,
    case when is_first then 'admin'    else 'member'  end,
    coalesce(new.raw_user_meta_data->'data', '{}'::jsonb)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Redeem an invite code → approve the calling user. Called from the client.
create or replace function public.redeem_invite(p_code text)
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  select exists (select 1 from public.invite_codes
                 where code = p_code and active) into ok;
  if ok then
    perform set_config('app.bypass_guard', 'on', true);
    update public.profiles set status = 'approved' where id = auth.uid();
  end if;
  return ok;
end;
$$;

-- Prevent privilege escalation: a non-admin cannot change their own
-- status/role by editing their profile directly.
create or replace function public.profiles_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.status is distinct from old.status) or (new.role is distinct from old.role) then
    if coalesce(current_setting('app.bypass_guard', true), '') <> 'on'
       and not public.is_admin() then
      new.status := old.status;
      new.role := old.role;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_trg on public.profiles;
create trigger profiles_guard_trg
  before update on public.profiles
  for each row execute function public.profiles_guard();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.expenses     enable row level security;
alter table public.reservations enable row level security;
alter table public.completions  enable row level security;
alter table public.photos       enable row level security;
alter table public.announcements enable row level security;
alter table public.invite_codes enable row level security;

-- PROFILES: any authenticated user can read the roster; you can edit your
-- own profile (not your status/role); admins can edit anyone (approvals).
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Shared tables: approved riders read everything; you can only write
-- your own rows (admins can moderate anything).
do $$
declare t text;
begin
  foreach t in array array['expenses','reservations','completions','photos','announcements'] loop
    execute format('drop policy if exists %1$s_select on public.%1$s', t);
    execute format('create policy %1$s_select on public.%1$s
      for select to authenticated using (public.is_approved())', t);

    execute format('drop policy if exists %1$s_insert on public.%1$s', t);
    execute format('create policy %1$s_insert on public.%1$s
      for insert to authenticated
      with check (public.is_approved() and created_by = auth.uid())', t);

    execute format('drop policy if exists %1$s_update on public.%1$s', t);
    execute format('create policy %1$s_update on public.%1$s
      for update to authenticated
      using (public.is_approved() and (created_by = auth.uid() or public.is_admin()))', t);

    execute format('drop policy if exists %1$s_delete on public.%1$s', t);
    execute format('create policy %1$s_delete on public.%1$s
      for delete to authenticated
      using (public.is_approved() and (created_by = auth.uid() or public.is_admin()))', t);
  end loop;
end $$;

-- INVITE CODES: readable by authenticated (the redeem RPC checks validity);
-- only admins can manage them.
drop policy if exists invite_select on public.invite_codes;
create policy invite_select on public.invite_codes
  for select to authenticated using (true);
drop policy if exists invite_admin on public.invite_codes;
create policy invite_admin on public.invite_codes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Realtime: broadcast row changes to subscribed clients
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.reservations;
alter publication supabase_realtime add table public.completions;
alter publication supabase_realtime add table public.photos;
alter publication supabase_realtime add table public.announcements;

-- ---------------------------------------------------------------------
-- STORAGE: public 'media' bucket for trip photos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do nothing;

drop policy if exists media_read on storage.objects;
create policy media_read on storage.objects
  for select to public using (bucket_id = 'media');

drop policy if exists media_write on storage.objects;
create policy media_write on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_approved());

-- Done. Create your account in the app — the first signup becomes admin.

-- ---------------------------------------------------------------------
-- MESSAGES (Inbox) — sender + recipient only can read
-- ---------------------------------------------------------------------
alter table public.messages enable row level security;

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select to authenticated
  using (public.is_approved() and (created_by = auth.uid() or to_id = auth.uid()));

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (public.is_approved() and created_by = auth.uid());

drop policy if exists messages_delete on public.messages;
create policy messages_delete on public.messages
  for delete to authenticated
  using (created_by = auth.uid() or public.is_admin());

do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
