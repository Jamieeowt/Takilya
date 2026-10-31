/**
 * Takilya - Official Trailer & Clips Types
 * Adheres strictly to AGENTS.md data model rules.
 */

export type TrailerType = 'official' | 'teaser' | 'clip' | 'bts' | 'international';

export type TrailerPostedByType = 'admin' | 'studio' | 'festival' | 'person';

export interface OfficialTrailerItem {
  id: string;
  film_id: string;
  youtube_id: string;
  title: string;
  type: TrailerType;
  posted_by_type: TrailerPostedByType;
  posted_by_id: string;
  view_count: number;
  duration_seconds?: number | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined or augmented metadata
  film_title?: string;
  poster_url?: string | null;
  posted_by_name?: string;
  is_verified?: boolean;
}

export interface PostOfficialClipPayload {
  film_id: string;
  youtube_url: string;
  title: string;
  type: 'official' | 'teaser' | 'clip' | 'bts';
  posted_by_type: TrailerPostedByType;
  posted_by_id: string;
  caption?: string;
}

export interface PostOfficialClipResult {
  success: boolean;
  trailerId: string;
  youtubeId: string;
  message: string;
}

