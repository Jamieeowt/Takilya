import { supabase } from '@/lib/supabase';
import {
  StreamingPlatform,
  WatchAvailabilityItem,
  PlatformBrowseFilm,
  WatchAvailabilityType,
} from './types';

// ==============================================================================
// 1. SAMPLE / FALLBACK DATASETS
// ==============================================================================

export const SAMPLE_PLATFORMS: StreamingPlatform[] = [
  {
    id: '40404040-0001-0000-0000-000000000000',
    name: 'JuanFlix / FDCP Channel',
    slug: 'juanflix',
    website_url: 'https://juanflix.com.ph',
    is_local: true,
    films_count: 85,
  },
  {
    id: '40404040-0002-0000-0000-000000000000',
    name: 'Netflix',
    slug: 'netflix',
    website_url: 'https://netflix.com',
    is_local: false,
    films_count: 140,
  },
  {
    id: '40404040-0003-0000-0000-000000000000',
    name: 'iWantTFC',
    slug: 'iwanttfc',
    website_url: 'https://iwanttfc.com',
    is_local: true,
    films_count: 110,
  },
  {
    id: '40404040-0004-0000-0000-000000000000',
    name: 'YouTube (Official Channels)',
    slug: 'youtube',
    website_url: 'https://youtube.com',
    is_local: false,
    films_count: 65,
  },
  {
    id: '40404040-0005-0000-0000-000000000000',
    name: 'Vivamax',
    slug: 'vivamax',
    website_url: 'https://vivamax.net',
    is_local: true,
    films_count: 95,
  },
];

