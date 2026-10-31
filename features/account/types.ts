import { FollowTargetType, UserRole, WatchMedium } from '@/features/films/types';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  role: UserRole;
  bio: string;
  followers_count: number;
  following_counts: {
    festivals: number;
    studios: number;
    users: number;
    people: number;
  };
  films_logged_count: number;
  reviews_count: number;
  watchlist_count: number;
  lists_count: number;
  top_films: TopFilmItem[];
}

export interface TopFilmItem {
  id: string; // film id
  position: number; // 1 to 4
  title: string;
  year: number;
  director: string;
  poster_url?: string | null;
}

export interface UserDiaryItem {
  id: string;
  film_id: string;
  film_title: string;
  release_year: number;
  poster_url?: string | null;
  watched_date: string;
  rating?: number | null;
  is_rewatch: boolean;
  medium: WatchMedium;
  notes?: string | null;
  review_title?: string | null;
  review_body?: string | null;
}

export interface UserWatchlistItem {
  id: string; // watchlist row id
  film_id: string;
  title: string;
  release_year: number;
  poster_url?: string | null;
  director?: string;
  audience_score?: number | null;
  critic_score?: number | null;
  genres?: string[];
  language?: string;
  added_at: string;
}

export interface UserCustomListItem {
  id: string;
  title: string;
  description?: string | null;
  is_private: boolean;
  film_count: number;
  preview_posters: string[];
  updated_at: string;
}

export interface UserReviewEntry {
  id: string;
  film_id: string;
  film_title: string;
  release_year: number;
  poster_url?: string | null;
  rating: number;
  title?: string | null;
  body: string;
  has_spoilers: boolean;
  created_at: string;
  upvotes_count: number;
}

export interface PolymorphicFollow {
  id: string;
  follower_id: string;
  target_type: FollowTargetType;
  target_id: string;
  target_name: string;
}
