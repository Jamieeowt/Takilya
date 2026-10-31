-- ==============================================================================
-- Takilya: Full PostgreSQL Database Schema
-- Canonical Schema Reference (matches migrations/20261031160000_takilya_full_schema.sql)
-- Designed for Philippine Cinema Discovery, Ratings, Discussions, and Video Feed
-- Compliant with AGENTS.md rules & Supabase Row Level Security
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. ENUMS & DOMAIN TYPES
-- ==============================================================================

create type public.user_role as enum (
  'user',
  'critic',
  'verified_official',
  'admin'
);

create type public.verification_status_type as enum (
  'unverified',
  'pending',
  'verified',
  'rejected'
);

create type public.award_scope_type as enum (
  'local',
  'international'
);

create type public.award_status_type as enum (
  'nominated',
  'won',
  'official_selection',
  'special_mention'
);

create type public.award_recipient_type as enum (
  'film',
  'person'
);

create type public.trailer_type as enum (
  'teaser',
  'official',
  'international',
  'clip',
  'bts'
);

create type public.posted_by_type as enum (
  'admin',
  'studio',
  'festival',
  'person'
);

create type public.availability_type as enum (
  'subscription',
  'free',
  'rent',
  'buy',
  'theatrical'
);

create type public.follow_target_type as enum (
  'user',
  'studio',
  'festival',
  'person'
);

create type public.vote_target_type as enum (
  'review',
  'comment'
);

create type public.report_target_type as enum (
  'review',
  'comment',
  'thread',
  'trailer',
  'user'
);

create type public.report_status_type as enum (
  'pending',
  'reviewed',
  'resolved',
  'dismissed'
);

create type public.preservation_status_type as enum (
  'restored',
  'archived',
  'at_risk',
  'lost'
);

create type public.person_role_type as enum (
  'director',
  'actor',
  'writer',
  'cinematographer',
  'producer',
  'editor',
  'composer',
  'other'
);

-- ==============================================================================
-- 2. HELPER FUNCTIONS
-- ==============================================================================

-- Admin check function for RLS
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Generic updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- ==============================================================================
-- 3. PROFILES (Extends auth.users)
-- ==============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  role public.user_role default 'user' not null,
  verification_status public.verification_status_type default 'unverified' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30),
  constraint username_format check (username ~* '^[a-zA-Z0-9_]+$')
);

create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_verification on public.profiles(verification_status);

-- Protect role & verification_status so only admins can mutate them
create or replace function public.check_profile_privileged_updates()
returns trigger
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Only administrators can update account roles.';
    end if;
    if new.verification_status is distinct from old.verification_status then
      raise exception 'Only administrators can update account verification status.';
    end if;
  end if;
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger tr_protect_profile_privileged_fields
  before update on public.profiles
  for each row
  execute function public.check_profile_privileged_updates();

-- Trigger to automatically create profile on auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    bio,
    role,
    verification_status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', 'Cinephile'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'bio',
    'user',
    'unverified'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 4. STUDIOS & OUTFITS
-- ==============================================================================

create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  founded_year integer,
  verification_status public.verification_status_type default 'unverified' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_studios_slug on public.studios(slug);
create index if not exists idx_studios_verification on public.studios(verification_status);

create trigger tr_studios_updated_at
  before update on public.studios
  for each row execute function public.update_updated_at_column();

-- ==============================================================================
-- 5. PEOPLE (Directors, Actors, Writers, Cinematographers)
-- ==============================================================================

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  bio text,
  photo_url text,
  birth_year integer,
  role_type public.person_role_type default 'director' not null,
  verification_status public.verification_status_type default 'unverified' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_people_slug on public.people(slug);
create index if not exists idx_people_role_type on public.people(role_type);
create index if not exists idx_people_verification on public.people(verification_status);

create trigger tr_people_updated_at
  before update on public.people
  for each row execute function public.update_updated_at_column();

-- ==============================================================================
-- 6. FILMS (Philippine Films ONLY - No TV Series)
-- ==============================================================================

