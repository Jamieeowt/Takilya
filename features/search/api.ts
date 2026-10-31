import { supabase } from '@/lib/supabase';
import {
  SearchFilterState,
  SearchResultsResponse,
  DiscoveryCuratedSections,
  SearchFilmItem,
  SearchPersonItem,
  SearchScreeningItem,
} from './types';

// ==============================================================================
// SEED DISCOVERY & SEARCH CATALOG (Philippine Cinema Only - Strict AGENTS.md)
// ==============================================================================

const SEED_SEARCH_FILMS: SearchFilmItem[] = [
  {
    id: 'cccccccc-0001-0000-0000-000000000000',
    title: 'Himala',
    original_title: 'Himala',
    slug: 'himala',
    release_year: 1982,
    runtime_minutes: 124,
    language: 'Filipino',
    mtrcb_rating: 'PG',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
    director: 'Ishmael Bernal',
    genres: ['Drama', 'Social Realism', 'Restored Heritage'],
    critic_score: 98,
    audience_score: 95,
    synopsis: 'A drought-stricken town falls into commercial frenzy when a provincial girl claims to witness a Marian apparition.',
    is_classic: true,
    streaming_platforms: ['iWantTFC', 'JuanFlix / FDCP'],
    screening_info: 'Restored 4K Heritage Print',
  },
  {
    id: 'cccccccc-0002-0000-0000-000000000000',
    title: 'Maynila sa mga Kuko ng Liwanag',
    original_title: 'Maynila sa mga Kuko ng Liwanag',
    slug: 'maynila-sa-mga-kuko-ng-liwanag',
    release_year: 1975,
    runtime_minutes: 125,
    language: 'Filipino',
    mtrcb_rating: 'R-16',
    poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1200&auto=format&fit=crop&q=80',
    director: 'Lino Brocka',
    genres: ['Drama', 'Social Realism', 'Classics'],
    critic_score: 99,
    audience_score: 94,
    synopsis: 'A provincial fisherman travels to the cruel alleys of Manila searching for his abducted childhood sweetheart Ligaya.',
    is_classic: true,
    streaming_platforms: ['JuanFlix / FDCP'],
    screening_info: 'Cannes Classic Special Screening',
  },
  {
    id: 'cccccccc-0003-0000-0000-000000000000',
    title: 'Leonor Will Never Die',
    original_title: 'Ang Pagbabalik ng Kwago',
    slug: 'leonor-will-never-die',
    release_year: 2022,
    runtime_minutes: 99,
    language: 'Filipino',
    mtrcb_rating: 'PG',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&auto=format&fit=crop&q=80',
    director: 'Martika Ramirez Escobar',
    genres: ['Meta-Comedy', 'Indie', 'Action'],
    critic_score: 96,
    audience_score: 89,
    synopsis: 'A retired action screenwriter enters a coma and finds herself inside her unfinished 1980s screenplay.',
    is_classic: false,
    streaming_platforms: ['Netflix Philippines'],
    screening_info: 'Sundance Special Jury Prize',
  },
  {
    id: 'cccccccc-0004-0000-0000-000000000000',
    title: 'John Denver Trending',
    original_title: 'John Denver Trending',
    slug: 'john-denver-trending',
    release_year: 2019,
    runtime_minutes: 96,
    language: 'Kinaray-a',
    mtrcb_rating: 'PG',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&auto=format&fit=crop&q=80',
    director: 'Arden Rod Condez',
    genres: ['Social Realism', 'Drama', 'Psychological Thriller'],
    critic_score: 92,
    audience_score: 88,
    synopsis: 'A 14-year-old high school student in Antique is framed for theft as cyberbullying spins dangerously out of control.',
    is_classic: false,
    streaming_platforms: ['JuanFlix / FDCP'],
    screening_info: 'Cinemalaya Best Film Winner',
  },
  {
    id: 'cccccccc-0005-0000-0000-000000000000',
    title: 'Cleaners',
    original_title: 'Cleaners',
    slug: 'cleaners',
    release_year: 2019,
    runtime_minutes: 78,
    language: 'Ilokano',
    mtrcb_rating: 'PG',
    poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
    director: 'Glenn Barit',
    genres: ['Coming-of-Age', 'Regional Cinema', 'Indie'],
    critic_score: 95,
    audience_score: 91,
    synopsis: 'Tuguegarao Catholic school classroom cleaners navigate youthful angst, photocopied and hand-colored on paper.',
    is_classic: false,
    streaming_platforms: ['JuanFlix / FDCP'],
    screening_info: 'QCinema Best Film Winner',
  },
  {
    id: 'cccccccc-0006-0000-0000-000000000000',
    title: 'Oda sa Wala',
    original_title: 'Oda sa Wala',
    slug: 'oda-sa-wala',
    release_year: 2018,
    runtime_minutes: 92,
    language: 'Filipino',
    mtrcb_rating: 'R-13',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
    director: 'Dwein Baltazar',
    genres: ['Drama', 'Indie', 'Psychological'],
    critic_score: 97,
    audience_score: 86,
    synopsis: 'An aging, lonely embalmer befriends a cadaver in her family funeral parlor.',
    is_classic: false,
    streaming_platforms: ['iWantTFC'],
    screening_info: 'Gawad Urian Best Picture',
  },
];

