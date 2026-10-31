import { supabase } from '@/lib/supabase';
import {
  ActivityItem,
  ActivityType,
  ReviewComment,
  CuratedListDraft,
  FollowEntity,
  FollowTargetType,
  FollowCounts,
} from './types';
import { UserRole } from '@/features/films/types';

// ==============================================================================
// TIME FORMATTER HELPER
// ==============================================================================

export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffDay > 7) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  if (diffDay >= 2) return `${diffDay}d ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffHr >= 1) return `${diffHr}h ago`;
  if (diffMin >= 1) return `${diffMin}m ago`;
  return 'Just now';
}

// ==============================================================================
// SAMPLE COMMUNITY ACTIVITY (Rich Philippine Cinema Seed Data)
// ==============================================================================

export const SAMPLE_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'reviewed',
    user: {
      id: 'usr-critic-1',
      name: 'Jessica Zafra',
      username: 'jessicazafra',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
      role: 'critic',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
    relative_time: '2h ago',
    film: {
      id: 'cccccccc-0001-0000-0000-000000000000',
      title: 'Himala',
      release_year: 1982,
      poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
      director: 'Ishmael Bernal',
    },
    rating: 5.0,
    review: {
      id: 'rev-act-1',
      title: 'Bernal and Lee dissect the machinery of mass hysteria',
      body: 'Forty-four years after its debut in the Manila Film Center, Himala remains frighteningly contemporary. Ricky Lee’s dialogue cuts like surgical steel, while Nora Aunor transforms the tragic Elsa into the mirror of a desperate nation seeking miracles in the sand dunes of Paoay.',
      rating: 5.0,
      has_spoilers: false,
      likes_count: 52,
      comments_count: 8,
      is_liked: false,
    },
    likes_count: 52,
    comments_count: 8,
    is_liked: false,
  },
  {
    id: 'act-2',
    type: 'created_list',
    user: {
      id: 'usr-critic-2',
      name: 'Richard Bolisay',
      username: 'bolisay',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
      role: 'critic',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6h ago
    relative_time: '6h ago',
    list: {
      id: 'list-act-1',
      title: 'Essential Regional Masterworks (2010–2026)',
      description: 'Groundbreaking Philippine films rooted outside the NCR, told in Cebuano, Ilokano, Bikol, Waray, and Kinaray-a.',
      film_count: 10,
      preview_posters: [
        'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
      ],
    },
    likes_count: 41,
    comments_count: 4,
    is_liked: false,
  },
  {
    id: 'act-3',
    type: 'logged',
    user: {
      id: 'usr-user-1',
      name: 'Bea Mendoza',
      username: 'beamendoza',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
      role: 'user',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10h ago
    relative_time: '10h ago',
    film: {
      id: 'cccccccc-0006-0000-0000-000000000000',
      title: 'Leonor Will Never Die',
      release_year: 2022,
      poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      director: 'Martika Ramirez Escobar',
    },
    rating: 4.5,
    review: {
      id: 'rev-act-3',
      body: 'Rewatched in a packed indie screening! The meta-cinematic joy and heart of Martika Ramirez Escobar’s debut never gets old.',
      rating: 4.5,
      has_spoilers: false,
      likes_count: 19,
      comments_count: 2,
      is_liked: false,
    },
    likes_count: 19,
    comments_count: 2,
    is_liked: false,
  },
  {
    id: 'act-4',
    type: 'watchlist',
    user: {
      id: 'usr-user-2',
      name: 'Paolo Santos',
      username: 'paolosantos',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
      role: 'user',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // Yesterday
    relative_time: 'Yesterday',
    film: {
      id: 'cccccccc-0004-0000-0000-000000000000',
      title: 'Kisapmata',
      release_year: 1981,
      poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
      director: 'Mike De Leon',
    },
    likes_count: 14,
    comments_count: 0,
    is_liked: false,
  },
  {
    id: 'act-5',
    type: 'rated',
    user: {
      id: 'usr-critic-3',
      name: 'Philbert Dy',
      username: 'philbertdy',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
      role: 'critic',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 2880).toISOString(), // 2d ago
    relative_time: '2d ago',
    film: {
      id: 'cccccccc-0003-0000-0000-000000000000',
      title: "Batch '81",
      release_year: 1982,
      poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      director: 'Mike De Leon',
    },
    rating: 5.0,
    review: {
      id: 'rev-act-5',
      body: 'Mark Gil’s descent into fraternity indoctrination remains the most terrifying political parable in Philippine cinema history.',
      rating: 5.0,
      has_spoilers: false,
      likes_count: 38,
      comments_count: 5,
      is_liked: false,
    },
    likes_count: 38,
    comments_count: 5,
    is_liked: false,
  },
];

export const SAMPLE_COMMENTS: Record<string, ReviewComment[]> = {
  'rev-act-1': [
    {
      id: 'c-1',
      review_id: 'rev-act-1',
      user: {
        id: 'usr-user-3',
        name: 'Carlos Yulo',
        username: 'carlosyulo',
        avatar_url: null,
        role: 'user',
      },
      body: '@jessicazafra completely agree on the sand dunes sequence. The sound design in the 4K restoration makes the howling wind so terrifying.',
      created_at: '1h ago',
    },
    {
      id: 'c-2',
      review_id: 'rev-act-1',
      user: {
        id: 'usr-critic-2',
        name: 'Richard Bolisay',
        username: 'bolisay',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
        role: 'critic',
      },
      body: 'Essential point about Ricky Lee’s script. Every single line in Cupang is transactional: faith traded for water, miracles traded for tourism.',
      created_at: '45m ago',
    },
  ],
};

// ==============================================================================
// SUPABASE QUERIES & MUTATIONS
// ==============================================================================

export async function fetchCommunityActivity(
  userId?: string,
  filter: 'all' | 'following' | 'reviews' = 'all'
): Promise<ActivityItem[]> {
  try {
    // If filtering by reviews only
    if (filter === 'reviews') {
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          body,
          has_spoilers,
          created_at,
          user:user_id (
            id,
            username,
            display_name,
            avatar_url,
            role
          ),
          film:film_id (
            id,
            title,
            release_date,
            poster_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (reviewsData && reviewsData.length > 0) {
        return reviewsData.map((item: any) => ({
          id: `act-rev-${item.id}`,
          type: 'reviewed',
          user: {
            id: item.user?.id || 'anon',
            name: item.user?.display_name || 'Cinephile',
            username: item.user?.username || 'user',
            avatar_url: item.user?.avatar_url,
            role: (item.user?.role as UserRole) || 'user',
          },
          created_at: item.created_at,
          relative_time: getRelativeTime(item.created_at),
          film: {
            id: item.film?.id || '',
            title: item.film?.title || 'Philippine Film',
            release_year: item.film?.release_date ? new Date(item.film.release_date).getFullYear() : 2020,
            poster_url: item.film?.poster_url,
          },
          rating: 5.0,
          review: {
            id: item.id,
            title: item.title,
            body: item.body,
            rating: 5.0,
            has_spoilers: Boolean(item.has_spoilers),
            likes_count: 12,
            comments_count: 2,
            is_liked: false,
          },
          likes_count: 12,
          comments_count: 2,
          is_liked: false,
        }));
      }
    }

    return SAMPLE_ACTIVITY;
  } catch (err) {
    console.warn('Failed to fetch community activity from Supabase:', err);
    return SAMPLE_ACTIVITY;
  }
}

export async function toggleLikeReview(
  userId: string,
  reviewId: string,
  currentlyLiked: boolean
): Promise<{ isLiked: boolean; newLikesCountDelta: number }> {
  try {
    if (currentlyLiked) {
      await supabase
        .from('votes')
        .delete()
        .eq('user_id', userId)
        .eq('target_type', 'review')
        .eq('target_id', reviewId);

      return { isLiked: false, newLikesCountDelta: -1 };
    } else {
      await supabase.from('votes').upsert(
        {
          user_id: userId,
          target_type: 'review',
          target_id: reviewId,
          value: 1,
        },
        { onConflict: 'user_id, target_type, target_id' }
      );

      return { isLiked: true, newLikesCountDelta: 1 };
    }
  } catch {
    // If table unmigrated or error, return expected optimistic outcome
    return { isLiked: !currentlyLiked, newLikesCountDelta: currentlyLiked ? -1 : 1 };
  }
}

export async function fetchReviewComments(reviewId: string): Promise<ReviewComment[]> {
  try {
    const { data, error } = await supabase
      .from('review_comments')
      .select(`
        id,
        review_id,
        body,
        created_at,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url,
          role
        )
      `)
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return SAMPLE_COMMENTS[reviewId] || [];
    }

    return data.map((item: any) => ({
      id: item.id,
      review_id: item.review_id,
      user: {
        id: item.profiles?.id || 'anon',
        name: item.profiles?.display_name || 'Cinephile',
        username: item.profiles?.username || 'user',
        avatar_url: item.profiles?.avatar_url,
        role: (item.profiles?.role as UserRole) || 'user',
      },
      body: item.body,
      created_at: getRelativeTime(item.created_at),
    }));
  } catch {
    return SAMPLE_COMMENTS[reviewId] || [];
  }
}

export async function addReviewComment(
  userId: string,
  reviewId: string,
  body: string
): Promise<ReviewComment> {
  const newId = 'comment-' + Date.now();
  const createdNow = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('review_comments')
      .insert({
        review_id: reviewId,
        user_id: userId,
        body,
      })
      .select(`
        id,
        review_id,
        body,
        created_at,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url,
          role
        )
      `)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        review_id: data.review_id,
        user: {
          id: (data as any).profiles?.id || userId,
          name: (data as any).profiles?.display_name || 'You',
          username: (data as any).profiles?.username || 'current_user',
          avatar_url: (data as any).profiles?.avatar_url,
          role: ((data as any).profiles?.role as UserRole) || 'user',
        },
        body: data.body,
        created_at: 'Just now',
      };
    }
  } catch {}

  // Fallback optimistic comment
  return {
    id: newId,
    review_id: reviewId,
    user: {
      id: userId,
      name: 'You',
      username: 'cinephile',
      role: 'user',
    },
    body,
    created_at: 'Just now',
  };
}

export async function searchFilmsForList(query: string): Promise<
  { id: string; title: string; release_year: number; poster_url?: string | null }[]
> {
  if (!query.trim()) return [];

  try {
    const { data } = await supabase
      .from('films')
      .select('id, title, release_date, poster_url')
      .ilike('title', `%${query.trim()}%`)
      .limit(8);

    if (data && data.length > 0) {
      return data.map((f: any) => ({
        id: f.id,
        title: f.title,
        release_year: f.release_date ? new Date(f.release_date).getFullYear() : 2020,
        poster_url: f.poster_url,
      }));
    }
  } catch {}

  // Fallback catalog search
  const catalog = [
    { id: 'cccccccc-0001-0000-0000-000000000000', title: 'Himala', release_year: 1982, poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80' },
    { id: 'cccccccc-0002-0000-0000-000000000000', title: 'Maynila sa mga Kuko ng Liwanag', release_year: 1975, poster_url: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=600&auto=format&fit=crop&q=80' },
    { id: 'cccccccc-0003-0000-0000-000000000000', title: "Batch '81", release_year: 1982, poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
    { id: 'cccccccc-0004-0000-0000-000000000000', title: 'Kisapmata', release_year: 1981, poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80' },
    { id: 'cccccccc-0005-0000-0000-000000000000', title: 'Oro, Plata, Mata', release_year: 1982, poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80' },
    { id: 'cccccccc-0006-0000-0000-000000000000', title: 'Leonor Will Never Die', release_year: 2022, poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80' },
    { id: 'cccccccc-0007-0000-0000-000000000000', title: 'John Denver Trending', release_year: 2019, poster_url: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=600&auto=format&fit=crop&q=80' },
    { id: 'cccccccc-0008-0000-0000-000000000000', title: 'Balangiga: Howling Wilderness', release_year: 2017, poster_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80' },
    { id: 'cccccccc-0009-0000-0000-000000000000', title: 'Cleaners', release_year: 2019, poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80' },
    { id: 'cccccccc-0010-0000-0000-000000000000', title: 'Itim (The Rites of May)', release_year: 1976, poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80' },
  ];

  return catalog.filter((f) => f.title.toLowerCase().includes(query.toLowerCase()));
}

export async function createCuratedListWithFilms(
  userId: string,
  draft: CuratedListDraft
): Promise<string> {
  const { data: listRow, error: listErr } = await supabase
    .from('custom_lists')
    .insert({
      user_id: userId,
      title: draft.title,
      description: draft.description || null,
      is_private: draft.is_private,
    })
    .select('id')
    .single();

  if (listErr || !listRow) throw listErr || new Error('Failed to create list');

  const listId = listRow.id;

  if (draft.films.length > 0) {
    const items = draft.films.map((f, idx) => ({
      list_id: listId,
      film_id: f.id,
      position: idx + 1,
    }));

    await supabase.from('custom_list_items').insert(items);
  }

  return listId;
}

// ==============================================================================
// POLYMORPHIC FOLLOWS (Phase 3: Prompt 3.1)
// ==============================================================================

export const SAMPLE_FOLLOW_ENTITIES: FollowEntity[] = [
  // Festivals
  {
    id: 'dddddddd-0001-0000-0000-000000000000',
    target_type: 'festival',
    name: 'Cinemalaya Philippine Independent Film Festival',
    handle: 'cinemalaya',
    avatar_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=80',
    subtitle: 'Premier Independent Film Festival • Manila, PH',
    is_verified: true,
    followers_count: 14200,
    is_following: true,
  },
  {
    id: 'dddddddd-0002-0000-0000-000000000000',
    target_type: 'festival',
    name: 'QCinema International Film Festival',
    handle: 'qcinema',
    avatar_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&auto=format&fit=crop&q=80',
    subtitle: 'International Showcase & Grants • Quezon City, PH',
    is_verified: true,
    followers_count: 11800,
    is_following: true,
  },
  {
    id: 'dddddddd-0003-0000-0000-000000000000',
    target_type: 'festival',
    name: 'Cinema One Originals',
    handle: 'c1originals',
    avatar_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80',
    subtitle: 'Original Independent Cinema Showcase',
    is_verified: true,
    followers_count: 8900,
    is_following: false,
  },
  {
    id: 'dddddddd-0004-0000-0000-000000000000',
    target_type: 'festival',
    name: 'Metro Manila Film Festival (MMFF)',
    handle: 'mmff-official',
    avatar_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80',
    subtitle: 'Annual Nationwide Theatrical Festival',
    is_verified: true,
    followers_count: 24500,
    is_following: false,
  },
  // Studios
  {
    id: '44444444-4444-4444-4444-444444444444',
    target_type: 'studio',
    name: 'Anima Studios',
    handle: 'anima-studios',
    avatar_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80',
    subtitle: 'Independent Producer • Sundance Honoree',
    is_verified: true,
    followers_count: 8400,
    is_following: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    target_type: 'studio',
    name: 'Black Sheep',
    handle: 'black-sheep',
    avatar_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&auto=format&fit=crop&q=80',
    subtitle: 'Edgy Contemporary Philippine Cinema',
    is_verified: true,
    followers_count: 15300,
    is_following: true,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    target_type: 'studio',
    name: 'Sine Olivia Pilipinas',
    handle: 'sine-olivia',
    avatar_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&auto=format&fit=crop&q=80',
    subtitle: 'Slow Cinema Production Outfit of Lav Diaz',
    is_verified: true,
    followers_count: 5200,
    is_following: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    target_type: 'studio',
    name: 'Sagip Pelikula (ABS-CBN Restoration)',
    handle: 'sagip-pelikula',
    avatar_url: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=400&auto=format&fit=crop&q=80',
    subtitle: 'Film Heritage Recovery & 4K Restoration',
    is_verified: true,
    followers_count: 18900,
    is_following: true,
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    target_type: 'studio',
    name: 'Regal Entertainment',
    handle: 'regal-films',
    avatar_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&auto=format&fit=crop&q=80',
    subtitle: 'Pioneering Philippine Studio • Est. 1962',
    is_verified: true,
    followers_count: 22100,
    is_following: false,
  },
  // People
  {
    id: 'bbbbbbbb-0001-0000-0000-000000000000',
    target_type: 'person',
    name: 'Ishmael Bernal',
    handle: 'ishmael-bernal',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    subtitle: 'National Artist for Cinema • Director (Himala, City After Dark)',
    is_verified: true,
    followers_count: 9800,
    is_following: true,
  },
  {
    id: 'bbbbbbbb-0002-0000-0000-000000000000',
    target_type: 'person',
    name: 'Lino Brocka',
    handle: 'lino-brocka',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    subtitle: 'National Artist for Cinema • Director (Maynila, Insiang)',
    is_verified: true,
    followers_count: 12400,
    is_following: true,
  },
  {
    id: 'bbbbbbbb-0003-0000-0000-000000000000',
    target_type: 'person',
    name: 'Martika Ramirez Escobar',
    handle: 'martika-escobar',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    subtitle: 'Director & Cinematographer (Leonor Will Never Die)',
    is_verified: true,
    followers_count: 6700,
    is_following: true,
  },
  {
    id: 'bbbbbbbb-0004-0000-0000-000000000000',
    target_type: 'person',
    name: 'Glenn Barit',
    handle: 'glenn-barit',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    subtitle: 'Director (Cleaners, Luzon Regional Cinema)',
    is_verified: true,
    followers_count: 4300,
    is_following: false,
  },
  {
    id: 'bbbbbbbb-0005-0000-0000-000000000000',
    target_type: 'person',
    name: 'Dolly de Leon',
    handle: 'dolly-de-leon',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    subtitle: 'Golden Globe Nominee & BAFTA Nominee • Actor',
    is_verified: true,
    followers_count: 18200,
    is_following: true,
  },
  {
    id: 'bbbbbbbb-0006-0000-0000-000000000000',
    target_type: 'person',
    name: 'Nora Aunor',
    handle: 'nora-aunor',
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
    subtitle: 'National Artist for Cinema • Grand Dame of Philippine Cinema',
    is_verified: true,
    followers_count: 21300,
    is_following: true,
  },
  // Users
  {
    id: 'usr-critic-1',
    target_type: 'user',
    name: 'Jessica Zafra',
    handle: 'jessicazafra',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
    subtitle: 'Film Critic & Essayist • Manila',
    is_verified: true,
    role: 'critic',
    followers_count: 8900,
    is_following: true,
  },
  {
    id: 'usr-critic-2',
    target_type: 'user',
    name: 'Richard Bolisay',
    handle: 'bolisay',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    subtitle: 'Author of Break It to Me Gently • Critic',
    is_verified: true,
    role: 'critic',
    followers_count: 6400,
    is_following: true,
  },
  {
    id: 'usr-critic-3',
    target_type: 'user',
    name: 'Philbert Dy',
    handle: 'philbertdy',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    subtitle: 'Film Critic & Programmer • Manila',
    is_verified: true,
    role: 'critic',
    followers_count: 7800,
    is_following: false,
  },
  {
    id: 'usr-user-1',
    target_type: 'user',
    name: 'Cinephile PH',
    handle: 'cinephile_ph',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    subtitle: 'Pinoy Noir Enthusiast & Restored Cinema Collector',
    is_verified: false,
    role: 'user',
    followers_count: 450,
    is_following: false,
  },
];

/**
 * Check if follower currently follows a polymorphic target
 */
export async function checkIsFollowing(
  followerId: string,
  targetType: FollowTargetType,
  targetId: string
): Promise<boolean> {
  if (!followerId || !targetId) return false;

  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .maybeSingle();

    if (error) {
      // Fallback check against local seed data
      const sample = SAMPLE_FOLLOW_ENTITIES.find(
        (e) => e.target_type === targetType && e.id === targetId
      );
      return Boolean(sample?.is_following);
    }

    return Boolean(data);
  } catch {
    const sample = SAMPLE_FOLLOW_ENTITIES.find(
      (e) => e.target_type === targetType && e.id === targetId
    );
    return Boolean(sample?.is_following);
  }
}

/**
 * Toggle follow/unfollow for a polymorphic target
 */
export async function toggleFollow(
  followerId: string,
  targetType: FollowTargetType,
  targetId: string,
  currentlyFollowing: boolean
): Promise<boolean> {
  if (!followerId || !targetId) {
    throw new Error('Follower and target ID are required');
  }

  try {
    if (currentlyFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase.from('follows').insert({
        follower_id: followerId,
        target_type: targetType,
        target_id: targetId,
      });

      if (error) throw error;
      return true;
    }
  } catch (err) {
    // If Supabase throws (e.g. offline/demo mode), toggle fallback in memory
    const sample = SAMPLE_FOLLOW_ENTITIES.find(
      (e) => e.target_type === targetType && e.id === targetId
    );
    if (sample) {
      sample.is_following = !currentlyFollowing;
    }
    return !currentlyFollowing;
  }
}

/**
 * Fetch list of entities a user follows, optionally filtered by target_type
 */
export async function fetchUserFollowing(
  followerId: string,
  targetType?: FollowTargetType
): Promise<FollowEntity[]> {
  try {
    let query = supabase
      .from('follows')
      .select('id, target_type, target_id, created_at')
      .eq('follower_id', followerId)
      .order('created_at', { ascending: false });

    if (targetType) {
      query = query.eq('target_type', targetType);
    }

    const { data: followRows, error } = await query;

    if (error || !followRows || followRows.length === 0) {
      // Fallback to sample seed entities
      if (targetType) {
        return SAMPLE_FOLLOW_ENTITIES.filter(
          (e) => e.target_type === targetType && e.is_following
        );
      }
      return SAMPLE_FOLLOW_ENTITIES.filter((e) => e.is_following);
    }

    // Resolve target entities by type
    const resolved: FollowEntity[] = [];

    const studioIds = followRows.filter((r) => r.target_type === 'studio').map((r) => r.target_id);
    const festivalIds = followRows.filter((r) => r.target_type === 'festival').map((r) => r.target_id);
    const personIds = followRows.filter((r) => r.target_type === 'person').map((r) => r.target_id);
    const userIds = followRows.filter((r) => r.target_type === 'user').map((r) => r.target_id);

    const [studiosRes, festivalsRes, peopleRes, profilesRes] = await Promise.all([
      studioIds.length > 0 ? supabase.from('studios').select('id, name, slug, logo_url, description, verification_status').in('id', studioIds) : { data: [] },
      festivalIds.length > 0 ? supabase.from('festivals').select('id, name, slug, logo_url, description, location, verification_status').in('id', festivalIds) : { data: [] },
      personIds.length > 0 ? supabase.from('people').select('id, name, slug, photo_url, bio, role_type, verification_status').in('id', personIds) : { data: [] },
      userIds.length > 0 ? supabase.from('profiles').select('id, username, display_name, avatar_url, bio, role, verification_status').in('id', userIds) : { data: [] },
    ]);

    const studioMap = new Map((studiosRes.data || []).map((s: any) => [s.id, s]));
    const festivalMap = new Map((festivalsRes.data || []).map((f: any) => [f.id, f]));
    const personMap = new Map((peopleRes.data || []).map((p: any) => [p.id, p]));
    const profileMap = new Map((profilesRes.data || []).map((u: any) => [u.id, u]));

    for (const row of followRows) {
      if (row.target_type === 'studio' && studioMap.has(row.target_id)) {
        const s = studioMap.get(row.target_id);
        resolved.push({
          id: s.id,
          target_type: 'studio',
          name: s.name,
          handle: s.slug,
          avatar_url: s.logo_url,
          subtitle: s.description || 'Film Studio',
          is_verified: s.verification_status === 'verified',
          is_following: true,
          created_at: row.created_at,
        });
      } else if (row.target_type === 'festival' && festivalMap.has(row.target_id)) {
        const f = festivalMap.get(row.target_id);
        resolved.push({
          id: f.id,
          target_type: 'festival',
          name: f.name,
          handle: f.slug,
          avatar_url: f.logo_url,
          subtitle: f.location || f.description || 'Film Festival',
          is_verified: f.verification_status === 'verified',
          is_following: true,
          created_at: row.created_at,
        });
      } else if (row.target_type === 'person' && personMap.has(row.target_id)) {
        const p = personMap.get(row.target_id);
        resolved.push({
          id: p.id,
          target_type: 'person',
          name: p.name,
          handle: p.slug,
          avatar_url: p.photo_url,
          subtitle: p.bio || `${p.role_type || 'Filmmaker'}`,
          is_verified: p.verification_status === 'verified',
          is_following: true,
          created_at: row.created_at,
        });
      } else if (row.target_type === 'user' && profileMap.has(row.target_id)) {
        const u = profileMap.get(row.target_id);
        resolved.push({
          id: u.id,
          target_type: 'user',
          name: u.display_name,
          handle: u.username,
          avatar_url: u.avatar_url,
          subtitle: u.bio || `@${u.username}`,
          role: u.role,
          is_verified: u.verification_status === 'verified' || u.role === 'critic' || u.role === 'admin',
          is_following: true,
          created_at: row.created_at,
        });
      }
    }

    if (resolved.length === 0) {
      if (targetType) {
        return SAMPLE_FOLLOW_ENTITIES.filter(
          (e) => e.target_type === targetType && e.is_following
        );
      }
      return SAMPLE_FOLLOW_ENTITIES.filter((e) => e.is_following);
    }

    return resolved;
  } catch {
    if (targetType) {
      return SAMPLE_FOLLOW_ENTITIES.filter(
        (e) => e.target_type === targetType && e.is_following
      );
    }
    return SAMPLE_FOLLOW_ENTITIES.filter((e) => e.is_following);
  }
}

/**
 * Fetch list of followers for a polymorphic target (User, Studio, Festival, or Person)
 */
export async function fetchTargetFollowers(
  targetId: string,
  targetType?: FollowTargetType
): Promise<FollowEntity[]> {
  try {
    let query = supabase
      .from('follows')
      .select(`
        id,
        created_at,
        follower_id,
        profiles:follower_id (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          role,
          verification_status
        )
      `)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });

    if (targetType) {
      query = query.eq('target_type', targetType);
    }

    const { data: rows, error } = await query;

    if (error || !rows || rows.length === 0) {
      // Fallback sample followers
      return SAMPLE_FOLLOW_ENTITIES.filter((e) => e.target_type === 'user');
    }

    return rows.map((r: any) => {
      const p = r.profiles || {};
      return {
        id: p.id || r.follower_id,
        target_type: 'user',
        name: p.display_name || 'Cinephile',
        handle: p.username || 'user',
        avatar_url: p.avatar_url,
        subtitle: p.bio || `@${p.username || 'user'}`,
        role: p.role || 'user',
        is_verified: p.verification_status === 'verified' || p.role === 'critic' || p.role === 'admin',
        is_following: false,
        created_at: r.created_at,
      };
    });
  } catch {
    return SAMPLE_FOLLOW_ENTITIES.filter((e) => e.target_type === 'user');
  }
}

/**
 * Fetch follow counts (followers count and polymorphic following counts)
 */
export async function fetchFollowCounts(
  targetId: string,
  targetType: FollowTargetType = 'user'
): Promise<FollowCounts> {
  try {
    const [followersRes, followingRes] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('target_id', targetId),
      targetType === 'user'
        ? supabase.from('follows').select('target_type').eq('follower_id', targetId)
        : Promise.resolve({ data: [] }),
    ]);

    const followers = followersRes.count || 0;
    let festivals = 0;
    let studios = 0;
    let people = 0;
    let users = 0;

    if (followingRes.data) {
      for (const row of followingRes.data) {
        if (row.target_type === 'festival') festivals++;
        else if (row.target_type === 'studio') studios++;
        else if (row.target_type === 'person') people++;
        else if (row.target_type === 'user') users++;
      }
    }

    return {
      followers,
      following: {
        festivals,
        studios,
        people,
        users,
        total: festivals + studios + people + users,
      },
    };
  } catch {
    return {
      followers: 124,
      following: {
        festivals: 12,
        studios: 18,
        people: 44,
        users: 95,
        total: 169,
      },
    };
  }
}


