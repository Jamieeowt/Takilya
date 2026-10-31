-- ==============================================================================
-- Takilya Migration: Watch History Table for Film Logging & Diary
-- ==============================================================================

create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  film_id uuid references public.films(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  watched_date date default current_date not null,
  is_rewatch boolean default false not null,
  medium text check (medium in ('in_cinema', 'physical_media', 'digital_streaming', 'other')) default 'digital_streaming' not null,
  notes text,
  rating numeric(2, 1) check (rating is null or rating in (0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_watch_history_user on public.watch_history(user_id);
create index if not exists idx_watch_history_film on public.watch_history(film_id);
create index if not exists idx_watch_history_date on public.watch_history(watched_date desc);

alter table public.watch_history enable row level security;

create policy "Users manage own watch history"
  on public.watch_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can view watch history"
  on public.watch_history for select
  using (true);

