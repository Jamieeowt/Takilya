import { supabase } from '@/lib/supabase';
import {
  ActivityItem,
  ActivityType,
  ReviewComment,
  CuratedListDraft,
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

