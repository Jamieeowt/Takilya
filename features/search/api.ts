import { supabase } from '@/lib/supabase';
import {
  SearchFilterState,
  BrowseFilterState,
  SearchResultsResponse,
  DiscoveryCuratedSections,
  SearchFilmItem,
  SearchPersonItem,
  SearchStudioItem,
  SearchFestivalItem,
  SearchScreeningItem,
  BrowseFilmCard,
} from './types';

// ==============================================================================
// 1. SEED CATALOG (Philippine Cinema Only - Strict AGENTS.md Rules)
// ==============================================================================

export const SEED_SEARCH_FILMS: SearchFilmItem[] = [
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
    mtrcb_rating: 'PG-13',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
    director: 'Glenn Barit',
    genres: ['Coming-of-Age', 'Indie', 'Comedy'],
    critic_score: 95,
    audience_score: 91,
    synopsis: 'High school students in Tuguegarao navigate peer pressures, elections, and taboos, printed entirely on photocopied paper.',
    is_classic: false,
    streaming_platforms: ['JuanFlix / FDCP'],
    screening_info: 'QCinema Best Film Winner',
  },
  {
    id: 'cccccccc-0006-0000-0000-000000000000',
    title: 'BuyBust',
    original_title: 'BuyBust',
    slug: 'buybust',
    release_year: 2018,
    runtime_minutes: 127,
    language: 'Filipino',
    mtrcb_rating: 'R-16',
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    director: 'Erik Matti',
    genres: ['Action', 'Thriller'],
    critic_score: 88,
    audience_score: 83,
    synopsis: 'An elite anti-narcotics squad is trapped inside a labyrinthine Manila slum during a botched drug raid.',
    is_classic: false,
    streaming_platforms: ['Netflix Philippines'],
  },
  {
    id: 'cccccccc-0007-0000-0000-000000000000',
    title: 'On the Job',
    original_title: 'On the Job',
    slug: 'on-the-job',
    release_year: 2013,
    runtime_minutes: 121,
    language: 'Filipino',
    mtrcb_rating: 'R-16',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
    director: 'Erik Matti',
    genres: ['Action', 'Crime', 'Thriller'],
    critic_score: 94,
    audience_score: 90,
    synopsis: 'Inmates are temporarily released from prison to conduct state-sponsored political assassinations.',
    is_classic: false,
    streaming_platforms: ['Netflix Philippines', 'iWantTFC'],
  },
  {
    id: 'cccccccc-0008-0000-0000-000000000000',
    title: 'Oda sa Wala',
    original_title: 'Oda sa Wala',
    slug: 'oda-sa-wala',
    release_year: 2018,
    runtime_minutes: 92,
    language: 'Tagalog',
    mtrcb_rating: 'PG-13',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    director: 'Dwein Baltazar',
    genres: ['Drama', 'Indie'],
    critic_score: 97,
    audience_score: 86,
    synopsis: 'An isolated embalmer finds purpose and surreal companionship when an unclaimed corpse arrives at her morgue.',
    is_classic: false,
  },
];

export const SEED_PEOPLE: SearchPersonItem[] = [
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000000',
    name: 'Ishmael Bernal',
    slug: 'ishmael-bernal',
    role_type: 'Director',
    birth_year: 1938,
    is_verified: true,
    film_credits_summary: 'Himala, Manila By Night, Relasyon',
    followers_count: 5800,
  },
  {
    id: 'aaaaaaaa-0002-0000-0000-000000000000',
    name: 'Lino Brocka',
    slug: 'lino-brocka',
    role_type: 'Director',
    birth_year: 1939,
    is_verified: true,
    film_credits_summary: 'Maynila sa mga Kuko ng Liwanag, Insiang, Tinimbang Ka Ngunit Kulang',
    followers_count: 8200,
  },
  {
    id: 'aaaaaaaa-0003-0000-0000-000000000000',
    name: 'Nora Aunor',
    slug: 'nora-aunor',
    role_type: 'Actor',
    birth_year: 1953,
    is_verified: true,
    film_credits_summary: 'Himala, Bona, Tatlong Taong Walang Diyos',
    followers_count: 14200,
  },
  {
    id: 'aaaaaaaa-0004-0000-0000-000000000000',
    name: 'Martika Ramirez Escobar',
    slug: 'martika-ramirez-escobar',
    role_type: 'Director',
    birth_year: 1992,
    is_verified: true,
    film_credits_summary: 'Leonor Will Never Die, Pusong Bato',
    followers_count: 3900,
  },
  {
    id: 'aaaaaaaa-0005-0000-0000-000000000000',
    name: 'Dolly de Leon',
    slug: 'dolly-de-leon',
    role_type: 'Actor',
    birth_year: 1969,
    is_verified: true,
    film_credits_summary: 'Triangle of Sadness, Verdict, Keys to the Heart',
    followers_count: 9100,
  },
  {
    id: 'aaaaaaaa-0006-0000-0000-000000000000',
    name: 'Lav Diaz',
    slug: 'lav-diaz',
    role_type: 'Director',
    birth_year: 1958,
    is_verified: true,
    film_credits_summary: 'Norte The End of History, Ang Babaeng Humayo, Melancholia',
    followers_count: 6700,
  },
];

