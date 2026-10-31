-- ==============================================================================
-- Takilya: Seed Data for Philippine Cinema Database
-- Matches schema in supabase/migrations/20261031160000_takilya_full_schema.sql
-- ==============================================================================

-- 1. Studios
insert into public.studios (id, name, slug, description, founded_year, verification_status)
values
  ('11111111-1111-1111-1111-111111111111', 'TBA Studios', 'tba-studios', 'Pioneering Philippine independent studio behind modern historical epics and auteur cinema.', 2014, 'verified'),
  ('22222222-2222-2222-2222-222222222222', 'Black Sheep', 'black-sheep', 'Sub-division of ABS-CBN Studios focused on bold, conversational Filipino films.', 2018, 'verified'),
  ('33333333-3333-3333-3333-333333333333', 'Sine Olivia Pilipinas', 'sine-olivia', 'Independent production collective established by auteur Lav Diaz.', 2003, 'verified'),
  ('44444444-4444-4444-4444-444444444444', 'Anima Studios', 'anima-studios', 'Entertainment studio producing genre-bending and award-winning Philippine cinema.', 2016, 'verified'),
  ('55555555-5555-5555-5555-555555555555', 'Arkeofilms', 'arkeofilms', 'Boutique indie production outfit supporting regional and innovative Filipino voices.', 2005, 'verified')
on conflict (slug) do nothing;

-- 2. People & Filmmakers
insert into public.people (id, name, slug, bio, birth_year, role_type, verification_status)
values
  ('aaaaaaaa-0001-0000-0000-000000000000', 'Ishmael Bernal', 'ishmael-bernal', 'Conferred National Artist for Cinema (2001). Master of social satire, humanism, and sharp feminist drama.', 1938, 'director', 'verified'),
  ('aaaaaaaa-0002-0000-0000-000000000000', 'Lino Brocka', 'lino-brocka', 'Conferred National Artist for Cinema (1997). Legendary champion of freedom of expression and Philippine social realism.', 1939, 'director', 'verified'),
  ('aaaaaaaa-0003-0000-0000-000000000000', 'Kidlat Tahimik', 'kidlat-tahimik', 'Conferred National Artist for Film and Broadcast Arts (2018). Father of Philippine independent cinema.', 1942, 'director', 'verified'),
  ('aaaaaaaa-0004-0000-0000-000000000000', 'Martika Ramirez Escobar', 'martika-escobar', 'Award-winning cinematographer and director of Sundance Special Jury Prize winner Leonor Will Never Die.', 1992, 'director', 'verified'),
  ('aaaaaaaa-0005-0000-0000-000000000000', 'Arden Rod Condez', 'arden-rod-condez', 'Filmmaker and screenwriter from Pandan, Antique. Director of Cinemalaya Best Film John Denver Trending.', 1982, 'director', 'verified'),
  ('aaaaaaaa-0006-0000-0000-000000000000', 'Glenn Barit', 'glenn-barit', 'Tuguegarao-born filmmaker known for nostalgic regional storytelling and photocopied animation in Cleaners.', 1992, 'director', 'verified'),
  ('aaaaaaaa-0007-0000-0000-000000000000', 'Nora Aunor', 'nora-aunor', 'Conferred National Artist for Film and Broadcast Arts (2022). The Philippine Grand Dame of Cinema.', 1953, 'actor', 'verified'),
  ('aaaaaaaa-0008-0000-0000-000000000000', 'Bembol Roco', 'bembol-roco', 'Iconic Filipino dramatic actor celebrated for Maynila sa mga Kuko ng Liwanag.', 1953, 'actor', 'verified'),
  ('aaaaaaaa-0009-0000-0000-000000000000', 'Sheila Francisco', 'sheila-francisco', 'Veteran stage and screen actress, acclaimed for portraying Leonor Reyes in Leonor Will Never Die.', 1957, 'actor', 'verified')
on conflict (slug) do nothing;

