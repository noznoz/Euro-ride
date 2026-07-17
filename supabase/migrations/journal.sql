-- Trip journal — run once in Supabase (SQL Editor → paste → Run).
-- Shared daily journal entries that build the trip's travel story.

create table if not exists public.journal (
  id numeric primary key,
  data jsonb not null default '{}'::jsonb,   -- { day, text, by, ts }
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.journal enable row level security;

drop policy if exists journal_select on public.journal;
create policy journal_select on public.journal
  for select to authenticated using (public.is_approved());

drop policy if exists journal_insert on public.journal;
create policy journal_insert on public.journal
  for insert to authenticated
  with check (public.is_approved() and created_by = auth.uid());

drop policy if exists journal_update on public.journal;
create policy journal_update on public.journal
  for update to authenticated
  using (public.is_approved() and (created_by = auth.uid() or public.is_admin()));

drop policy if exists journal_delete on public.journal;
create policy journal_delete on public.journal
  for delete to authenticated
  using (public.is_approved() and (created_by = auth.uid() or public.is_admin()));

do $$ begin
  alter publication supabase_realtime add table public.journal;
exception when duplicate_object then null; end $$;