export const SEED_STUDIOS: SearchStudioItem[] = [
  {
    id: '44444444-0001-0000-0000-000000000000',
    name: 'TBA Studios',
    slug: 'tba-studios',
    founded_year: 2014,
    verification_status: 'verified',
    is_verified: true,
    followers_count: 6200,
    films_count: 18,
  },
  {
    id: '44444444-0002-0000-0000-000000000000',
    name: 'Black Sheep',
    slug: 'black-sheep',
    founded_year: 2018,
    verification_status: 'verified',
    is_verified: true,
    followers_count: 4800,
    films_count: 12,
  },
  {
    id: '44444444-0003-0000-0000-000000000000',
    name: 'Epicmedia Productions',
    slug: 'epicmedia',
    founded_year: 2013,
    verification_status: 'verified',
    is_verified: true,
    followers_count: 3400,
    films_count: 8,
  },
  {
    id: '44444444-0004-0000-0000-000000000000',
    name: 'Star Cinema',
    slug: 'star-cinema',
    founded_year: 1993,
    verification_status: 'verified',
    is_verified: true,
    followers_count: 28000,
    films_count: 140,
  },
];

export const SEED_FESTIVALS: SearchFestivalItem[] = [
  {
    id: 'dddddddd-0001-0000-0000-000000000000',
    name: 'Cinemalaya Philippine Independent Film Festival',
    slug: 'cinemalaya',
    location: 'Cultural Center of the Philippines, Manila',
    founded_year: 2005,
    verification_status: 'verified',
    is_verified: true,
    followers_count: 18500,
  },
  {
    id: 'dddddddd-0002-0000-0000-000000000000',
    name: 'QCinema International Film Festival',
    slug: 'qcinema',
    location: 'Quezon City',
    founded_year: 2013,
    verification_status: 'verified',
    is_verified: true,
    followers_count: 14200,
  },
  {
    id: 'dddddddd-0003-0000-0000-000000000000',
    name: 'Cinema Rehiyon',
    slug: 'cinema-rehiyon',
    location: 'Nationwide Regional Hubs',
    founded_year: 2009,
    verification_status: 'verified',
    is_verified: true,
    followers_count: 7100,
  },
  {
    id: 'dddddddd-0004-0000-0000-000000000000',
    name: 'Metro Manila Film Festival (MMFF)',
    slug: 'mmff',
    location: 'Metro Manila',
    founded_year: 1975,
    verification_status: 'verified',
    is_verified: true,
    followers_count: 31000,
  },
];

export const SEED_SCREENINGS: SearchScreeningItem[] = [
  {
    id: 'sc-01',
    film_id: 'cccccccc-0001-0000-0000-000000000000',
    film_title: 'Himala',
    venue_name: 'Cinematheque Centre Manila',
    city: 'Ermita, Manila',
    showtime: 'Today • 6:00 PM',
    ticket_status: 'now_showing',
  },
  {
    id: 'sc-02',
    film_id: 'cccccccc-0003-0000-0000-000000000000',
    film_title: 'Leonor Will Never Die',
    venue_name: 'Cinema 76 Film Society',
    city: 'Tomas Morato, Quezon City',
    showtime: 'Tomorrow • 7:30 PM',
    ticket_status: 'advance_tickets',
  },
];

// ==============================================================================
// 2. DISCOVERY CURATED SECTIONS
// ==============================================================================

export async function fetchDiscoveryCuratedSections(): Promise<DiscoveryCuratedSections> {
  return {
    trendingFilms: SEED_SEARCH_FILMS.slice(0, 4),
    awardWinners: [SEED_SEARCH_FILMS[0], SEED_SEARCH_FILMS[1], SEED_SEARCH_FILMS[2]],
    nowShowing: SEED_SCREENINGS,
  };
}

export const fetchDiscoverySections = fetchDiscoveryCuratedSections;

// ==============================================================================
// 3. FULL-TEXT MULTI-ENTITY SEARCH (PostgreSQL FTS + GIN with Fallback)
// ==============================================================================

