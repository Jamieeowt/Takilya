export type FeedType = 'for_you' | 'latest';

export interface FeedTrailerItem {
  id: string; // trailer id
  film_id: string;
  youtube_video_id: string;
  title: string; // trailer / clip title
  type: 'teaser' | 'official' | 'international' | 'clip' | 'bts';
  view_count: number;
  created_at: string;

  // Film metadata
  film_title: string;
  release_year: number;
  director: string;
  poster_url?: string | null;
  genres: string[];
  critic_score?: number | null;
  audience_score?: number | null;
  synopsis?: string | null;

  // Posting entity (Studio, Festival, Person, Admin, User)
  posted_by_type: 'admin' | 'studio' | 'festival' | 'person' | 'user';
  posted_by_id: string;
  posted_by_name: string;
  posted_by_avatar?: string | null;
  is_verified: boolean;

  // Engagement stats
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
  is_in_watchlist?: boolean;

  // Promoted slot metadata
  is_promoted: boolean;
  sponsor_name?: string | null;
}

export interface FeedPageResponse {
  items: FeedTrailerItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