const SEED_SCREENINGS: SearchScreeningItem[] = [
  {
    id: 'sc-1',
    film_id: 'cccccccc-0003-0000-0000-000000000000',
    film_title: 'Leonor Will Never Die',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    venue_name: "Cinema '76 Microcinema",
    city: 'San Juan, Metro Manila',
    showtime: 'Today • 7:30 PM',
    ticket_status: 'now_showing',
    ticket_url: 'https://cinema76.com',
  },
  {
    id: 'sc-2',
    film_id: 'cccccccc-0001-0000-0000-000000000000',
    film_title: 'Himala (4K Restored)',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
    venue_name: 'Cinematheque Centre Manila (FDCP)',
    city: 'Ermita, Manila',
    showtime: 'Tomorrow • 5:00 PM',
    ticket_status: 'now_showing',
    ticket_url: 'https://fdcp.ph/cinematheque',
  },
  {
    id: 'sc-3',
    film_id: 'cccccccc-0005-0000-0000-000000000000',
    film_title: 'Cleaners',
    poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    venue_name: 'Gateway Cineplex Premiere Lounge',
    city: 'Quezon City',
    showtime: 'Saturday • 8:15 PM',
    ticket_status: 'advance_tickets',
    ticket_url: 'https://gatewaycineplex.com',
  },
  {
    id: 'sc-4',
    film_id: 'cccccccc-0002-0000-0000-000000000000',
    film_title: 'Maynila sa mga Kuko ng Liwanag',
    poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80',
    venue_name: 'UP Film Institute (Cine Adarna)',
    city: 'Diliman, Quezon City',
    showtime: 'Sunday • 4:00 PM',
    ticket_status: 'advance_tickets',
    ticket_url: 'https://filminstitute.upd.edu.ph',
  },
];

const SEED_PEOPLE: SearchPersonItem[] = [
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000000',
    name: 'Ishmael Bernal',
    slug: 'ishmael-bernal',
    role_type: 'Director',
    birth_year: 1938,
    is_verified: true,
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    film_credits_summary: 'Himala, Manila by Night, Relasyon',
  },
  {
    id: 'aaaaaaaa-0002-0000-0000-000000000000',
    name: 'Lino Brocka',
    slug: 'lino-brocka',
    role_type: 'Director',
    birth_year: 1939,
    is_verified: true,
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    film_credits_summary: 'Maynila sa mga Kuko ng Liwanag, Insiang',
  },
  {
    id: 'aaaaaaaa-0004-0000-0000-000000000000',
    name: 'Martika Ramirez Escobar',
    slug: 'martika-escobar',
    role_type: 'Director & Cinematographer',
    birth_year: 1992,
    is_verified: true,
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    film_credits_summary: 'Leonor Will Never Die, Pusong Bato',
  },
  {
    id: 'aaaaaaaa-0007-0000-0000-000000000000',
    name: 'Nora Aunor',
    slug: 'nora-aunor',
    role_type: 'Actor (National Artist)',
    birth_year: 1953,
    is_verified: true,
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
    film_credits_summary: 'Himala, Tatlong Taong Walang Diyos, Bona',
  },
];

