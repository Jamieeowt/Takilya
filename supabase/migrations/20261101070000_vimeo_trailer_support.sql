-- Migration: Add vimeo_id column to public.trailers for dedicated Vimeo embeds
alter table public.trailers
  add column if not exists vimeo_id text;

-- Update verified Philippine cinema Vimeo IDs
update public.trailers
set vimeo_id = '138298816'
where id = '20202020-0001-0000-0000-000000000000'; -- Himala

update public.trailers
set vimeo_id = '769367056'
where id = '20202020-0002-0000-0000-000000000000'; -- Leonor Will Never Die

update public.trailers
set vimeo_id = '368470441'
where id = '20202020-0003-0000-0000-000000000000'; -- John Denver Trending

update public.trailers
set vimeo_id = '769367056'
where id = '20202020-0004-0000-0000-000000000000'; -- Cleaners

