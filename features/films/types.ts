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

// ---------------------------------------------------------
// Detailed Film Profile Entities
// ---------------------------------------------------------

export interface FilmCastMember {
  id: string;
  person_id: string;
  name: string;
  slug?: string;
  role: string; // 'director' | 'lead_actor' | 'writer' | 'cinematographer' | 'producer' | 'supporting_actor'
  character_name?: string | null;
  photo_url?: string | null;
  verification_status?: VerificationStatus;
  billing_order: number;
}

export interface FilmAwardItem {
  id: string;
  category_name: string;
  award_body_name: string;
  ceremony_year: number;
  status: AwardStatus;
  recipient_name?: string;
  notes?: string | null;
}

export interface FilmWatchOption {
  id: string;
  platform_name: string;
  platform_slug: string;
  logo_url?: string | null;
  availability_type: 'subscription' | 'free' | 'rent' | 'buy' | 'theatrical';
  price_php?: number | null;
  url: string;
  is_local: boolean;
}

export interface FilmTrailerItem {
  id: string;
  film_id: string;
  youtube_id: string;
  title: string;
  type: 'official' | 'teaser' | 'clip' | 'behind_the_scenes';
  view_count: number;
  duration_seconds?: number | null;
  is_verified?: boolean;
  posted_by_name?: string;
}

export interface FilmReviewItem {
  id: string;
  film_id: string;
  user_id: string;
  user_name: string;
  user_username: string;
  user_avatar?: string | null;
  user_role: UserRole;
  rating: number; // 0.5 to 5.0
  title?: string | null;
  body: string;
  has_spoilers: boolean;
  is_critic_review: boolean;
  created_at: string;
  upvotes_count?: number;
}

export interface FilmRatingMetrics {
  audience_score: number; // 0 to 100
  critic_score: number;   // 0 to 100
  audience_average_stars: number; // 1.0 to 5.0
  critic_average_stars: number;   // 1.0 to 5.0
  total_ratings_count: number;
  total_reviews_count: number;
  distribution: {
    star5: number; // percentage 0-100
    star4: number;
    star3: number;
    star2: number;
    star1: number;
  };
}

export interface FilmDetailFull {
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
  is_classic: boolean;
  studio?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  genres: string[];
  tags: string[];
  director: string;
  credits: FilmCastMember[];
  awards: FilmAwardItem[];
  watch_options: FilmWatchOption[];
  trailers: FilmTrailerItem[];
  reviews: FilmReviewItem[];
  ratings: FilmRatingMetrics;
  user_state: {
    is_in_watchlist: boolean;
    is_watched: boolean;
    user_rating: number | null; // e.g. 4.5
    user_review: FilmReviewItem | null;
  };
}

export type WatchMedium = 'in_cinema' | 'physical_media' | 'digital_streaming' | 'other';

export interface LogFilmPayload {
  filmId: string;
  userId: string;
  rating: number; // 0.5 to 5.0
  reviewTitle?: string;
  reviewBody?: string;
  hasSpoilers?: boolean;
  watchedDate?: string; // YYYY-MM-DD
  isRewatch?: boolean;
  medium?: WatchMedium;
}

export interface CandidateFilm {
  id: string;
  title: string;
  original_title?: string | null;
  slug: string;
  synopsis: string;
  release_year: number;
  poster_url?: string | null;
  backdrop_url?: string | null;
  director: string;
  director_id?: string;
  cast_ids?: string[];
  cast_names?: string[];
  genres: string[];
  tags: string[];
  audience_score?: number | null; // 0 to 100
  critic_score?: number | null;
  ratings_count?: number | null;
  is_classic?: boolean;
}

export interface UserRatingInput {
  film_id: string;
  score: number; // 1.0 to 5.0
}

export interface RecommendedFilmItem {
  id: string;
  title: string;
  original_title?: string | null;
  slug: string;
  synopsis: string;
  release_year: number;
  poster_url?: string | null;
  backdrop_url?: string | null;
  director: string;
  audience_score?: number | null;
  critic_score?: number | null;
  ratings_count?: number | null;
  recommendation_score: number;
  recommendation_reason: string;
  genres?: string[];
  tags?: string[];
}

export interface SimilarFilmItem {
  id: string;
  title: string;
  original_title?: string | null;
  slug: string;
  synopsis: string;
  release_year: number;
  poster_url?: string | null;
  backdrop_url?: string | null;
  director: string;
  audience_score?: number | null;
  critic_score?: number | null;
  ratings_count?: number | null;
  similarity_score: number;
  similarity_reason: string;
}
