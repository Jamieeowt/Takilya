-- Cinemalaya Schema Patch (Compact, safe & idempotent)
-- Run this in Supabase SQL Editor to prepare schema for batch ingester

ALTER TABLE public.films
  ADD COLUMN IF NOT EXISTS release_year integer,
  ADD COLUMN IF NOT EXISTS letterboxd_url text,
  ADD COLUMN IF NOT EXISTS cultural_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS watch_sources jsonb DEFAULT '[]';

-- Ensure unique constraint on (title, release_year) for idempotent upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'films_title_release_year_key'
  ) THEN
    ALTER TABLE public.films ADD CONSTRAINT films_title_release_year_key UNIQUE (title, release_year);
  END IF;
END $$;

-- Backfill release_year from release_date for existing rows
UPDATE public.films
SET release_year = EXTRACT(YEAR FROM release_date)::integer
WHERE release_year IS NULL AND release_date IS NOT NULL;

-- Default release_date from release_year if missing
UPDATE public.films
SET release_date = make_date(release_year, 1, 1)
WHERE release_date IS NULL AND release_year IS NOT NULL;

