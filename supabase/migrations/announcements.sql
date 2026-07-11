-- Announcements board — run this once in Supabase (SQL Editor → paste → Run).
-- Adds the shared feed for the News tab.

create table if not exists public.announcements (
  id numeric primary key,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists announcements_select on public.announcements;
create policy announcements_select on public.announcements
  for select to authenticated using (public.is_approved());

drop policy if exists announcements_insert on public.announcements;
create policy announcements_insert on public.announcements
  for insert to authenticated
  with check (public.is_approved() and created_by = auth.uid());

drop policy if exists announcements_update on public.announcements;
create policy announcements_update on public.announcements
  for update to authenticated
  using (public.is_approved() and (created_by = auth.uid() or public.is_admin()));

drop policy if exists announcements_delete on public.announcements;
create policy announcements_delete on public.announcements
  for delete to authenticated
  using (public.is_approved() and (created_by = auth.uid() or public.is_admin()));

do $$ begin
  alter publication supabase_realtime add table public.announcements;
exception when duplicate_object then null; end $$;
