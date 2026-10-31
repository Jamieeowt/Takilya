export type PreservationStatus = 'restored' | 'archived' | 'at_risk' | 'lost';

export interface PreservedFilmItem {
  id: string; // preservation_record id
  film_id: string;
  status: PreservationStatus;
  restoring_body?: string | null;
  restoration_year?: number | null;
  archive_location?: string | null;
  notes?: string | null;
  film: {
    id: string;
    title: string;
    release_year: number;
    poster_url?: string | null;
    director?: string | null;
    synopsis?: string | null;
    is_classic?: boolean;
  };
}

export interface NationalArtistItem {
  id: string; // national_artist id
  person_id: string;
  year_conferred: number;
  category: string;
  citation?: string | null;
  person: {
    id: string;
    name: string;
    slug?: string;
    photo_url?: string | null;
    role_type?: string;
    birth_year?: number | null;
    bio?: string | null;
  };
}

export interface FilmPreservationDetail {
  id: string;
  film_id: string;
  status: PreservationStatus;
  restoring_body: string;
  restoration_year?: number | null;
  archive_location?: string | null;
  notes?: string | null;
}

