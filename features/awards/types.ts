import { AwardStatus } from '@/features/films/types';

export type AwardScope = 'local' | 'international';
export type AwardRecipientType = 'film' | 'person' | 'studio';

export interface AwardBody {
  id: string;
  name: string;
  acronym?: string | null;
  scope: AwardScope;
  description?: string | null;
  country: string;
  logo_url?: string | null;
}

export interface AwardCategory {
  id: string;
  award_body_id: string;
  name: string;
  description?: string | null;
}

export interface AwardRecognitionRecipient {
  id: string;
  name: string; // film title or person name
  type: AwardRecipientType;
  poster_url?: string | null;
  photo_url?: string | null;
  release_year?: number | null;
  director?: string | null;
}

export interface AwardRecognition {
  id: string;
  category_id: string;
  category_name: string;
  award_body_id: string;
  award_body_name: string;
  award_body_acronym?: string | null;
  award_body_scope: AwardScope;
  ceremony_year: number;
  status: AwardStatus;
  recipient_type: AwardRecipientType;
  recipient_id: string;
  recipient: AwardRecognitionRecipient;
  source_url?: string | null;
  notes?: string | null;
}

export interface AwardRecognitionFilters {
  award_body_id?: string;
  scope?: 'all' | 'local' | 'international';
  year?: number;
  status?: AwardStatus | 'all';
  search?: string;
}

export interface AwardWinningFilm {
  id: string;
  title: string;
  release_year: number;
  poster_url?: string | null;
  director?: string | null;
  synopsis?: string | null;
  wins_count: number;
  nominations_count: number;
  top_accolades: string[]; // e.g. ["Gawad Urian Best Picture", "Sundance Special Jury Prize"]
}

export interface UnsungNomineeAnalytics {
  id: string;
  name: string;
  type: AwardRecipientType;
  poster_url?: string | null;
  photo_url?: string | null;
  release_year?: number | null;
  director?: string | null;
  nominations_count: number;
  nominated_categories: string[];
  award_bodies: string[];
}

export interface MMFFEditionFilm {
  id: string;
  title: string;
  release_year: number;
  poster_url?: string | null;
  director?: string | null;
  awards_won_in_edition?: string[];
  is_best_picture?: boolean;
}

export interface MMFFSeasonData {
  is_active_season: boolean;
  edition_number: number;
  edition_year: number;
  theme_title: string;
  season_dates: string;
  days_until_festival?: number;
  festival_id: string;
  landmark_entries: MMFFEditionFilm[];
}