-- 3. National Artists
insert into public.national_artists (person_id, year_conferred, category, citation)
values
  ('aaaaaaaa-0001-0000-0000-000000000000', 2001, 'Cinema', 'For his incisive social commentaries, stylistic mastery, and indelible contributions to the Golden Age of Philippine Cinema including Himala and Manila by Night.'),
  ('aaaaaaaa-0002-0000-0000-000000000000', 1997, 'Cinema', 'For pioneering militant social realism, exposing the plight of marginalized urban poor, and asserting films as vital agents for social change.'),
  ('aaaaaaaa-0003-0000-0000-000000000000', 2018, 'Film and Broadcast Arts', 'For trailblazing indigenous, personal, and fiercely independent cinema with international acclaim for Mababangong Bangungot.'),
  ('aaaaaaaa-0007-0000-0000-000000000000', 2022, 'Film and Broadcast Arts', 'For unmatched dramatic vulnerability, distinct vocal mastery, and immortal performances that defined generations of Philippine storytelling.')
on conflict (person_id) do nothing;

-- 4. Genres
insert into public.genres (id, name, slug, description)
values
  ('bbbbbbbb-0001-0000-0000-000000000000', 'Drama', 'drama', 'Emotion-driven narratives depicting personal, social, and moral struggles.'),
  ('bbbbbbbb-0002-0000-0000-000000000000', 'Social Realism', 'social-realism-genre', 'Uncompromising portrayal of working-class realities and structural injustice.'),
  ('bbbbbbbb-0003-0000-0000-000000000000', 'Coming-of-Age', 'coming-of-age', 'Stories charting youth, nostalgia, moral discovery, and adolescence.'),
  ('bbbbbbbb-0004-0000-0000-000000000000', 'Meta-Comedy', 'meta-comedy', 'Humorous films self-consciously playing with cinematic conventions.'),
  ('bbbbbbbb-0005-0000-0000-000000000000', 'Psychological Thriller', 'psychological-thriller', 'High-tension character studies exploring fear, paranoia, and morality.')
on conflict (slug) do nothing;

-- 5. Films
insert into public.films (id, title, original_title, slug, synopsis, release_date, runtime_minutes, language, mtrcb_rating, is_classic, studio_id)
values
  (
    'cccccccc-0001-0000-0000-000000000000',
    'Himala',
    'Himala',
    'himala',
    'In a drought-stricken rural town, a young provincial woman named Elsa claims to have witnessed an apparition of the Virgin Mary, setting off a nationwide wave of fanaticism, commerce, and tragedy.',
    '1982-12-25',
    124,
    'Filipino',
    'PG',
    true,
    null
  ),
  (
    'cccccccc-0002-0000-0000-000000000000',
    'Maynila sa mga Kuko ng Liwanag',
    'Maynila sa mga Kuko ng Liwanag',
    'maynila-sa-mga-kuko-ng-liwanag',
    'Julio, a naive fisherman from Marinduque, navigates the cruel alleys of Manila searching for his lost childhood sweetheart Ligaya, uncovering exploitation across construction sites and Chinatown.',
    '1975-07-16',
    125,
    'Filipino',
    'R-16',
    true,
    null
  ),
  (
    'cccccccc-0003-0000-0000-000000000000',
    'Leonor Will Never Die',
    'Ang Pagbabalik ng Kwago',
    'leonor-will-never-die',
    'A retired action filmmaker falls into a coma when a television falls on her head, transporting her inside her own unfinished 1980s action screenplay where she fights to save her protagonist.',
    '2022-01-21',
    99,
    'Filipino',
    'PG',
    false,
    '44444444-4444-4444-4444-444444444444'
  ),
  (
    'cccccccc-0004-0000-0000-000000000000',
    'John Denver Trending',
    'John Denver Trending',
    'john-denver-trending',
    'A 14-year-old junior high student in Antique is falsely accused of stealing an iPad. After a viral video of his retaliation circulates on social media, cyberbullying escalates into an inescapable nightmare.',
    '2019-08-01',
    96,
    'Kinaray-a',
    'PG',
    false,
    '55555555-5555-5555-5555-555555555555'
  ),
  (
    'cccccccc-0005-0000-0000-000000000000',
    'Cleaners',
    'Cleaners',
    'cleaners',
    'Set in Tuguegarao City in 2004, a series of linked coming-of-age stories follows high school classroom cleaners navigating junior high pressures, entirely rendered in vibrant photocopied paper textures.',
    '2019-10-13',
    78,
    'Ilokano',
    'PG',
    false,
    null
  )
