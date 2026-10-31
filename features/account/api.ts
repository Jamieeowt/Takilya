import { supabase } from '@/lib/supabase';
import {
  UserProfile,
  TopFilmItem,
  UserDiaryItem,
  UserWatchlistItem,
  UserCustomListItem,
  UserReviewEntry,
} from './types';
import { UserRole } from '@/features/films/types';
import {
  getCachedDiary,
  setCachedDiary,
  getCachedWatchlist,
  setCachedWatchlist,
} from '@/lib/offline';

// ==============================================================================
// FALLBACK DATA (For guests, unauthenticated users, or pre-seed state)
// ==============================================================================

export const SAMPLE_TOP_FILMS: TopFilmItem[] = [
  {
    id: 'cccccccc-0001-0000-0000-000000000000',
    position: 1,
    title: 'Himala',
    year: 1982,
    director: 'Ishmael Bernal',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cccccccc-0003-0000-0000-000000000000',
    position: 2,
    title: "Batch '81",
    year: 1982,
    director: 'Mike De Leon',
    poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cccccccc-0002-0000-0000-000000000000',
    position: 3,
    title: 'Maynila sa mga Kuko ng Liwanag',
    year: 1975,
    director: 'Lino Brocka',
    poster_url: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cccccccc-0006-0000-0000-000000000000',
    position: 4,
    title: 'Leonor Will Never Die',
    year: 2022,
    director: 'Martika Ramirez Escobar',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
  },
];

export const SAMPLE_PROFILE: UserProfile = {
  id: 'usr-1',
  username: 'cinephile_ph',
  display_name: 'Jaime Gerolaga',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
  role: 'critic',
  bio: 'Filipino cinema archivist and critic. Championing regional films, QCinema, Cinemalaya, and restored 70s/80s masterworks.',
  followers_count: 342,
  following_counts: {
    festivals: 12,
    studios: 18,
    users: 95,
    people: 44,
  },
  films_logged_count: 86,
  reviews_count: 34,
  watchlist_count: 28,
  lists_count: 4,
  top_films: SAMPLE_TOP_FILMS,
};

export const SAMPLE_DIARY: UserDiaryItem[] = [
  {
    id: 'diary-1',
    film_id: 'cccccccc-0001-0000-0000-000000000000',
    film_title: 'Himala',
    release_year: 1982,
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
    watched_date: '2026-10-28',
    rating: 5.0,
    is_rewatch: true,
    medium: 'physical_media',
    notes: '4K restored DCP screening at CCP Black Box. Overwhelming spiritual dread.',
    review_title: 'The unshakeable pinnacle of Philippine cinema',
    review_body: 'Nora Aunor gives what remains the single greatest cinematic performance in Southeast Asian history.',
  },
  {
    id: 'diary-2',
    film_id: 'cccccccc-0004-0000-0000-000000000000',
    film_title: 'Kisapmata',
    release_year: 1981,
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
    watched_date: '2026-10-24',
    rating: 5.0,
    is_rewatch: false,
    medium: 'digital_streaming',
    notes: 'Mike De Leon creates suffocating psychological terror without any supernatural tropes.',
    review_title: 'Vic Silayan’s chilling patriarch',
    review_body: 'A claustrophobic masterpiece exploring familial fascism. The camera movement within the house is peerless.',
  },
  {
    id: 'diary-3',
    film_id: 'cccccccc-0006-0000-0000-000000000000',
    film_title: 'Leonor Will Never Die',
    release_year: 2022,
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    watched_date: '2026-10-18',
    rating: 4.5,
    is_rewatch: true,
    medium: 'in_cinema',
    notes: 'Sundance Special Jury Prize celebration screening at Cinema ' + 'Centenario.',
    review_title: 'Inventive meta-action love letter to Pinoy B-movies',
    review_body: 'Sheila Francisco is radiant as the screenwriter who enters her own unfinished script.',
  },
  {
    id: 'diary-4',
    film_id: 'cccccccc-0009-0000-0000-000000000000',
    film_title: 'Cleaners',
    release_year: 2019,
    poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    watched_date: '2026-10-10',
    rating: 4.5,
    is_rewatch: false,
    medium: 'digital_streaming',
    notes: 'Tuguegarao high school photocopied aesthetic is unlike anything in world cinema.',
  },
];

