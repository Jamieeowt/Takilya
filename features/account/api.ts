import { supabase } from '@/lib/supabase';
import { UserProfile } from './types';

const SAMPLE_PROFILE: UserProfile = {
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

export async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const { data } = await supabase.from('profiles').select('*').limit(1).single();
    if (!data) {
      return SAMPLE_PROFILE;
    }
    return SAMPLE_PROFILE;
  } catch (err) {
    return SAMPLE_PROFILE;
  }
}