export const SAMPLE_AVAILABILITY_ITEMS: WatchAvailabilityItem[] = [
  {
    id: 'avail-001',
    film_id: 'cccccccc-0001-0000-0000-000000000000',
    platform_id: '40404040-0003-0000-0000-000000000000',
    platform_name: 'iWantTFC',
    platform_slug: 'iwanttfc',
    is_local: true,
    url: 'https://iwanttfc.com/movies/himala',
    availability_type: 'stream',
    last_verified: 'Oct 2026',
    created_at: new Date().toISOString(),
    film: {
      id: 'cccccccc-0001-0000-0000-000000000000',
      title: 'Himala',
      release_year: 1982,
      director: 'Ishmael Bernal',
      poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop',
    },
  },
  {
    id: 'avail-002',
    film_id: 'cccccccc-0001-0000-0000-000000000000',
    platform_id: '40404040-0001-0000-0000-000000000000',
    platform_name: 'JuanFlix / FDCP Channel',
    platform_slug: 'juanflix',
    is_local: true,
    url: 'https://juanflix.com.ph/titles/himala',
    availability_type: 'stream',
    last_verified: 'Oct 2026',
    created_at: new Date().toISOString(),
    film: {
      id: 'cccccccc-0001-0000-0000-000000000000',
      title: 'Himala',
      release_year: 1982,
      director: 'Ishmael Bernal',
      poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop',
    },
  },
  {
    id: 'avail-003',
    film_id: 'cccccccc-0001-0000-0000-000000000000',
    platform_id: '40404040-0004-0000-0000-000000000000',
    platform_name: 'YouTube (Sagip Pelikula)',
    platform_slug: 'youtube',
    is_local: false,
    url: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
    availability_type: 'free',
    last_verified: 'Oct 2026',
    created_at: new Date().toISOString(),
    film: {
      id: 'cccccccc-0001-0000-0000-000000000000',
      title: 'Himala',
      release_year: 1982,
      director: 'Ishmael Bernal',
      poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop',
    },
  },
  {
    id: 'avail-004',
    film_id: 'cccccccc-0003-0000-0000-000000000000',
    platform_id: '40404040-0002-0000-0000-000000000000',
    platform_name: 'Netflix',
    platform_slug: 'netflix',
    is_local: false,
    url: 'https://netflix.com/title/81614068',
    availability_type: 'stream',
    last_verified: 'Oct 2026',
    created_at: new Date().toISOString(),
    film: {
      id: 'cccccccc-0003-0000-0000-000000000000',
      title: 'Leonor Will Never Die',
      release_year: 2022,
      director: 'Martika Ramirez Escobar',
      poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop',
    },
  },
  {
    id: 'avail-005',
    film_id: 'cccccccc-0004-0000-0000-000000000000',
    platform_id: '40404040-0001-0000-0000-000000000000',
    platform_name: 'JuanFlix / FDCP Channel',
    platform_slug: 'juanflix',
    is_local: true,
    url: 'https://juanflix.com.ph/john-denver-trending',
    availability_type: 'rent',
    price_php: 120,
    last_verified: 'Oct 2026',
    created_at: new Date().toISOString(),
    film: {
      id: 'cccccccc-0004-0000-0000-000000000000',
      title: 'John Denver Trending',
      release_year: 2019,
      director: 'Arden Rod Condez',
      poster_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    },
  },
  {
    id: 'avail-006',
    film_id: 'cccccccc-0005-0000-0000-000000000000',
    platform_id: '40404040-0004-0000-0000-000000000000',
    platform_name: 'YouTube (QCinema)',
    platform_slug: 'youtube',
    is_local: false,
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    availability_type: 'free',
    last_verified: 'Oct 2026',
    created_at: new Date().toISOString(),
    film: {
      id: 'cccccccc-0005-0000-0000-000000000000',
      title: 'Cleaners',
      release_year: 2019,
      director: 'Glenn Barit',
      poster_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop',
    },
  },
  {
    id: 'avail-007',
    film_id: 'cccccccc-0002-0000-0000-000000000000',
    platform_id: '40404040-0001-0000-0000-000000000000',
    platform_name: 'JuanFlix / FDCP Channel',
    platform_slug: 'juanflix',
    is_local: true,
    url: 'https://juanflix.com.ph/titles/maynila',
    availability_type: 'stream',
    last_verified: 'Oct 2026',
    created_at: new Date().toISOString(),
    film: {
      id: 'cccccccc-0002-0000-0000-000000000000',
      title: 'Maynila sa mga Kuko ng Liwanag',
      release_year: 1975,
      director: 'Lino Brocka',
      poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    },
  },
  {
    id: 'avail-008',
    film_id: 'cccccccc-0006-0000-0000-000000000000',
    platform_id: '40404040-0004-0000-0000-000000000000',
    platform_name: 'YouTube (Sagip Pelikula)',
    platform_slug: 'youtube',
    is_local: false,
    url: 'https://www.youtube.com/watch?v=vP88v2B4a_A',
    availability_type: 'free',
    last_verified: 'Oct 2026',
    created_at: new Date().toISOString(),
    film: {
      id: 'cccccccc-0006-0000-0000-000000000000',
      title: 'Insiang',
      release_year: 1976,
      director: 'Lino Brocka',
      poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop',
    },
  },
  {
    id: 'avail-009',
    film_id: 'cccccccc-0020-0000-0000-000000000000',
    platform_id: '40404040-0002-0000-0000-000000000000',
    platform_name: 'Netflix',
    platform_slug: 'netflix',
    is_local: false,
    url: 'https://netflix.com/title/81033333',
    availability_type: 'stream',
    last_verified: 'Oct 2026',
    created_at: new Date().toISOString(),
    film: {
      id: 'cccccccc-0020-0000-0000-000000000000',
      title: 'Goyo: Ang Batang Heneral',
      release_year: 2018,
      director: 'Jerrold Tarog',
      poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop',
    },
  },
];

// ==============================================================================
// 2. TYPED SUPABASE API FUNCTIONS
// ==============================================================================

/**
 * Fetch all available streaming and theater platforms
 */
export async function fetchStreamingPlatforms(): Promise<StreamingPlatform[]> {
  try {
    const { data, error } = await supabase
      .from('streaming_platforms')
      .select('id, name, slug, logo_url, website_url, is_local')
      .order('is_local', { ascending: false });

    if (error || !data || data.length === 0) {
      return SAMPLE_PLATFORMS;
    }

    return data as StreamingPlatform[];
  } catch {
    return SAMPLE_PLATFORMS;
  }
}

/**
 * Fetch where a specific film can be watched (stream, rent, cinema, free)
 */
