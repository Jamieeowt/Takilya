import { supabase } from '@/lib/supabase';
import {
  ExploreSectionsData,
  ExploreFilterState,
  ExploreFilmCard,
  SearchEntityResult,
  FeaturedTodayHero,
  NationalArtistMasterwork,
  CinemalayaEditionGroup,
  RestoredClassicItem,
} from './types';

// ==============================================================================
// SEED & FALLBACK CATALOG (Guarantees rich display even if offline/sandbox)
// ==============================================================================

const SEED_FILMS: ExploreFilmCard[] = [
  {
    id: 'cccccccc-0001-0000-0000-000000000000',
    title: 'Himala',
    original_title: 'Himala',
    slug: 'himala',
    synopsis:
      'In a drought-stricken rural town, a young provincial woman named Elsa claims to have witnessed an apparition of the Virgin Mary, setting off a nationwide wave of fanaticism, commerce, and tragedy.',
    release_year: 1982,
    release_date: '1982-12-25',
    runtime_minutes: 124,
    language: 'Filipino',
    mtrcb_rating: 'PG',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
    director: 'Ishmael Bernal',
    studio_name: 'Experimental Cinema of the Philippines',
    genres: ['Drama', 'Social Realism'],
    tags: ['restored-heritage', 'national-artist-masterwork'],
    is_classic: true,
    critic_score: 98,
    audience_score: 95,
    ratings_count: 2850,
    trending_rank: 3,
    badge_label: 'National Artist Masterwork',
  },
  {
    id: 'cccccccc-0002-0000-0000-000000000000',
    title: 'Maynila sa mga Kuko ng Liwanag',
    original_title: 'Maynila sa mga Kuko ng Liwanag',
    slug: 'maynila-sa-mga-kuko-ng-liwanag',
    synopsis:
      'Julio, a naive fisherman from Marinduque, navigates the cruel alleys of Manila searching for his lost childhood sweetheart Ligaya, uncovering exploitation across construction sites and Chinatown.',
    release_year: 1975,
    release_date: '1975-07-16',
    runtime_minutes: 125,
    language: 'Filipino',
    mtrcb_rating: 'R-16',
    poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1200&auto=format&fit=crop&q=80',
    director: 'Lino Brocka',
    studio_name: 'Cinema Artists Philippines',
    genres: ['Drama', 'Social Realism'],
    tags: ['social-realism', 'national-artist-masterwork', 'restored-heritage'],
    is_classic: true,
    critic_score: 99,
    audience_score: 94,
    ratings_count: 3100,
    trending_rank: 5,
    badge_label: 'Cannes Classic',
  },
  {
    id: 'cccccccc-0003-0000-0000-000000000000',
    title: 'Leonor Will Never Die',
    original_title: 'Ang Pagbabalik ng Kwago',
    slug: 'leonor-will-never-die',
    synopsis:
      'A retired action filmmaker falls into a coma when a television falls on her head, transporting her inside her own unfinished 1980s action screenplay where she fights to save her protagonist.',
    release_year: 2022,
    release_date: '2022-01-21',
    runtime_minutes: 99,
    language: 'Filipino',
    mtrcb_rating: 'PG',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&auto=format&fit=crop&q=80',
    director: 'Martika Ramirez Escobar',
    studio_name: 'Anima Studios',
    genres: ['Meta-Comedy', 'Action', 'Drama'],
    tags: ['indie', 'qcinema-selection', 'sundance-winner'],
    is_classic: false,
    critic_score: 96,
    audience_score: 89,
    ratings_count: 1420,
    trending_rank: 1,
    badge_label: 'Sundance Jury Prize',
    promoted: true,
    sponsor_name: 'QCinema Autumn Re-Release',
  },
  {
    id: 'cccccccc-0004-0000-0000-000000000000',
    title: 'John Denver Trending',
    original_title: 'John Denver Trending',
    slug: 'john-denver-trending',
    synopsis:
      'A 14-year-old junior high student in Antique is falsely accused of stealing an iPad. After a viral video of his retaliation circulates on social media, cyberbullying escalates into an inescapable nightmare.',
    release_year: 2019,
    release_date: '2019-08-01',
    runtime_minutes: 96,
    language: 'Kinaray-a',
    mtrcb_rating: 'PG',
    poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80',
    director: 'Arden Rod Condez',
    studio_name: 'Arkeofilms',
    genres: ['Drama', 'Psychological Thriller'],
    tags: ['indie', 'regional-cinema', 'based-on-true-story', 'cinemalaya-winner'],
    is_classic: false,
    critic_score: 92,
    audience_score: 88,
    ratings_count: 810,
    trending_rank: 4,
    badge_label: 'Cinemalaya Best Film',
  },
  {
    id: 'cccccccc-0005-0000-0000-000000000000',
    title: 'Cleaners',
    original_title: 'Cleaners',
    slug: 'cleaners',
    synopsis:
      'Set in Tuguegarao City in 2004, a series of linked coming-of-age stories follows high school classroom cleaners navigating junior high pressures, entirely rendered in vibrant photocopied paper textures.',
    release_year: 2019,
    release_date: '2019-10-13',
    runtime_minutes: 78,
    language: 'Ilokano',
    mtrcb_rating: 'PG',
    poster_url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80',
    director: 'Glenn Barit',
    studio_name: 'QCinema Productions',
    genres: ['Coming-of-Age', 'Drama', 'Animation'],
    tags: ['indie', 'regional-cinema', 'qcinema-selection'],
    is_classic: false,
    critic_score: 94,
    audience_score: 91,
    ratings_count: 980,
    trending_rank: 2,
    badge_label: 'QCinema Best Film',
  },
  {
    id: 'cccccccc-0006-0000-0000-000000000000',
    title: 'Patay na si Hesus',
    original_title: 'Patay na si Hesus',
    slug: 'patay-na-si-hesus',
    synopsis:
      'A Cebuano single mother drags her three eccentric adult children on an anarchic road trip across Dumaguete to attend the funeral of their estranged father, Hesus.',
    release_year: 2016,
    release_date: '2016-10-14',
    runtime_minutes: 90,
    language: 'Cebuano',
    mtrcb_rating: 'R-13',
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&auto=format&fit=crop&q=80',
    director: 'Victor Villanueva',
    studio_name: 'T-Rex Entertainment',
    genres: ['Comedy', 'Drama'],
    tags: ['indie', 'regional-cinema', 'qcinema-winner'],
    is_classic: false,
    critic_score: 90,
    audience_score: 87,
    ratings_count: 750,
    trending_rank: 6,
    badge_label: 'QCinema Audience Choice',
  },
];

