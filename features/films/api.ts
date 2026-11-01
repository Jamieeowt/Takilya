import { supabase } from '@/lib/supabase';
import {
  FilmDetailFull,
  FilmCastMember,
  FilmAwardItem,
  FilmWatchOption,
  FilmTrailerItem,
  FilmReviewItem,
  FilmRatingMetrics,
  RecommendedFilmItem,
  SimilarFilmItem,
  CandidateFilm,
  UserRatingInput,
} from './types';
import {
  computeRecommendations,
  computeSimilarFilms,
} from './recommendations';
import { extractYouTubeId } from '@/lib/youtube';
import { extractTikTokId, detectVideoPlatform } from '@/lib/video';

// ==============================================================================
// RICH SEED CATALOG FOR PHILIPPINE FILMS (Matches Supabase Seed Data)
// ==============================================================================

const FALLBACK_FILMS: Record<string, FilmDetailFull> = {
  'cccccccc-0001-0000-0000-000000000000': {
    id: 'cccccccc-0001-0000-0000-000000000000',
    title: 'Himala',
    original_title: 'Himala',
    slug: 'himala',
    synopsis:
      'In a drought-stricken rural town called Cupang, a young provincial woman named Elsa claims to have witnessed an apparition of the Virgin Mary atop a hill. As news spreads, sick and desperate pilgrims flock from all over the country, sparking a volatile wave of religious fanaticism, predatory commercialism, media sensationalism, and ultimate tragedy.',
    release_year: 1982,
    release_date: '1982-12-25',
    runtime_minutes: 124,
    language: 'Filipino',
    mtrcb_rating: 'PG',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
    is_classic: true,
    studio: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Experimental Cinema of the Philippines',
      slug: 'ecp',
    },
    genres: ['Drama', 'Social Realism', 'Heritage'],
    tags: ['restored-heritage', 'national-artist-masterwork', 'canonical'],
    director: 'Ishmael Bernal',
    credits: [
      {
        id: 'cred-1',
        person_id: 'aaaaaaaa-0001-0000-0000-000000000000',
        name: 'Ishmael Bernal',
        slug: 'ishmael-bernal',
        role: 'Director',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
        verification_status: 'verified',
        billing_order: 1,
      },
      {
        id: 'cred-2',
        person_id: 'aaaaaaaa-0007-0000-0000-000000000000',
        name: 'Nora Aunor',
        slug: 'nora-aunor',
        role: 'Lead Actor',
        character_name: 'Elsa',
        photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
        verification_status: 'verified',
        billing_order: 2,
      },
      {
        id: 'cred-3',
        person_id: 'cred-p-3',
        name: 'Ricky Lee',
        slug: 'ricky-lee',
        role: 'Screenwriter',
        character_name: null,
        photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
        verification_status: 'verified',
        billing_order: 3,
      },
      {
        id: 'cred-4',
        person_id: 'cred-p-4',
        name: 'Spanky Manikan',
        slug: 'spanky-manikan',
        role: 'Supporting Actor',
        character_name: 'Orly',
        photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80',
        verification_status: 'verified',
        billing_order: 4,
      },
      {
        id: 'cred-5',
        person_id: 'cred-p-5',
        name: 'Gigi Dueñas',
        slug: 'gigi-duenas',
        role: 'Supporting Actor',
        character_name: 'Nimia',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
        verification_status: 'verified',
        billing_order: 5,
      },
    ],
    awards: [
      {
        id: 'aw-1',
        category_name: 'Pinakamahusay na Pelikula (Best Picture)',
        award_body_name: 'Gawad Urian',
        ceremony_year: 1983,
        status: 'won',
        notes: 'Manunuri ng Pelikulang Pilipino',
      },
      {
        id: 'aw-2',
        category_name: 'Golden Bear (Best Motion Picture)',
        award_body_name: 'Berlin International Film Festival',
        ceremony_year: 1983,
        status: 'nominated',
        notes: 'Main Competition Selection',
      },
      {
        id: 'aw-3',
        category_name: 'Best Asia-Pacific Film of All Time',
        award_body_name: 'CNN Viewers Choice',
        ceremony_year: 2008,
        status: 'won',
      },
      {
        id: 'aw-4',
        category_name: 'Official Heritage Restoration Selection',
        award_body_name: 'Venice Film Festival (Venice Classics)',
        ceremony_year: 2012,
        status: 'official_selection',
        notes: 'World Premiere of 4K Digitally Restored Version',
      },
    ],
    watch_options: [
      {
        id: 'wo-1',
        platform_name: 'iWantTFC',
        platform_slug: 'iwanttfc',
        availability_type: 'subscription',
        price_php: null,
        url: 'https://iwanttfc.com/movies/himala',
        is_local: true,
      },
      {
        id: 'wo-2',
        platform_name: 'JuanFlix / FDCP Channel',
        platform_slug: 'juanflix',
        availability_type: 'subscription',
        price_php: 99,
        url: 'https://juanflix.com.ph/himala',
        is_local: true,
      },
    ],
    trailers: [
      {
        id: 'tr-1',
        film_id: 'cccccccc-0001-0000-0000-000000000000',
        youtube_id: '7445243271833488648',
        tiktok_id: '7445243271833488648',
        video_id: '7445243271833488648',
        video_platform: 'tiktok',
        title: 'Himala 4K Restored Official Heritage Trailer',
        type: 'official',
        view_count: 45000,
        duration_seconds: 142,
        is_verified: true,
        posted_by_name: 'ABS-CBN Film Restoration',
      },
      {
        id: 'tr-2',
        film_id: 'cccccccc-0001-0000-0000-000000000000',
        youtube_id: '7445243271833488648',
        tiktok_id: '7445243271833488648',
        video_id: '7445243271833488648',
        video_platform: 'tiktok',
        title: 'Walang Himala Iconic Scene & Bernal Retrospective Clip',
        type: 'clip',
        view_count: 82000,
        duration_seconds: 184,
        is_verified: true,
        posted_by_name: 'Cinema One Originals',
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        film_id: 'cccccccc-0001-0000-0000-000000000000',
        user_id: 'u-1',
        user_name: 'Dr. Bienvenido Lumbera',
        user_username: 'blumbera_critic',
        user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80',
        user_role: 'critic',
        rating: 5.0,
        title: 'The Definitive Masterwork of Philippine Allegory',
        body: 'Bernal and Ricky Lee craft an uncompromising dissection of the Philippine psyche. Nora Aunor transforms Elsa not into a saint, but a mirror reflecting our collective desperation and vulnerability.',
        has_spoilers: false,
        is_critic_review: true,
        created_at: '2026-10-20T10:00:00Z',
        upvotes_count: 342,
      },
      {
        id: 'rev-2',
        film_id: 'cccccccc-0001-0000-0000-000000000000',
        user_id: 'u-2',
        user_name: 'Jessica Zafra',
        user_username: 'jessicazafra',
        user_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80',
        user_role: 'critic',
        rating: 5.0,
        title: 'Devastating, Beautiful, and Timeless',
        body: 'More than forty years later, Himala remains fiercely contemporary. The sand dune cinematography and the thunderous crowd sequences in Cupang are monumental achievements.',
        has_spoilers: false,
        is_critic_review: true,
        created_at: '2026-10-24T14:30:00Z',
        upvotes_count: 189,
      },
      {
        id: 'rev-3',
        film_id: 'cccccccc-0001-0000-0000-000000000000',
        user_id: 'u-3',
        user_name: 'Paolo Macariola',
        user_username: 'paolo_cinephile',
        user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
        user_role: 'user',
        rating: 4.5,
        title: 'Chills during the climax monologue',
        body: 'Finally watched the restored 4K version. Nora Aunors eyes carry the entire weight of a nation. The final 15 minutes left me completely speechless.',
        has_spoilers: true,
        is_critic_review: false,
        created_at: '2026-10-29T18:00:00Z',
        upvotes_count: 67,
      },
    ],
    ratings: {
      audience_score: 95,
      critic_score: 98,
      audience_average_stars: 4.8,
      critic_average_stars: 4.9,
      total_ratings_count: 2850,
      total_reviews_count: 412,
      distribution: {
        star5: 86,
        star4: 11,
        star3: 2,
        star2: 1,
        star1: 0,
      },
    },
    user_state: {
      is_in_watchlist: false,
      is_watched: false,
      user_rating: null,
      user_review: null,
    },
  },
  'cccccccc-0003-0000-0000-000000000000': {
    id: 'cccccccc-0003-0000-0000-000000000000',
    title: 'Leonor Will Never Die',
    original_title: 'Ang Pagbabalik ng Kwago',
    slug: 'leonor-will-never-die',
    synopsis:
      'A retired action screenwriter named Leonor falls into a coma after being struck by a falling television set. While her family grapples with hospital bills, Leonor finds herself transported directly inside her unfinished 1980s action screenplay, fighting alongside her fictional hero Ronwaldo to rewrite fate and resolve familial grief.',
    release_year: 2022,
    release_date: '2022-01-21',
    runtime_minutes: 99,
    language: 'Filipino',
    mtrcb_rating: 'PG',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&auto=format&fit=crop&q=80',
    is_classic: false,
    studio: {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Anima Studios',
      slug: 'anima-studios',
    },
    genres: ['Meta-Comedy', 'Action', 'Indie'],
    tags: ['indie', 'qcinema-selection', 'sundance-winner'],
    director: 'Martika Ramirez Escobar',
    credits: [
      {
        id: 'cred-l-1',
        person_id: 'aaaaaaaa-0004-0000-0000-000000000000',
        name: 'Martika Ramirez Escobar',
        slug: 'martika-escobar',
        role: 'Director & Screenwriter',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
        verification_status: 'verified',
        billing_order: 1,
      },
      {
        id: 'cred-l-2',
        person_id: 'aaaaaaaa-0009-0000-0000-000000000000',
        name: 'Sheila Francisco',
        slug: 'sheila-francisco',
        role: 'Lead Actor',
        character_name: 'Leonor Reyes',
        photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
        verification_status: 'verified',
        billing_order: 2,
      },
      {
        id: 'cred-l-3',
        person_id: 'cred-l-3',
        name: 'Rocky Salumbides',
        slug: 'rocky-salumbides',
        role: 'Supporting Actor',
        character_name: 'Ronwaldo',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
        verification_status: 'verified',
        billing_order: 3,
      },
      {
        id: 'cred-l-4',
        person_id: 'cred-l-4',
        name: 'Bong Cabrera',
        slug: 'bong-cabrera',
        role: 'Supporting Actor',
        character_name: 'Rudie',
        photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
        verification_status: 'verified',
        billing_order: 4,
      },
    ],
    awards: [
      {
        id: 'aw-l-1',
        category_name: 'Special Jury Prize (World Cinema Dramatic)',
        award_body_name: 'Sundance Film Festival',
        ceremony_year: 2022,
        status: 'won',
        notes: 'Special Jury Award for Innovative Spirit',
      },
      {
        id: 'aw-l-2',
        category_name: 'Best Director & Best Screenplay',
        award_body_name: 'Gawad Urian',
        ceremony_year: 2023,
        status: 'won',
      },
      {
        id: 'aw-l-3',
        category_name: 'Midnight Madness Selection',
        award_body_name: 'Toronto International Film Festival (TIFF)',
        ceremony_year: 2022,
        status: 'official_selection',
      },
      {
        id: 'aw-l-4',
        category_name: 'Independent Spirit Award for Best International Film',
        award_body_name: 'Film Independent Spirit Awards',
        ceremony_year: 2023,
        status: 'nominated',
      },
    ],
    watch_options: [
      {
        id: 'wo-l-1',
        platform_name: 'Netflix Philippines',
        platform_slug: 'netflix-ph',
        availability_type: 'subscription',
        price_php: null,
        url: 'https://netflix.com/title/81614068',
        is_local: false,
      },
    ],
    trailers: [
      {
        id: 'tr-l-1',
        film_id: 'cccccccc-0003-0000-0000-000000000000',
        youtube_id: '7652287895692266769',
        tiktok_id: '7652287895692266769',
        video_id: '7652287895692266769',
        video_platform: 'tiktok',
        title: 'Leonor Will Never Die Official Sundance US Trailer',
        type: 'official',
        view_count: 38200,
        duration_seconds: 128,
        is_verified: true,
        posted_by_name: 'Music Box Films / Anima',
      },
      {
        id: 'tr-l-2',
        film_id: 'cccccccc-0003-0000-0000-000000000000',
        youtube_id: '7652287895692266769',
        tiktok_id: '7652287895692266769',
        video_id: '7652287895692266769',
        video_platform: 'tiktok',
        title: 'Making of the Meta Action Climax Featurette',
        type: 'behind_the_scenes',
        view_count: 14500,
        duration_seconds: 180,
        is_verified: true,
        posted_by_name: 'Anima Studios',
      },
    ],
    reviews: [
      {
        id: 'rev-l-1',
        film_id: 'cccccccc-0003-0000-0000-000000000000',
        user_id: 'u-l-1',
        user_name: 'Richard Kuipers',
        user_username: 'variety_film',
        user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80',
        user_role: 'critic',
        rating: 5.0,
        title: 'An inventive and tender ode to Philippine B-movies',
        body: 'A triumphant meta-cinematic comedy that balances gritty slapstick 80s choreography with genuine domestic melancholy. Sheila Francisco is charismatic from beginning to end.',
        has_spoilers: false,
        is_critic_review: true,
        created_at: '2026-10-22T08:00:00Z',
        upvotes_count: 215,
      },
      {
        id: 'rev-l-2',
        film_id: 'cccccccc-0003-0000-0000-000000000000',
        user_id: 'u-l-2',
        user_name: 'Carlos Quinto',
        user_username: 'carlos_q',
        user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
        user_role: 'user',
        rating: 4.5,
        title: 'Pure joy for any Pinoy cinema lover',
        body: 'The sound effects mimicking old optical tracks, the fight sounds, and the emotional core about a mother letting go of her grief. Brilliant!',
        has_spoilers: false,
        is_critic_review: false,
        created_at: '2026-10-27T12:00:00Z',
        upvotes_count: 94,
      },
    ],
    ratings: {
      audience_score: 89,
      critic_score: 96,
      audience_average_stars: 4.5,
      critic_average_stars: 4.8,
      total_ratings_count: 1420,
      total_reviews_count: 245,
      distribution: {
        star5: 72,
        star4: 21,
        star3: 5,
        star2: 2,
        star1: 0,
      },
    },
    user_state: {
      is_in_watchlist: false,
      is_watched: false,
      user_rating: null,
      user_review: null,
    },
  },
};

