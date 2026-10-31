# TAKILYA (Pelikulang Pilipino)

> **Takilya** is a high-fidelity mobile application for discovering, rating, and discussing **Philippine Cinema** (films only, no TV series). Built from the ground up to give indie, regional, and mainstream Filipino films equal organic visibility through a modern, TikTok-style vertical video feed of trailers and official clips.

---

## 1. App Vision & Core Pillars

1. **Filipino-Centered Cinema**: Equal visibility across Philippine film movements—from Cinemalaya and QCinema regional gems to restored classics by National Artists and mainstream studio milestones. TV series and non-Philippine content are strictly excluded.
2. **TikTok-Style Discovery**: Full-bleed, edge-to-edge vertical video trailers with custom YouTube embeds, vinyl poster disc rotation, double-tap spring heart animations, and instant watchlist toggling.
3. **Dual Rating System**: Independent audience scores (general cinephiles) and critic scores (accredited critics with `role = 'critic'`) shown side-by-side to preserve critical dialogue without skewing organic viewer reception.
4. **Spoiler-Safe Community**: Full-featured per-film review boards and discussion threads protected by tap-to-reveal spoiler blur masks and character/profanity moderation.
5. **Direct Filmmaker Ecosystem**: Polymorphic following across users, independent studios (TBA Studios, Black Sheep), festivals (Cinemalaya, QCinema, MMFF, Sinag Maynila), and filmmakers.
6. **Strict Monochrome Aesthetic**: High-contrast, pure black (`#000000`) and white (`#FFFFFF`) palette with a refined gray ramp. Zero color used anywhere in the UI—meaning is conveyed purely through geometry, weight, icons, and borders.

---

## 2. Tech Stack

- **Mobile Framework**: React Native Expo (SDK 58, TypeScript strict mode)
- **Routing & Navigation**: Expo Router v4 (typed file-based routes with glass tab bar and headers)
- **Database & Backend**: Supabase (PostgreSQL 15, Auth, Storage, Row Level Security, Realtime subscriptions)
- **Data Fetching & State**: TanStack Query (React Query v5) with optimistic mutations, and Zustand for light client state
- **Video Player**: `react-native-youtube-iframe` (official YouTube embeds only; no raw video file uploads or hosting)
- **Animations & Gesture**: `react-native-reanimated` (v4), `react-native-gesture-handler`, `expo-haptics`
- **UI & Icons**: `lucide-react-native`, `expo-blur`, `expo-image` with blurhash placeholders

---

## 3. App Architecture & Bottom Tabs

```
Takilya Navigation (Bottom Tabs)
├── 1. Feed: Full-bleed vertical video player (trailers & official clips)
├── 2. Explore: Search, festivals, studios, people, awards & heritage
├── 3. Activity / Reviews: Community reviews, discussions, ratings
└── 4. Account / Profile: Diary logs, top films showcase, watchlist, following
```

### Bottom Tabs Overview
1. **Feed (`app/(tabs)/index.tsx`)**:
   - Vertical swipe-up pager with edge-to-edge video playback.
   - Segmented toggle: "For You" (personalized via followed festivals and studios) vs. "Latest".
   - Double-tap to like with spring heart animation, vinyl disc poster spin, mute/unmute toggle.
   - Outlined "Promoted" pills strictly injected at a max 1:10 ratio (never placed at position 1).
2. **Explore (`app/(tabs)/explore.tsx`)**:
   - Netflix-style horizontal poster rows (`PosterRow`).
   - PostgreSQL tsvector full-text search across films, people, studios, and festivals.
   - Dedicated hubs for **Festivals**, **People**, **Studios**, **Philippine Film Heritage** (National Artists & Preserved Films), and **Where to Watch**.
3. **Activity (`app/(tabs)/activity.tsx`)**:
   - Real-time community activity stream of ratings, written reviews, and discussions.
   - Filter chips for All, Reviews, and Discussions.
4. **Account (`app/(tabs)/profile.tsx`)**:
   - Letterboxd-style profile layout: Top 4 Favorites showcase, stat counters, and diary list.
   - Modular tabs: Diary, Watchlist, Custom Lists, Reviews, and Discussions.
   - Polymorphic follow management (Festivals, Studios, Filmmakers, Users).

---

## 4. Design System (Strict Monochrome)

Takilya strictly adheres to a high-contrast black-and-white design language defined in `lib/theme.ts`:

- **Pure Colors**: Pure Black `#000000`, Pure White `#FFFFFF`
- **Gray Ramp**: `#0A0A0A`, `#141414`, `#1F1F1F`, `#2E2E2E`, `#8A8A8A`, `#D4D4D4`, `#F5F5F5`
- **Grid & Radii**: Strict 8px spacing grid; 1px hairline borders at 12% white; 16px to 24px card radii; fully round pills (`radius.full`).
- **Typography**: Inter (SF Pro on iOS) with tight tracking on headings.
- **Visual State Indicators**:
  - **Awards**: Won = filled badge, Nominated = outlined badge, Official Selection = dashed outline, Special Mention = double outline.
  - **Verification**: White check in a filled circle (`VerifiedBadge`).
  - **Promoted Items**: Outlined pill tag with sponsor name (`PromotedPill`).