const SEED_NATIONAL_ARTISTS: NationalArtistMasterwork[] = [
  {
    artist_id: 'aaaaaaaa-0001-0000-0000-000000000000',
    artist_name: 'Ishmael Bernal',
    conferment_year: 2001,
    category: 'Cinema',
    citation:
      'Master of social satire, humanism, and sharp feminist drama. Conferred for indelible contributions including Himala and City After Dark.',
    film: SEED_FILMS[0],
  },
  {
    artist_id: 'aaaaaaaa-0002-0000-0000-000000000000',
    artist_name: 'Lino Brocka',
    conferment_year: 1997,
    category: 'Cinema',
    citation:
      'Champion of free expression and militant social realism, exposing the plight of urban working classes with international acclaim at Cannes.',
    film: SEED_FILMS[1],
  },
];

const SEED_CINEMALAYA: CinemalayaEditionGroup[] = [
  {
    edition_id: 'eeeeeeee-0001-0000-0000-000000000000',
    edition_name: 'Cinemalaya 15',
    year: 2019,
    theme: 'Ikalabing-limang Yugto',
    films: [SEED_FILMS[3]], // John Denver Trending
  },
  {
    edition_id: 'eeeeeeee-0003-0000-0000-000000000000',
    edition_name: 'Cinemalaya 18',
    year: 2022,
    theme: 'Breaking Through the Noise',
    films: [
      {
        id: 'cccccccc-0007-0000-0000-000000000000',
        title: 'The Baseball Player',
        original_title: 'The Baseball Player',
        slug: 'the-baseball-player',
        synopsis:
          'A 17-year-old Moro child soldier in Maguindanao dreams of becoming a baseball player amidst escalating conflict and personal trauma.',
        release_year: 2022,
        release_date: '2022-08-05',
        runtime_minutes: 104,
        language: 'Maguindanaon',
        mtrcb_rating: 'PG',
        poster_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
        backdrop_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&auto=format&fit=crop&q=80',
        director: 'Carlo Obispo',
        studio_name: 'Cinemalaya Productions',
        genres: ['Drama', 'War'],
        tags: ['indie', 'regional-cinema', 'cinemalaya-winner'],
        is_classic: false,
        critic_score: 93,
        audience_score: 89,
        ratings_count: 520,
        badge_label: 'Best Film Winner',
      },
    ],
  },
];

