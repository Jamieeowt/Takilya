import { VerificationStatus, AwardStatus } from '@/features/films/types';

export interface StudioFilm {
  id: string;
  title: string;
  release_year: number;
  poster_url?: string | null;
  director?: string | null;
  synopsis?: string | null;
  audience_score?: number | null;
  critic_score?: number | null;
}

export interface StudioAwardItem {
  id: string;
  ceremony_year: number;
  status: AwardStatus;
  category_name: string;
  award_body_name: string;
  film_title?: string;
  recipient_name?: string;
}

export interface StudioAwardSummary {
  wins_count: number;
  nominations_count: number;
  recognitions: StudioAwardItem[];
}

export interface StudioClip {
  id: string;
  film_id: string;
  film_title?: string;
  youtube_id: string;
  title: string;
  type: 'official' | 'teaser' | 'clip' | 'behind_the_scenes';
  view_count: number;
  duration_seconds?: number | null;
  published_at?: string | null;
}

export interface Studio {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  founded_year?: number | null;
  verification_status: VerificationStatus;
  followers_count: number;
  films_count?: number;
}

