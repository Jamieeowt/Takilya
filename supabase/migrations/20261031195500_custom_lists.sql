-- ==============================================================================
-- Takilya Migration: Custom Film Lists & Collections
-- ==============================================================================

create table if not exists public.custom_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  is_private boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_custom_lists_user_id on public.custom_lists(user_id);
create index if not exists idx_custom_lists_created_at on public.custom_lists(created_at desc);

create table if not exists public.custom_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.custom_lists(id) on delete cascade not null,
  film_id uuid references public.films(id) on delete cascade not null,
  position integer default 0 not null,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (list_id, film_id)
);

create index if not exists idx_custom_list_items_list on public.custom_list_items(list_id);
create index if not exists idx_custom_list_items_film on public.custom_list_items(film_id);
create index if not exists idx_custom_list_items_position on public.custom_list_items(list_id, position);

create trigger tr_custom_lists_updated_at
  before update on public.custom_lists
  for each row execute function public.update_updated_at_column();

-- Row Level Security
alter table public.custom_lists enable row level security;
alter table public.custom_list_items enable row level security;

create policy "Public can view public lists"
  on public.custom_lists for select
  using (not is_private or auth.uid() = user_id);

create policy "Users can manage own lists"
  on public.custom_lists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can view list items of public lists"
  on public.custom_list_items for select
  using (
    exists (
      select 1 from public.custom_lists
      where custom_lists.id = custom_list_items.list_id
        and (not custom_lists.is_private or custom_lists.user_id = auth.uid())
    )
  );

create policy "Users can manage items of own lists"
  on public.custom_list_items for all
  using (
    exists (
      select 1 from public.custom_lists
      where custom_lists.id = custom_list_items.list_id
        and custom_lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.custom_lists
      where custom_lists.id = custom_list_items.list_id
        and custom_lists.user_id = auth.uid()
    )
  );