create table if not exists public.films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  original_title text,
  slug text unique not null,
  synopsis text not null,
  release_date date,
  runtime_minutes integer check (runtime_minutes is null or runtime_minutes > 0),
  language text default 'Filipino' not null,
  mtrcb_rating text check (mtrcb_rating in ('G', 'PG', 'R-13', 'R-16', 'R-18', 'X', 'Unrated')) default 'Unrated',
  poster_url text,
  backdrop_url text,
  is_classic boolean default false not null,
  studio_id uuid references public.studios(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_films_slug on public.films(slug);
create index if not exists idx_films_studio_id on public.films(studio_id);
create index if not exists idx_films_release_date on public.films(release_date);
create index if not exists idx_films_is_classic on public.films(is_classic);
create index if not exists idx_films_language on public.films(language);

create trigger tr_films_updated_at
  before update on public.films
  for each row execute function public.update_updated_at_column();

-- ==============================================================================
-- 7. FILM CREDITS
-- ==============================================================================

create table if not exists public.film_credits (
  id uuid primary key default gen_random_uuid(),
  film_id uuid references public.films(id) on delete cascade not null,
  person_id uuid references public.people(id) on delete cascade not null,
  role text not null, -- 'director', 'writer', 'lead_actor', 'supporting_actor', etc.
  character_name text,
  billing_order integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (film_id, person_id, role, character_name)
);

create index if not exists idx_film_credits_film_id on public.film_credits(film_id);
create index if not exists idx_film_credits_person_id on public.film_credits(person_id);
create index if not exists idx_film_credits_role on public.film_credits(role);

-- ==============================================================================
-- 8. GENRES & FILM_GENRES
-- ==============================================================================

create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  description text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_genres_slug on public.genres(slug);

create table if not exists public.film_genres (
  film_id uuid references public.films(id) on delete cascade not null,
  genre_id uuid references public.genres(id) on delete cascade not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  primary key (film_id, genre_id)
);

create index if not exists idx_film_genres_film_id on public.film_genres(film_id);
create index if not exists idx_film_genres_genre_id on public.film_genres(genre_id);

-- ==============================================================================
-- 9. TAGS & FILM_TAGS (Includes indie, regional-cinema, based-on-true-story, etc.)
-- ==============================================================================

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  description text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_tags_slug on public.tags(slug);

create table if not exists public.film_tags (
  film_id uuid references public.films(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  primary key (film_id, tag_id)
);

create index if not exists idx_film_tags_film_id on public.film_tags(film_id);
create index if not exists idx_film_tags_tag_id on public.film_tags(tag_id);

-- Seed essential cultural and cinematic tags
insert into public.tags (name, slug, description)
values
  ('Indie', 'indie', 'Independent Philippine productions made outside major studio systems.'),
  ('Regional Cinema', 'regional-cinema', 'Films rooted in Philippine provinces and told in regional languages (Bikol, Cebuano, Hiligaynon, Ilokano, etc.).'),
  ('Based on a True Story', 'based-on-true-story', 'Films inspired by or depicting documented historical or real-life events.'),
  ('Social Realism', 'social-realism', 'Grounded narratives portraying the socioeconomic realities of everyday Filipinos.'),
  ('Restored Heritage', 'restored-heritage', 'Classic Philippine cinematic heritage recovered and restored in 4K/2K.'),
  ('National Artist Masterwork', 'national-artist-masterwork', 'Directed or written by a Conferred National Artist of the Philippines.'),
  ('Cinemalaya Winner', 'cinemalaya-winner', 'Recognized at the Cinemalaya Philippine Independent Film Festival.'),
  ('QCinema Selection', 'qcinema-selection', 'Featured or awarded at the QCinema International Film Festival.')
on conflict (slug) do nothing;

-- ==============================================================================
-- 10. FESTIVALS, EDITIONS & SELECTIONS
-- ==============================================================================

create table if not exists public.festivals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  location text,
  logo_url text,
  founded_year integer,
  verification_status public.verification_status_type default 'unverified' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_festivals_slug on public.festivals(slug);
create index if not exists idx_festivals_verification on public.festivals(verification_status);

create trigger tr_festivals_updated_at
  before update on public.festivals
  for each row execute function public.update_updated_at_column();

create table if not exists public.festival_editions (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid references public.festivals(id) on delete cascade not null,
  year integer not null,
  name text,
  theme text,
  starts_at date,
  ends_at date,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (festival_id, year)
);

create index if not exists idx_festival_editions_fest_year on public.festival_editions(festival_id, year);

create table if not exists public.festival_selections (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid references public.festival_editions(id) on delete cascade not null,
  film_id uuid references public.films(id) on delete cascade not null,
  section text, -- 'Main Competition', 'Asian Next Wave', 'Shorts', 'Special Screenings'
  status text not null default 'official_selection',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (edition_id, film_id)
);

create index if not exists idx_fest_selections_edition on public.festival_selections(edition_id);
create index if not exists idx_fest_selections_film on public.festival_selections(film_id);
create index if not exists idx_fest_selections_status on public.festival_selections(status);

-- ==============================================================================
-- 11. AWARD BODIES, CATEGORIES & RECOGNITIONS
-- ==============================================================================

create table if not exists public.award_bodies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  acronym text,
  scope public.award_scope_type default 'local' not null,
  description text,
  country text default 'Philippines' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_award_bodies_scope on public.award_bodies(scope);

create table if not exists public.award_categories (
  id uuid primary key default gen_random_uuid(),
  award_body_id uuid references public.award_bodies(id) on delete cascade not null,
  name text not null, -- 'Pinakamahusay na Pelikula (Best Picture)', 'Best Director', etc.
  description text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (award_body_id, name)
);

create index if not exists idx_award_categories_body on public.award_categories(award_body_id);

create table if not exists public.award_recognitions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.award_categories(id) on delete cascade not null,
  ceremony_year integer not null,
  status public.award_status_type not null check (status in ('nominated', 'won', 'official_selection', 'special_mention')),
  recipient_type public.award_recipient_type not null,
  recipient_id uuid not null, -- films.id or people.id depending on recipient_type
  source_url text,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_award_recognitions_cat on public.award_recognitions(category_id);
create index if not exists idx_award_recognitions_year on public.award_recognitions(ceremony_year);
create index if not exists idx_award_recognitions_status on public.award_recognitions(status);
create index if not exists idx_award_recognitions_recipient on public.award_recognitions(recipient_type, recipient_id);

-- ==============================================================================
-- 12. TRAILERS & OFFICIAL CLIPS (YouTube Embeds Only)
-- ==============================================================================

create table if not exists public.trailers (
  id uuid primary key default gen_random_uuid(),
  film_id uuid references public.films(id) on delete cascade not null,
  youtube_id text not null, -- 11-char YouTube embed ID
  title text not null,
  type public.trailer_type default 'official' not null,
  posted_by_type public.posted_by_type default 'admin' not null,
  posted_by_id uuid not null, -- id from profiles, studios, festivals, or people
  view_count bigint default 0 not null,
  duration_seconds integer,
  published_at timestamptz default timezone('utc'::text, now()),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_trailers_film_id on public.trailers(film_id);
create index if not exists idx_trailers_youtube_id on public.trailers(youtube_id);
create index if not exists idx_trailers_type on public.trailers(type);
create index if not exists idx_trailers_posted_by on public.trailers(posted_by_type, posted_by_id);
create index if not exists idx_trailers_view_count on public.trailers(view_count desc);

create trigger tr_trailers_updated_at
  before update on public.trailers
  for each row execute function public.update_updated_at_column();

-- ==============================================================================
-- 13. PROMOTED SLOTS (Clearly labeled, max 1 per 10 organic items)
-- ==============================================================================

create table if not exists public.promoted_slots (
  id uuid primary key default gen_random_uuid(),
  film_id uuid references public.films(id) on delete cascade not null,
  trailer_id uuid references public.trailers(id) on delete cascade not null,
  sponsor_name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean default true not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint check_slot_dates check (ends_at > starts_at)
);

create index if not exists idx_promoted_slots_active on public.promoted_slots(is_active, starts_at, ends_at);
create index if not exists idx_promoted_slots_film on public.promoted_slots(film_id);
create index if not exists idx_promoted_slots_trailer on public.promoted_slots(trailer_id);

-- ==============================================================================
-- 14. STREAMING PLATFORMS & WATCH AVAILABILITY
-- ==============================================================================

create table if not exists public.streaming_platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  website_url text,
  is_local boolean default false not null, -- Local Philippine platforms: JuanFlix/FDCP, iWantTFC, Vivamax
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_platforms_slug on public.streaming_platforms(slug);
create index if not exists idx_platforms_is_local on public.streaming_platforms(is_local);

create table if not exists public.watch_availability (
  id uuid primary key default gen_random_uuid(),
  film_id uuid references public.films(id) on delete cascade not null,
  platform_id uuid references public.streaming_platforms(id) on delete cascade not null,
  url text not null,
  availability_type public.availability_type default 'subscription' not null,
  price_php numeric(8, 2),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (film_id, platform_id, availability_type)
);

create index if not exists idx_watch_availability_film on public.watch_availability(film_id);
create index if not exists idx_watch_availability_platform on public.watch_availability(platform_id);
create index if not exists idx_watch_availability_type on public.watch_availability(availability_type);

-- ==============================================================================
-- 15. RATINGS (Score 1-5 in half steps: 1.0, 1.5, ... 5.0, unique per user/film)
-- ==============================================================================

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  film_id uuid references public.films(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score numeric(2, 1) not null check (score in (1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (film_id, user_id)
);

create index if not exists idx_ratings_film_id on public.ratings(film_id);
create index if not exists idx_ratings_user_id on public.ratings(user_id);
create index if not exists idx_ratings_score on public.ratings(score);

create trigger tr_ratings_updated_at
  before update on public.ratings
  for each row execute function public.update_updated_at_column();

-- ==============================================================================
-- 16. REVIEWS
-- ==============================================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  film_id uuid references public.films(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  body text not null,
  has_spoilers boolean default false not null,
  is_critic_review boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (film_id, user_id)
);

create index if not exists idx_reviews_film_id on public.reviews(film_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);
create index if not exists idx_reviews_is_critic on public.reviews(is_critic_review);
create index if not exists idx_reviews_created_at on public.reviews(created_at desc);

create trigger tr_reviews_updated_at
  before update on public.reviews
  for each row execute function public.update_updated_at_column();

-- Automatically sync is_critic_review based on user's current role
create or replace function public.sync_critic_review_flag()
returns trigger
language plpgsql
security definer
as $$
declare
  user_current_role public.user_role;
begin
  select role into user_current_role from public.profiles where id = new.user_id;
  new.is_critic_review := (user_current_role = 'critic');
  return new;
end;
$$;

create trigger tr_sync_critic_review
  before insert or update of user_id on public.reviews
  for each row execute function public.sync_critic_review_flag();

-- ==============================================================================
-- 17. DISCUSSION THREADS & COMMENTS
-- ==============================================================================

create table if not exists public.discussion_threads (
  id uuid primary key default gen_random_uuid(),
  film_id uuid references public.films(id) on delete cascade, -- Nullable for general cinema debates
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text not null,
  is_pinned boolean default false not null,
  is_locked boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_threads_film_id on public.discussion_threads(film_id);
create index if not exists idx_threads_author_id on public.discussion_threads(author_id);
create index if not exists idx_threads_created_at on public.discussion_threads(created_at desc);

create trigger tr_threads_updated_at
  before update on public.discussion_threads
  for each row execute function public.update_updated_at_column();

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.discussion_threads(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  parent_comment_id uuid references public.comments(id) on delete cascade, -- Nullable for threaded replies
  body text not null,
  has_spoilers boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_comments_thread_id on public.comments(thread_id);
create index if not exists idx_comments_author_id on public.comments(author_id);
create index if not exists idx_comments_parent on public.comments(parent_comment_id);
create index if not exists idx_comments_created_at on public.comments(created_at);

create trigger tr_comments_updated_at
  before update on public.comments
  for each row execute function public.update_updated_at_column();

-- ==============================================================================
-- 18. VOTES (Polymorphic: review or comment, value +1 or -1)
-- ==============================================================================

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_type public.vote_target_type not null,
  target_id uuid not null,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, target_type, target_id)
);

create index if not exists idx_votes_user on public.votes(user_id);
create index if not exists idx_votes_target on public.votes(target_type, target_id);

-- ==============================================================================
-- 19. REPORTS (Moderation)
-- ==============================================================================

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason text not null,
  status public.report_status_type default 'pending' not null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_reports_reporter on public.reports(reporter_id);
create index if not exists idx_reports_target on public.reports(target_type, target_id);

-- ==============================================================================
-- 20. POLYMORPHIC FOLLOWS: (follower_id, target_type in ['user','studio','festival','person'], target_id)
-- ==============================================================================

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references public.profiles(id) on delete cascade not null,
  target_type public.follow_target_type not null,
  target_id uuid not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (follower_id, target_type, target_id)
);

create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_follows_target on public.follows(target_type, target_id);

-- ==============================================================================
-- 21. WATCHLIST & TOP FILMS (1-10)
-- ==============================================================================

create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  film_id uuid references public.films(id) on delete cascade not null,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, film_id)
);

create index if not exists idx_watchlist_user_id on public.watchlist(user_id);
create index if not exists idx_watchlist_film_id on public.watchlist(film_id);

create table if not exists public.top_films (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  film_id uuid references public.films(id) on delete cascade not null,
  position smallint not null check (position >= 1 and position <= 10),
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, position),
  unique (user_id, film_id)
);

create index if not exists idx_top_films_user_id on public.top_films(user_id);
create index if not exists idx_top_films_film_id on public.top_films(film_id);
create index if not exists idx_top_films_position on public.top_films(user_id, position);

create trigger tr_top_films_updated_at
  before update on public.top_films
  for each row execute function public.update_updated_at_column();

-- ==============================================================================
-- 22. NOTIFICATIONS
-- ==============================================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  title text not null,
  message text not null,
  data jsonb default '{}'::jsonb not null,
  is_read boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_notifications_user_read on public.notifications(user_id, is_read);
create index if not exists idx_notifications_created on public.notifications(created_at desc);

-- ==============================================================================
-- 23. HERITAGE: NATIONAL ARTISTS & PRESERVATION RECORDS
-- ==============================================================================

create table if not exists public.national_artists (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete cascade unique not null,
  year_conferred integer not null check (year_conferred >= 1972),
  category text default 'Cinema' not null,
  citation text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_national_artists_person on public.national_artists(person_id);
create index if not exists idx_national_artists_year on public.national_artists(year_conferred);

create table if not exists public.preservation_records (
  id uuid primary key default gen_random_uuid(),
  film_id uuid references public.films(id) on delete cascade not null,
  status public.preservation_status_type default 'restored' not null,
  restoring_body text, -- 'ABS-CBN Sagip Pelikula', 'FDCP Philippine Film Archive', etc.
  restoration_year integer,
  archive_location text,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_preservation_records_film on public.preservation_records(film_id);
create index if not exists idx_preservation_records_status on public.preservation_records(status);

-- ==============================================================================
-- 24. VIEWS: DUAL RATINGS (AUDIENCE SCORE & CRITIC SCORE)
-- ==============================================================================

create or replace view public.film_audience_score as
select
  f.id as film_id,
  f.title as film_title,
  count(r.id)::int as ratings_count,
  round(avg(r.score)::numeric, 2) as average_score,
  round((avg(r.score) * 20.0)::numeric, 1) as audience_percentage
from public.films f
left join (
  select r.film_id, r.score, r.id
  from public.ratings r
  join public.profiles p on p.id = r.user_id
  where p.role != 'critic'
) r on r.film_id = f.id
group by f.id, f.title;

create or replace view public.film_critic_score as
select
  f.id as film_id,
  f.title as film_title,
  count(r.id)::int as ratings_count,
  round(avg(r.score)::numeric, 2) as average_score,
  round((avg(r.score) * 20.0)::numeric, 1) as critic_percentage
from public.films f
left join (
  select r.film_id, r.score, r.id
  from public.ratings r
  join public.profiles p on p.id = r.user_id
  where p.role = 'critic'
) r on r.film_id = f.id
group by f.id, f.title;

grant select on public.film_audience_score to anon, authenticated;
grant select on public.film_critic_score to anon, authenticated;

-- ==============================================================================
-- 25. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across every single table
alter table public.profiles enable row level security;
alter table public.studios enable row level security;
alter table public.people enable row level security;
alter table public.films enable row level security;
alter table public.film_credits enable row level security;
alter table public.genres enable row level security;
alter table public.film_genres enable row level security;
alter table public.tags enable row level security;
alter table public.film_tags enable row level security;
alter table public.festivals enable row level security;
alter table public.festival_editions enable row level security;
alter table public.festival_selections enable row level security;
alter table public.award_bodies enable row level security;
alter table public.award_categories enable row level security;
alter table public.award_recognitions enable row level security;
alter table public.trailers enable row level security;
alter table public.promoted_slots enable row level security;
alter table public.streaming_platforms enable row level security;
alter table public.watch_availability enable row level security;
alter table public.ratings enable row level security;
alter table public.reviews enable row level security;
alter table public.discussion_threads enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;
alter table public.reports enable row level security;
alter table public.follows enable row level security;
alter table public.watchlist enable row level security;
alter table public.top_films enable row level security;
alter table public.notifications enable row level security;
alter table public.national_artists enable row level security;
alter table public.preservation_records enable row level security;

-- ------------------------------------------------------------------------------
-- A. PROFILES POLICIES
-- ------------------------------------------------------------------------------
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin());

-- ------------------------------------------------------------------------------
-- B. CATALOG TABLES (Public read, admin-only write)
-- ------------------------------------------------------------------------------

-- Studios
create policy "Studios are viewable by everyone"
  on public.studios for select using (true);
create policy "Admins can insert studios"
  on public.studios for insert with check (public.is_admin());
create policy "Admins can update studios"
  on public.studios for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete studios"
  on public.studios for delete using (public.is_admin());

-- People
create policy "People are viewable by everyone"
  on public.people for select using (true);
create policy "Admins can insert people"
  on public.people for insert with check (public.is_admin());
create policy "Admins can update people"
  on public.people for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete people"
  on public.people for delete using (public.is_admin());

-- Films
create policy "Films are viewable by everyone"
  on public.films for select using (true);
create policy "Admins can insert films"
  on public.films for insert with check (public.is_admin());
create policy "Admins can update films"
  on public.films for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete films"
  on public.films for delete using (public.is_admin());

-- Film Credits
create policy "Film credits are viewable by everyone"
  on public.film_credits for select using (true);
create policy "Admins can manage film credits"
  on public.film_credits for all using (public.is_admin());

-- Genres & Film Genres
create policy "Genres are viewable by everyone"
  on public.genres for select using (true);
create policy "Admins can manage genres"
  on public.genres for all using (public.is_admin());

create policy "Film genres are viewable by everyone"
  on public.film_genres for select using (true);
create policy "Admins can manage film genres"
  on public.film_genres for all using (public.is_admin());

-- Tags & Film Tags
create policy "Tags are viewable by everyone"
  on public.tags for select using (true);
create policy "Admins can manage tags"
  on public.tags for all using (public.is_admin());

create policy "Film tags are viewable by everyone"
  on public.film_tags for select using (true);
create policy "Admins can manage film tags"
  on public.film_tags for all using (public.is_admin());

-- Festivals, Editions & Selections
create policy "Festivals are viewable by everyone"
  on public.festivals for select using (true);
create policy "Admins can manage festivals"
  on public.festivals for all using (public.is_admin());

create policy "Festival editions are viewable by everyone"
  on public.festival_editions for select using (true);
create policy "Admins can manage festival editions"
  on public.festival_editions for all using (public.is_admin());

create policy "Festival selections are viewable by everyone"
  on public.festival_selections for select using (true);
create policy "Admins can manage festival selections"
  on public.festival_selections for all using (public.is_admin());

-- Award Bodies, Categories & Recognitions
create policy "Award bodies are viewable by everyone"
  on public.award_bodies for select using (true);
create policy "Admins can manage award bodies"
  on public.award_bodies for all using (public.is_admin());

create policy "Award categories are viewable by everyone"
  on public.award_categories for select using (true);
create policy "Admins can manage award categories"
  on public.award_categories for all using (public.is_admin());

create policy "Award recognitions are viewable by everyone"
  on public.award_recognitions for select using (true);
create policy "Admins can manage award recognitions"
  on public.award_recognitions for all using (public.is_admin());

-- Streaming Platforms & Watch Availability
create policy "Streaming platforms are viewable by everyone"
  on public.streaming_platforms for select using (true);
create policy "Admins can manage streaming platforms"
  on public.streaming_platforms for all using (public.is_admin());

create policy "Watch availability is viewable by everyone"
  on public.watch_availability for select using (true);
create policy "Admins can manage watch availability"
  on public.watch_availability for all using (public.is_admin());

-- National Artists & Preservation Records
create policy "National artists are viewable by everyone"
  on public.national_artists for select using (true);
create policy "Admins can manage national artists"
  on public.national_artists for all using (public.is_admin());

create policy "Preservation records are viewable by everyone"
  on public.preservation_records for select using (true);
create policy "Admins can manage preservation records"
  on public.preservation_records for all using (public.is_admin());

-- ------------------------------------------------------------------------------
-- C. TRAILERS & PROMOTED SLOTS
-- Verified accounts: studios, festivals and people can post official clips
-- only after an admin sets verification_status = 'verified'.
-- ------------------------------------------------------------------------------
create policy "Trailers are viewable by everyone"
  on public.trailers for select using (true);

create policy "Admins or verified entities can post trailers"
  on public.trailers for insert
  with check (
    public.is_admin() or (
      exists (
        select 1 from public.profiles
        where id = auth.uid()
          and role = 'verified_official'
          and verification_status = 'verified'
      )
    )
  );

create policy "Admins or creator can update trailers"
  on public.trailers for update
  using (
    public.is_admin() or (
      posted_by_id = auth.uid() and posted_by_type = 'person'
    )
  );

create policy "Admins can delete trailers"
  on public.trailers for delete using (public.is_admin());

-- Promoted Slots (Public read active, admin-only write)
create policy "Public can view active promoted slots"
  on public.promoted_slots for select
  using (
    is_active = true and starts_at <= timezone('utc'::text, now()) and ends_at >= timezone('utc'::text, now())
    or public.is_admin()
  );

create policy "Admins manage promoted slots"
  on public.promoted_slots for all
  using (public.is_admin());

-- ------------------------------------------------------------------------------
-- D. RATINGS & REVIEWS (Users write own rows)
-- ------------------------------------------------------------------------------
create policy "Ratings are viewable by everyone"
  on public.ratings for select using (true);

create policy "Authenticated users can insert own rating"
  on public.ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rating"
  on public.ratings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users or admins can delete rating"
  on public.ratings for delete
  using (auth.uid() = user_id or public.is_admin());

-- Reviews
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Authenticated users can insert own review"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own review"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users or admins can delete review"
  on public.reviews for delete
  using (auth.uid() = user_id or public.is_admin());

-- ------------------------------------------------------------------------------
-- E. DISCUSSION THREADS & COMMENTS
-- ------------------------------------------------------------------------------
create policy "Discussion threads are viewable by everyone"
  on public.discussion_threads for select using (true);

create policy "Authenticated users can create discussion thread"
  on public.discussion_threads for insert
  with check (auth.uid() = author_id);

create policy "Authors or admins can update discussion thread"
  on public.discussion_threads for update
  using (auth.uid() = author_id or public.is_admin())
  with check (auth.uid() = author_id or public.is_admin());

create policy "Authors or admins can delete discussion thread"
  on public.discussion_threads for delete
  using (auth.uid() = author_id or public.is_admin());

-- Comments
create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Authenticated users can post comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own comment"
  on public.comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Authors or admins can delete comment"
  on public.comments for delete
  using (auth.uid() = author_id or public.is_admin());

-- ------------------------------------------------------------------------------
-- F. VOTES (+1 or -1 on review or comment)
-- ------------------------------------------------------------------------------
create policy "Votes are viewable by everyone"
  on public.votes for select using (true);

create policy "Users can cast own vote"
  on public.votes for insert
  with check (auth.uid() = user_id);

create policy "Users can modify own vote"
  on public.votes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own vote"
  on public.votes for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- G. REPORTS (Moderation)
-- ------------------------------------------------------------------------------
create policy "Admins or reporters can view reports"
  on public.reports for select
  using (auth.uid() = reporter_id or public.is_admin());

create policy "Authenticated users can create report"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Admins can update reports"
  on public.reports for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete reports"
  on public.reports for delete
  using (public.is_admin());

-- ------------------------------------------------------------------------------
-- H. POLYMORPHIC FOLLOWS (follower_id, target_type, target_id)
-- ------------------------------------------------------------------------------
create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

create policy "Users can follow targets"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow targets"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ------------------------------------------------------------------------------
-- I. WATCHLIST & TOP FILMS
-- ------------------------------------------------------------------------------
create policy "Users can view own watchlist or public watchlists"
  on public.watchlist for select
  using (true);

create policy "Users manage own watchlist"
  on public.watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Top Films (1-10)
create policy "Top films are viewable by everyone"
  on public.top_films for select using (true);

create policy "Users manage own top films"
  on public.top_films for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- J. NOTIFICATIONS (Private to recipient)
-- ------------------------------------------------------------------------------
create policy "Users view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users update own notifications (mark read)"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

create policy "Admins can insert system notifications"
  on public.notifications for insert
  with check (public.is_admin() or auth.uid() is not null);

-- ==============================================================================
-- 27. RPC FUNCTIONS
-- ==============================================================================

create or replace function public.increment_trailer_view_count(t_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.trailers
  set view_count = view_count + 1
  where id = t_id;
end;
$$;

grant execute on function public.increment_trailer_view_count(uuid) to anon, authenticated;


-- ==============================================================================
-- 28. EXPLORE SEARCH (Single Unified Postgres Query across 4 entities)
-- ==============================================================================

create or replace function public.search_explore_entities(search_query text)
returns table (
  type text,
  id uuid,
  film_id uuid,
  title text,
  subtitle text,
  badge text,
  image_url text,
  is_verified boolean,
  year int
)
language sql
stable
security definer
set search_path = public
as $$
  with query_clean as (
    select trim(search_query) as q
  )
  -- 1. Films matching title, original_title, or synopsis
  select
    'film'::text as type,
    f.id as id,
    f.id as film_id,
    f.title as title,
    coalesce(extract(year from f.release_date)::text, '2020') || ' • Dir. ' || coalesce(p.name, 'Filipino Filmmaker') || ' • ' || f.language as subtitle,
    coalesce(f.mtrcb_rating, 'PG') as badge,
    f.poster_url as image_url,
    false as is_verified,
    extract(year from f.release_date)::int as year
  from public.films f
  cross join query_clean qc
  left join public.film_credits fc on fc.film_id = f.id and fc.role = 'director'
  left join public.people p on p.id = fc.person_id
  where f.title ilike '%' || qc.q || '%'
     or f.original_title ilike '%' || qc.q || '%'
     or f.synopsis ilike '%' || qc.q || '%'
     or p.name ilike '%' || qc.q || '%'

  union all

  -- 2. People matching name or bio
  select
    'person'::text as type,
    p.id as id,
    null::uuid as film_id,
    p.name as title,
    case
      when p.role_type = 'director' then 'Director / Filmmaker'
      when p.role_type = 'actor' then 'Lead Actor / Performer'
      else initcap(p.role_type::text)
    end as subtitle,
    case when p.verification_status = 'verified' then 'Verified Official' else null end as badge,
    p.photo_url as image_url,
    (p.verification_status = 'verified') as is_verified,
    p.birth_year as year
  from public.people p
  cross join query_clean qc
  where p.name ilike '%' || qc.q || '%'
     or p.bio ilike '%' || qc.q || '%'

  union all

  -- 3. Film Festivals matching name or description
  select
    'festival'::text as type,
    fest.id as id,
    null::uuid as film_id,
    fest.name as title,
    coalesce(fest.location, 'Philippines') || ' • Est. ' || coalesce(fest.founded_year::text, '2005') as subtitle,
    'Film Festival'::text as badge,
    null::text as image_url,
    (fest.verification_status = 'verified') as is_verified,
    fest.founded_year as year
  from public.festivals fest
  cross join query_clean qc
  where fest.name ilike '%' || qc.q || '%'
     or fest.description ilike '%' || qc.q || '%'

  union all

  -- 4. Independent & Mainstream Studios matching name or description
  select
    'studio'::text as type,
    s.id as id,
    null::uuid as film_id,
    s.name as title,
    'Production Outfit • Est. ' || coalesce(s.founded_year::text, '2014') as subtitle,
    'Studio'::text as badge,
    s.logo_url as image_url,
    (s.verification_status = 'verified') as is_verified,
    s.founded_year as year
  from public.studios s
  cross join query_clean qc
  where s.name ilike '%' || qc.q || '%'
     or s.description ilike '%' || qc.q || '%'

  limit 25;
$$;

grant execute on function public.search_explore_entities(text) to anon, authenticated;