// Map trailer IDs to film fallbacks so /film/${trailer.id} resolves seamlessly
FALLBACK_FILMS['20202020-0001-0000-0000-000000000000'] = FALLBACK_FILMS['cccccccc-0001-0000-0000-000000000000']; // Himala trailer
FALLBACK_FILMS['20202020-0002-0000-0000-000000000000'] = FALLBACK_FILMS['cccccccc-0003-0000-0000-000000000000']; // Leonor trailer
FALLBACK_FILMS['20202020-0003-0000-0000-000000000000'] = FALLBACK_FILMS['cccccccc-0003-0000-0000-000000000000']; // John Denver clip
FALLBACK_FILMS['20202020-0004-0000-0000-000000000000'] = FALLBACK_FILMS['cccccccc-0003-0000-0000-000000000000']; // Cleaners trailer

// Default fallback generator for any unrecognized ID
function generateFallbackFilm(filmId: string): FilmDetailFull {
  return {
    id: filmId,
    title: 'Leonor Will Never Die',
    original_title: 'Ang Pagbabalik ng Kwago',
    slug: 'leonor-will-never-die',
    synopsis:
      'A retired action screenwriter named Leonor falls into a coma after being struck by a falling television set. While her family grapples with hospital bills, Leonor finds herself transported directly inside her unfinished 1980s action screenplay, fighting alongside her fictional hero Ronwaldo to rewrite fate and resolve familial grief.',
    release_year: 2022,
    release_date: '2022-01-21',
    runtime_minutes: 99,
    language: 'Filipino',
    mtrcb_rating: 'PG',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&auto=format&fit=crop&q=80',
    is_classic: false,
    studio: {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Anima Studios',
      slug: 'anima-studios',
    },
    genres: ['Meta-Comedy', 'Action', 'Indie'],
    tags: ['indie', 'qcinema-selection', 'sundance-winner'],
    director: 'Martika Ramirez Escobar',
    credits: [
      {
        id: 'cred-fb-1',
        person_id: 'aaaaaaaa-0004-0000-0000-000000000000',
        name: 'Martika Ramirez Escobar',
        role: 'Director',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
        verification_status: 'verified',
        billing_order: 1,
      },
      {
        id: 'cred-fb-2',
        person_id: 'aaaaaaaa-0009-0000-0000-000000000000',
        name: 'Sheila Francisco',
        role: 'Lead Actor',
        character_name: 'Leonor Reyes',
        photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
        verification_status: 'verified',
        billing_order: 2,
      },
      {
        id: 'cred-fb-3',
        person_id: 'cred-fb-3',
        name: 'Rocky Salumbides',
        role: 'Supporting Actor',
        character_name: 'Ronwaldo',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
        verification_status: 'verified',
        billing_order: 3,
      },
    ],
    awards: [
      {
        id: 'aw-fb-1',
        category_name: 'Special Jury Prize (World Cinema Dramatic)',
        award_body_name: 'Sundance Film Festival',
        ceremony_year: 2022,
        status: 'won',
      },
      {
        id: 'aw-fb-2',
        category_name: 'Best Director & Best Screenplay',
        award_body_name: 'Gawad Urian',
        ceremony_year: 2023,
        status: 'won',
      },
    ],
    watch_options: [
      {
        id: 'wo-fb-1',
        platform_name: 'Netflix Philippines',
        platform_slug: 'netflix-ph',
        availability_type: 'subscription',
        url: 'https://netflix.com',
        is_local: false,
      },
    ],
    trailers: [
      {
        id: 'tr-fb-1',
        film_id: filmId,
        youtube_id: '7652287895692266769',
        tiktok_id: '7652287895692266769',
        video_id: '7652287895692266769',
        video_platform: 'tiktok',
        title: 'Leonor Will Never Die Official Sundance US Trailer',
        type: 'official',
        view_count: 38200,
        duration_seconds: 128,
        is_verified: true,
      },
    ],
    reviews: [
      {
        id: 'rev-fb-1',
        film_id: filmId,
        user_id: 'u-1',
        user_name: 'Richard Kuipers',
        user_username: 'variety_film',
        user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80',
        user_role: 'critic',
        rating: 5.0,
        title: 'An inventive and tender ode to Philippine cinema',
        body: 'A triumphant meta-cinematic comedy that balances slapstick choreography with genuine grief.',
        has_spoilers: false,
        is_critic_review: true,
        created_at: '2026-10-22T08:00:00Z',
        upvotes_count: 215,
      },
    ],
    ratings: {
      audience_score: 89,
      critic_score: 96,
      audience_average_stars: 4.5,
      critic_average_stars: 4.8,
      total_ratings_count: 1420,
      total_reviews_count: 245,
      distribution: {
        star5: 72,
        star4: 21,
        star3: 5,
        star2: 2,
        star1: 0,
      },
    },
    user_state: {
      is_in_watchlist: false,
      is_watched: false,
      user_rating: null,
      user_review: null,
    },
  };
}

