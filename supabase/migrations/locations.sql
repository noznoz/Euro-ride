-- Live location sharing — run once in Supabase (SQL Editor → paste → Run).
-- One row per rider (their latest shared location).

create table if not exists public.locations (
  rider_id   uuid primary key references public.profiles(id) on delete cascade,
  rider_name text,
  lat        double precision,
  lon        double precision,
  sos        boolean not null default false,
  ts         bigint,
  updated_at timestamptz not null default now()
);

alter table public.locations enable row level security;

drop policy if exists locations_select on public.locations;
create policy locations_select on public.locations
  for select to authenticated using (public.is_approved());

drop policy if exists locations_write on public.locations;
create policy locations_write on public.locations
  for all to authenticated
  using (rider_id = auth.uid())
  with check (rider_id = auth.uid() and public.is_approved());

do $$ begin
  alter publication supabase_realtime add table public.locations;
exception when duplicate_object then null; end $$;