export async function fetchFilmWatchAvailability(
  filmId: string
): Promise<WatchAvailabilityItem[]> {
  try {
    const { data, error } = await supabase
      .from('watch_availability')
      .select(`
        id,
        film_id,
        platform_id,
        url,
        availability_type,
        price_php,
        created_at,
        streaming_platforms (
          id,
          name,
          slug,
          logo_url,
          website_url,
          is_local
        )
      `)
      .eq('film_id', filmId);

    if (error || !data || data.length === 0) {
      const match = SAMPLE_AVAILABILITY_ITEMS.filter((item) => item.film_id === filmId);
      return match.length > 0 ? match : [];
    }

    return data.map((row: any) => {
      const platform = row.streaming_platforms || {};
      const rawType = row.availability_type || 'subscription';
      const normType: WatchAvailabilityType =
        rawType === 'subscription' ? 'stream' : rawType === 'theatrical' ? 'cinema' : rawType;

      return {
        id: row.id,
        film_id: row.film_id,
        platform_id: row.platform_id,
        platform_name: platform.name || 'Streaming Service',
        platform_slug: platform.slug || 'stream',
        logo_url: platform.logo_url || null,
        website_url: platform.website_url || null,
        is_local: Boolean(platform.is_local),
        url: row.url,
        availability_type: normType,
        price_php: row.price_php,
        last_verified: 'Oct 2026',
        created_at: row.created_at,
      };
    });
  } catch {
    const match = SAMPLE_AVAILABILITY_ITEMS.filter((item) => item.film_id === filmId);
    return match.length > 0 ? match : [];
  }
}

/**
 * Browse films across platforms with optional free-only filter
 */
export async function fetchBrowseFilmsByPlatform(
  platformSlug: string = 'all',
  freeOnly: boolean = false
): Promise<PlatformBrowseFilm[]> {
  try {
    let query = supabase
      .from('watch_availability')
      .select(`
        id,
        url,
        availability_type,
        price_php,
        streaming_platforms (
          name,
          slug,
          is_local
        ),
        films (
          id,
          title,
          release_year,
          poster_url,
          director,
          synopsis
        )
      `);

    if (freeOnly) {
      query = query.eq('availability_type', 'free');
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return getFilteredSampleBrowseFilms(platformSlug, freeOnly);
    }

    const mapped: PlatformBrowseFilm[] = data
      .filter((row: any) => row.films)
      .map((row: any) => {
        const platform = row.streaming_platforms || {};
        const film = row.films || {};
        const rawType = row.availability_type || 'subscription';
        const normType: WatchAvailabilityType =
          rawType === 'subscription' ? 'stream' : rawType === 'theatrical' ? 'cinema' : rawType;

        return {
          id: film.id,
          title: film.title,
          release_year: film.release_year,
          poster_url: film.poster_url,
          director: film.director,
          synopsis: film.synopsis,
          platform_name: platform.name || 'Platform',
          platform_slug: platform.slug || 'stream',
          availability_type: normType,
          price_php: row.price_php,
          url: row.url,
          is_free: normType === 'free',
          is_local: Boolean(platform.is_local),
          last_verified: 'Oct 2026',
        };
      });

    if (platformSlug !== 'all') {
      return mapped.filter((m) => m.platform_slug === platformSlug);
    }
    return mapped;
  } catch {
    return getFilteredSampleBrowseFilms(platformSlug, freeOnly);
  }
}

function getFilteredSampleBrowseFilms(
  platformSlug: string,
  freeOnly: boolean
): PlatformBrowseFilm[] {
  let list: PlatformBrowseFilm[] = SAMPLE_AVAILABILITY_ITEMS.map((item) => ({
    id: item.film_id,
    title: item.film?.title || 'Film Title',
    release_year: item.film?.release_year || 2020,
    poster_url: item.film?.poster_url,
    director: item.film?.director,
    synopsis: item.film?.synopsis,
    platform_name: item.platform_name,
    platform_slug: item.platform_slug,
    availability_type: item.availability_type,
    price_php: item.price_php,
    url: item.url,
    is_free: item.availability_type === 'free',
    is_local: item.is_local,
    last_verified: item.last_verified,
  }));

  if (platformSlug !== 'all') {
    list = list.filter((f) => f.platform_slug === platformSlug);
  }
  if (freeOnly) {
    list = list.filter((f) => f.is_free);
  }

  // Deduplicate by film id
  const seen = new Set<string>();
  return list.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}

