export interface SearchFilterState {
  genre: string | null;
  decade: string | null; // 'all' | 'classics' | '2010s' | '2020s' | '2026'
  streamingPlatform: string | null; // 'all' | 'netflix' | 'iwanttfc' | 'vivamax' | 'juanflix' | 'theatrical'
  minRating: number | null; // 0, 70, 80, 90
  sortBy: 'relevance' | 'rating' | 'year' | 'title';
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
  screening_info?: string | null; // e.g. "Cinema '76 • 7:30 PM"
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
}

export interface SearchScreeningItem {
  id: string;
  film_id: string;
  film_title: string;
  poster_url?: string | null;
  venue_name: string; // e.g. "Cinematheque Centre Manila", "Cinema '76 Microcinema", "Gateway Cineplex"
  city: string;
  showtime: string;
  ticket_status: 'now_showing' | 'advance_tickets' | 'sold_out';
  ticket_url?: string;
}

export interface SearchResultsResponse {
  films: SearchFilmItem[];
  people: SearchPersonItem[];
  screenings: SearchScreeningItem[];
  totalFilmsCount: number;
}

export interface DiscoveryCuratedSections {
  trendingFilms: SearchFilmItem[];
  awardWinners: SearchFilmItem[];
  nowShowing: SearchScreeningItem[];
}