on conflict (slug) do nothing;

-- 6. Film Credits
insert into public.film_credits (film_id, person_id, role, character_name, billing_order)
values
  ('cccccccc-0001-0000-0000-000000000000', 'aaaaaaaa-0001-0000-0000-000000000000', 'director', null, 1),
  ('cccccccc-0001-0000-0000-000000000000', 'aaaaaaaa-0007-0000-0000-000000000000', 'lead_actor', 'Elsa', 2),
  ('cccccccc-0002-0000-0000-000000000000', 'aaaaaaaa-0002-0000-0000-000000000000', 'director', null, 1),
  ('cccccccc-0002-0000-0000-000000000000', 'aaaaaaaa-0008-0000-0000-000000000000', 'lead_actor', 'Julio Madiaga', 2),
  ('cccccccc-0003-0000-0000-000000000000', 'aaaaaaaa-0004-0000-0000-000000000000', 'director', null, 1),
  ('cccccccc-0003-0000-0000-000000000000', 'aaaaaaaa-0009-0000-0000-000000000000', 'lead_actor', 'Leonor Reyes', 2),
  ('cccccccc-0004-0000-0000-000000000000', 'aaaaaaaa-0005-0000-0000-000000000000', 'director', null, 1),
  ('cccccccc-0005-0000-0000-000000000000', 'aaaaaaaa-0006-0000-0000-000000000000', 'director', null, 1)
on conflict do nothing;

-- 7. Film Genres & Tags
insert into public.film_genres (film_id, genre_id)
values
  ('cccccccc-0001-0000-0000-000000000000', 'bbbbbbbb-0001-0000-0000-000000000000'),
  ('cccccccc-0001-0000-0000-000000000000', 'bbbbbbbb-0002-0000-0000-000000000000'),
  ('cccccccc-0002-0000-0000-000000000000', 'bbbbbbbb-0001-0000-0000-000000000000'),
  ('cccccccc-0002-0000-0000-000000000000', 'bbbbbbbb-0002-0000-0000-000000000000'),
  ('cccccccc-0003-0000-0000-000000000000', 'bbbbbbbb-0004-0000-0000-000000000000'),
  ('cccccccc-0004-0000-0000-000000000000', 'bbbbbbbb-0001-0000-0000-000000000000'),
  ('cccccccc-0004-0000-0000-000000000000', 'bbbbbbbb-0005-0000-0000-000000000000'),
  ('cccccccc-0005-0000-0000-000000000000', 'bbbbbbbb-0003-0000-0000-000000000000')
on conflict do nothing;

insert into public.film_tags (film_id, tag_id)
select 'cccccccc-0001-0000-0000-000000000000'::uuid, id from public.tags where slug in ('restored-heritage', 'national-artist-masterwork')
union all
select 'cccccccc-0002-0000-0000-000000000000'::uuid, id from public.tags where slug in ('social-realism', 'national-artist-masterwork', 'restored-heritage')
union all
select 'cccccccc-0003-0000-0000-000000000000'::uuid, id from public.tags where slug in ('indie', 'qcinema-selection')
union all
select 'cccccccc-0004-0000-0000-000000000000'::uuid, id from public.tags where slug in ('indie', 'regional-cinema', 'based-on-true-story', 'cinemalaya-winner')
union all
select 'cccccccc-0005-0000-0000-000000000000'::uuid, id from public.tags where slug in ('indie', 'regional-cinema', 'qcinema-selection')
on conflict do nothing;

