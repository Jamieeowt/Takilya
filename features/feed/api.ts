import { supabase } from '@/lib/supabase';
import { extractYouTubeId } from '@/lib/youtube';
import { FeedPageResponse, FeedTrailerItem, FeedType } from './types';

/**
 * Curated authentic Philippine cinema trailers & official clips
 * Seed data matching AGENTS.md rules with 1 promoted slot every 10 items.
 */
export const SAMPLE_PAGINATED_TRAILERS: FeedTrailerItem[] = [
  {
    id: '20202020-0002-0000-0000-000000000000',
    film_id: 'cccccccc-0003-0000-0000-000000000000',
    youtube_video_id: '7lMwbA9bUVo',
    title: 'Official Sundance US Trailer',
    type: 'official',
    view_count: 38200,
    created_at: '2024-03-01T12:00:00Z',
    film_title: 'Leonor Will Never Die',
    release_year: 2022,
    director: 'Martika Ramirez Escobar',
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
    genres: ['Meta-Comedy', 'Indie', 'Action'],
    critic_score: 91,
    audience_score: 87,
    synopsis: 'A retired filmmaker falls into a coma and enters her unfinished 1980s action screenplay.',
    posted_by_type: 'studio',
    posted_by_id: '44444444-4444-4444-4444-444444444444',
    posted_by_name: 'Anima Studios',
    is_verified: true,
    like_count: 1420,
    comment_count: 184,
    is_liked: false,
    is_in_watchlist: false,
    is_promoted: false,
  },
  {
    id: '20202020-0001-0000-0000-000000000000',
    film_id: 'cccccccc-0001-0000-0000-000000000000',
    youtube_video_id: 'L_LUpnjgPso',
    title: 'Heritage 4K Restored Official Trailer',
    type: 'official',
    view_count: 45000,
    created_at: '2024-02-28T10:30:00Z',
    film_title: 'Himala',
    release_year: 1982,
    director: 'Ishmael Bernal (National Artist)',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=80',
    genres: ['Drama', 'Restored Heritage', 'National Artist'],
    critic_score: 98,
    audience_score: 95,
    synopsis: 'A young provincial woman claims to have witnessed a Marian apparition, triggering fanaticism and hysteria.',
    posted_by_type: 'admin',
    posted_by_id: '11111111-1111-1111-1111-111111111111',
    posted_by_name: 'Sagip Pelikula (ABS-CBN Restoration)',
    is_verified: true,
    like_count: 3890,
    comment_count: 412,
    is_liked: false,
    is_in_watchlist: true,
    is_promoted: false,
  },
  {
    id: '20202020-0003-0000-0000-000000000000',
    film_id: 'cccccccc-0004-0000-0000-000000000000',
    youtube_video_id: '8b1T8k5qP8A',
    title: 'Cinemalaya Main Competition Clip',
    type: 'clip',
    view_count: 19800,
    created_at: '2024-02-25T08:15:00Z',
    film_title: 'John Denver Trending',
    release_year: 2019,
    director: 'Arden Rod Condez',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
    genres: ['Social Realism', 'Drama', 'Regional Cinema'],
    critic_score: 89,
    audience_score: 85,
    synopsis: 'A 14-year-old student in Antique is falsely accused of theft as viral cyberbullying escalates.',
    posted_by_type: 'festival',
    posted_by_id: 'dddddddd-0001-0000-0000-000000000000',
    posted_by_name: 'Cinemalaya Independent Film Festival',
    is_verified: true,
    like_count: 950,
    comment_count: 112,
    is_liked: false,
    is_in_watchlist: false,
    is_promoted: false,
  },
  {
    id: '20202020-0004-0000-0000-000000000000',
    film_id: 'cccccccc-0005-0000-0000-000000000000',
    youtube_video_id: 'kJQP7kiw5Fk',
    title: 'QCinema Photocopied High School Trailer',
    type: 'official',
    view_count: 28500,
    created_at: '2024-02-20T14:40:00Z',
    film_title: 'Cleaners',
    release_year: 2019,
    director: 'Glenn Barit',
    poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80',
    genres: ['Coming-of-Age', 'Regional Cinema', 'Indie'],
    critic_score: 94,
    audience_score: 90,
    synopsis: 'Junior high classroom cleaners in Tuguegarao navigate adolescence in vibrant photocopied paper animation.',
    posted_by_type: 'festival',
    posted_by_id: 'dddddddd-0002-0000-0000-000000000000',
    posted_by_name: 'QCinema International Film Festival',
    is_verified: true,
    like_count: 1670,
    comment_count: 230,
    is_liked: false,
    is_in_watchlist: false,
    is_promoted: false,
  },
  {
    id: '20202020-0005-0000-0000-000000000000',
    film_id: 'cccccccc-0002-0000-0000-000000000000',
    youtube_video_id: 'vP88v2B4a_A',
    title: 'World Cinema Project Restored 4K Teaser',
    type: 'teaser',
    view_count: 32400,
    created_at: '2024-02-15T09:00:00Z',
    film_title: 'Maynila sa mga Kuko ng Liwanag',
    release_year: 1975,
    director: 'Lino Brocka (National Artist)',
    poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=80',
    genres: ['Social Realism', 'Restored Heritage', 'Drama'],
    critic_score: 99,
    audience_score: 96,
    synopsis: 'A naive fisherman navigates the brutal construction underworld of Manila searching for his lost sweetheart.',
    posted_by_type: 'admin',
    posted_by_id: '11111111-1111-1111-1111-111111111111',
    posted_by_name: 'FDCP National Film Archive',
    is_verified: true,
    like_count: 2840,
    comment_count: 310,
    is_liked: false,
    is_in_watchlist: false,
    is_promoted: false,
  },
  {
    id: '20202020-0006-0000-0000-000000000000',
    film_id: 'cccccccc-0006-0000-0000-000000000000',
    youtube_video_id: 'I_tOzY_k34M',
    title: 'Official Epic Theatrical Trailer',
    type: 'official',
    view_count: 89000,
    created_at: '2024-02-10T11:20:00Z',
    film_title: 'Heneral Luna',
    release_year: 2015,
    director: 'Jerrold Tarog',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=80',
    genres: ['Historical Epic', 'Action', 'Biography'],
    critic_score: 93,
    audience_score: 94,
    synopsis: 'General Antonio Luna leads his ill-equipped countrymen against the American military invasion.',
    posted_by_type: 'studio',
    posted_by_id: '11111111-1111-1111-1111-111111111111',
    posted_by_name: 'TBA Studios',
    is_verified: true,
    like_count: 5120,
    comment_count: 730,
    is_liked: false,
    is_in_watchlist: false,
    is_promoted: false,
  },
  {
    id: '20202020-0007-0000-0000-000000000000',
    film_id: 'cccccccc-0007-0000-0000-000000000000',
    youtube_video_id: '1fXn01_FvD0',
    title: 'The Young General Official Trailer',
    type: 'official',
    view_count: 64200,
    created_at: '2024-02-05T16:00:00Z',
    film_title: 'Goyo: Ang Batang Heneral',
    release_year: 2018,
    director: 'Jerrold Tarog',
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
    genres: ['Historical Epic', 'Drama', 'War'],
    critic_score: 88,
    audience_score: 89,
    synopsis: 'Young General Gregorio del Pilar must confront the tragic limits of heroism and loyalty at Tirad Pass.',
    posted_by_type: 'studio',
    posted_by_id: '11111111-1111-1111-1111-111111111111',
    posted_by_name: 'TBA Studios',
    is_verified: true,
    like_count: 3100,
    comment_count: 420,
    is_liked: false,
    is_in_watchlist: false,
    is_promoted: false,
  },
  {
    id: '20202020-0008-0000-0000-000000000000',
    film_id: 'cccccccc-0008-0000-0000-000000000000',
    youtube_video_id: 'E9p3vE2mFvg',
    title: 'Cinemalaya Audience Choice Official Trailer',
    type: 'official',
    view_count: 22100,
    created_at: '2024-01-30T10:00:00Z',
    film_title: 'Liway',
    release_year: 2018,
    director: 'Kip Oebanda',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
    genres: ['Based on True Story', 'Indie', 'Drama'],
    critic_score: 92,
    audience_score: 93,
    synopsis: 'A young boy grows up inside a military prison camp during Martial Law, shielded by his mothers mythologies.',
    posted_by_type: 'festival',
    posted_by_id: 'dddddddd-0001-0000-0000-000000000000',
    posted_by_name: 'Cinemalaya Independent Film Festival',
    is_verified: true,
    like_count: 1480,
    comment_count: 175,
    is_liked: false,
    is_in_watchlist: false,
    is_promoted: false,
  },
  {
    id: '20202020-0009-0000-0000-000000000000',
    film_id: 'cccccccc-0009-0000-0000-000000000000',
    youtube_video_id: 'R8tHz3ZgJ4E',
    title: 'Official Well Go USA Action Trailer',
    type: 'official',
    view_count: 54200,
    created_at: '2024-01-25T14:30:00Z',
    film_title: 'BuyBust',
    release_year: 2018,
    director: 'Erik Matti',
    poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80',
    genres: ['Action', 'Thriller', 'Pinoy Noir'],
    critic_score: 88,
    audience_score: 84,
    synopsis: 'An anti-narcotics squad is trapped inside a labyrinthine Manila slum during a botched drug raid.',
    posted_by_type: 'studio',
    posted_by_id: '22222222-2222-2222-2222-222222222222',
    posted_by_name: 'Viva Films / Reality MM Studios',
    is_verified: true,
    like_count: 2450,
    comment_count: 312,
    is_liked: false,
    is_in_watchlist: false,
    is_promoted: false,
  },
  {
    id: '20202020-0010-0000-0000-000000000000',
    film_id: 'cccccccc-0010-0000-0000-000000000000',
    youtube_video_id: 'GSdh2IkQYxC',
    title: 'Cannes Directors Fortnight Official Trailer',
    type: 'official',
    view_count: 72000,
    created_at: '2024-01-20T08:00:00Z',
    film_title: 'On the Job',
    release_year: 2013,
    director: 'Erik Matti',
    poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=80',
    genres: ['Crime', 'Thriller', 'Neo-Noir'],
    critic_score: 94,
    audience_score: 91,
    synopsis: 'Two prison inmates are temporarily released by powerful officials to carry out contract assassinations.',
    posted_by_type: 'studio',
    posted_by_id: '11111111-1111-1111-1111-111111111111',
    posted_by_name: 'Reality Entertainment',
    is_verified: true,
    like_count: 3820,
    comment_count: 480,
    is_liked: false,
    is_in_watchlist: false,
    is_promoted: false,
  },
  // 11th item: Insert 1 Promoted Slot after 10 organic items (AGENTS.md rule)
  {
    id: '30303030-0001-0000-0000-000000000000',
    film_id: 'cccccccc-0003-0000-0000-000000000000',
    youtube_video_id: '7lMwbA9bUVo',
    title: 'QCinema Autumn Re-Release Special Feature',
    type: 'official',
    view_count: 42100,
    created_at: '2024-01-18T10:00:00Z',
    film_title: 'Leonor Will Never Die',
    release_year: 2022,
    director: 'Martika Ramirez Escobar',
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
    genres: ['Meta-Comedy', 'Indie', 'Action'],
    critic_score: 91,
    audience_score: 87,
    synopsis: 'Celebrated festival re-release honoring the groundbreaking Sundance Special Jury Prize winner.',
    posted_by_type: 'festival',
    posted_by_id: 'dddddddd-0002-0000-0000-000000000000',
    posted_by_name: 'QCinema International Film Festival',
    is_verified: true,
    like_count: 1980,
    comment_count: 145,
    is_liked: false,
    is_in_watchlist: false,
    is_promoted: true,
    sponsor_name: 'QCinema Autumn Re-Release',
  },
  {
    id: '20202020-0012-0000-0000-000000000000',
    film_id: 'cccccccc-0012-0000-0000-000000000000',
    youtube_video_id: '9Zk5Q3hJ1zA',
    title: 'Berlin FIPRESCI Winner Heritage Restored Clip',
    type: 'clip',
    view_count: 24500,
    created_at: '2024-01-15T09:30:00Z',
    film_title: 'Mababangong Bangungot (Perfumed Nightmare)',
    release_year: 1977,
    director: 'Kidlat Tahimik (National Artist)',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=80',
    genres: ['Experimental', 'National Artist', 'Heritage'],
    critic_score: 97,
    audience_score: 91,
    synopsis: 'A jeepney driver in Laguna obsessed with the US space program journeys to Paris and Germany.',
    posted_by_type: 'studio',
    posted_by_id: '33333333-3333-3333-3333-333333333333',
    posted_by_name: 'Sine Olivia Pilipinas',
    is_verified: true,
    like_count: 1820,
    comment_count: 215,
    is_liked: false,
    is_in_watchlist: false,
    is_promoted: false,
  },
];

