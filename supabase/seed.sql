-- Seed Data for Takilya (Philippine Cinema)

-- Studios
insert into studios (id, name, slug, description, studio_type, verification_status)
values
  ('11111111-1111-1111-1111-111111111111', 'TBA Studios', 'tba-studios', 'Award-winning Philippine independent film production and distribution company.', 'indie', 'verified'),
  ('22222222-2222-2222-2222-222222222222', 'Black Sheep', 'black-sheep', 'Creator of bold, conversational modern Philippine cinema.', 'mainstream', 'verified'),
  ('33333333-3333-3333-3333-333333333333', 'Sine Olivia Pilipinas', 'sine-olivia', 'Independent production outfit led by Lav Diaz.', 'indie', 'verified')
on conflict do nothing;

-- Festivals
insert into festivals (id, name, slug, description, location, established_year, verification_status)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cinemalaya', 'cinemalaya', 'Philippine Independent Film Festival dedicated to the development and promotion of Filipino independent films.', 'Manila', 2005, 'verified'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'QCinema International Film Festival', 'qcinema', 'Annual film festival in Quezon City fostering original Philippine voices.', 'Quezon City', 2013, 'verified'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Cinema Rehiyon', 'cinema-rehiyon', 'Celebrates works produced in the diverse regions and cultural languages of the Philippines.', 'Bacolod / Nationwide', 2009, 'verified')
on conflict do nothing;

-- National Artists & Directors
insert into people (id, full_name, slug, biography, is_national_artist, verification_status)
values
  ('44444444-4444-4444-4444-444444444444', 'Ishmael Bernal', 'ishmael-bernal', 'National Artist for Cinema (2001), renowned for sharp social satire and feminist masterworks.', true, 'verified'),
  ('55555555-5555-5555-5555-555555555555', 'Lino Brocka', 'lino-brocka', 'National Artist for Cinema (1997), pioneer of social realism in Philippine film.', true, 'verified'),
  ('66666666-6666-6666-6666-666666666666', 'Martika Ramirez Escobar', 'martika-escobar', 'Director and cinematographer of Sundance award-winning film Leonor Will Never Die.', false, 'verified')
on conflict do nothing;

-- Films
insert into films (id, title, slug, synopsis, release_year, director_id, critic_score, audience_score, is_preserved, is_national_artist_work)
values
  ('f1111111-1111-1111-1111-111111111111', 'Himala', 'himala', 'Elsa, a provincial girl, brings pilgrims and merchants to her arid town after seeing a vision of the Virgin Mary, unraveling mass hysteria and tragedy.', 1982, '44444444-4444-4444-4444-444444444444', 98.0, 95.0, true, true),
  ('f2222222-2222-2222-2222-222222222222', 'Maynila sa mga Kuko ng Liwanag', 'maynila-sa-mga-kuko-ng-liwanag', 'A young fisherman from the province travels to Manila in search of his lost lover, only to encounter exploitation and tragedy in the city.', 1975, '55555555-5555-5555-5555-555555555555', 99.0, 96.0, true, true),
  ('f3333333-3333-3333-3333-333333333333', 'Leonor Will Never Die', 'leonor-will-never-die', 'Fiction and reality blur when a retired filmmaker falls into a coma after a television falls on her head, transporting her inside her unfinished action script.', 2022, '66666666-6666-6666-6666-666666666666', 91.0, 87.0, false, false)
on conflict do nothing;

-- Trailers (YouTube embed keys)
insert into trailers (film_id, youtube_video_id, title, type, is_official)
values
  ('f1111111-1111-1111-1111-111111111111', 'L_LUpnjgPso', 'Himala 4K Restored Official Trailer', 'trailer', true),
  ('f3333333-3333-3333-3333-333333333333', '7lMwbA9bUVo', 'Leonor Will Never Die Official US Trailer', 'trailer', true)
on conflict do nothing;