-- 8. Festivals & Editions
insert into public.festivals (id, name, slug, description, location, founded_year, verification_status)
values
  ('dddddddd-0001-0000-0000-000000000000', 'Cinemalaya Philippine Independent Film Festival', 'cinemalaya', 'Flagship competitive festival fostering pure independent Filipino filmmakers.', 'Manila', 2005, 'verified'),
  ('dddddddd-0002-0000-0000-000000000000', 'QCinema International Film Festival', 'qcinema', 'Premier international film festival in Quezon City funding and presenting innovative cinema.', 'Quezon City', 2013, 'verified'),
  ('dddddddd-0003-0000-0000-000000000000', 'Cinema Rehiyon', 'cinema-rehiyon', 'Non-competitive festival celebrating the voices, languages, and cultures of the Philippine regions.', 'Regional / Nationwide', 2009, 'verified')
on conflict (slug) do nothing;

insert into public.festival_editions (id, festival_id, year, name, theme, starts_at, ends_at)
values
  ('eeeeeeee-0001-0000-0000-000000000000', 'dddddddd-0001-0000-0000-000000000000', 2019, 'Cinemalaya 15', 'Ikalabing-limang Yugto', '2019-08-02', '2019-08-11'),
  ('eeeeeeee-0002-0000-0000-000000000000', 'dddddddd-0002-0000-0000-000000000000', 2019, 'QCinema 2019', 'Filipino New Breed', '2019-10-13', '2019-10-22')
on conflict (festival_id, year) do nothing;

insert into public.festival_selections (edition_id, film_id, section, status)
values
  ('eeeeeeee-0001-0000-0000-000000000000', 'cccccccc-0004-0000-0000-000000000000', 'Main Competition', 'in_competition'),
  ('eeeeeeee-0002-0000-0000-000000000000', 'cccccccc-0005-0000-0000-000000000000', 'Asian Next Wave', 'in_competition')
on conflict do nothing;

-- 9. Award Bodies, Categories & Recognitions
insert into public.award_bodies (id, name, acronym, scope, description, country)
values
  ('ffffffff-0001-0000-0000-000000000000', 'Manunuri ng Pelikulang Pilipino (Gawad Urian)', 'Gawad Urian', 'local', 'The most esteemed film critic award-giving body in the Philippines, founded in 1976.', 'Philippines'),
  ('ffffffff-0002-0000-0000-000000000000', 'Sundance Film Festival', 'Sundance', 'international', 'Foremost global independent film festival organized by the Sundance Institute.', 'United States')
on conflict do nothing;

insert into public.award_categories (id, award_body_id, name, description)
values
  ('10101010-0001-0000-0000-000000000000', 'ffffffff-0001-0000-0000-000000000000', 'Pinakamahusay na Pelikula (Best Picture)', 'Awarded to the outstanding Philippine motion picture of the year.'),
  ('10101010-0002-0000-0000-000000000000', 'ffffffff-0001-0000-0000-000000000000', 'Pinakamahusay na Direksyon (Best Director)', 'Awarded to the most accomplished film direction.'),
  ('10101010-0003-0000-0000-000000000000', 'ffffffff-0002-0000-0000-000000000000', 'Special Jury Prize (World Cinema Dramatic)', 'Honoring innovative vision and stylistic craft.')
on conflict do nothing;

insert into public.award_recognitions (category_id, ceremony_year, status, recipient_type, recipient_id, source_url)
values
  ('10101010-0001-0000-0000-000000000000', 1983, 'won', 'film', 'cccccccc-0001-0000-0000-000000000000', 'https://manunuri.com'),
  ('10101010-0001-0000-0000-000000000000', 1976, 'won', 'film', 'cccccccc-0002-0000-0000-000000000000', 'https://manunuri.com'),
  ('10101010-0003-0000-0000-000000000000', 2022, 'won', 'film', 'cccccccc-0003-0000-0000-000000000000', 'https://sundance.org')
on conflict do nothing;

