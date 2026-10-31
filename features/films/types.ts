export type UserRole = 'user' | 'critic' | 'verified_official' | 'admin';

export type FollowTargetType = 'user' | 'studio' | 'festival' | 'person';

export type AwardStatus = 'nominated' | 'won' | 'official_selection' | 'special_mention';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Film {
  id: string;
  title: string;
  synopsis: string;
  release_year: number;
  runtime_minutes?: number;
  poster_url?: string;
  director?: string;
  studio_id?: string;
  audience_score?: number; // 0-100 or 1-5
  critic_score?: number;   // 0-100 or 1-5
  is_preserved?: boolean;
  is_national_artist_work?: boolean;
  created_at: string;
}

export interface VideoItem {
  id: string;
  film_id: string;
  film_title: string;
  youtube_video_id: string; // YouTube embed ID (react-native-youtube-iframe)
  type: 'trailer' | 'clip';
  title: string;
  director: string;
  release_year: number;
  critic_score?: number;
  audience_score?: number;
  is_promoted: boolean;
  promoted_label?: string;
  views_count?: number;
}

