export type DecadeFilter = '70s' | '80s' | '90s' | '2000s' | '2010s' | '2020s';
export type MtrcbFilter = 'G' | 'PG' | 'R-13' | 'R-16' | 'R-18';
export type TagFilter = 'indie' | 'regional' | 'restored' | 'national-artist';
export type LanguageFilter = 'Filipino' | 'Cebuano' | 'Ilokano' | 'Hiligaynon' | 'Kinaray-a' | 'Tagalog';

export interface ExploreFilterState {
  decade?: DecadeFilter | null;
  mtrcb_rating?: MtrcbFilter | null;
  tag?: TagFilter | null;
  language?: LanguageFilter | null;
}

export interface ExploreFilmCard {
  id: string;
  title: string;
  original_title?: string | null;
  slug: string;
  synopsis: string;
  release_year: number;
  release_date?: string | null;
  runtime_minutes?: number | null;
  language: string;
  mtrcb_rating: string;
  poster_url?: string | null;
  backdrop_url?: string | null;
  director: string;
  studio_name?: string | null;
  genres: string[];
  tags: string[];
  is_classic: boolean;
  critic_score?: number | null;
  audience_score?: number | null;
  ratings_count?: number;
  trending_rank?: number;
  badge_label?: string;
  promoted?: boolean;
  sponsor_name?: string | null;
}

export interface FeaturedTodayHero {
  film: ExploreFilmCard;
  is_promoted: boolean;
  sponsor_name?: string | null;
  headline: string;
  curator_note: string;
}

export interface NationalArtistMasterwork {
  artist_id: string;
  artist_name: string;
  conferment_year: number;
  category: string;
  citation: string;
  film: ExploreFilmCard;
}

export interface CinemalayaEditionGroup {
  edition_id: string;
  edition_name: string;
  year: number;
  theme?: string | null;
  films: ExploreFilmCard[];
}

export interface RestoredClassicItem {
  id: string;
  film: ExploreFilmCard;
  status: 'restored' | 'archived' | 'at_risk' | 'lost';
  restoring_body: string;
  restoration_year: number;
  archive_location?: string | null;
}

export interface ExploreSectionsData {
  featured: FeaturedTodayHero;
  nationalArtists: NationalArtistMasterwork[];
  cinemalaya: CinemalayaEditionGroup[];
  restoredClassics: RestoredClassicItem[];
  regionalSpotlight: ExploreFilmCard[];
  trendingThisWeek: ExploreFilmCard[];
}

export type SearchResultType = 'film' | 'person' | 'festival' | 'studio';

export interface SearchEntityResult {
  type: SearchResultType;
  id: string;
  film_id?: string;
  title: string;
  subtitle: string;
  badge?: string;
  image_url?: string | null;
  is_verified?: boolean;
  year?: number | null;
}
