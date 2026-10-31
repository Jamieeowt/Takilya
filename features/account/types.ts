import { FollowTargetType, UserRole } from '@/features/films/types';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  role: UserRole;
  bio: string;
  followers_count: number;
  following_counts: {
    festivals: number;
    studios: number;
    users: number;
    people: number;
  };
  top_films: {
    id: string;
    title: string;
    year: number;
    director: string;
  }[];
  watchlist_count: number;
}

export interface PolymorphicFollow {
  id: string;
  follower_id: string;
  target_type: FollowTargetType;
  target_id: string;
  target_name: string;
}