const SEED_RESTORED: RestoredClassicItem[] = [
  {
    id: 'res-1',
    film: SEED_FILMS[0], // Himala
    status: 'restored',
    restoring_body: 'ABS-CBN Film Restoration (Sagip Pelikula) & Central Digital Lab',
    restoration_year: 2012,
    archive_location: 'ABS-CBN Film Archives, Quezon City',
  },
  {
    id: 'res-2',
    film: SEED_FILMS[1], // Maynila sa mga Kuko ng Liwanag
    status: 'restored',
    restoring_body: "The Film Foundation World Cinema Project / Cineteca di Bologna (L'Immagine Ritrovata)",
    restoration_year: 2013,
    archive_location: 'Bologna, Italy & FDCP National Film Archive',
  },
];

const SEED_FEATURED: FeaturedTodayHero = {
  film: SEED_FILMS[2], // Leonor Will Never Die
  is_promoted: true,
  sponsor_name: 'QCinema Autumn Re-Release',
  headline: 'Sundance Special Jury Prize Winner',
  curator_note:
    'Martika Ramirez Escobar’s genre-defying love letter to 80s Pinoy action cinema and the transcendent power of storytelling.',
};

// ==============================================================================
// 1. FETCH CURATED EXPLORE SECTIONS
// ==============================================================================

