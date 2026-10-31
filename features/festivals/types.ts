import { VerificationStatus, AwardStatus } from '@/features/films/types';

export interface Festival {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  location?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  founded_year?: number | null;
  verification_status: VerificationStatus;
  followers_count: number;
  editions_count?: number;
  selections_count?: number;
}

export interface FestivalEdition {
  id: string;
  festival_id: string;
  year: number;
  name?: string | null;
  theme?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  selections_count?: number;
}

export interface FestivalSelectionFilm {
  id: string;
  title: string;
  release_year: number;
  director?: string | null;
  poster_url?: string | null;
  synopsis?: string | null;
  audience_score?: number | null;
  critic_score?: number | null;
}

export interface FestivalSelection {
  id: string;
  edition_id: string;
  film_id: string;
  section: string; // 'Main Competition', 'Asian Next Wave', 'Shorts', 'Special Screenings'
  status: AwardStatus; // 'won' | 'nominated' | 'official_selection' | 'special_mention'
  award_name?: string | null;
  created_at: string;
  film: FestivalSelectionFilm;
}

export interface FestivalClip {
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