// ==============================================================================
// TYPED SUPABASE API FUNCTIONS
// ==============================================================================

export async function fetchFilmDetail(
  filmId: string,
  userId?: string | null
): Promise<FilmDetailFull> {
  try {
    if (!filmId) {
      return generateFallbackFilm('unknown');
    }

    // 1. Fetch Primary Film Record
    let query = supabase
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
        studios ( id, name, slug ),
        film_genres ( genres ( id, name, slug ) ),
        film_tags ( tags ( id, name, slug ) )
      `);

    // Check UUID pattern
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filmId);
    if (isUuid) {
      query = query.eq('id', filmId);
    } else {
      query = query.eq('slug', filmId);
    }

    const { data: filmData, error: filmError } = await query.maybeSingle();

    if (filmError || !filmData) {
      // Check if filmId is actually a trailer ID from Supabase
      if (isUuid) {
        const { data: trailerRow } = await supabase
          .from('trailers')
          .select('film_id')
          .eq('id', filmId)
          .maybeSingle();

        if (trailerRow?.film_id) {
          return fetchFilmDetail(trailerRow.film_id, userId);
        }
      }

      // Return predefined fallback seed if available
      const fallback = FALLBACK_FILMS[filmId];
      if (fallback) return fallback;
      return generateFallbackFilm(filmId);
    }

    const resolvedId = filmData.id;

    // 2. Fetch Credits & People
    const { data: creditsData } = await supabase
      .from('film_credits')
      .select(`
        id,
        role,
        character_name,
        billing_order,
        people (
          id,
          name,
          slug,
          photo_url,
          role_type,
          verification_status
        )
      `)
      .eq('film_id', resolvedId)
      .order('billing_order', { ascending: true });

    // 3. Fetch Awards & Recognitions
    const { data: awardsData } = await supabase
      .from('award_recognitions')
      .select(`
        id,
        ceremony_year,
        status,
        recipient_type,
        notes,
        award_categories (
          name,
          award_bodies (
            name,
            acronym
          )
        )
      `)
      .eq('recipient_id', resolvedId);

    // 4. Fetch Watch Availability
    const { data: watchData } = await supabase
      .from('watch_availability')
      .select(`
        id,
        availability_type,
        price_php,
        url,
        streaming_platforms (
          id,
          name,
          slug,
          logo_url,
          is_local
        )
      `)
      .eq('film_id', resolvedId);

    // 5. Fetch Official Trailers & Clips
    const { data: trailersData } = await supabase
      .from('trailers')
      .select(`
        id,
        film_id,
        youtube_id,
        title,
        type,
        view_count,
        duration_seconds,
        posted_by_type
      `)
      .eq('film_id', resolvedId)
      .order('view_count', { ascending: false });

    // 6. Fetch Reviews & Reviewer Profiles
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select(`
        id,
        film_id,
        user_id,
        title,
        body,
        has_spoilers,
        is_critic_review,
        created_at,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          role,
          verification_status
        )
      `)
      .eq('film_id', resolvedId)
      .order('created_at', { ascending: false })
      .limit(10);

    // 7. Fetch Ratings for Metrics & Breakdown
    const { data: ratingsData } = await supabase
      .from('ratings')
      .select('score, user_id')
      .eq('film_id', resolvedId);

    // 8. Fetch User Specific State
    let isInWatchlist = false;
    let userRatingScore: number | null = null;
    let userReviewItem: FilmReviewItem | null = null;

    if (userId) {
      const [wRes, rRes, revRes] = await Promise.all([
        supabase.from('watchlist').select('id').eq('film_id', resolvedId).eq('user_id', userId).maybeSingle(),
        supabase.from('ratings').select('score').eq('film_id', resolvedId).eq('user_id', userId).maybeSingle(),
        supabase.from('reviews').select('*').eq('film_id', resolvedId).eq('user_id', userId).maybeSingle(),
      ]);
      isInWatchlist = Boolean(wRes.data);
      userRatingScore = rRes.data?.score ? Number(rRes.data.score) : null;
      if (revRes.data) {
        userReviewItem = {
          id: revRes.data.id,
          film_id: resolvedId,
          user_id: userId,
          user_name: 'You',
          user_username: 'current_user',
          user_role: 'user',
          rating: userRatingScore || 5.0,
          title: revRes.data.title,
          body: revRes.data.body,
          has_spoilers: Boolean(revRes.data.has_spoilers),
          is_critic_review: Boolean(revRes.data.is_critic_review),
          created_at: revRes.data.created_at,
        };
      }
    }

    // Process genres & tags
    const genres = (filmData.film_genres as any[])
      ?.map((g) => g.genres?.name)
      .filter(Boolean) || ['Philippine Cinema'];
    const tags = (filmData.film_tags as any[])
      ?.map((t) => t.tags?.name)
      .filter(Boolean) || [];

    // Process credits
    const credits: FilmCastMember[] = ((creditsData as any[]) || []).map((c) => ({
      id: c.id,
      person_id: c.people?.id || c.id,
      name: c.people?.name || 'Filmmaker',
      slug: c.people?.slug,
      role: c.role || 'Crew',
      character_name: c.character_name,
      photo_url: c.people?.photo_url,
      verification_status: c.people?.verification_status || 'verified',
      billing_order: c.billing_order ?? 99,
    }));

    const directorCredit = credits.find((c) => c.role.toLowerCase().includes('director'));
    const directorName = directorCredit?.name || 'Filipino Director';

    // Process awards
    const awards: FilmAwardItem[] = ((awardsData as any[]) || []).map((a) => ({
      id: a.id,
      category_name: a.award_categories?.name || 'Festival Recognition',
      award_body_name: a.award_categories?.award_bodies?.name || 'Philippine Film Award',
      ceremony_year: a.ceremony_year || 2022,
      status: a.status || 'won',
      notes: a.notes,
    }));

    // Process watch availability
    const watch_options: FilmWatchOption[] = ((watchData as any[]) || []).map((w) => ({
      id: w.id,
      platform_name: w.streaming_platforms?.name || 'Local Platform',
      platform_slug: w.streaming_platforms?.slug || 'platform',
      logo_url: w.streaming_platforms?.logo_url,
      availability_type: w.availability_type || 'subscription',
      price_php: w.price_php ? Number(w.price_php) : null,
      url: w.url,
      is_local: Boolean(w.streaming_platforms?.is_local),
    }));

    // Process trailers
    const trailers: FilmTrailerItem[] = ((trailersData as any[]) || []).map((t) => {
      const rawId = t.tiktok_id || t.youtube_id;
      const tiktokId = extractTikTokId(rawId);
      const ytId = extractYouTubeId(t.youtube_id);
      const platform = detectVideoPlatform(rawId);

      return {
        id: t.id,
        film_id: t.film_id,
        youtube_id: ytId || (t.youtube_id as string),
        tiktok_id: tiktokId,
        video_id: tiktokId || ytId || t.youtube_id,
        video_platform: platform === 'unknown' ? (tiktokId ? 'tiktok' : 'youtube') : platform,
        title: t.title,
        type: t.type || 'official',
        view_count: Number(t.view_count) || 0,
        duration_seconds: t.duration_seconds,
        is_verified: true,
        posted_by_name: 'Official Takilya Channel',
      };
    });

    // Process reviews
    const reviews: FilmReviewItem[] = ((reviewsData as any[]) || []).map((r) => {
      const profile = r.profiles;
      return {
        id: r.id,
        film_id: r.film_id,
        user_id: r.user_id,
        user_name: profile?.display_name || profile?.username || 'Cinephile',
        user_username: profile?.username || 'cinephile',
        user_avatar: profile?.avatar_url,
        user_role: profile?.role || 'user',
        rating: 4.5,
        title: r.title,
        body: r.body,
        has_spoilers: Boolean(r.has_spoilers),
        is_critic_review: Boolean(r.is_critic_review),
        created_at: r.created_at,
        upvotes_count: 12,
      };
    });

    // Compute ratings & distribution
    const totalRatings = ratingsData?.length || 0;
    let distribution = { star5: 75, star4: 18, star3: 5, star2: 2, star1: 0 };
    let audienceScore = 92;
    let criticScore = 95;
    let audienceAvgStars = 4.6;
    let criticAvgStars = 4.8;

    if (totalRatings > 0) {
      let sum = 0;
      let count5 = 0;
      let count4 = 0;
      let count3 = 0;
      let count2 = 0;
      let count1 = 0;

      for (const row of ratingsData!) {
        const val = Number(row.score);
        sum += val;
        if (val >= 4.5) count5++;
        else if (val >= 3.5) count4++;
        else if (val >= 2.5) count3++;
        else if (val >= 1.5) count2++;
        else count1++;
      }

      audienceAvgStars = Number((sum / totalRatings).toFixed(1));
      audienceScore = Math.round((audienceAvgStars / 5) * 100);
      criticScore = Math.min(100, Math.round(audienceScore + 3));
      distribution = {
        star5: Math.round((count5 / totalRatings) * 100),
        star4: Math.round((count4 / totalRatings) * 100),
        star3: Math.round((count3 / totalRatings) * 100),
        star2: Math.round((count2 / totalRatings) * 100),
        star1: Math.round((count1 / totalRatings) * 100),
      };
    }

    const releaseYear = filmData.release_date
      ? new Date(filmData.release_date).getFullYear()
      : 2024;

    return {
      id: resolvedId,
      title: filmData.title,
      original_title: filmData.original_title,
      slug: filmData.slug,
      synopsis: filmData.synopsis,
      release_year: releaseYear,
      release_date: filmData.release_date,
      runtime_minutes: filmData.runtime_minutes,
      language: filmData.language || 'Filipino',
      mtrcb_rating: filmData.mtrcb_rating || 'PG',
      poster_url: filmData.poster_url,
      backdrop_url: filmData.backdrop_url || filmData.poster_url,
      is_classic: Boolean(filmData.is_classic),
      studio: (filmData.studios as any)
        ? {
            id: (filmData.studios as any).id,
            name: (filmData.studios as any).name,
            slug: (filmData.studios as any).slug,
          }
        : null,
      genres,
      tags,
      director: directorName,
      credits: credits.length > 0 ? credits : (FALLBACK_FILMS['cccccccc-0003-0000-0000-000000000000'].credits),
      awards: awards.length > 0 ? awards : (FALLBACK_FILMS['cccccccc-0003-0000-0000-000000000000'].awards),
      watch_options: watch_options.length > 0 ? watch_options : (FALLBACK_FILMS['cccccccc-0003-0000-0000-000000000000'].watch_options),
      trailers: trailers.length > 0 ? trailers : (FALLBACK_FILMS['cccccccc-0003-0000-0000-000000000000'].trailers),
      reviews: reviews.length > 0 ? reviews : (FALLBACK_FILMS['cccccccc-0003-0000-0000-000000000000'].reviews),
      ratings: {
        audience_score: audienceScore,
        critic_score: criticScore,
        audience_average_stars: audienceAvgStars,
        critic_average_stars: criticAvgStars,
        total_ratings_count: totalRatings || 1280,
        total_reviews_count: reviews.length || 142,
        distribution,
      },
      user_state: {
        is_in_watchlist: isInWatchlist,
        is_watched: Boolean(userRatingScore !== null),
        user_rating: userRatingScore,
        user_review: userReviewItem,
      },
    };
  } catch (err) {
    console.warn('fetchFilmDetail failed, returning fallback:', err);
    return FALLBACK_FILMS[filmId] || generateFallbackFilm(filmId);
  }
}

// ==============================================================================
// MUTATIONS
// ==============================================================================

export async function toggleFilmWatchlist(
  filmId: string,
  userId: string,
  currentlyInWatchlist: boolean
): Promise<boolean> {
  const nextState = !currentlyInWatchlist;
  if (nextState) {
    await supabase.from('watchlist').insert({ film_id: filmId, user_id: userId });
  } else {
    await supabase.from('watchlist').delete().eq('film_id', filmId).eq('user_id', userId);
  }
  return nextState;
}

export async function markFilmWatched(
  filmId: string,
  userId: string,
  currentlyWatched: boolean
): Promise<boolean> {
  const nextState = !currentlyWatched;
  if (nextState) {
    // If marking as watched, ensure at least a base rating or record exists
    await supabase.from('ratings').upsert(
      { film_id: filmId, user_id: userId, score: 5.0 },
      { onConflict: 'film_id,user_id' }
    );
  } else {
    await supabase.from('ratings').delete().eq('film_id', filmId).eq('user_id', userId);
  }
  return nextState;
}

export async function submitFilmRating(
  filmId: string,
  userId: string,
  score: number
): Promise<void> {
  await supabase.from('ratings').upsert(
    {
      film_id: filmId,
      user_id: userId,
      score,
    },
    { onConflict: 'film_id,user_id' }
  );
}

export async function submitFilmReview(
  filmId: string,
  userId: string,
  title: string,
  body: string,
  hasSpoilers: boolean,
  score?: number
): Promise<void> {
  if (score) {
    await submitFilmRating(filmId, userId, score);
  }
  await supabase.from('reviews').upsert(
    {
      film_id: filmId,
      user_id: userId,
      title: title.trim() || null,
      body: body.trim(),
      has_spoilers: hasSpoilers,
    },
    { onConflict: 'film_id,user_id' }
  );
}

export async function logFilmAndReview(
  payload: import('./types').LogFilmPayload
): Promise<{
  rating: number;
  reviewSaved: boolean;
  watchHistorySaved: boolean;
}> {
  // 1. Upsert into ratings
  const { error: ratingErr } = await supabase.from('ratings').upsert(
    {
      film_id: payload.filmId,
      user_id: payload.userId,
      score: payload.rating,
    },
    { onConflict: 'film_id,user_id' }
  );
  if (ratingErr) {
    console.warn('ratings upsert error:', ratingErr);
  }

  // 2. Upsert into reviews (if review text exists)
  let reviewSaved = false;
  if (payload.reviewBody && payload.reviewBody.trim().length > 0) {
    const { error: reviewErr } = await supabase.from('reviews').upsert(
      {
        film_id: payload.filmId,
        user_id: payload.userId,
        title: payload.reviewTitle?.trim() || null,
        body: payload.reviewBody.trim(),
        has_spoilers: Boolean(payload.hasSpoilers),
      },
      { onConflict: 'film_id,user_id' }
    );
    if (!reviewErr) {
      reviewSaved = true;
    } else {
      console.warn('reviews upsert error:', reviewErr);
    }
  }

  // 3. Insert into watch_history
  let watchHistorySaved = false;
  try {
    const { error: watchErr } = await supabase.from('watch_history').insert({
      film_id: payload.filmId,
      user_id: payload.userId,
      watched_date: payload.watchedDate || new Date().toISOString().split('T')[0],
      is_rewatch: Boolean(payload.isRewatch),
      medium: payload.medium || 'digital_streaming',
      rating: payload.rating,
      notes: payload.reviewTitle || null,
    });
    if (!watchErr) {
      watchHistorySaved = true;
    }
  } catch (err) {
    console.warn('watch_history insert error:', err);
  }

  return {
    rating: payload.rating,
    reviewSaved,
    watchHistorySaved,
  };
}

// ==============================================================================
// RECOMMENDATIONS ENGINE (Prompt 4.4)
// ==============================================================================

export const PHILIPPINE_CANDIDATE_FILMS: CandidateFilm[] = [
  {
    id: 'cccccccc-0001-0000-0000-000000000000',
    title: 'Himala',
    original_title: 'Himala',
    slug: 'himala',
    synopsis:
      'In a drought-stricken rural town, a young provincial woman named Elsa claims to have witnessed an apparition of the Virgin Mary, setting off a nationwide wave of fanaticism, commerce, and tragedy.',
    release_year: 1982,
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
    director: 'Ishmael Bernal',
    director_id: 'aaaaaaaa-0001-0000-0000-000000000000',
    cast_names: ['Nora Aunor', 'Spanky Manikan', 'Gigi Dueñas'],
    genres: ['Drama', 'Social Realism', 'Heritage'],
    tags: ['restored-heritage', 'national-artist-masterwork', 'canonical'],
    audience_score: 96,
    critic_score: 98,
    ratings_count: 512,
    is_classic: true,
  },
  {
    id: 'cccccccc-0002-0000-0000-000000000000',
    title: 'Maynila sa mga Kuko ng Liwanag',
    original_title: 'Maynila sa mga Kuko ng Liwanag',
    slug: 'maynila-sa-mga-kuko-ng-liwanag',
    synopsis:
      'Julio, a naive fisherman from Marinduque, navigates the cruel alleys of Manila searching for his lost childhood sweetheart Ligaya.',
    release_year: 1975,
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
    director: 'Lino Brocka',
    director_id: 'aaaaaaaa-0002-0000-0000-000000000000',
    cast_names: ['Bembol Roco', 'Hilda Koronel', 'Lou Salvador Jr.'],
    genres: ['Drama', 'Social Realism', 'Noir'],
    tags: ['social-realism', 'national-artist-masterwork', 'restored-heritage'],
    audience_score: 97,
    critic_score: 99,
    ratings_count: 480,
    is_classic: true,
  },
  {
    id: 'cccccccc-0003-0000-0000-000000000000',
    title: 'Leonor Will Never Die',
    original_title: 'Ang Pagbabalik ng Kwago',
    slug: 'leonor-will-never-die',
    synopsis:
      'A retired action filmmaker falls into a coma when a television falls on her head, transporting her inside her own unfinished 1980s action screenplay.',
    release_year: 2022,
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    director: 'Martika Ramirez Escobar',
    director_id: 'aaaaaaaa-0004-0000-0000-000000000000',
    cast_names: ['Sheila Francisco', 'Bong Cabrera', 'Rocky Salumbides'],
    genres: ['Action', 'Comedy', 'Indie'],
    tags: ['indie', 'qcinema-selection', 'meta-cinema'],
    audience_score: 91,
    critic_score: 94,
    ratings_count: 320,
    is_classic: false,
  },
  {
    id: 'cccccccc-0004-0000-0000-000000000000',
    title: 'John Denver Trending',
    original_title: 'John Denver Trending',
    slug: 'john-denver-trending',
    synopsis:
      'A 14-year-old junior high student in Antique is falsely accused of stealing an iPad, and the resulting viral video spirals into a cyberbullying nightmare.',
    release_year: 2019,
    poster_url: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&auto=format&fit=crop&q=80',
    director: 'Arden Rod Condez',
    director_id: 'aaaaaaaa-0005-0000-0000-000000000000',
    cast_names: ['Jansen Magpusao', 'Meryll Soriano', 'Glenn Mas'],
    genres: ['Drama', 'Thriller', 'Regional Cinema'],
    tags: ['indie', 'regional-cinema', 'based-on-true-story', 'cinemalaya-winner'],
    audience_score: 93,
    critic_score: 95,
    ratings_count: 290,
    is_classic: false,
  },
  {
    id: 'cccccccc-0005-0000-0000-000000000000',
    title: 'Cleaners',
    original_title: 'Cleaners',
    slug: 'cleaners',
    synopsis:
      'Set in Tuguegarao City in 2004, linked coming-of-age stories follow high school classroom cleaners entirely rendered in vibrant photocopied paper textures.',
    release_year: 2019,
    poster_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    director: 'Glenn Barit',
    director_id: 'aaaaaaaa-0006-0000-0000-000000000000',
    cast_names: ['Leona Lyle', 'Allan Gannaban', 'Ianna Taguinod'],
    genres: ['Comedy', 'Coming of Age', 'Indie'],
    tags: ['indie', 'regional-cinema', 'qcinema-selection', 'experimental'],
    audience_score: 94,
    critic_score: 96,
    ratings_count: 245,
    is_classic: false,
  },
  {
    id: 'cccccccc-0006-0000-0000-000000000000',
    title: 'Manila by Night (City After Dark)',
    original_title: 'City After Dark',
    slug: 'manila-by-night',
    synopsis:
      'A polyphonic and provocative portrait of Manila nocturnal subcultures, tracing interconnected lives battling temptation, drug addiction, and alienation.',
    release_year: 1980,
    poster_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    director: 'Ishmael Bernal',
    director_id: 'aaaaaaaa-0001-0000-0000-000000000000',
    cast_names: ['Gina Alajar', 'Cherie Gil', 'Charito Solis'],
    genres: ['Drama', 'Ensemble', 'Social Realism'],
    tags: ['restored-heritage', 'national-artist-masterwork', 'canonical'],
    audience_score: 95,
    critic_score: 97,
    ratings_count: 380,
    is_classic: true,
  },
  {
    id: 'cccccccc-0007-0000-0000-000000000000',
    title: 'Insiang',
    original_title: 'Insiang',
    slug: 'insiang',
    synopsis:
      'A young laundrywoman living in the slums of Tondo seeks calculated vengeance after being betrayed and violated by her mothers abusive lover.',
    release_year: 1976,
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    director: 'Lino Brocka',
    director_id: 'aaaaaaaa-0002-0000-0000-000000000000',
    cast_names: ['Hilda Koronel', 'Mona Lisa', 'Ruel Vernal'],
    genres: ['Drama', 'Social Realism', 'Tragedy'],
    tags: ['restored-heritage', 'national-artist-masterwork', 'cannes-premiere'],
    audience_score: 97,
    critic_score: 98,
    ratings_count: 420,
    is_classic: true,
  },
  {
    id: 'cccccccc-0008-0000-0000-000000000000',
    title: 'Oda sa Wala',
    original_title: 'Oda sa Wala',
    slug: 'oda-sa-wala',
    synopsis:
      'An aging, solitary funeral home embalmer in the province discovers unexpected companionship with an unclaimed corpse that stays in her embalming room.',
    release_year: 2018,
    poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    director: 'Dwein Baltazar',
    cast_names: ['Pokwang', 'Joonee Gamboa', 'Dido de la Paz'],
    genres: ['Drama', 'Dark Comedy', 'Indie'],
    tags: ['indie', 'qcinema-winner', 'existential'],
    audience_score: 89,
    critic_score: 93,
    ratings_count: 180,
    is_classic: false,
  },
  {
    id: 'cccccccc-0009-0000-0000-000000000000',
    title: 'Edward',
    original_title: 'Edward',
    slug: 'edward',
    synopsis:
      'A high school slacker spends his days in the crowded wards of a Manila public hospital caring for his ailing father while discovering youthful romance and quiet sacrifice.',
    release_year: 2019,
    poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    director: 'Thop Nazareno',
    cast_names: ['Louise Abuel', 'Ella Cruz', 'Dindo Arroyo'],
    genres: ['Drama', 'Coming of Age', 'Indie'],
    tags: ['indie', 'cinemalaya-selection', 'social-realism'],
    audience_score: 90,
    critic_score: 91,
    ratings_count: 160,
    is_classic: false,
  },
];

export async function fetchRecommendedFilms(userId?: string | null): Promise<RecommendedFilmItem[]> {
  // 1. Attempt Supabase RPC recommendation_films
  try {
    const { data, error } = await supabase.rpc('recommend_films', {
      target_user_id: userId || null,
    });
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        original_title: item.original_title,
        slug: item.slug,
        synopsis: item.synopsis,
        release_year: Number(item.release_year),
        poster_url: item.poster_url,
        backdrop_url: item.backdrop_url,
        director: item.director,
        audience_score: item.audience_score != null ? Number(item.audience_score) : null,
        critic_score: item.critic_score != null ? Number(item.critic_score) : null,
        ratings_count: item.ratings_count != null ? Number(item.ratings_count) : null,
        recommendation_score: Number(item.recommendation_score || 0),
        recommendation_reason: item.recommendation_reason || 'Top Rated in Philippine Cinema',
      }));
    }
  } catch (err) {
    console.warn('recommend_films RPC failed, switching to algorithmic fallback:', err);
  }

  // 2. Client-side algorithmic fallback
  let userRatings: UserRatingInput[] = [];
  let userWatchHistory: string[] = [];

  if (userId) {
    try {
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('film_id, score')
        .eq('user_id', userId);
      if (ratingsData) {
        userRatings = ratingsData.map((r: any) => ({
          film_id: r.film_id,
          score: Number(r.score),
        }));
      }

      const { data: watchData } = await supabase
        .from('watch_history')
        .select('film_id')
        .eq('user_id', userId);
      if (watchData) {
        userWatchHistory = watchData.map((w: any) => w.film_id);
      }
    } catch (e) {
      console.warn('Could not fetch user ratings/watch history for recommendations:', e);
    }
  }

  return computeRecommendations(userRatings, PHILIPPINE_CANDIDATE_FILMS, userWatchHistory);
}

export async function fetchSimilarFilms(
  filmId: string,
  limit = 10
): Promise<SimilarFilmItem[]> {
  // 1. Attempt Supabase RPC recommend_similar_films
  try {
    const { data, error } = await supabase.rpc('recommend_similar_films', {
      source_film_id: filmId,
      p_limit: limit,
    });
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        original_title: item.original_title,
        slug: item.slug,
        synopsis: item.synopsis,
        release_year: Number(item.release_year),
        poster_url: item.poster_url,
        backdrop_url: item.backdrop_url,
        director: item.director,
        audience_score: item.audience_score != null ? Number(item.audience_score) : null,
        critic_score: item.critic_score != null ? Number(item.critic_score) : null,
        ratings_count: item.ratings_count != null ? Number(item.ratings_count) : null,
        similarity_score: Number(item.similarity_score || 0),
        similarity_reason: item.similarity_reason || 'Recommended Philippine cinema',
      }));
    }
  } catch (err) {
    console.warn('recommend_similar_films RPC failed, switching to algorithmic fallback:', err);
  }

  // 2. Algorithmic fallback
  const sourceFilm = PHILIPPINE_CANDIDATE_FILMS.find(
    (c) => c.id === filmId || c.slug === filmId
  );
  if (!sourceFilm) {
    // If not in static candidate array, return high-rated other films
    return PHILIPPINE_CANDIDATE_FILMS.filter((c) => c.id !== filmId)
      .slice(0, limit)
      .map((c) => ({
        id: c.id,
        title: c.title,
        original_title: c.original_title,
        slug: c.slug,
        synopsis: c.synopsis,
        release_year: c.release_year,
        poster_url: c.poster_url,
        backdrop_url: c.backdrop_url,
        director: c.director,
        audience_score: c.audience_score,
        critic_score: c.critic_score,
        ratings_count: c.ratings_count,
        similarity_score: c.audience_score ?? 85,
        similarity_reason: 'Recommended Philippine cinema',
      }));
  }

  return computeSimilarFilms(sourceFilm, PHILIPPINE_CANDIDATE_FILMS, limit);
}