// ==============================================================================
// DISCOVERY CAROUSELS API
// ==============================================================================

export async function fetchDiscoverySections(): Promise<DiscoveryCuratedSections> {
  try {
    // Attempt Supabase fetch
    const { data: filmsData } = await supabase
      .from('films')
      .select(`
        id,
        title,
        original_title,
        slug,
        release_date,
        runtime_minutes,
        language,
        mtrcb_rating,
        poster_url,
        backdrop_url,
        is_classic,
        film_genres ( genres ( name ) ),
        film_credits ( role, people ( name ) )
      `)
      .limit(10);

    if (filmsData && filmsData.length > 0) {
      const mappedFilms: SearchFilmItem[] = filmsData.map((f) => {
        const directorCredit = (f.film_credits as any[])?.find((c) =>
          c.role?.toLowerCase().includes('director')
        );
        const genres = (f.film_genres as any[])?.map((g) => g.genres?.name).filter(Boolean) || [
          'Philippine Cinema',
        ];

        return {
          id: f.id,
          title: f.title,
          original_title: f.original_title,
          slug: f.slug,
          release_year: f.release_date ? new Date(f.release_date).getFullYear() : 2022,
          runtime_minutes: f.runtime_minutes,
          language: f.language || 'Filipino',
          mtrcb_rating: f.mtrcb_rating || 'PG',
          poster_url: f.poster_url || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
          backdrop_url: f.backdrop_url,
          director: directorCredit?.people?.name || 'Filipino Director',
          genres,
          critic_score: 94,
          audience_score: 90,
          is_classic: Boolean(f.is_classic),
          streaming_platforms: ['iWantTFC', 'Netflix PH'],
        };
      });

      return {
        trendingFilms: mappedFilms,
        awardWinners: mappedFilms.filter((f) => f.is_classic || f.critic_score! >= 95),
        nowShowing: SEED_SCREENINGS,
      };
    }

    return {
      trendingFilms: SEED_SEARCH_FILMS,
      awardWinners: [SEED_SEARCH_FILMS[0], SEED_SEARCH_FILMS[1], SEED_SEARCH_FILMS[2]],
      nowShowing: SEED_SCREENINGS,
    };
  } catch (e) {
    return {
      trendingFilms: SEED_SEARCH_FILMS,
      awardWinners: [SEED_SEARCH_FILMS[0], SEED_SEARCH_FILMS[1], SEED_SEARCH_FILMS[2]],
      nowShowing: SEED_SCREENINGS,
    };
  }
}

// ==============================================================================
// INSTANT SEARCH WITH MULTI-ENTITY AND FILTERING API
// ==============================================================================

