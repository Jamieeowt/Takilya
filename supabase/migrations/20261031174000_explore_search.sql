-- ==============================================================================
-- Explore Tab: Instant Multi-Entity Search Function
-- Searches films, people, festivals, and studios via a single Postgres query
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

