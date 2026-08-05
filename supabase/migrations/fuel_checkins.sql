-- Fuel log + roll-call check-ins — run once in Supabase (SQL Editor → Run).

create table if not exists public.fuel (
  id numeric primary key,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.fuel enable row level security;
drop policy if exists fuel_select on public.fuel;
create policy fuel_select on public.fuel for select to authenticated using (public.is_approved());
drop policy if exists fuel_write on public.fuel;
create policy fuel_write on public.fuel for all to authenticated
  using (public.is_approved() and created_by = auth.uid())
  with check (public.is_approved() and created_by = auth.uid());

create table if not exists public.checkins (
  rider_id   uuid primary key references public.profiles(id) on delete cascade,
  rider_name text,
  ts         bigint,
  updated_at timestamptz not null default now()
);
alter table public.checkins enable row level security;
drop policy if exists checkins_select on public.checkins;
create policy checkins_select on public.checkins for select to authenticated using (public.is_approved());
drop policy if exists checkins_write on public.checkins;
create policy checkins_write on public.checkins for all to authenticated
  using (rider_id = auth.uid()) with check (rider_id = auth.uid() and public.is_approved());

do $$ begin
  alter publication supabase_realtime add table public.fuel;
  alter publication supabase_realtime add table public.checkins;
exception when duplicate_object then null; end $$;