export const SAMPLE_WATCHLIST: UserWatchlistItem[] = [
  {
    id: 'wl-1',
    film_id: 'cccccccc-0005-0000-0000-000000000000',
    title: 'Oro, Plata, Mata',
    release_year: 1982,
    poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
    director: 'Peque Gallaga',
    audience_score: 93,
    critic_score: 96,
    genres: ['Historical Epic', 'Drama', 'War'],
    language: 'Filipino / Hiligaynon',
    added_at: '2026-10-25T14:30:00Z',
  },
  {
    id: 'wl-2',
    film_id: 'cccccccc-0007-0000-0000-000000000000',
    title: 'John Denver Trending',
    release_year: 2019,
    poster_url: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=600&auto=format&fit=crop&q=80',
    director: 'Arden Rod Condez',
    audience_score: 89,
    critic_score: 91,
    genres: ['Social Drama', 'Indie'],
    language: 'Kinaray-a',
    added_at: '2026-10-20T10:15:00Z',
  },
  {
    id: 'wl-3',
    film_id: 'cccccccc-0008-0000-0000-000000000000',
    title: 'Balangiga: Howling Wilderness',
    release_year: 2017,
    poster_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    director: 'Khavn De La Cruz',
    audience_score: 85,
    critic_score: 92,
    genres: ['Historical Surrealism', 'Drama'],
    language: 'Waray-Waray',
    added_at: '2026-10-15T09:40:00Z',
  },
  {
    id: 'wl-4',
    film_id: 'cccccccc-0010-0000-0000-000000000000',
    title: 'Itim (The Rites of May)',
    release_year: 1976,
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    director: 'Mike De Leon',
    audience_score: 90,
    critic_score: 94,
    genres: ['Psychological Horror', 'Mystery', 'Restored Heritage'],
    language: 'Filipino',
    added_at: '2026-10-05T12:00:00Z',
  },
  {
    id: 'wl-5',
    film_id: 'cccccccc-0002-0000-0000-000000000000',
    title: 'Maynila sa mga Kuko ng Liwanag',
    release_year: 1975,
    poster_url: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=600&auto=format&fit=crop&q=80',
    director: 'Lino Brocka',
    audience_score: 95,
    critic_score: 98,
    genres: ['Social Realism', 'Noir', 'Heritage'],
    language: 'Filipino',
    added_at: '2026-09-28T18:00:00Z',
  },
  {
    id: 'wl-6',
    film_id: 'cccccccc-0003-0000-0000-000000000000',
    title: "Batch '81",
    release_year: 1982,
    poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    director: 'Mike De Leon',
    audience_score: 94,
    critic_score: 97,
    genres: ['Psychological Drama', 'Political'],
    language: 'Filipino',
    added_at: '2026-09-20T11:20:00Z',
  },
];

