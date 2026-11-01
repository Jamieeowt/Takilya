export type FeedType = 'for_you' | 'latest';

export interface FeedTrailerItem {
  id: string; // trailer id
  film_id: string;
  video_url: string; // Direct https .mp4 or HLS .m3u8 URL
  vimeo_id?: string | null; // Dedicated Vimeo embed ID
  poster_url?: string | null;
  duration_seconds?: number | null;
  rights_note?: string | null; // Permission or license note
  youtube_video_id?: string;
  tiktok_video_id?: string | null;
  video_id?: string;
  video_platform?: 'vimeo' | 'native' | 'tiktok' | 'youtube';
  title: string; // trailer / clip title
  type: 'teaser' | 'official' | 'international' | 'clip' | 'bts';
  view_count: number;
  created_at: string;

  // Film metadata
  film_title: string;
  release_year: number;
  director: string;
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
  promoted_slot_id?: string | null;
}

export interface FeedPageResponse {
  items: FeedTrailerItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

