-- ==============================================================================
-- Takilya Migration: Review Comments & Social Interactions
-- ==============================================================================

create table if not exists public.review_comments (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references public.reviews(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_review_comments_review_id on public.review_comments(review_id);
create index if not exists idx_review_comments_user_id on public.review_comments(user_id);
create index if not exists idx_review_comments_created_at on public.review_comments(created_at asc);

create trigger tr_review_comments_updated_at
  before update on public.review_comments
  for each row execute function public.update_updated_at_column();

-- Row Level Security
alter table public.review_comments enable row level security;

create policy "Public can view review comments"
  on public.review_comments for select
  using (true);

create policy "Authenticated users can post comments"
  on public.review_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own comments"
  on public.review_comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.review_comments for delete
  using (auth.uid() = user_id);