-- 10. Trailers & YouTube Embeds
insert into public.trailers (id, film_id, youtube_id, title, type, posted_by_type, posted_by_id, view_count)
values
  ('20202020-0001-0000-0000-000000000000', 'cccccccc-0001-0000-0000-000000000000', 'L_LUpnjgPso', 'Himala 4K Restored Official Heritage Trailer', 'official', 'admin', '11111111-1111-1111-1111-111111111111', 45000),
  ('20202020-0002-0000-0000-000000000000', 'cccccccc-0003-0000-0000-000000000000', '7lMwbA9bUVo', 'Leonor Will Never Die Official Sundance US Trailer', 'official', 'studio', '44444444-4444-4444-4444-444444444444', 38200),
  ('20202020-0003-0000-0000-000000000000', 'cccccccc-0004-0000-0000-000000000000', '8b1T8k5qP8A', 'John Denver Trending Cinemalaya Official Clip', 'clip', 'festival', 'dddddddd-0001-0000-0000-000000000000', 19800),
  ('20202020-0004-0000-0000-000000000000', 'cccccccc-0005-0000-0000-000000000000', 'kJQP7kiw5Fk', 'Cleaners QCinema Coming-of-Age Trailer', 'official', 'admin', '11111111-1111-1111-1111-111111111111', 28500),
  ('20202020-0005-0000-0000-000000000000', 'cccccccc-0002-0000-0000-000000000000', 'vP88v2B4a_A', 'Maynila sa mga Kuko ng Liwanag World Cinema Project Teaser', 'official', 'admin', '11111111-1111-1111-1111-111111111111', 32400)
on conflict do nothing;

-- 11. Promoted Slots (clearly marked)
insert into public.promoted_slots (id, film_id, trailer_id, sponsor_name, starts_at, ends_at, is_active)
values
  ('30303030-0001-0000-0000-000000000000', 'cccccccc-0003-0000-0000-000000000000', '20202020-0002-0000-0000-000000000000', 'QCinema Autumn Re-Release', now() - interval '1 day', now() + interval '30 days', true)
on conflict do nothing;

-- 12. Streaming Platforms & Watch Availability
insert into public.streaming_platforms (id, name, slug, logo_url, website_url, is_local)
values
  ('40404040-0001-0000-0000-000000000000', 'JuanFlix / FDCP Channel', 'juanflix', null, 'https://juanflix.com.ph', true),
  ('40404040-0002-0000-0000-000000000000', 'iWantTFC', 'iwanttfc', null, 'https://iwanttfc.com', true),
  ('40404040-0003-0000-0000-000000000000', 'Netflix Philippines', 'netflix-ph', null, 'https://netflix.com', false)
on conflict (slug) do nothing;

insert into public.watch_availability (film_id, platform_id, url, availability_type, price_php)
values
  ('cccccccc-0001-0000-0000-000000000000', '40404040-0002-0000-0000-000000000000', 'https://iwanttfc.com/movies/himala', 'subscription', null),
  ('cccccccc-0003-0000-0000-000000000000', '40404040-0003-0000-0000-000000000000', 'https://netflix.com/title/81614068', 'subscription', null),
  ('cccccccc-0004-0000-0000-000000000000', '40404040-0001-0000-0000-000000000000', 'https://juanflix.com.ph/john-denver-trending', 'rent', 120.00)
on conflict do nothing;

-- 13. Preservation Records
insert into public.preservation_records (film_id, status, restoring_body, restoration_year, archive_location)
values
  ('cccccccc-0001-0000-0000-000000000000', 'restored', 'ABS-CBN Film Restoration (Sagip Pelikula) & Central Digital Lab', 2012, 'ABS-CBN Film Archives, Quezon City'),
  ('cccccccc-0002-0000-0000-000000000000', 'restored', 'The Film Foundation World Cinema Project / Cineteca di Bologna (L’Immagine Ritrovata)', 2013, 'Bologna, Italy & FDCP National Film Archive')
on conflict do nothing;