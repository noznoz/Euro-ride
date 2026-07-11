-- Inbox (rider-to-rider messages) — run once in Supabase (SQL Editor → Run).

create table if not exists public.messages (
  id numeric primary key,
  data jsonb not null default '{}'::jsonb,   -- { fromName, toName, text, ts }
  to_id uuid references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- You can read a message only if you sent it or it's addressed to you.
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
