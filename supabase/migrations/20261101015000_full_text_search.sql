-- Migration: 20261101015000_full_text_search.sql
-- Full-Text Search with tsvector and GIN indices for Takilya Explore & Search

-- 1. Create GIN indexes on films, people, studios, and festivals
create index if not exists idx_films_fts on public.films using gin(
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(original_title, '') || ' ' || coalesce(synopsis, ''))
);

create index if not exists idx_people_fts on public.people using gin(
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(bio, ''))
);

create index if not exists idx_studios_fts on public.studios using gin(
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
);

create index if not exists idx_festivals_fts on public.festivals using gin(
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
);

-- 2. Enhanced search function supporting multi-entity full text search
create or replace function public.search_all_catalog_entities(p_query text)
returns table (
  entity_type text,
  entity_id uuid,
  title text,
  subtitle text,
  badge text,
  image_url text,
  is_verified boolean,
  year int,
  rank float4
)
language sql
stable
security definer
set search_path = public
as $$
  with q as (
    select
      trim(p_query) as raw_q,
      plainto_tsquery('simple', trim(p_query)) as ts_q
  )
  -- 1. Films
  select
    'film'::text as entity_type,
    f.id as entity_id,
    f.title as title,
    coalesce(extract(year from f.release_date)::text, '2020') || ' • ' || f.language as subtitle,
    coalesce(f.mtrcb_rating, 'PG') as badge,
    f.poster_url as image_url,
    false as is_verified,
    extract(year from f.release_date)::int as year,
    ts_rank(to_tsvector('simple', coalesce(f.title, '') || ' ' || coalesce(f.original_title, '') || ' ' || coalesce(f.synopsis, '')), q.ts_q) as rank
  from public.films f, q
  where (q.ts_q @@ to_tsvector('simple', coalesce(f.title, '') || ' ' || coalesce(f.original_title, '') || ' ' || coalesce(f.synopsis, '')))
     or f.title ilike '%' || q.raw_q || '%'
     or f.original_title ilike '%' || q.raw_q || '%'

  union all

  -- 2. People
  select
    'person'::text as entity_type,
    p.id as entity_id,
    p.name as title,
    case
      when p.role_type = 'director' then 'Director / Filmmaker'
      when p.role_type = 'actor' then 'Lead Actor / Performer'
      else initcap(p.role_type::text)
    end as subtitle,
    case when p.verification_status = 'verified' then 'Verified' else null end as badge,
    p.photo_url as image_url,
    (p.verification_status = 'verified') as is_verified,
    p.birth_year as year,
    ts_rank(to_tsvector('simple', coalesce(p.name, '') || ' ' || coalesce(p.bio, '')), q.ts_q) as rank
  from public.people p, q
  where (q.ts_q @@ to_tsvector('simple', coalesce(p.name, '') || ' ' || coalesce(p.bio, '')))
     or p.name ilike '%' || q.raw_q || '%'

  union all

  -- 3. Studios
  select
    'studio'::text as entity_type,
    s.id as entity_id,
    s.name as title,
    'Studio • Est. ' || coalesce(s.founded_year::text, '2014') as subtitle,
    case when s.verification_status = 'verified' then 'Verified Studio' else 'Studio' end as badge,
    s.logo_url as image_url,
    (s.verification_status = 'verified') as is_verified,
    s.founded_year as year,
    ts_rank(to_tsvector('simple', coalesce(s.name, '') || ' ' || coalesce(s.description, '')), q.ts_q) as rank
  from public.studios s, q
  where (q.ts_q @@ to_tsvector('simple', coalesce(s.name, '') || ' ' || coalesce(s.description, '')))
     or s.name ilike '%' || q.raw_q || '%'

  union all

  -- 4. Festivals
  select
    'festival'::text as entity_type,
    fest.id as entity_id,
    fest.name as title,
    coalesce(fest.location, 'Philippines') || ' • Est. ' || coalesce(fest.founded_year::text, '2005') as subtitle,
    case when fest.verification_status = 'verified' then 'Verified Festival' else 'Festival' end as badge,
    fest.banner_url as image_url,
    (fest.verification_status = 'verified') as is_verified,
    fest.founded_year as year,
    ts_rank(to_tsvector('simple', coalesce(fest.name, '') || ' ' || coalesce(fest.description, '')), q.ts_q) as rank
  from public.festivals fest, q
  where (q.ts_q @@ to_tsvector('simple', coalesce(fest.name, '') || ' ' || coalesce(fest.description, '')))
     or fest.name ilike '%' || q.raw_q || '%'

  order by rank desc;
$$;