export async function searchEntitiesAndFilms(
  searchQuery: string,
  filters: SearchFilterState
): Promise<SearchResultsResponse> {
  const q = searchQuery.trim().toLowerCase();

  try {
    // 1. Query Films with Full-Text or Substring Search
    let filmsQuery = supabase.from('films').select(`
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
      filmsQuery = filmsQuery.or(
        `title.ilike.%${q}%,original_title.ilike.%${q}%,synopsis.ilike.%${q}%`
      );
    }

    const { data: filmsData } = await filmsQuery.limit(20);

    let films: SearchFilmItem[] = [];

    if (filmsData && filmsData.length > 0) {
      films = filmsData.map((f: any) => {
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

    // Apply Filter State on Films (Genre, Decade, Streaming, Rating)
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
      }
    }

    if (filters.minRating) {
      films = films.filter(
        (f) =>
          (f.critic_score && f.critic_score >= filters.minRating!) ||
          (f.audience_score && f.audience_score >= filters.minRating!)
      );
    }

    if (filters.sortBy === 'rating') {
      films.sort((a, b) => (b.critic_score || 0) - (a.critic_score || 0));
    } else if (filters.sortBy === 'year') {
      films.sort((a, b) => b.release_year - a.release_year);
    } else if (filters.sortBy === 'title') {
      films.sort((a, b) => a.title.localeCompare(b.title));
    }

    // 2. Query People (Directors & Actors)
    let people: SearchPersonItem[] = [];
    if (q) {
      const { data: peopleData } = await supabase
        .from('people')
        .select('id, name, slug, role_type, photo_url, birth_year, verification_status')
        .or(`name.ilike.%${q}%,bio.ilike.%${q}%`)
        .limit(10);

      if (peopleData && peopleData.length > 0) {
        people = peopleData.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          role_type: p.role_type || 'Filmmaker',
          photo_url: p.photo_url,
          birth_year: p.birth_year,
          is_verified: p.verification_status === 'verified',
        }));
      } else {
        people = SEED_PEOPLE.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.film_credits_summary?.toLowerCase().includes(q)
        );
      }
    }

    // 3. Query Studios
    let studios: SearchStudioItem[] = [];
    if (q) {
      const { data: studioData } = await supabase
        .from('studios')
        .select('id, name, slug, logo_url, founded_year, verification_status')
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(8);

      if (studioData && studioData.length > 0) {
        studios = studioData.map((s: any) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          logo_url: s.logo_url,
          founded_year: s.founded_year,
          verification_status: s.verification_status || 'unverified',
          is_verified: s.verification_status === 'verified',
          followers_count: 3200,
        }));
      } else {
        studios = SEED_STUDIOS.filter((s) => s.name.toLowerCase().includes(q));
      }
    }

    // 4. Query Festivals
    let festivals: SearchFestivalItem[] = [];
    if (q) {
      const { data: festData } = await supabase
        .from('festivals')
        .select('id, name, slug, banner_url, location, founded_year, verification_status')
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(8);

      if (festData && festData.length > 0) {
        festivals = festData.map((fest: any) => ({
          id: fest.id,
          name: fest.name,
          slug: fest.slug,
          banner_url: fest.banner_url,
          location: fest.location,
          founded_year: fest.founded_year,
          verification_status: fest.verification_status || 'unverified',
          is_verified: fest.verification_status === 'verified',
          followers_count: 8500,
        }));
      } else {
        festivals = SEED_FESTIVALS.filter((fest) => fest.name.toLowerCase().includes(q));
      }
    }

    const totalCount = films.length + people.length + studios.length + festivals.length;

    return {
      films,
      people,
      studios,
      festivals,
      screenings: q ? SEED_SCREENINGS.filter((s) => s.film_title.toLowerCase().includes(q)) : [],
      totalFilmsCount: films.length,
      totalCount,
    };
  } catch (err) {
    console.warn('Search API fallback:', err);
    const filteredFilms = SEED_SEARCH_FILMS.filter((f) => {
      if (!q) return true;
      return f.title.toLowerCase().includes(q) || f.director.toLowerCase().includes(q);
    });
    return {
      films: filteredFilms,
      people: SEED_PEOPLE.filter((p) => p.name.toLowerCase().includes(q)),
      studios: SEED_STUDIOS.filter((s) => s.name.toLowerCase().includes(q)),
      festivals: SEED_FESTIVALS.filter((fest) => fest.name.toLowerCase().includes(q)),
      screenings: [],
      totalFilmsCount: filteredFilms.length,
      totalCount: filteredFilms.length,
    };
  }
}

// ==============================================================================
// 4. MULTI-FACET BROWSE BY GENRE & TAGS API (Letterboxd-style Catalog)
// ==============================================================================

export async function fetchBrowseFilms(filters: BrowseFilterState): Promise<BrowseFilmCard[]> {
  try {
    let query = supabase.from('films').select(`
      id,
      title,
      original_title,
      slug,
      release_date,
      language,
      poster_url,
      is_classic,
      film_genres ( genres ( name, slug ) ),
      film_tags ( tags ( slug, name ) ),
      film_credits ( role, people ( name ) ),
      award_recognitions ( status, award_categories ( award_bodies ( scope, name ) ) )
    `);

    // Decade filter
    if (filters.decade && filters.decade !== 'all') {
      const match = filters.decade.match(/^(\d{4})s$/);
      if (match) {
        const startYear = parseInt(match[1], 10);
        const endYear = startYear + 9;
        query = query
          .gte('release_date', `${startYear}-01-01`)
          .lte('release_date', `${endYear}-12-31`);
      }
    }

    // Language filter
    if (filters.language && filters.language !== 'all') {
      query = query.ilike('language', `%${filters.language}%`);
    }

    const { data: dbRows, error } = await query.limit(60);

    let films: BrowseFilmCard[] = [];

    if (!error && dbRows && dbRows.length > 0) {
      films = dbRows.map((row: any) => {
        const releaseYear = row.release_date ? new Date(row.release_date).getFullYear() : 2020;
        const directorCredit = (row.film_credits as any[])?.find((c) =>
          c.role?.toLowerCase().includes('director')
        );
        const genres = (row.film_genres as any[])?.map((g) => g.genres?.name).filter(Boolean) || [
          'Philippine Film',
        ];
        const tags = (row.film_tags as any[])?.map((t) => t.tags?.slug).filter(Boolean) || [];
        const recognitions = (row.award_recognitions as any[]) || [];
        const hasWon = recognitions.some((r) => r.status === 'won');

        return {
          id: row.id,
          title: row.title,
          original_title: row.original_title,
          slug: row.slug,
          release_year: releaseYear,
          poster_url: row.poster_url || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
          director: directorCredit?.people?.name || 'Filipino Director',
          language: row.language || 'Filipino',
          genres,
          tags,
          critic_score: 91,
          audience_score: 87,
          award_count: recognitions.length,
          has_won_award: hasWon,
          is_classic: Boolean(row.is_classic),
        };
      });
    } else {
      // Fallback
      films = SEED_SEARCH_FILMS.map((s) => ({
        id: s.id,
        title: s.title,
        original_title: s.original_title,
        slug: s.slug,
        release_year: s.release_year,
        poster_url: s.poster_url,
        director: s.director,
        language: s.language,
        genres: s.genres,
        tags: s.genres.map((g) => g.toLowerCase().replace(/\s+/g, '-')),
        critic_score: s.critic_score,
        audience_score: s.audience_score,
        award_count: 2,
        has_won_award: true,
        is_classic: s.is_classic,
      }));
    }

    // Apply client-side combinable filters
    if (filters.genre && filters.genre !== 'All' && filters.genre !== 'all') {
      const gTarget = filters.genre.toLowerCase();
      films = films.filter((f) =>
        f.genres.some((g) => g.toLowerCase().includes(gTarget))
      );
    }

    if (filters.tag && filters.tag !== 'All' && filters.tag !== 'all') {
      const tTarget = filters.tag.toLowerCase();
      films = films.filter((f) =>
        f.tags.some((t) => t.toLowerCase().includes(tTarget))
      );
    }

    if (filters.awardScope && filters.awardScope !== 'all') {
      if (filters.awardScope === 'won') {
        films = films.filter((f) => f.has_won_award);
      }
    }

    // Sorting
    if (filters.sortBy === 'rating') {
      films.sort((a, b) => (b.critic_score || 0) - (a.critic_score || 0));
    } else if (filters.sortBy === 'year') {
      films.sort((a, b) => b.release_year - a.release_year);
    } else if (filters.sortBy === 'title') {
      films.sort((a, b) => a.title.localeCompare(b.title));
    }

    return films;
  } catch (err) {
    console.warn('[Takilya Browse API] fetchBrowseFilms error:', err);
    return SEED_SEARCH_FILMS.map((s) => ({
      id: s.id,
      title: s.title,
      original_title: s.original_title,
      slug: s.slug,
      release_year: s.release_year,
      poster_url: s.poster_url,
      director: s.director,
      language: s.language,
      genres: s.genres,
      tags: ['indie', 'regional-cinema'],
      critic_score: s.critic_score,
      audience_score: s.audience_score,
      award_count: 2,
      has_won_award: true,
      is_classic: s.is_classic,
    }));
  }
}
