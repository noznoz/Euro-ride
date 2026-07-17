-- Push notifications — run once in Supabase (SQL Editor → paste → Run).
-- One row per device subscription.

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  rider_id uuid references public.profiles(id) on delete cascade,
  rider_name text,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- Riders manage only their own device subscriptions. The edge function reads
-- everything using the service-role key (which bypasses RLS).
drop policy if exists push_rw on public.push_subscriptions;
create policy push_rw on public.push_subscriptions
  for all to authenticated
  using (rider_id = auth.uid())
  with check (rider_id = auth.uid());
