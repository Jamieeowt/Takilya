-- ==============================================================================
-- Takilya Migration: Film Recommendation Engine
-- Computes personalized recommendations based on high user ratings (>= 4.0),
-- metadata affinity (director, cast, genres, tags), and weighted audience scores,
-- with cold-start fallbacks and similar-film recommendation procedures.
-- ==============================================================================

-- 1. Personalized Recommendations for User
create or replace function public.recommend_films(target_user_id uuid default null)
returns table (
  id uuid,
  title text,
  original_title text,
  slug text,
  synopsis text,
  release_year int,
  poster_url text,
  backdrop_url text,
  director text,
  audience_score numeric,
  critic_score numeric,
  ratings_count int,
  recommendation_score numeric,
  recommendation_reason text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_high_ratings_count int := 0;
begin
  -- Check count of films rated >= 4.0 by target user
  if target_user_id is not null then
    select count(*)
    into v_high_ratings_count
    from public.ratings
    where user_id = target_user_id and score >= 4.0;
  end if;

  -- Cold-Start Fallback:
  -- If user has no ratings or fewer than 3 high ratings (score >= 4.0),
  -- return top-rated Philippine films by audience score and ratings count.
  if target_user_id is null or v_high_ratings_count < 3 then
    return query
    select
      f.id,
      f.title,
      f.original_title,
      f.slug,
      f.synopsis,
      extract(year from f.release_date)::int as release_year,
      f.poster_url,
      f.backdrop_url,
      coalesce(dir.name, 'Filipino Filmmaker') as director,
      coalesce(fas.audience_percentage, 0)::numeric as audience_score,
      coalesce(fcs.critic_percentage, 0)::numeric as critic_score,
      coalesce(fas.ratings_count, 0)::int as ratings_count,
      coalesce(fas.audience_percentage, 88.0)::numeric as recommendation_score,
      'Top Rated in Philippine Cinema'::text as recommendation_reason
    from public.films f
    left join public.film_audience_score fas on fas.film_id = f.id
    left join public.film_critic_score fcs on fcs.film_id = f.id
    left join lateral (
      select p.name
      from public.film_credits fc
      join public.people p on p.id = fc.person_id
      where fc.film_id = f.id and fc.role = 'director'
      order by fc.billing_order asc
      limit 1
    ) dir on true
    where (target_user_id is null or (
      f.id not in (
        select film_id from public.ratings where user_id = target_user_id
        union
        select film_id from public.watch_history where user_id = target_user_id
      )
    ))
    order by
      coalesce(fas.audience_percentage, 0) desc,
      coalesce(fas.ratings_count, 0) desc,
      f.release_date desc nulls last
    limit 20;
    return;
  end if;

  -- Personalized Recommendation Branch:
  -- User has at least 3 films rated >= 4.0. Extract affinity vectors.
  return query
  with user_liked as (
    select film_id, score
    from public.ratings
    where user_id = target_user_id and score >= 4.0
  ),
  user_genres as (
    select fg.genre_id, count(*)::numeric as weight
    from public.film_genres fg
    join user_liked ul on ul.film_id = fg.film_id
    group by fg.genre_id
  ),
  user_tags as (
    select ft.tag_id, count(*)::numeric as weight
    from public.film_tags ft
    join user_liked ul on ul.film_id = ft.film_id
    group by ft.tag_id
  ),
  user_directors as (
    select fc.person_id, count(*)::numeric as weight, max(p.name) as director_name
    from public.film_credits fc
    join user_liked ul on ul.film_id = fc.film_id
    join public.people p on p.id = fc.person_id
    where fc.role = 'director'
    group by fc.person_id
  ),
  user_cast as (
    select fc.person_id, count(*)::numeric as weight, max(p.name) as actor_name
    from public.film_credits fc
    join user_liked ul on ul.film_id = fc.film_id
    join public.people p on p.id = fc.person_id
    where fc.role in ('lead_actor', 'supporting_actor')
    group by fc.person_id
  ),
  candidate_genres as (
    select fg.film_id, sum(ug.weight * 3.0) as score
    from public.film_genres fg
    join user_genres ug on ug.genre_id = fg.genre_id
    group by fg.film_id
  ),
  candidate_tags as (
    select ft.film_id, sum(ut.weight * 2.0) as score
    from public.film_tags ft
    join user_tags ut on ut.tag_id = ft.tag_id
    group by ft.film_id
  ),
  candidate_directors as (
    select fc.film_id, sum(ud.weight * 5.0) as score, max(ud.director_name) as top_director_match
    from public.film_credits fc
    join user_directors ud on ud.person_id = fc.person_id
    where fc.role = 'director'
    group by fc.film_id
  ),
  candidate_cast as (
    select fc.film_id, sum(uc.weight * 2.5) as score, max(uc.actor_name) as top_actor_match
    from public.film_credits fc
    join user_cast uc on uc.person_id = fc.person_id
    where fc.role in ('lead_actor', 'supporting_actor')
    group by fc.film_id
  )
  select
    f.id,
    f.title,
    f.original_title,
    f.slug,
    f.synopsis,
    extract(year from f.release_date)::int as release_year,
    f.poster_url,
    f.backdrop_url,
    coalesce(dir.name, 'Filipino Filmmaker') as director,
    coalesce(fas.audience_percentage, 0)::numeric as audience_score,
    coalesce(fcs.critic_percentage, 0)::numeric as critic_score,
    coalesce(fas.ratings_count, 0)::int as ratings_count,
    round(
      (
        (coalesce(cg.score, 0) + coalesce(ct.score, 0) + coalesce(cd.score, 0) + coalesce(cc.score, 0) + 1.0)
        * (coalesce(fas.audience_percentage, 75.0) / 100.0)
      )::numeric,
      2
    ) as recommendation_score,
    case
      when cd.score is not null and cd.score > 0 then 'Because you like director ' || cd.top_director_match
      when cc.score is not null and cc.score > 0 then 'Stars ' || cc.top_actor_match
      when cg.score is not null and cg.score > 0 and ct.score is not null and ct.score > 0 then 'Matches your genre & cinema style taste'
      when cg.score is not null and cg.score > 0 then 'Based on your favorite genres'
      when ct.score is not null and ct.score > 0 then 'Matches themes you enjoy'
      else 'Recommended for your taste'
    end as recommendation_reason
  from public.films f
  left join candidate_genres cg on cg.film_id = f.id
  left join candidate_tags ct on ct.film_id = f.id
  left join candidate_directors cd on cd.film_id = f.id
  left join candidate_cast cc on cc.film_id = f.id
  left join public.film_audience_score fas on fas.film_id = f.id
  left join public.film_critic_score fcs on fcs.film_id = f.id
  left join lateral (
    select p.name
    from public.film_credits fc
    join public.people p on p.id = fc.person_id
    where fc.film_id = f.id and fc.role = 'director'
    order by fc.billing_order asc
    limit 1
  ) dir on true
  where f.id not in (
    select film_id from public.ratings where user_id = target_user_id
    union
    select film_id from public.watch_history where user_id = target_user_id
  )
  order by
    recommendation_score desc,
    coalesce(fas.audience_percentage, 0) desc,
    f.release_date desc nulls last
  limit 20;
end;
$$;

-- 2. Similar Films Recommendation (Because You Liked [Film])
create or replace function public.recommend_similar_films(source_film_id uuid, p_limit int default 10)
returns table (
  id uuid,
  title text,
  original_title text,
  slug text,
  synopsis text,
  release_year int,
  poster_url text,
  backdrop_url text,
  director text,
  audience_score numeric,
  critic_score numeric,
  ratings_count int,
  similarity_score numeric,
  similarity_reason text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
  with source_genres as (
    select genre_id from public.film_genres where film_id = source_film_id
  ),
  source_tags as (
    select tag_id from public.film_tags where film_id = source_film_id
  ),
  source_directors as (
    select person_id from public.film_credits where film_id = source_film_id and role = 'director'
  ),
  cand_genres as (
    select fg.film_id, count(*)::numeric * 3.0 as score
    from public.film_genres fg
    join source_genres sg on sg.genre_id = fg.genre_id
    where fg.film_id != source_film_id
    group by fg.film_id
  ),
  cand_tags as (
    select ft.film_id, count(*)::numeric * 2.0 as score
    from public.film_tags ft
    join source_tags st on st.tag_id = ft.tag_id
    where ft.film_id != source_film_id
    group by ft.film_id
  ),
  cand_directors as (
    select fc.film_id, count(*)::numeric * 5.0 as score, max(p.name) as director_name
    from public.film_credits fc
    join source_directors sd on sd.person_id = fc.person_id
    join public.people p on p.id = fc.person_id
    where fc.film_id != source_film_id and fc.role = 'director'
    group by fc.film_id
  )
  select
    f.id,
    f.title,
    f.original_title,
    f.slug,
    f.synopsis,
    extract(year from f.release_date)::int as release_year,
    f.poster_url,
    f.backdrop_url,
    coalesce(dir.name, 'Filipino Filmmaker') as director,
    coalesce(fas.audience_percentage, 0)::numeric as audience_score,
    coalesce(fcs.critic_percentage, 0)::numeric as critic_score,
    coalesce(fas.ratings_count, 0)::int as ratings_count,
    round(
      (
        (coalesce(cg.score, 0) + coalesce(ct.score, 0) + coalesce(cd.score, 0) + 0.5)
        * (coalesce(fas.audience_percentage, 75.0) / 100.0)
      )::numeric,
      2
    ) as similarity_score,
    case
      when cd.score is not null and cd.score > 0 then 'Also directed by ' || cd.director_name
      when cg.score is not null and cg.score > 0 and ct.score is not null and ct.score > 0 then 'Similar themes and genre'
      when cg.score is not null and cg.score > 0 then 'Similar genre'
      else 'Recommended Philippine cinema'
    end as similarity_reason
  from public.films f
  left join cand_genres cg on cg.film_id = f.id
  left join cand_tags ct on ct.film_id = f.id
  left join cand_directors cd on cd.film_id = f.id
  left join public.film_audience_score fas on fas.film_id = f.id
  left join public.film_critic_score fcs on fcs.film_id = f.id
  left join lateral (
    select p.name
    from public.film_credits fc
    join public.people p on p.id = fc.person_id
    where fc.film_id = f.id and fc.role = 'director'
    order by fc.billing_order asc
    limit 1
  ) dir on true
  where f.id != source_film_id
    and (cg.score is not null or ct.score is not null or cd.score is not null or f.is_classic)
  order by
    similarity_score desc,
    coalesce(fas.audience_percentage, 0) desc,
    f.release_date desc nulls last
  limit p_limit;
end;
$$;

-- 3. Grants
grant execute on function public.recommend_films(uuid) to anon, authenticated;
grant execute on function public.recommend_similar_films(uuid, int) to anon, authenticated;