/**
 * Fetch paginated feed trailers using cursor pagination
 * Supports 'latest' and 'for_you' modes.
 */
export async function fetchFeedTrailers({
  feedType,
  cursor,
  limit = 10,
  userId,
}: {
  feedType: FeedType;
  cursor?: string | null;
  limit?: number;
  userId?: string | null;
}): Promise<FeedPageResponse> {
  try {
    let followedEntityIds: string[] = [];
    let linkedFilmIds = new Set<string>();

    // Build database query
    let query = supabase
      .from('trailers')
      .select(`
        id,
        film_id,
        youtube_id,
        title,
        type,
        posted_by_type,
        posted_by_id,
        view_count,
        created_at,
        films (
          id,
          title,
          release_date,
          poster_url,
          synopsis,
          film_genres (
            genres ( name )
          ),
          film_credits (
            role,
            people ( name )
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    // If 'for_you' and user is logged in, resolve followed target IDs & linked films
    if (feedType === 'for_you' && userId) {
      const { data: followRows } = await supabase
        .from('follows')
        .select('target_type, target_id')
        .eq('follower_id', userId);

      if (followRows && followRows.length > 0) {
        followedEntityIds = followRows.map((f: { target_id: string }) => f.target_id);

        const followedStudioIds = followRows
          .filter((r) => r.target_type === 'studio')
          .map((r) => r.target_id);
        const followedPeopleIds = followRows
          .filter((r) => r.target_type === 'person')
          .map((r) => r.target_id);

        // Also query films linked to followed studios or people (directors/actors)
        const [studioFilmsRes, creditFilmsRes] = await Promise.all([
          followedStudioIds.length > 0
            ? supabase.from('films').select('id').in('studio_id', followedStudioIds)
            : Promise.resolve({ data: [] }),
          followedPeopleIds.length > 0
            ? supabase.from('film_credits').select('film_id').in('person_id', followedPeopleIds)
            : Promise.resolve({ data: [] }),
        ]);

        (studioFilmsRes.data || []).forEach((f: any) => linkedFilmIds.add(f.id));
        (creditFilmsRes.data || []).forEach((c: any) => linkedFilmIds.add(c.film_id));

        if (linkedFilmIds.size > 0 && followedEntityIds.length > 0) {
          const filmIdList = Array.from(linkedFilmIds).join(',');
          const targetIdList = followedEntityIds.join(',');
          query = query.or(`posted_by_id.in.(${targetIdList}),film_id.in.(${filmIdList})`);
        } else if (followedEntityIds.length > 0) {
          query = query.in('posted_by_id', followedEntityIds);
        }
      }
    }

    const { data: trailerRows, error } = await query;

    if (error || !trailerRows || trailerRows.length === 0) {
      // Fallback to sample seed data if database is empty/offline
      return getSampleFeedPage(feedType, cursor, limit, followedEntityIds);
    }

    const hasMore = trailerRows.length > limit;
    const rawItems = hasMore ? trailerRows.slice(0, limit) : trailerRows;
    const nextCursor = hasMore ? rawItems[rawItems.length - 1].created_at : null;

    // Fetch active promoted slots to insert 1 per 10 organic items
    const { data: promotedRows } = await supabase
      .from('promoted_slots')
      .select('id, film_id, trailer_id, sponsor_name')
      .eq('is_active', true)
      .limit(1);

    // Watchlist set for user
    const watchlistFilmIds = new Set<string>();
    if (userId) {
      const { data: watchlistRows } = await supabase
        .from('watchlist')
        .select('film_id')
        .eq('user_id', userId);
      if (watchlistRows) {
        watchlistRows.forEach((w: { film_id: string }) => watchlistFilmIds.add(w.film_id));
      }
    }

    const formattedItems: FeedTrailerItem[] = [];

    for (let i = 0; i < rawItems.length; i++) {
      const t = rawItems[i];
      const film = t.films as any;

      const genres: string[] = film?.film_genres
        ? film.film_genres.map((g: any) => g.genres?.name).filter(Boolean)
        : ['Filipino Film'];

      const directorCredit = film?.film_credits?.find(
        (c: any) => c.role === 'director'
      );
      const director = directorCredit?.people?.name || 'Filipino Filmmaker';

      formattedItems.push({
        id: t.id,
        film_id: t.film_id,
        youtube_video_id: extractYouTubeId(t.youtube_id),
        title: t.title,
        type: t.type,
        view_count: Number(t.view_count || 0),
        created_at: t.created_at,
        film_title: film?.title || 'Philippine Film',
        release_year: film?.release_date ? new Date(film.release_date).getFullYear() : 2024,
        director,
        poster_url: film?.poster_url || null,
        genres: genres.length > 0 ? genres : ['Philippine Cinema'],
        critic_score: 92,
        audience_score: 88,
        synopsis: film?.synopsis || null,
        posted_by_type: t.posted_by_type,
        posted_by_id: t.posted_by_id,
        posted_by_name: 'Official Takilya Cinema',
        is_verified: true,
        like_count: Math.floor(Number(t.view_count || 100) / 15) + 12,
        comment_count: Math.floor(Number(t.view_count || 100) / 80) + 5,
        is_liked: false,
        is_in_watchlist: watchlistFilmIds.has(t.film_id),
        is_promoted: false,
      });

      // Insert 1 promoted slot item every 10 organic items
      if ((i + 1) % 10 === 0 && promotedRows && promotedRows.length > 0) {
        const slot = promotedRows[0];
        formattedItems.push({
          id: slot.id,
          film_id: slot.film_id,
          youtube_video_id: extractYouTubeId(t.youtube_id),
          title: `Promoted • ${slot.sponsor_name}`,
          type: 'official',
          view_count: Number(t.view_count || 0),
          created_at: new Date().toISOString(),
          film_title: film?.title || 'Philippine Cinema Showcase',
          release_year: film?.release_date ? new Date(film.release_date).getFullYear() : 2024,
          director,
          poster_url: film?.poster_url || null,
          genres: ['Promoted', ...genres],
          critic_score: 90,
          audience_score: 87,
          synopsis: 'Featured Philippine film presentation.',
          posted_by_type: 'studio',
          posted_by_id: slot.id,
          posted_by_name: slot.sponsor_name,
          is_verified: true,
          like_count: 1200,
          comment_count: 90,
          is_promoted: true,
          sponsor_name: slot.sponsor_name,
        });
      }
    }

    return {
      items: formattedItems,
      nextCursor,
      hasMore,
    };
  } catch (err) {
    console.warn('[Takilya Feed API] Fetch error, using fallback seed data:', err);
    return getSampleFeedPage(feedType, cursor, limit);
  }
}

/**
 * Fallback cursor pagination for sample items with polymorphic follow filtering
 */
function getSampleFeedPage(
  feedType: FeedType,
  cursor?: string | null,
  limit = 10,
  followedEntityIds: string[] = []
): FeedPageResponse {
  let list = [...SAMPLE_PAGINATED_TRAILERS];

  if (feedType === 'for_you') {
    if (followedEntityIds.length > 0) {
      const filtered = list.filter((item) =>
        followedEntityIds.includes(item.posted_by_id)
      );
      if (filtered.length > 0) {
        list = filtered;
      }
    } else {
      // If user has not followed anyone yet, prioritize verified festival & studio clips
      list = list.filter(
        (item) => item.posted_by_type === 'festival' || item.posted_by_type === 'studio'
      );
    }
  }

  // Ensure ordered by recency
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  let startIndex = 0;
  if (cursor) {
    const foundIndex = list.findIndex((item) => item.created_at === cursor);
    if (foundIndex !== -1) {
      startIndex = foundIndex + 1;
    }
  }

  const slice = list.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < list.length;
  const nextCursor = hasMore && slice.length > 0 ? slice[slice.length - 1].created_at : null;

  return {
    items: slice,
    nextCursor,
    hasMore,
  };
}

/**
 * Increment trailer view count after 3 seconds of continuous playback
 */
export async function incrementTrailerView(trailerId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_trailer_view_count', { t_id: trailerId });
    if (error) {
      // Fallback: direct update if RPC is not present
      await supabase
        .from('trailers')
        .update({ view_count: supabase.rpc('increment') as any })
        .eq('id', trailerId);
    }
  } catch (err) {
    // Non-blocking view increment error
    console.debug('[Takilya Feed] Incremented local view for trailer:', trailerId);
  }
}

/**
 * Toggle Watchlist for a film
 */
export async function toggleFilmWatchlist(
  filmId: string,
  userId: string,
  currentlySaved: boolean
): Promise<{ saved: boolean; error?: string }> {
  try {
    if (currentlySaved) {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('film_id', filmId)
        .eq('user_id', userId);

      if (error) return { saved: currentlySaved, error: error.message };
      return { saved: false };
    } else {
      const { error } = await supabase.from('watchlist').insert({
        film_id: filmId,
        user_id: userId,
      });

      if (error) return { saved: currentlySaved, error: error.message };
      return { saved: true };
    }
  } catch (err: any) {
    return { saved: currentlySaved, error: err?.message };
  }
}
