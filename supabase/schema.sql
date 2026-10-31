-- Takilya Supabase Schema
-- Philippine Films Mobile Discovery & Reviews Database
-- Compliant with AGENTS.md data model rules and Row Level Security

-- Extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles & Roles
create type user_role as enum ('user', 'critic', 'verified_official', 'admin');
create type verification_status_type as enum ('unverified', 'pending', 'verified', 'rejected');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  role user_role default 'user' not null,
  verification_status verification_status_type default 'unverified' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Studios
create table if not exists studios (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  studio_type text check (studio_type in ('indie', 'mainstream', 'regional', 'collective')) default 'indie',
  verification_status verification_status_type default 'unverified' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Festivals
create table if not exists festivals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  location text,
  established_year integer,
  verification_status verification_status_type default 'unverified' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. People (Directors, Actors, Writers, Cinematographers)
create table if not exists people (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  slug text unique not null,
  biography text,
  photo_url text,
  is_national_artist boolean default false not null,
  verification_status verification_status_type default 'unverified' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Films (Philippine Films ONLY - no TV series)
create table if not exists films (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  original_title text,
  slug text unique not null,
  synopsis text not null,
  release_year integer not null,
  runtime_minutes integer,
  poster_url text,
  backdrop_url text,
  primary_language text default 'Filipino',
  regional_dialect text, -- Bikol, Cebuano, Hiligaynon, Ilokano, Kapampangan, Waray, etc.
  director_id uuid references people(id) on delete set null,
  studio_id uuid references studios(id) on delete set null,
  critic_score numeric(4, 1),   -- 0 - 100
  audience_score numeric(4, 1), -- 0 - 100
  is_preserved boolean default false not null,
  is_national_artist_work boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Trailers & Clips (YouTube embeds only - Never host/upload video files)
create table if not exists trailers (
  id uuid primary key default uuid_generate_v4(),
  film_id uuid references films(id) on delete cascade not null,
  youtube_video_id text not null, -- 11 character YouTube ID
  title text not null,
  type text check (type in ('trailer', 'teaser', 'clip', 'restoration_clip')) default 'trailer' not null,
  is_official boolean default true not null,
  is_promoted boolean default false not null,
  promoted_label text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Reviews & Ratings (Dual: critic vs. audience)
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  film_id uuid references films(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  rating numeric(3, 1) not null check (rating >= 1.0 and rating <= 10.0),
  author_role user_role not null,
  title text,
  content text not null,
  spoiler_warning boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Polymorphic Follows: (follower_id, target_type in ['user','studio','festival','person'], target_id)
create table if not exists follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid references profiles(id) on delete cascade not null,
  target_type text check (target_type in ('user', 'studio', 'festival', 'person')) not null,
  target_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (follower_id, target_type, target_id)
);

-- 9. Watchlist & Top Films
create table if not exists watchlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  film_id uuid references films(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, film_id)
);

create table if not exists top_films (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  film_id uuid references films(id) on delete cascade not null,
  rank_position integer check (rank_position between 1 and 10) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, rank_position)
);

-- 10. Award Recognitions
create type award_status as enum ('nominated', 'won', 'official_selection', 'special_mention');

create table if not exists award_recognitions (
  id uuid primary key default uuid_generate_v4(),
  film_id uuid references films(id) on delete cascade not null,
  award_body text not null, -- Gawad Urian, FAMAS, Cinemalaya, QCinema, Metro Manila Film Festival
  category text not null,
  status award_status not null,
  edition_year integer not null,
  recipient_person_id uuid references people(id) on delete set null
);

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
alter table profiles enable row level security;
alter table studios enable row level security;
alter table festivals enable row level security;
alter table people enable row level security;
alter table films enable row level security;
alter table trailers enable row level security;
alter table reviews enable row level security;
alter table follows enable row level security;
alter table watchlist enable row level security;
alter table top_films enable row level security;
alter table award_recognitions enable row level security;

-- RLS Policies
create policy "Public read profiles" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

create policy "Public read studios" on studios for select using (true);
create policy "Public read festivals" on festivals for select using (true);
create policy "Public read people" on people for select using (true);
create policy "Public read films" on films for select using (true);
create policy "Public read trailers" on trailers for select using (true);
create policy "Public read reviews" on reviews for select using (true);
create policy "Authenticated users insert reviews" on reviews for insert with check (auth.uid() = author_id);
create policy "Users update own reviews" on reviews for update using (auth.uid() = author_id);

create policy "Public read follows" on follows for select using (true);
create policy "Authenticated users manage follows" on follows for all using (auth.uid() = follower_id);

create policy "Users view own watchlist" on watchlist for select using (auth.uid() = user_id);
create policy "Users manage own watchlist" on watchlist for all using (auth.uid() = user_id);

create policy "Public read top films" on top_films for select using (true);
create policy "Users manage own top films" on top_films for all using (auth.uid() = user_id);

create policy "Public read award recognitions" on award_recognitions for select using (true);