export async function fetchExploreSections(): Promise<ExploreSectionsData> {
  try {
    // Attempt real database fetch
    const [filmsRes, nationalRes, restoredRes, promotedRes] = await Promise.all([
      supabase
        .from('films')
        .select(`
          id,
          title,
          original_title,
          slug,
          synopsis,
          release_date,
          runtime_minutes,
          language,
          mtrcb_rating,
          poster_url,
          backdrop_url,
          is_classic,
          studios ( name ),
          film_genres ( genres ( name ) ),
          film_tags ( tags ( slug ) ),
          film_credits ( role, people ( name ) )
        `)
        .order('release_date', { ascending: false }),

      supabase
        .from('national_artists')
        .select(`
          person_id,
          year_conferred,
          category,
          citation,
          people (
            id,
            name,
            film_credits (
              film_id
            )
          )
        `),

      supabase
        .from('preservation_records')
        .select(`
          id,
          film_id,
          status,
          restoring_body,
          restoration_year,
          archive_location
        `)
        .eq('status', 'restored'),

      supabase
        .from('promoted_slots')
        .select(`
          id,
          film_id,
          sponsor_name,
          is_active
        `)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle(),
    ]);

    if (!filmsRes.data || filmsRes.data.length === 0) {
      // Use rich fallback data
      return {
        featured: SEED_FEATURED,
        nationalArtists: SEED_NATIONAL_ARTISTS,
        cinemalaya: SEED_CINEMALAYA,
        restoredClassics: SEED_RESTORED,
        regionalSpotlight: SEED_FILMS.filter((f) => f.tags.includes('regional-cinema') || f.language !== 'Filipino'),
        trendingThisWeek: [...SEED_FILMS].sort((a, b) => (b.ratings_count || 0) - (a.ratings_count || 0)),
      };
    }

    // Map database films
    const dbFilms: ExploreFilmCard[] = filmsRes.data.map((row: any) => {
      const year = row.release_date ? new Date(row.release_date).getFullYear() : 2020;
      const directorCredit = row.film_credits?.find((c: any) => c.role === 'director');
      const directorName = directorCredit?.people?.name || 'Filipino Director';
      const genres = row.film_genres?.map((g: any) => g.genres?.name).filter(Boolean) || ['Drama'];
      const tags = row.film_tags?.map((t: any) => t.tags?.slug).filter(Boolean) || [];

      // Find matching seed for scores/posters if missing
      const matchSeed = SEED_FILMS.find((s) => s.slug === row.slug || s.title.toLowerCase() === row.title.toLowerCase());

      return {
        id: row.id,
        title: row.title,
        original_title: row.original_title,
        slug: row.slug,
        synopsis: row.synopsis,
        release_year: year,
        release_date: row.release_date,
        runtime_minutes: row.runtime_minutes,
        language: row.language || 'Filipino',
        mtrcb_rating: row.mtrcb_rating || 'PG',
        poster_url: row.poster_url || matchSeed?.poster_url || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
        backdrop_url: row.backdrop_url || matchSeed?.backdrop_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
        director: directorName,
        studio_name: row.studios?.name || null,
        genres,
        tags,
        is_classic: Boolean(row.is_classic),
        critic_score: matchSeed?.critic_score || 92,
        audience_score: matchSeed?.audience_score || 88,
        ratings_count: matchSeed?.ratings_count || 650,
        badge_label: matchSeed?.badge_label,
        promoted: promotedRes.data?.film_id === row.id,
        sponsor_name: promotedRes.data?.film_id === row.id ? promotedRes.data?.sponsor_name : null,
      };
    });

    // 1. Featured Today
    let featured: FeaturedTodayHero = SEED_FEATURED;
    const promotedFilm = dbFilms.find((f) => f.promoted || f.slug === 'leonor-will-never-die') || dbFilms[0];
    if (promotedFilm) {
      featured = {
        film: promotedFilm,
        is_promoted: Boolean(promotedFilm.promoted),
        sponsor_name: promotedFilm.sponsor_name || 'QCinema Autumn Re-Release',
        headline: promotedFilm.badge_label || 'Editor’s Spotlight Pick',
        curator_note:
          promotedFilm.synopsis.slice(0, 140) + '...',
      };
    }

    // 2. National Artist Masterworks
    const nationalArtists: NationalArtistMasterwork[] = [];
    if (nationalRes.data && nationalRes.data.length > 0) {
      for (const na of nationalRes.data) {
        const personData: any = na.people;
        const person = Array.isArray(personData) ? personData[0] : personData;
        const matchedFilmId = person?.film_credits?.[0]?.film_id;
        const matchedFilm = dbFilms.find((f) => f.id === matchedFilmId) || SEED_FILMS.find((s) => s.director === person?.name);

        if (matchedFilm) {
          nationalArtists.push({
            artist_id: na.person_id,
            artist_name: person?.name || 'National Artist',
            conferment_year: na.year_conferred,
            category: na.category,
            citation: na.citation || 'Conferred National Artist for Cinema.',
            film: matchedFilm,
          });
        }
      }
    }
    if (nationalArtists.length === 0) {
      nationalArtists.push(...SEED_NATIONAL_ARTISTS);
    }

    // 3. Cinemalaya Through the Years
    const cinemalaya: CinemalayaEditionGroup[] = SEED_CINEMALAYA.map((c) => ({
      ...c,
      films: c.films.map((f) => dbFilms.find((df) => df.slug === f.slug) || f),
    }));

    // 4. Restored Classics
    const restoredClassics: RestoredClassicItem[] = [];
    if (restoredRes.data && restoredRes.data.length > 0) {
      for (const r of restoredRes.data) {
        const film = dbFilms.find((f) => f.id === r.film_id) || SEED_FILMS.find((s) => s.id === r.film_id);
        if (film) {
          restoredClassics.push({
            id: r.id,
            film,
            status: r.status,
            restoring_body: r.restoring_body || 'Philippine Film Archive',
            restoration_year: r.restoration_year || 2015,
            archive_location: r.archive_location,
          });
        }
      }
    }
    if (restoredClassics.length === 0) {
      restoredClassics.push(...SEED_RESTORED);
    }

    // 5. Regional Cinema Spotlight (Philippine cinema in regional languages / dialects or tagged regional-cinema)
    const regionalSpotlight = dbFilms.filter(
      (f) =>
        f.tags.includes('regional-cinema') ||
        (f.language && f.language !== 'Filipino' && f.language !== 'Tagalog')
    );

    // 6. Trending This Week (Ranked by ratings count)
    const trendingThisWeek = [...dbFilms]
      .sort((a, b) => (b.ratings_count || 0) - (a.ratings_count || 0))
      .map((f, idx) => ({ ...f, trending_rank: idx + 1 }));

    return {
      featured,
      nationalArtists,
      cinemalaya,
      restoredClassics,
      regionalSpotlight:
        regionalSpotlight.length > 0
          ? regionalSpotlight
          : SEED_FILMS.filter(
              (f) =>
                f.tags.includes('regional-cinema') ||
                (f.language !== 'Filipino' && f.language !== 'Tagalog')
            ),
      trendingThisWeek,
    };
  } catch {
    // Graceful fallback
    return {
      featured: SEED_FEATURED,
      nationalArtists: SEED_NATIONAL_ARTISTS,
      cinemalaya: SEED_CINEMALAYA,
      restoredClassics: SEED_RESTORED,
      regionalSpotlight: SEED_FILMS.filter(
        (f) =>
          f.tags.includes('regional-cinema') ||
          (f.language !== 'Filipino' && f.language !== 'Tagalog')
      ),
      trendingThisWeek: [...SEED_FILMS].sort((a, b) => (b.ratings_count || 0) - (a.ratings_count || 0)),
    };
  }
}

