-- ==============================================================================
-- Takilya Migration: Notifications Schema & Realtime Setup (Prompt 4.5)
-- Ensures entity_type and entity_id exist on notifications,
-- adds unread count performance index, mark_all_notifications_read RPC,
-- and adds notifications table to supabase_realtime publication.
-- ==============================================================================

alter table public.notifications
  add column if not exists entity_type text check (entity_type in ('film', 'thread', 'comment', 'review', 'trailer')),
  add column if not exists entity_id uuid;

-- Performance indexes for notifications screen and unread badge count
create index if not exists idx_notifications_user_unread
  on public.notifications(user_id) where not is_read;

create index if not exists idx_notifications_entity
  on public.notifications(entity_type, entity_id);

-- Atomic RPC to mark all notifications as read for current user
create or replace function public.mark_all_notifications_read(target_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count int;
begin
  if auth.uid() != target_user_id and not public.is_admin() then
    raise exception 'Unauthorized to mark notifications for this user';
  end if;

  update public.notifications
  set is_read = true
  where user_id = target_user_id and is_read = false;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

grant execute on function public.mark_all_notifications_read(uuid) to authenticated;

-- Enable Supabase Realtime publication on notifications table
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
exception
  when others then null;
end $$;
