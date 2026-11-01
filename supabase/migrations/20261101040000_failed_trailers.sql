-- Migration: Create failed_trailers table for logging playback failures
create table if not exists public.failed_trailers (
  id uuid primary key default gen_random_uuid(),
  trailer_id text not null,
  error text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.failed_trailers enable row level security;

create policy "Allow inserting failed trailer logs"
  on public.failed_trailers for insert
  to authenticated, anon
  with check (true);

create policy "Allow selecting failed trailer logs"
  on public.failed_trailers for select
  to authenticated
  using (true);