// ==============================================================================
// 2. FETCH FILTERED FILMS
// ==============================================================================

export async function fetchFilteredFilms(filters: ExploreFilterState): Promise<ExploreFilmCard[]> {
  try {
    let query = supabase.from('films').select(`
      id,
      title,
      original_title,
      slug,
      synopsis,
      release_date,
      runtime_minutes,
      language,
      mtrcb_rating,
      poster_url,
      backdrop_url,
      is_classic,
      studios ( name ),
      film_genres ( genres ( name ) ),
      film_tags ( tags ( slug ) ),
      film_credits ( role, people ( name ) )
    `);

    // Decade filter
    if (filters.decade) {
      const decadeMap: Record<string, [string, string]> = {
        '70s': ['1970-01-01', '1979-12-31'],
        '80s': ['1980-01-01', '1989-12-31'],
        '90s': ['1990-01-01', '1999-12-31'],
        '2000s': ['2000-01-01', '2009-12-31'],
        '2010s': ['2010-01-01', '2019-12-31'],
        '2020s': ['2020-01-01', '2029-12-31'],
      };
      const range = decadeMap[filters.decade];
      if (range) {
        query = query.gte('release_date', range[0]).lte('release_date', range[1]);
      }
    }

    // MTRCB rating filter
    if (filters.mtrcb_rating) {
      query = query.eq('mtrcb_rating', filters.mtrcb_rating);
    }

    // Language filter
    if (filters.language) {
      query = query.ilike('language', `%${filters.language}%`);
    }

    const { data } = await query;

    if (!data || data.length === 0) {
      // Filter memory catalogue
      return filterSeedFilms(filters);
    }

    let films: ExploreFilmCard[] = data.map((row: any) => {
      const year = row.release_date ? new Date(row.release_date).getFullYear() : 2020;
      const directorCredit = row.film_credits?.find((c: any) => c.role === 'director');
      const directorName = directorCredit?.people?.name || 'Filipino Director';
      const genres = row.film_genres?.map((g: any) => g.genres?.name).filter(Boolean) || ['Drama'];
      const tags = row.film_tags?.map((t: any) => t.tags?.slug).filter(Boolean) || [];

      const matchSeed = SEED_FILMS.find((s) => s.slug === row.slug || s.title.toLowerCase() === row.title.toLowerCase());

      return {
        id: row.id,
        title: row.title,
        original_title: row.original_title,
        slug: row.slug,
        synopsis: row.synopsis,
        release_year: year,
        release_date: row.release_date,
        runtime_minutes: row.runtime_minutes,
        language: row.language || 'Filipino',
        mtrcb_rating: row.mtrcb_rating || 'PG',
        poster_url: row.poster_url || matchSeed?.poster_url || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
        backdrop_url: row.backdrop_url || matchSeed?.backdrop_url,
        director: directorName,
        studio_name: row.studios?.name || null,
        genres,
        tags,
        is_classic: Boolean(row.is_classic),
        critic_score: matchSeed?.critic_score || 90,
        audience_score: matchSeed?.audience_score || 85,
        ratings_count: matchSeed?.ratings_count || 500,
        badge_label: matchSeed?.badge_label,
      };
    });

    // Tag filter (client/relational check)
    if (filters.tag) {
      const targetTag = filters.tag.toLowerCase();
      films = films.filter((f) => {
        if (targetTag === 'restored') return f.is_classic || f.tags.includes('restored-heritage');
        if (targetTag === 'national-artist') return f.tags.includes('national-artist-masterwork');
        if (targetTag === 'regional') return f.tags.includes('regional-cinema') || f.language !== 'Filipino';
        if (targetTag === 'indie') return f.tags.includes('indie');
        return f.tags.some((t) => t.toLowerCase().includes(targetTag));
      });
    }

    return films.length > 0 ? films : filterSeedFilms(filters);
  } catch {
    return filterSeedFilms(filters);
  }
}

