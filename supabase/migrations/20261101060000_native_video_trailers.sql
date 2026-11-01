-- Migration: Native In-App Video Trailers with expo-video
-- Adds video_url, poster_url, duration_seconds, rights_note to public.trailers
-- Creates private-to-authenticated 'trailers' Supabase Storage bucket with admin-only upload path.

alter table public.trailers
  alter column youtube_id drop not null;

alter table public.trailers
  add column if not exists video_url text,
  add column if not exists poster_url text,
  add column if not exists duration_seconds integer,
  add column if not exists rights_note text;

-- Create private 'trailers' storage bucket (private to authenticated users)
insert into storage.buckets (id, name, public)
values ('trailers', 'trailers', false)
on conflict (id) do update set public = false;

-- Storage RLS Policies:
-- 1. Read: Authenticated users can read/stream trailer files
create policy "Authenticated users can read trailers"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'trailers');

-- 2. Insert: Admins only can upload trailer videos
create policy "Admins can upload trailers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'trailers' and public.is_admin());

-- 3. Update: Admins only can update trailer videos
create policy "Admins can update trailers"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'trailers' and public.is_admin());

-- 4. Delete: Admins only can delete trailer videos
create policy "Admins can delete trailers"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'trailers' and public.is_admin());