- **Accessibility**: Minimum 44x44px tap targets on all touchables; explicit `accessibilityRole` and `accessibilityLabel` attributes.

---

## 5. Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Expo Go](https://expo.dev/go) app on a physical device, or an iOS Simulator / Android Emulator.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/takilya.git
   cd takilya
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the Metro Bundler**:
   ```bash
   npm start
   ```
   - Press `a` to open in Android Emulator.
   - Press `i` to open in iOS Simulator.
   - Scan the QR code with Expo Go on your mobile device.

---

## 6. Database Setup & Row Level Security

The Takilya backend runs on Supabase PostgreSQL with strict Row Level Security enabled on all tables.

### 1. Migrations
Database migrations are located in `supabase/migrations/`:
- `20261031160000_takilya_full_schema.sql`: Core tables, enums, triggers, and RLS policies.
- `20261101010000_promoted_slots.sql`: Promoted slots and event analytics tracking.
- `20261101020000_recommendation_engine.sql`: PostgreSQL SQL recommendation functions (`recommend_films`, `recommend_similar_films`).
- `20261101025000_notifications.sql`: In-app notification triggers and Realtime publication.

### 2. Seeding
Apply the seed data containing verified Philippine cinema history, National Artists, Cinemalaya editions, trailers, and catalog films:
```bash
# Using Supabase CLI
supabase db reset
# Or execute supabase/seed.sql directly in the Supabase SQL Editor
```

### 3. Row Level Security (RLS) Test Suite
Verify security isolation and policy enforcement:
```sql
-- Execute supabase/tests/rls_policies.sql in your Supabase SQL Editor
-- Asserts that:
--   1. Anonymous users have read-only access to catalog tables.
--   2. Normal users cannot tamper with or delete other users' reviews.
--   3. Normal unverified users cannot upload official studio trailers.
--   4. Only admins can write to award body and recognition tables.
```

---

## 7. Testing Suite

Takilya includes a comprehensive Jest test suite covering unit validation, state mutation flows, and component rendering:

```bash
# Run all unit and integration tests
npm test

# Run tests in a specific suite
npx jest __tests__/unit/ratings.test.ts
npx jest __tests__/unit/promoted.test.ts
npx jest __tests__/unit/spoilers.test.tsx
npx jest __tests__/unit/moderation_reports.test.ts

# Verify TypeScript compilation (0 errors)
npx tsc --noEmit
```

### Test Coverage Highlights
- **Rating Validation**: Tests 1.0 to 5.0 score scale, 0.5-step constraints, and dual audience/critic average formulas.
- **Promoted Injection**: Asserts max 1:10 promoted ratio and strict exclusion from position 1.
- **Spoiler Protection**: Asserts spoiler blur mask rendering and tap-to-reveal toggle state.
- **Polymorphic Follows**: Optimistic toggling across user, studio, festival, and person entities.
- **Moderation & Reports**: Banned word sanitization, 500-char limits, and report submission payloads.
- **YouTube Extraction**: Robust regex parsing across watch URLs, shorts, embeds, and raw IDs.

---

## 8. EAS Build & Deployment Workflow

Takilya is configured for cloud builds via Expo Application Services (EAS):

### Configuration Files
- `eas.json`: Defines `development`, `preview`, and `production` profiles with environment variable bindings.
- `app.json`: Bundle ID (`com.takilya.app`), scheme (`takilya://`), permissions, and monochrome icons.

### Build Commands

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Development Client**:
   ```bash
   eas build --profile development --platform android
   eas build --profile development --platform ios
   ```

3. **Internal Testing (APK / TestFlight)**:
   ```bash
   eas build --profile preview --platform android
   eas build --profile preview --platform ios
   ```

4. **Production Release**:
   ```bash
   eas build --profile production --platform all
   ```

5. **Store Submission**:
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

---

## 9. Content Policy & Legal

- **Terms of Service & Community Guidelines**: Accessible in-app at `app/legal/terms.tsx` (strict anti-piracy, mandatory spoiler tagging, respectful community discourse).
- **Privacy Policy**: Accessible in-app at `app/legal/privacy.tsx` (zero data selling, Row Level Security, full right to erasure).
- **In-App Reporting**: Every trailer clip, review, and comment includes a "Report" action writing directly to the `reports` table for moderator review.

---

## 10. License

Proprietary — Developed for the Philippine Cinema Community.
All rights reserved © 2026 Takilya.