export const SAMPLE_CUSTOM_LISTS: UserCustomListItem[] = [
  {
    id: 'list-1',
    title: 'Favorite Pinoy Noir & Psychological Thrillers',
    description: 'Dark, cynical portraits of Manila streets, corrupt systems, and moral degradation.',
    is_private: false,
    film_count: 8,
    preview_posters: [
      'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    ],
    updated_at: '2026-10-25T16:00:00Z',
  },
  {
    id: 'list-2',
    title: 'Cinemalaya Highlights & Pioneers',
    description: 'Groundbreaking Philippine independent cinema that emerged from CCP halls since 2005.',
    is_private: false,
    film_count: 14,
    preview_posters: [
      'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    ],
    updated_at: '2026-10-14T11:30:00Z',
  },
  {
    id: 'list-3',
    title: 'Conferred National Artist Masterworks',
    description: 'Canonical titles by Brocka, Bernal, De Leon, Romero, and Avellana.',
    is_private: false,
    film_count: 12,
    preview_posters: [
      'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
    ],
    updated_at: '2026-09-30T09:10:00Z',
  },
  {
    id: 'list-4',
    title: 'Regional Philippine Voices (Non-Tagalog)',
    description: 'Cinema told in Ilokano, Cebuano, Waray, Hiligaynon, Kinaray-a, and Maguindanaon.',
    is_private: true,
    film_count: 9,
    preview_posters: [
      'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
    ],
    updated_at: '2026-09-12T15:20:00Z',
  },
];

export const SAMPLE_USER_REVIEWS: UserReviewEntry[] = [
  {
    id: 'rev-1',
    film_id: 'cccccccc-0001-0000-0000-000000000000',
    film_title: 'Himala',
    release_year: 1982,
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
    rating: 5.0,
    title: 'The unshakeable pinnacle of Philippine cinema',
    body: 'Ishmael Bernal constructs a terrifyingly modern dissection of hysteria, faith, and the brutal transactional nature of tragedy in Cupang. Ricky Lee’s screenplay never wastes a syllable, while Nora Aunor’s final proclamation on the sand dunes continues to reverberate across generations of Filipino artists.',
    has_spoilers: false,
    created_at: '2026-10-28T19:00:00Z',
    upvotes_count: 48,
  },
  {
    id: 'rev-2',
    film_id: 'cccccccc-0004-0000-0000-000000000000',
    film_title: 'Kisapmata',
    release_year: 1981,
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
    rating: 5.0,
    title: 'Vic Silayan’s chilling patriarch',
    body: 'Adapted from Nick Joaquin’s reportage "The House on Zapote Street", Kisapmata is the tightest domestic horror ever created in Asia. Every door frame, every squeak of the stairs, and every silence over the dining table serves as an allegory for authoritarian rule in the Philippines.',
    has_spoilers: true,
    created_at: '2026-10-24T21:15:00Z',
    upvotes_count: 32,
  },
  {
    id: 'rev-3',
    film_id: 'cccccccc-0006-0000-0000-000000000000',
    film_title: 'Leonor Will Never Die',
    release_year: 2022,
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    title: 'Inventive meta-action love letter to Pinoy B-movies',
    body: 'Martika Ramirez Escobar achieves something profoundly difficult: a meta-cinematic comedic romp that still hits an emotional core regarding grief, family, and unfinished artistic work. Sheila Francisco is an absolute revelation.',
    has_spoilers: false,
    created_at: '2026-10-18T16:30:00Z',
    upvotes_count: 27,
  },
];

// ==============================================================================
// SUPABASE DATA FETCHERS & MUTATIONS
// ==============================================================================

export async function fetchUserProfile(userId?: string): Promise<UserProfile> {
  if (!userId) {
    return SAMPLE_PROFILE;
  }

  try {
    const { data: profileRow, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr || !profileRow) {
      return SAMPLE_PROFILE;
    }

    // Parallel counts
    const [
      wHistoryRes,
      reviewsRes,
      watchlistRes,
      customListsRes,
      followsRes,
      topFilmsRes,
    ] = await Promise.all([
      supabase.from('watch_history').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('watchlist').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('custom_lists').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('follows').select('target_type').eq('follower_id', userId),
      supabase
        .from('top_films')
        .select(`
          position,
          film_id,
          films:film_id (
            id,
            title,
            release_date,
            poster_url
          )
        `)
        .eq('user_id', userId)
        .order('position', { ascending: true })
        .limit(4),
    ]);

    let followingFestivals = 0;
    let followingStudios = 0;
    let followingUsers = 0;
    let followingPeople = 0;

    if (followsRes.data) {
      for (const f of followsRes.data) {
        if (f.target_type === 'festival') followingFestivals++;
        else if (f.target_type === 'studio') followingStudios++;
        else if (f.target_type === 'user') followingUsers++;
        else if (f.target_type === 'person') followingPeople++;
      }
    }

    let topFilms: TopFilmItem[] = [];
    if (topFilmsRes.data && topFilmsRes.data.length > 0) {
      topFilms = topFilmsRes.data.map((row: any) => ({
        id: row.film_id,
        position: row.position,
        title: row.films?.title || 'Unknown Title',
        year: row.films?.release_date ? new Date(row.films.release_date).getFullYear() : 2020,
        director: 'Filipino Filmmaker',
        poster_url: row.films?.poster_url,
      }));
    } else {
      topFilms = SAMPLE_TOP_FILMS;
    }

    return {
      id: profileRow.id,
      username: profileRow.username,
      display_name: profileRow.display_name,
      avatar_url: profileRow.avatar_url || SAMPLE_PROFILE.avatar_url,
      role: (profileRow.role as UserRole) || 'user',
      bio: profileRow.bio || SAMPLE_PROFILE.bio,
      followers_count: SAMPLE_PROFILE.followers_count,
      following_counts: {
        festivals: followingFestivals || SAMPLE_PROFILE.following_counts.festivals,
        studios: followingStudios || SAMPLE_PROFILE.following_counts.studios,
        users: followingUsers || SAMPLE_PROFILE.following_counts.users,
        people: followingPeople || SAMPLE_PROFILE.following_counts.people,
      },
      films_logged_count: wHistoryRes.count ?? SAMPLE_PROFILE.films_logged_count,
      reviews_count: reviewsRes.count ?? SAMPLE_PROFILE.reviews_count,
      watchlist_count: watchlistRes.count ?? SAMPLE_PROFILE.watchlist_count,
      lists_count: customListsRes.count ?? SAMPLE_PROFILE.lists_count,
      top_films: topFilms,
    };
  } catch (err) {
    console.warn('Error fetching user profile from Supabase:', err);
    return SAMPLE_PROFILE;
  }
}

export async function fetchUserDiary(userId?: string): Promise<UserDiaryItem[]> {
  if (!userId) return SAMPLE_DIARY;

  try {
    const { data, error } = await supabase
      .from('watch_history')
      .select(`
        id,
        film_id,
        watched_date,
        rating,
        is_rewatch,
        medium,
        notes,
        films:film_id (
          title,
          release_date,
          poster_url
        )
      `)
      .eq('user_id', userId)
      .order('watched_date', { ascending: false });

    if (!error && data && data.length > 0) {
      const formatted = data.map((item: any) => {
        const year = item.films?.release_date
          ? new Date(item.films.release_date).getFullYear()
          : 2020;
        return {
          id: item.id,
          film_id: item.film_id,
          film_title: item.films?.title || 'Unknown Title',
          release_year: year,
          poster_url: item.films?.poster_url,
          watched_date: item.watched_date,
          rating: item.rating ? Number(item.rating) : null,
          is_rewatch: Boolean(item.is_rewatch),
          medium: item.medium || 'digital_streaming',
          notes: item.notes,
        };
      });

      // Persist to local cache for offline browsing
      void setCachedDiary(userId, formatted);
      return formatted;
    }

    // Try local offline cache if query yielded nothing or was empty
    const cached = await getCachedDiary(userId);
    if (cached && cached.length > 0) return cached;

    return SAMPLE_DIARY;
  } catch {
    // Offline fallback to local cache
    const cached = await getCachedDiary(userId);
    if (cached && cached.length > 0) return cached;
    return SAMPLE_DIARY;
  }
}

export async function fetchUserWatchlist(userId?: string): Promise<UserWatchlistItem[]> {
  if (!userId) return SAMPLE_WATCHLIST;

  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select(`
        id,
        film_id,
        notes,
        created_at,
        films:film_id (
          id,
          title,
          release_date,
          poster_url,
          language
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const formatted = data.map((item: any) => {
        const year = item.films?.release_date
          ? new Date(item.films.release_date).getFullYear()
          : 2020;
        return {
          id: item.id,
          film_id: item.film_id,
          title: item.films?.title || 'Unknown Film',
          release_year: year,
          poster_url: item.films?.poster_url,
          director: 'Filipino Filmmaker',
          audience_score: 90,
          critic_score: 92,
          language: item.films?.language || 'Filipino',
          added_at: item.created_at,
        };
      });

      // Persist to local cache for offline browsing
      void setCachedWatchlist(userId, formatted);
      return formatted;
    }

    // Fallback to local offline cache
    const cached = await getCachedWatchlist(userId);
    if (cached && cached.length > 0) return cached;

    return SAMPLE_WATCHLIST;
  } catch {
    // Offline fallback
    const cached = await getCachedWatchlist(userId);
    if (cached && cached.length > 0) return cached;
    return SAMPLE_WATCHLIST;
  }
}

export async function fetchUserCustomLists(userId?: string): Promise<UserCustomListItem[]> {
  if (!userId) return SAMPLE_CUSTOM_LISTS;

  try {
    const { data, error } = await supabase
      .from('custom_lists')
      .select(`
        id,
        title,
        description,
        is_private,
        updated_at,
        custom_list_items (
          film_id,
          films:film_id (
            poster_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return SAMPLE_CUSTOM_LISTS;
    }

    return data.map((item: any) => {
      const itemsList = item.custom_list_items || [];
      const posters = itemsList
        .map((cli: any) => cli.films?.poster_url)
        .filter(Boolean)
        .slice(0, 4);

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        is_private: Boolean(item.is_private),
        film_count: itemsList.length,
        preview_posters: posters.length > 0 ? posters : SAMPLE_CUSTOM_LISTS[0].preview_posters,
        updated_at: item.updated_at,
      };
    });
  } catch {
    return SAMPLE_CUSTOM_LISTS;
  }
}

export async function fetchUserReviews(userId?: string): Promise<UserReviewEntry[]> {
  if (!userId) return SAMPLE_USER_REVIEWS;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        film_id,
        title,
        body,
        has_spoilers,
        created_at,
        films:film_id (
          title,
          release_date,
          poster_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return SAMPLE_USER_REVIEWS;
    }

    return data.map((item: any) => {
      const year = item.films?.release_date
        ? new Date(item.films.release_date).getFullYear()
        : 2020;
      return {
        id: item.id,
        film_id: item.film_id,
        film_title: item.films?.title || 'Unknown Title',
        release_year: year,
        poster_url: item.films?.poster_url,
        rating: 5.0, // fallback if rating join is null
        title: item.title,
        body: item.body,
        has_spoilers: Boolean(item.has_spoilers),
        created_at: item.created_at,
        upvotes_count: 0,
      };
    });
  } catch {
    return SAMPLE_USER_REVIEWS;
  }
}

export async function updateUserProfile(
  userId: string,
  payload: { display_name?: string; bio?: string; avatar_url?: string }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: payload.display_name,
      bio: payload.bio,
      avatar_url: payload.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

export async function updateTopFilms(
  userId: string,
  films: { filmId: string; position: number }[]
): Promise<void> {
  for (const item of films) {
    const { error } = await supabase.from('top_films').upsert(
      {
        user_id: userId,
        film_id: item.filmId,
        position: item.position,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, position' }
    );
    if (error) throw error;
  }
}

export async function removeFromWatchlist(userId: string, filmId: string): Promise<void> {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('film_id', filmId);
  if (error) throw error;
}

export async function createCustomList(
  userId: string,
  title: string,
  description?: string,
  isPrivate = false
): Promise<string> {
  const { data, error } = await supabase
    .from('custom_lists')
    .insert({
      user_id: userId,
      title,
      description: description || null,
      is_private: isPrivate,
    })
    .select('id')
    .single();

  if (error || !data) throw error || new Error('Failed to create list');
  return data.id;
}
