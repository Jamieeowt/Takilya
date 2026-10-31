export type WatchAvailabilityType =
  | 'stream'
  | 'subscription'
  | 'rent'
  | 'cinema'
  | 'theatrical'
  | 'free'
  | 'buy';

export interface StreamingPlatform {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  website_url?: string | null;
  is_local: boolean;
  films_count?: number;
}

export interface WatchAvailabilityItem {
  id: string;
  film_id: string;
  platform_id: string;
  platform_name: string;
  platform_slug: string;
  logo_url?: string | null;
  website_url?: string | null;
  is_local: boolean;
  url: string;
  availability_type: WatchAvailabilityType;
  price_php?: number | null;
  last_verified?: string | null;
  created_at?: string;
  film?: {
    id: string;
    title: string;
    release_year: number;
    poster_url?: string | null;
    director?: string | null;
    synopsis?: string | null;
    audience_score?: number | null;
    critic_score?: number | null;
  };
}

export interface PlatformBrowseFilm {
  id: string;
  title: string;
  release_year: number;
  poster_url?: string | null;
  director?: string | null;
  synopsis?: string | null;
  platform_name: string;
  platform_slug: string;
  availability_type: WatchAvailabilityType;
  price_php?: number | null;
  url: string;
  is_free: boolean;
  is_local: boolean;
  last_verified?: string | null;
}