function filterSeedFilms(filters: ExploreFilterState): ExploreFilmCard[] {
  return SEED_FILMS.filter((f) => {
    // Decade
    if (filters.decade) {
      const year = f.release_year;
      if (filters.decade === '70s' && (year < 1970 || year > 1979)) return false;
      if (filters.decade === '80s' && (year < 1980 || year > 1989)) return false;
      if (filters.decade === '90s' && (year < 1990 || year > 1999)) return false;
      if (filters.decade === '2000s' && (year < 2000 || year > 2009)) return false;
      if (filters.decade === '2010s' && (year < 2010 || year > 2019)) return false;
      if (filters.decade === '2020s' && (year < 2020 || year > 2029)) return false;
    }
    // MTRCB
    if (filters.mtrcb_rating && f.mtrcb_rating !== filters.mtrcb_rating) {
      return false;
    }
    // Language
    if (filters.language && !f.language.toLowerCase().includes(filters.language.toLowerCase())) {
      return false;
    }
    // Tag
    if (filters.tag) {
      const tag = filters.tag;
      if (tag === 'restored' && !f.is_classic && !f.tags.includes('restored-heritage')) return false;
      if (tag === 'national-artist' && !f.tags.includes('national-artist-masterwork')) return false;
      if (tag === 'regional' && !f.tags.includes('regional-cinema') && f.language === 'Filipino') return false;
      if (tag === 'indie' && !f.tags.includes('indie')) return false;
    }
    return true;
  });
}

// ==============================================================================
// 3. INSTANT SEARCH (Films, People, Festivals, Studios)
// ==============================================================================

