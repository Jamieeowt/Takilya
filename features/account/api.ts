import { supabase } from '@/lib/supabase';
import { UserProfile } from './types';
import { UserRole } from '@/features/films/types';

export const SAMPLE_PROFILE: UserProfile = {
  id: 'usr-1',
  username: 'cinephile_ph',
  display_name: 'Jaime Gerolaga',
  role: 'critic',
  bio: 'Advocate for regional Filipino cinema, QCinema & Cinemalaya regular. Restored film archivist.',
  followers_count: 342,
  following_counts: {
    festivals: 12,
    studios: 18,
    users: 95,
    people: 44,
  },
  top_films: [
    { id: 'f-1', title: 'Himala', year: 1982, director: 'Ishmael Bernal' },
    { id: 'f-2', title: "Batch '81", year: 1982, director: 'Mike De Leon' },
    { id: 'f-3', title: 'Maynila sa mga Kuko ng Liwanag', year: 1975, director: 'Lino Brocka' },
    { id: 'f-4', title: 'Leonor Will Never Die', year: 2022, director: 'Martika Ramirez Escobar' },
  ],
  watchlist_count: 28,
};

export async function fetchUserProfile(userId?: string): Promise<UserProfile> {
  try {
    if (userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        let festivalCount = 0;
        let studioCount = 0;
        let peopleCount = 0;
        let userCount = 0;
        let watchlistCount = 0;

        try {
          const [fFestivals, fStudios, fPeople, fUsers, wList] = await Promise.all([
            supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId).eq('target_type', 'festival'),
            supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId).eq('target_type', 'studio'),
            supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId).eq('target_type', 'person'),
            supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId).eq('target_type', 'user'),
            supabase.from('watchlist').select('*', { count: 'exact', head: true }).eq('user_id', userId),
          ]);
          festivalCount = fFestivals.count ?? 0;
          studioCount = fStudios.count ?? 0;
          peopleCount = fPeople.count ?? 0;
          userCount = fUsers.count ?? 0;
          watchlistCount = wList.count ?? 0;
        } catch {
          // fallback to 0 if tables are empty/unmigrated
        }

        return {
          id: data.id,
          username: data.username,
          display_name: data.display_name,
          role: (data.role as UserRole) || 'user',
          bio: data.bio || 'Philippine cinema enthusiast on Takilya.',
          followers_count: 0,
          following_counts: {
            festivals: festivalCount,
            studios: studioCount,
            people: peopleCount,
            users: userCount,
          },
          top_films: SAMPLE_PROFILE.top_films,
          watchlist_count: watchlistCount,
        };
      }
    }
    return SAMPLE_PROFILE;
  } catch {
    return SAMPLE_PROFILE;
  }
}
