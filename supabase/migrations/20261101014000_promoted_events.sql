-- Migration: 20261101014000_promoted_events.sql
-- Promoted Trailer Slots Analytics (Takilya Prompt 4.2)
-- Strict AGENTS.md rule: Promoted content is allowed only in clearly labeled promoted_slots,
-- shown at most 1 per 10 organic feed items, always with a visible "Promoted" tag.
-- Promoted items must NEVER influence or bias rating, score, or review rankings.

create type public.promoted_event_type as enum ('impression', 'tap');

create table if not exists public.promoted_events (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid references public.promoted_slots(id) on delete cascade not null,
  event_type public.promoted_event_type not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_promoted_events_slot on public.promoted_events(slot_id, event_type);
create index if not exists idx_promoted_events_created_at on public.promoted_events(created_at desc);

-- Enable RLS
alter table public.promoted_events enable row level security;

-- Anyone (authenticated or guest viewers) can insert event tracking rows (impressions & taps)
create policy "Allow inserting promoted events"
  on public.promoted_events for insert
  with check (true);

-- Admins can view analytics on all promoted events
create policy "Admins view all promoted events"
  on public.promoted_events for select
  using (public.is_admin());

