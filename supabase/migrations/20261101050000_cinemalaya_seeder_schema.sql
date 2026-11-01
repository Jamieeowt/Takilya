-- Migration: Add release_year, letterboxd_url, cultural_tags to public.films
-- and ensure unique (title, release_year) for Cinemalaya batch upserts

alter table public.films
  add column if not exists release_year integer,
  add column if not exists letterboxd_url text,
  add column if not exists cultural_tags text[] default '{}',
  add column if not exists watch_sources jsonb default '[]';

-- Backfill release_year from release_date for existing rows
update public.films
set release_year = extract(year from release_date)::integer
where release_year is null and release_date is not null;

-- Default release_date from release_year if missing
update public.films
set release_date = make_date(release_year, 1, 1)
where release_date is null and release_year is not null;

-- Ensure unique constraint on (title, release_year)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'films_title_release_year_key'
  ) then
    alter table public.films add constraint films_title_release_year_key unique (title, release_year);
  end if;
end $$;

-- Ensure Cinemalaya festival record exists
insert into public.festivals (id, name, slug, description, location, founded_year, verification_status)
values (
  'dddddddd-0001-0000-0000-000000000000',
  'Cinemalaya Philippine Independent Film Festival',
  'cinemalaya',
  'Premier Philippine independent film festival held annually at the Cultural Center of the Philippines.',
  'Manila, Philippines',
  2005,
  'verified'
)
on conflict (slug) do update set
  name = excluded.name,
  verification_status = 'verified';

-- Ensure Cinemalaya award body exists
insert into public.award_bodies (id, name, acronym, scope, description, country)
values (
  '10101010-0002-0000-0000-000000000000',
  'Cinemalaya Independent Film Festival Awards',
  'Cinemalaya',
  'festival',
  'Balanghai Trophies awarded annually to outstanding Philippine independent films.',
  'Philippines'
)
on conflict do nothing;

