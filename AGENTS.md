# Takilya: project instructions for the coding agent

## What the app is
Takilya is a mobile app for discovering, rating and discussing Philippine FILMS (films only, no TV series). Main screen is a TikTok-style vertical video feed of trailers and official clips. Filipino-centered: indie, regional and mainstream films get equal organic visibility.

## Stack
- React Native + Expo (TypeScript, strict), Expo Router for navigation
- Supabase: PostgreSQL, Auth, Storage, Row Level Security
- TanStack Query for data fetching, Zustand for light client state
- Videos are YouTube embeds only (react-native-youtube-iframe). Never host or upload video files.
- Persistent session storage: expo-secure-store (with web localStorage fallback)

## App structure (bottom tabs)
1. Feed: vertical, full-screen, swipe-up video player (trailers and official clips)
2. Explore: Festivals, People (directors, actors) and Studios databases, plus Heritage (National Artists, preserved films), search, genres, awards
3. Reviews: ratings, reviews, per-film discussions, awards per film
4. Account: profile, followers/following (Festivals, Studios, Users), watchlist, top films

## Data model rules
- Entities: films, people, studios, festivals, festival_editions, festival_selections, award_bodies, award_categories, award_recognitions, trailers, clips, genres, tags, streaming_platforms, watch_availability, profiles, reviews, ratings, discussion_threads, comments, votes, reports, follows, watchlist, top_films, notifications, national_artists, preservation_records, promoted_slots.
- follows is POLYMORPHIC: (follower_id, target_type in ['user','studio','festival','person'], target_id).
- award_recognitions.status is one of: nominated | won | official_selection | special_mention. Never collapse into a boolean.
- Ratings are DUAL: audience score (all users) and critic score (users with role = 'critic'), shown separately.
- Verified accounts: studios, festivals and people can post official clips only after an admin sets verification_status = 'verified'.
- Roles: user, critic, verified_official, admin.
- Promoted content is allowed only in clearly labeled promoted_slots, shown at most 1 per 10 organic feed items, always with a visible "Promoted" tag.

## Code conventions
- TypeScript strict, functional components, hooks only.
- Folders:
  - `app/` (Expo Router routes and layouts)
  - `components/` (reusable UI atoms: Badge, Card, ThemedText, ThemedView)
  - `features/<name>/` (queries, hooks, types, api.ts)
  - `lib/` (supabase client, theme, queryClient, store)
  - `supabase/` (schema.sql migrations, seed.sql data)
- All database access goes through typed functions in `features/*/api.ts`, never inline in components.
- Every list screen needs loading, empty and error states. Use FlatList with pagination.
- Accessible labels on all touchables; minimum 44px tap targets; dark theme by default.
- Never hard-code secrets. Read `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from env.
- Enable Row Level Security on every table; write policies for each.

## Development Commands
```bash
npx expo start              # Start the Expo development server
npx expo start --web        # Start web preview
npx tsc --noEmit            # Typecheck whole project
```

## Out of scope
Payments, ticketing, hosting video, TV series, real FDCP integration (use seed data standing in for FDCP records).
