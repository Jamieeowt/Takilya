# Takilya: project instructions for the coding agent
## What the app is
Takilya is a mobile app for discovering, rating and discussing Philippine
FILMS (films only, no TV series). Main screen is a TikTok-style vertical
video feed of trailers and official clips. Filipino-centered: indie, regional
and mainstream films get equal organic visibility.
## Stack
React Native Expo (TypeScript, strict), Expo Router for navigation
Supabase: PostgreSQL, Auth, Storage, Row Level Security
TanStack Query for data fetching, Zustand for light client state
Videos are TikTok embeds from official uploads only, loaded through the
official TikTok embed player in react-native-webview. Only one WebView is
mounted at a time (the visible feed item); other items show a thumbnail.
Always provide a thumbnail plus a "Watch on TikTok" fallback if playback
fails. Never host or upload video files.
## App structure (bottom tabs)
1. Feed: vertical, full-screen, swipe-up video player (trailers and official
clips)
2. Explore: Festivals, People (directors, actors) and Studios databases, plus
Heritage (National Artists, preserved films), search, genres, awards
3. Reviews: ratings, reviews, per-film discussions, awards per film
4. Account: profile, followers/following (Festivals, Studios, Users),
watchlist, top films
## Data model rules
- Entities: films, people, studios, festivals, festival_editions,
festival_selections, award_bodies, award_categories, award_recognitions,
trailers, clips, genres, tags, streaming_platforms, watch_availability,
profiles, reviews, ratings, discussion_threads, comments, votes, reports,
follows, watchlist, top_films, notifications, national_artists,
preservation_records, promoted_slots.
follows is POLYMORPHIC: (follower_id, target_type in
['user', 'studio', 'festival', 'person'], target_id).
award_recognitions.status is one of:
nominated | won | official_selection | special_mention. Never collapse into a boolean.
Ratings are DUAL: audience score (all users) and critic score (users with
role = 'critic'), shown separately.
Verified accounts: studios, festivals and people can post official clips
only after an admin sets verification_status = 'verified'.
Roles: user, critic, verified_official, admin.
Promoted content is allowed only in clearly labeled promoted_slots, shown
at most 1 per 10 organic feed items, always with a visible "Promoted" tag.
## Code conventions
TypeScript strict, functional components, hooks only.
Folders: app/ (routes), components/, features/<name>/ (queries, hooks,
types), lib/ (supabase client, utils), supabase/ (migrations, seed).
All database access goes through typed functions in features/*/api.ts,
never inline in components.
Every list screen needs loading, empty and error states. Use FlatList with
pagination.
Accessible labels on all touchables; minimum 44px tap targets.
## Design system (strict black and white)
Monochrome only: pure black #000000 and white #FFFFFF plus a gray ramp
(#0A0A0A, #141414, #1F1F1F, #2E2E2E, #8A8A8A, #D4D4D4, #F5F5F5). No other hue
anywhere, including badges, charts and errors. Tell states apart by fill vs
outline, weight, icon and label, never by color.
Dark mode is the default (black background, white text); light mode inverts
it (white background, black text). Every color comes from lib/theme.ts
tokens.
High fidelity, high tech, familiar patterns: TikTok-style feed, Instagram-
style profiles, Letterboxd-style poster grids, Netflix-style horizontal rows.
Type: Inter (SF Pro on iOS), tight tracking on headings, 8px spacing grid,
1px hairline borders at 12% white, 16 to 24px card radii, fully round pills.
Motion and depth: translucent blurred tab bar and headers (expo-blur),
subtle haptics (expo-haptics), spring animations (react-native-reanimated),
shimmer skeleton loaders, lucide-react-native icons, poster images with
blurhash placeholders (expo-image).
No emojis in the UI. Verified badge = white check in a filled circle.
Promoted label = outlined pill. Awards: Won = filled badge, Nominated =
outlined badge, Official Selection = dashed outline, Special Mention = double
outline.
Never hard-code secrets. Read EXPO_PUBLIC_SUPABASE_URL and
EXPO_PUBLIC_SUPABASE_ANON_KEY from env.
Enable Row Level Security on every table; write policies for each.
Policies grant read access to authenticated users only, never anon.
## Out of scope
Payments, ticketing, hosting video, TV series, real FDCP integration (use
seed data standing in for FDCP records).
## Launch flow and auth gate
Cold start: native splash, then an animated splash while the session
restores. No session: Welcome screen (Create account or Sign in); nothing
else is reachable. Session: the 4 tabs.
No guest mode. Every tab, film, trailer and profile requires a signed-in
user. Enforce it in routing (protected routes) and in Row Level Security
(no anon access to app data).
## Safe areas and bottom navigation
Wrap the app in SafeAreaProvider. Never hard-code notch or system-bar
offsets. Tab bar height = 56 + bottomInset, where bottomInset =
Math.max(insets.bottom, 12), so it never overlaps the iOS home indicator,
Android gesture bar or 3-button navigation. Scroll screens add the tab bar
height as bottom padding. Floating controls, sheets and toasts sit above
the tab bar and add insets.bottom. Android uses edge-to-edge with
transparent system bars.