import { VerificationStatus, AwardStatus } from '@/features/films/types';

export type PersonRoleType = 'director' | 'actor' | 'writer' | 'cinematographer' | 'producer';

export interface NationalArtistInfo {
  year_conferred: number;
  category: string;
  citation?: string | null;
}

export interface PersonAwardItem {
  id: string;
  ceremony_year: number;
  status: AwardStatus;
  category_name: string;
  award_body_name: string;
  film_title?: string;
  notes?: string | null;
}

export interface PersonAwardSummary {
  wins_count: number;
  nominations_count: number;
  recognitions: PersonAwardItem[];
}

export interface PersonFilmCredit {
  id: string;
  film_id: string;
  film_title: string;
  release_year: number;
  poster_url?: string | null;
  role: string; // 'director' | 'writer' | 'lead_actor' | 'supporting_actor' | 'cinematographer'
  character_name?: string | null;
  billing_order?: number;
}

export interface PersonClip {
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

export interface Person {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  photo_url?: string | null;
  birth_year?: number | null;
  role_type: PersonRoleType;
  verification_status: VerificationStatus;
  followers_count: number;
  films_count?: number;
  national_artist?: NationalArtistInfo | null;
}