export async function searchExplore(query: string): Promise<SearchEntityResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const results: SearchEntityResult[] = [];
  const queryLower = cleanQuery.toLowerCase();

  try {
    // 1. Single unified Supabase RPC Postgres query hitting films, people, festivals, and studios
    const rpcRes = await supabase.rpc('search_explore_entities', { search_query: cleanQuery });
    if (rpcRes.data && rpcRes.data.length > 0) {
      return rpcRes.data.map((row: any) => ({
        type: row.type,
        id: row.id,
        film_id: row.film_id || undefined,
        title: row.title,
        subtitle: row.subtitle,
        badge: row.badge || undefined,
        image_url: row.image_url || undefined,
        is_verified: Boolean(row.is_verified),
        year: row.year || null,
      }));
    }

    // 2. Parallel Supabase queries fallback
    const [filmsRes, peopleRes, festivalsRes, studiosRes] = await Promise.all([
      supabase
        .from('films')
        .select(`
          id,
          title,
          original_title,
          release_date,
          language,
          mtrcb_rating,
          poster_url,
          film_credits ( role, people ( name ) )
        `)
        .or(`title.ilike.%${cleanQuery}%,original_title.ilike.%${cleanQuery}%,synopsis.ilike.%${cleanQuery}%`)
        .limit(6),

      supabase
        .from('people')
        .select('id, name, bio, photo_url, role_type, verification_status')
        .or(`name.ilike.%${cleanQuery}%,bio.ilike.%${cleanQuery}%`)
        .limit(5),

      supabase
        .from('festivals')
        .select('id, name, description, location, founded_year, verification_status')
        .or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
        .limit(4),

      supabase
        .from('studios')
        .select('id, name, description, founded_year, verification_status')
        .or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
        .limit(4),
    ]);

    // Map films
    if (filmsRes.data && filmsRes.data.length > 0) {
      for (const f of filmsRes.data) {
        const year = f.release_date ? new Date(f.release_date).getFullYear() : 2020;
        const credits = (f.film_credits as any[]) || [];
        const directorCredit = credits.find((c: any) => c.role === 'director');
        const directorPeople = directorCredit?.people;
        const director = (Array.isArray(directorPeople) ? directorPeople[0]?.name : directorPeople?.name) || 'Filipino Director';
        results.push({
          type: 'film',
          id: f.id,
          film_id: f.id,
          title: f.title,
          subtitle: `${year} • Dir. ${director} • ${f.language || 'Filipino'}`,
          badge: f.mtrcb_rating || 'PG',
          image_url: f.poster_url,
          year,
        });
      }
    }

    // Map people
    if (peopleRes.data && peopleRes.data.length > 0) {
      for (const p of peopleRes.data) {
        const roleLabel = p.role_type === 'director' ? 'Filmmaker / Director' : 'Actor / Performer';
        results.push({
          type: 'person',
          id: p.id,
          title: p.name,
          subtitle: roleLabel,
          badge: p.verification_status === 'verified' ? 'Verified Official' : undefined,
          image_url: p.photo_url,
          is_verified: p.verification_status === 'verified',
        });
      }
    }

    // Map festivals
    if (festivalsRes.data && festivalsRes.data.length > 0) {
      for (const fest of festivalsRes.data) {
        results.push({
          type: 'festival',
          id: fest.id,
          title: fest.name,
          subtitle: `${fest.location || 'Philippines'} • Est. ${fest.founded_year || 2005}`,
          badge: 'Film Festival',
          is_verified: fest.verification_status === 'verified',
        });
      }
    }

    // Map studios
    if (studiosRes.data && studiosRes.data.length > 0) {
      for (const s of studiosRes.data) {
        results.push({
          type: 'studio',
          id: s.id,
          title: s.name,
          subtitle: `Independent Studio • Est. ${s.founded_year || 2014}`,
          badge: 'Studio',
          is_verified: s.verification_status === 'verified',
        });
      }
    }

    if (results.length > 0) {
      return results;
    }

    // Fallback to seed search if Supabase returned nothing
    return searchSeedData(queryLower);
  } catch {
    return searchSeedData(queryLower);
  }
}

