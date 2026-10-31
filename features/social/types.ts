import { FollowTargetType, UserRole } from '@/features/films/types';

export type { FollowTargetType };

export type ActivityType = 'logged' | 'rated' | 'reviewed' | 'watchlist' | 'created_list';

export interface ActivityUser {
  id: string;
  name: string;
  username: string;
  avatar_url?: string | null;
  role: UserRole;
}

export interface ActivityFilm {
  id: string;
  title: string;
  release_year: number;
  poster_url?: string | null;
  director?: string;
}

export interface ActivityReview {
  id: string;
  title?: string | null;
  body: string;
  rating?: number;
  has_spoilers: boolean;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export interface ActivityList {
  id: string;
  title: string;
  description?: string | null;
  film_count: number;
  preview_posters: string[];
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  user: ActivityUser;
  created_at: string;
  relative_time: string;
  film?: ActivityFilm;
  rating?: number;
  review?: ActivityReview;
  list?: ActivityList;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  user: ActivityUser;
  body: string;
  created_at: string;
}

export interface CuratedListDraft {
  title: string;
  description?: string;
  is_private: boolean;
  films: {
    id: string;
    title: string;
    release_year: number;
    poster_url?: string | null;
  }[];
}

// ==============================================================================
// POLYMORPHIC FOLLOW TYPES (Phase 3: Prompt 3.1)
// ==============================================================================

export type FollowFilterType = 'all' | 'festival' | 'studio' | 'person' | 'user';

export interface FollowEntity {
  id: string; // target id or follower id
  target_type: FollowTargetType;
  name: string;
  handle?: string; // username (@cinephile) or slug (cinemalaya)
  avatar_url?: string | null;
  subtitle?: string; // description, location, or role designation
  is_verified?: boolean;
  role?: UserRole;
  is_following?: boolean;
  followers_count?: number;
  created_at?: string;
}

export interface FollowCounts {
  followers: number;
  following: {
    festivals: number;
    studios: number;
    people: number;
    users: number;
    total: number;
  };
}

export interface ToggleFollowPayload {
  followerId: string;
  targetType: FollowTargetType;
  targetId: string;
  currentlyFollowing: boolean;
}