export async function searchEntitiesAndFilms(
  searchQuery: string,
  filters: SearchFilterState
): Promise<SearchResultsResponse> {
  const q = searchQuery.trim().toLowerCase();

  try {
    // 1. Query Films from Supabase if online
    let query = supabase.from('films').select(`
      id,
      title,
      original_title,
      slug,
      release_date,
      runtime_minutes,
      language,
      mtrcb_rating,
      poster_url,
      backdrop_url,
      is_classic,
      film_genres ( genres ( name ) ),
      film_credits ( role, people ( name ) )
    `);

    if (q) {
      query = query.or(`title.ilike.%${q}%,original_title.ilike.%${q}%,synopsis.ilike.%${q}%`);
    }

    const { data: filmsData } = await query.limit(20);

    let films: SearchFilmItem[] = [];

    if (filmsData && filmsData.length > 0) {
      films = filmsData.map((f) => {
        const directorCredit = (f.film_credits as any[])?.find((c) =>
          c.role?.toLowerCase().includes('director')
        );
        const genres = (f.film_genres as any[])?.map((g) => g.genres?.name).filter(Boolean) || [
          'Philippine Cinema',
        ];

        return {
          id: f.id,
          title: f.title,
          original_title: f.original_title,
          slug: f.slug,
          release_year: f.release_date ? new Date(f.release_date).getFullYear() : 2022,
          runtime_minutes: f.runtime_minutes,
          language: f.language || 'Filipino',
          mtrcb_rating: f.mtrcb_rating || 'PG',
          poster_url: f.poster_url || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
          backdrop_url: f.backdrop_url,
          director: directorCredit?.people?.name || 'Filipino Director',
          genres,
          critic_score: 93,
          audience_score: 89,
          is_classic: Boolean(f.is_classic),
          streaming_platforms: ['Netflix Philippines', 'iWantTFC'],
        };
      });
    } else {
      // Fallback matching
      films = SEED_SEARCH_FILMS.filter((f) => {
        if (!q) return true;
        return (
          f.title.toLowerCase().includes(q) ||
          f.original_title?.toLowerCase().includes(q) ||
          f.director.toLowerCase().includes(q) ||
          f.genres.some((g) => g.toLowerCase().includes(q))
        );
      });
    }

    // 2. Apply In-Memory Filters (Genres, Decade, Streaming, Rating)
    if (filters.genre) {
      const gTarget = filters.genre.toLowerCase();
      films = films.filter((f) =>
        f.genres.some((g) => g.toLowerCase().includes(gTarget))
      );
    }

    if (filters.decade) {
      if (filters.decade === 'classics') {
        films = films.filter((f) => f.release_year < 2000 || f.is_classic);
      } else if (filters.decade === '2010s') {
        films = films.filter((f) => f.release_year >= 2010 && f.release_year <= 2019);
      } else if (filters.decade === '2020s') {
        films = films.filter((f) => f.release_year >= 2020 && f.release_year <= 2025);
      } else if (filters.decade === '2026') {
        films = films.filter((f) => f.release_year >= 2026);
      }
    }

    if (filters.streamingPlatform && filters.streamingPlatform !== 'all') {
      const pTarget = filters.streamingPlatform.toLowerCase();
      films = films.filter((f) =>
        f.streaming_platforms?.some((p) => p.toLowerCase().includes(pTarget))
      );
    }

    if (filters.minRating) {
      films = films.filter(
        (f) =>
          (f.critic_score && f.critic_score >= filters.minRating!) ||
          (f.audience_score && f.audience_score >= filters.minRating!)
      );
    }

    // 3. Sort Results
    if (filters.sortBy === 'rating') {
      films.sort((a, b) => (b.critic_score || 0) - (a.critic_score || 0));
    } else if (filters.sortBy === 'year') {
      films.sort((a, b) => b.release_year - a.release_year);
    } else if (filters.sortBy === 'title') {
      films.sort((a, b) => a.title.localeCompare(b.title));
    }

    // 4. Query Matching People (Cast/Crew)
    let people: SearchPersonItem[] = [];
    if (q) {
      people = SEED_PEOPLE.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.film_credits_summary?.toLowerCase().includes(q)
      );
    }

    // 5. Query Matching Screenings
    let screenings: SearchScreeningItem[] = [];
    if (q) {
      screenings = SEED_SCREENINGS.filter((s) =>
        s.film_title.toLowerCase().includes(q) ||
        s.venue_name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      );
    }

    return {
      films,
      people,
      screenings,
      totalFilmsCount: films.length,
    };
  } catch (err) {
    console.warn('Search API failed, using fallback:', err);
    return {
      films: SEED_SEARCH_FILMS,
      people: SEED_PEOPLE,
      screenings: SEED_SCREENINGS,
      totalFilmsCount: SEED_SEARCH_FILMS.length,
    };
  }
}

