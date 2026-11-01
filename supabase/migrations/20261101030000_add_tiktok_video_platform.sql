-- Migration: Add video_platform and tiktok_id columns to public.trailers
-- Enables official TikTok vertical 9:16 embeds alongside fallback YouTube embeds.

alter table public.trailers
  add column if not exists video_platform text default 'tiktok',
  add column if not exists tiktok_id text,
  add column if not exists video_url text;

-- Backfill existing numeric IDs to tiktok_id
update public.trailers
set
  video_platform = 'tiktok',
  tiktok_id = youtube_id
where youtube_id ~ '^[0-9]{10,25}$';

