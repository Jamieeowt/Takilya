/**
 * Takilya - Search & Genre Browsing Types
 * Adheres strictly to AGENTS.md rules.
 */

export interface SearchFilterState {
  genre: string | null;
  decade: string | null; // 'all' | 'classics' | '2010s' | '2020s' | '2026'
  streamingPlatform: string | null; // 'all' | 'netflix' | 'iwanttfc' | 'vivamax' | 'juanflix' | 'theatrical'
  minRating: number | null; // 0, 70, 80, 90
  sortBy: 'relevance' | 'rating' | 'year' | 'title';
}

export interface BrowseFilterState {
  genre?: string | null;
  tag?: string | null;
  decade?: string | null; // 'all' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s'
  language?: string | null; // 'all' | 'Tagalog' | 'Ilokano' | 'Cebuano' | 'Kinaray-a' | 'Hiligaynon' | etc.
  awardScope?: 'all' | 'won' | 'local' | 'international' | null;
  sortBy?: 'popular' | 'rating' | 'year' | 'title';
}

export interface SearchFilmItem {
  id: string;
  title: string;
  original_title?: string | null;
  slug: string;
  release_year: number;
  runtime_minutes?: number | null;
  language: string;
  mtrcb_rating: string;
  poster_url?: string | null;
  backdrop_url?: string | null;
  director: string;
  genres: string[];
  critic_score?: number | null;
  audience_score?: number | null;
  synopsis?: string | null;
  is_classic?: boolean;
  streaming_platforms?: string[];
  screening_info?: string | null;
}

export interface SearchPersonItem {
  id: string;
  name: string;
  slug: string;
  photo_url?: string | null;
  role_type: string;
  birth_year?: number | null;
  is_verified: boolean;
  film_credits_summary?: string;
  followers_count?: number;
}

export interface SearchStudioItem {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  founded_year?: number | null;
  verification_status: string;
  is_verified: boolean;
  followers_count?: number;
  films_count?: number;
}

export interface SearchFestivalItem {
  id: string;
  name: string;
  slug: string;
  banner_url?: string | null;
  location?: string | null;
  founded_year?: number | null;
  verification_status: string;
  is_verified: boolean;
  followers_count?: number;
}

export interface SearchScreeningItem {
  id: string;
  film_id: string;
  film_title: string;
  poster_url?: string | null;
  venue_name: string;
  city: string;
  showtime: string;
  ticket_status: 'now_showing' | 'advance_tickets' | 'sold_out';
  ticket_url?: string;
}

export interface SearchResultsResponse {
  films: SearchFilmItem[];
  people: SearchPersonItem[];
  studios: SearchStudioItem[];
  festivals: SearchFestivalItem[];
  screenings: SearchScreeningItem[];
  totalFilmsCount: number;
  totalCount: number;
}

export interface DiscoveryCuratedSections {
  trendingFilms: SearchFilmItem[];
  awardWinners: SearchFilmItem[];
  nowShowing: SearchScreeningItem[];
}

export interface BrowseFilmCard {
  id: string;
  title: string;
  original_title?: string | null;
  slug: string;
  release_year: number;
  poster_url?: string | null;
  director: string;
  language: string;
  genres: string[];
  tags: string[];
  critic_score?: number | null;
  audience_score?: number | null;
  award_count?: number;
  has_won_award?: boolean;
  is_classic?: boolean;
}