function searchSeedData(queryLower: string): SearchEntityResult[] {
  const results: SearchEntityResult[] = [];

  // Match films
  for (const film of SEED_FILMS) {
    if (
      film.title.toLowerCase().includes(queryLower) ||
      film.synopsis.toLowerCase().includes(queryLower) ||
      film.director.toLowerCase().includes(queryLower) ||
      film.language.toLowerCase().includes(queryLower)
    ) {
      results.push({
        type: 'film',
        id: film.id,
        film_id: film.id,
        title: film.title,
        subtitle: `${film.release_year} • Dir. ${film.director} • ${film.language}`,
        badge: film.mtrcb_rating,
        image_url: film.poster_url,
        year: film.release_year,
      });
    }
  }

  // Match people
  const SEED_PEOPLE = [
    { id: 'aaaaaaaa-0001-0000-0000-000000000000', name: 'Ishmael Bernal', role: 'Director', note: 'National Artist for Cinema (2001)' },
    { id: 'aaaaaaaa-0002-0000-0000-000000000000', name: 'Lino Brocka', role: 'Director', note: 'National Artist for Cinema (1997)' },
    { id: 'aaaaaaaa-0003-0000-0000-000000000000', name: 'Kidlat Tahimik', role: 'Director', note: 'National Artist for Film (2018)' },
    { id: 'aaaaaaaa-0004-0000-0000-000000000000', name: 'Martika Ramirez Escobar', role: 'Director', note: 'Sundance Special Jury Prize Winner' },
    { id: 'aaaaaaaa-0005-0000-0000-000000000000', name: 'Arden Rod Condez', role: 'Director', note: 'Cinemalaya Best Film Winner' },
    { id: 'aaaaaaaa-0006-0000-0000-000000000000', name: 'Glenn Barit', role: 'Director', note: 'QCinema Best Film Winner' },
    { id: 'aaaaaaaa-0007-0000-0000-000000000000', name: 'Nora Aunor', role: 'Actor', note: 'National Artist for Film (2022)' },
  ];

  for (const person of SEED_PEOPLE) {
    if (person.name.toLowerCase().includes(queryLower) || person.note.toLowerCase().includes(queryLower)) {
      results.push({
        type: 'person',
        id: person.id,
        title: person.name,
        subtitle: `${person.role} • ${person.note}`,
        badge: 'Verified Official',
        is_verified: true,
      });
    }
  }

  // Match festivals
  const SEED_FESTIVALS = [
    { id: 'dddddddd-0001-0000-0000-000000000000', name: 'Cinemalaya Philippine Independent Film Festival', location: 'Manila', est: 2005 },
    { id: 'dddddddd-0002-0000-0000-000000000000', name: 'QCinema International Film Festival', location: 'Quezon City', est: 2013 },
    { id: 'dddddddd-0003-0000-0000-000000000000', name: 'Cinema Rehiyon', location: 'Regional / Nationwide', est: 2009 },
  ];

  for (const fest of SEED_FESTIVALS) {
    if (fest.name.toLowerCase().includes(queryLower) || fest.location.toLowerCase().includes(queryLower)) {
      results.push({
        type: 'festival',
        id: fest.id,
        title: fest.name,
        subtitle: `${fest.location} • Est. ${fest.est}`,
        badge: 'Film Festival',
        is_verified: true,
      });
    }
  }

  // Match studios
  const SEED_STUDIOS = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'TBA Studios', est: 2014 },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Black Sheep', est: 2018 },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Sine Olivia Pilipinas', est: 2003 },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Anima Studios', est: 2016 },
  ];

  for (const studio of SEED_STUDIOS) {
    if (studio.name.toLowerCase().includes(queryLower)) {
      results.push({
        type: 'studio',
        id: studio.id,
        title: studio.name,
        subtitle: `Independent Studio • Est. ${studio.est}`,
        badge: 'Studio',
        is_verified: true,
      });
    }
  }

  return results;
}
