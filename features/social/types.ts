import { UserRole } from '@/features/films/types';

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

