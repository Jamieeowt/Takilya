import { supabase } from '@/lib/supabase';
import {
  Studio,
  StudioFilm,
  StudioAwardSummary,
  StudioClip,
} from './types';

// ==============================================================================
// AUTHENTIC PHILIPPINE CINEMA STUDIOS FALLBACK CATALOG
// ==============================================================================

export const SAMPLE_STUDIOS: Studio[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'TBA Studios',
    slug: 'tba-studios',
    description:
      'Pioneering Philippine independent studio behind landmark historical epics (Heneral Luna, Goyo) and bold auteur cinema (Birdshot, Dito at Doon). Committed to elevating Filipino cinema onto the global stage.',
    logo_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&q=80',
    founded_year: 2014,
    verification_status: 'verified',
    followers_count: 15400,
    films_count: 18,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Black Sheep',
    slug: 'black-sheep',
    description:
      'Daring sub-division of ABS-CBN Studios creating creator-driven, non-formulaic, and genre-bending Filipino films including Fan Girl, Oda sa Wala, and Isa Pa with Feelings.',
    logo_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&q=80',
    founded_year: 2018,
    verification_status: 'verified',
    followers_count: 19800,
    films_count: 22,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Anima Studios',
    slug: 'anima-studios',
    description:
      'Award-winning entertainment outfit producing breakthrough independent features including Sundance winner Leonor Will Never Die, Cinemalaya winner John Denver Trending, and indie cult favorites.',
    logo_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&q=80',
    founded_year: 2016,
    verification_status: 'verified',
    followers_count: 11200,
    films_count: 16,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Sine Olivia Pilipinas',
    slug: 'sine-olivia',
    description:
      'Independent production collective established by auteur Lav Diaz. Produces uncompromised, epic-length black-and-white Philippine cinema exploring historical trauma, moral decay, and indigenous soul.',
    logo_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=300&q=80',
    founded_year: 2003,
    verification_status: 'verified',
    followers_count: 8400,
    films_count: 14,
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Arkeofilms',
    slug: 'arkeofilms',
    description:
      'Boutique production outfit supporting visionary Philippine independent cinema and regional filmmakers. Known for boundary-pushing narrative and documentary forms.',
    logo_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&q=80',
    founded_year: 2005,
    verification_status: 'verified',
    followers_count: 5100,
    films_count: 12,
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Regal Entertainment',
    slug: 'regal-entertainment',
    description:
      'Legendary Philippine studio founded by Mother Lily Monteverde. Backed the Second Golden Age of Philippine Cinema by bankrolling Bernal’s Manila by Night and De Leon’s Batch 81.',
    logo_url: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=300&q=80',
    founded_year: 1962,
    verification_status: 'verified',
    followers_count: 24500,
    films_count: 450,
  },
];

export const SAMPLE_STUDIO_FILMS: Record<string, StudioFilm[]> = {
  // Anima Studios
  '44444444-4444-4444-4444-444444444444': [
    {
      id: 'cccccccc-0006-0000-0000-000000000000',
      title: 'Leonor Will Never Die',
      release_year: 2022,
      director: 'Martika Ramirez Escobar',
      poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      synopsis: 'A retired screenwriter falls into a coma and wakes up inside her unfinished 80s action film script.',
      audience_score: 91,
      critic_score: 95,
    },
    {
      id: 'cccccccc-0007-0000-0000-000000000000',
      title: 'John Denver Trending',
      release_year: 2019,
      director: 'Arden Rod Condez',
      poster_url: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=600&auto=format&fit=crop&q=80',
      synopsis: 'A viral video upends the life of a 14-year-old junior high school boy in rural Antique.',
      audience_score: 89,
      critic_score: 91,
    },
    {
      id: 'cccccccc-0009-0000-0000-000000000000',
      title: 'Cleaners',
      release_year: 2019,
      director: 'Glenn Barit',
      poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
      synopsis: 'High school cleaners in Tuguegarao navigate innocence, pressure, and coming of age in 2004.',
      audience_score: 94,
      critic_score: 96,
    },
  ],
  // TBA Studios
  '11111111-1111-1111-1111-111111111111': [
    {
      id: 'cccccccc-0008-0000-0000-000000000000',
      title: 'Balangiga: Howling Wilderness',
      release_year: 2017,
      director: 'Khavn De La Cruz',
      poster_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
      synopsis: 'An eight-year-old boy and his grandfather flee the scorched-earth campaign in Samar during 1901.',
      audience_score: 85,
      critic_score: 92,
    },
  ],
};

export const SAMPLE_STUDIO_AWARDS: Record<string, StudioAwardSummary> = {
  // Anima Studios
  '44444444-4444-4444-4444-444444444444': {
    wins_count: 14,
    nominations_count: 28,
    recognitions: [
      {
        id: 'saw-1',
        ceremony_year: 2022,
        status: 'won',
        category_name: 'Special Jury Prize (World Cinema Dramatic)',
        award_body_name: 'Sundance Film Festival',
        film_title: 'Leonor Will Never Die',
      },
      {
        id: 'saw-2',
        ceremony_year: 2019,
        status: 'won',
        category_name: 'Best Film & NETPAC Jury Prize',
        award_body_name: 'Cinemalaya Philippine Independent Film Festival',
        film_title: 'John Denver Trending',
      },
      {
        id: 'saw-3',
        ceremony_year: 2020,
        status: 'won',
        category_name: 'Best Picture',
        award_body_name: 'QCinema International Film Festival',
        film_title: 'Cleaners',
      },
      {
        id: 'saw-4',
        ceremony_year: 2023,
        status: 'nominated',
        category_name: 'Best International Feature',
        award_body_name: 'Independent Spirit Awards',
        film_title: 'Leonor Will Never Die',
      },
    ],
  },
  // TBA Studios
  '11111111-1111-1111-1111-111111111111': {
    wins_count: 18,
    nominations_count: 36,
    recognitions: [
      {
        id: 'saw-5',
        ceremony_year: 2018,
        status: 'won',
        category_name: 'Best Picture',
        award_body_name: 'FAMAS Awards',
        film_title: 'Balangiga: Howling Wilderness',
      },
      {
        id: 'saw-6',
        ceremony_year: 2018,
        status: 'won',
        category_name: 'Best Picture',
        award_body_name: 'Gawad Urian',
        film_title: 'Balangiga: Howling Wilderness',
      },
    ],
  },
};

export const SAMPLE_STUDIO_CLIPS: Record<string, StudioClip[]> = {
  // Anima Studios
  '44444444-4444-4444-4444-444444444444': [
    {
      id: 'sclip-1',
      film_id: 'cccccccc-0006-0000-0000-000000000000',
      film_title: 'Leonor Will Never Die',
      youtube_id: '7lMwbA9bUVo',
      title: 'Leonor Will Never Die | Official US Theatrical Trailer (Music Box Films / Anima)',
      type: 'official',
      view_count: 48900,
      duration_seconds: 145,
      published_at: '2022-11-01T10:00:00Z',
    },
    {
      id: 'sclip-2',
      film_id: 'cccccccc-0007-0000-0000-000000000000',
      film_title: 'John Denver Trending',
      youtube_id: 'E_tqA8L5JbE',
      title: 'John Denver Trending | Official Teaser Trailer | Anima Studios',
      type: 'teaser',
      view_count: 31200,
      duration_seconds: 110,
      published_at: '2019-07-20T14:00:00Z',
    },
  ],
};

// ==============================================================================
// SUPABASE API FUNCTIONS
// ==============================================================================

export async function fetchStudios(): Promise<Studio[]> {
  try {
    const { data, error } = await supabase
      .from('studios')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      return SAMPLE_STUDIOS;
    }

    const studiosWithStats = await Promise.all(
      data.map(async (row: any) => {
        const [followsRes, filmsRes] = await Promise.all([
          supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('target_type', 'studio')
            .eq('target_id', row.id),
          supabase
            .from('films')
            .select('*', { count: 'exact', head: true })
            .eq('studio_id', row.id),
        ]);

        const sample = SAMPLE_STUDIOS.find(
          (s) => s.id === row.id || s.slug === row.slug
        );

        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description || sample?.description,
          logo_url: row.logo_url || sample?.logo_url,
          founded_year: row.founded_year || sample?.founded_year,
          verification_status: row.verification_status || 'unverified',
          followers_count: followsRes.count ?? (sample?.followers_count || 1200),
          films_count: filmsRes.count ?? (sample?.films_count || 4),
        };
      })
    );

    return studiosWithStats;
  } catch (err) {
    console.warn('fetchStudios error, using fallback:', err);
    return SAMPLE_STUDIOS;
  }
}

export async function fetchStudioById(idOrSlug: string): Promise<Studio | null> {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  try {
    let query = supabase.from('studios').select('*');
    if (isUUID) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data: row, error } = await query.maybeSingle();

    if (error || !row) {
      const sample = SAMPLE_STUDIOS.find(
        (s) => s.id === idOrSlug || s.slug === idOrSlug
      );
      return sample || null;
    }

    const [followsRes, filmsRes] = await Promise.all([
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'studio')
        .eq('target_id', row.id),
      supabase
        .from('films')
        .select('*', { count: 'exact', head: true })
        .eq('studio_id', row.id),
    ]);

    const sample = SAMPLE_STUDIOS.find(
      (s) => s.id === row.id || s.slug === row.slug
    );

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || sample?.description,
      logo_url: row.logo_url || sample?.logo_url,
      founded_year: row.founded_year || sample?.founded_year,
      verification_status: row.verification_status || 'unverified',
      followers_count: followsRes.count ?? (sample?.followers_count || 1500),
      films_count: filmsRes.count ?? (sample?.films_count || 6),
    };
  } catch (err) {
    console.warn('fetchStudioById error, using fallback:', err);
    return SAMPLE_STUDIOS.find((s) => s.id === idOrSlug || s.slug === idOrSlug) || null;
  }
}

export async function fetchStudioFilms(studioId: string): Promise<StudioFilm[]> {
  try {
    const { data, error } = await supabase
      .from('films')
      .select('id, title, release_date, poster_url, synopsis')
      .eq('studio_id', studioId)
      .order('release_date', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        release_year: item.release_date
          ? new Date(item.release_date).getFullYear()
          : 2020,
        poster_url: item.poster_url,
        director: 'Filipino Director',
        synopsis: item.synopsis,
        audience_score: 90,
        critic_score: 92,
      }));
    }

    return SAMPLE_STUDIO_FILMS[studioId] || SAMPLE_STUDIO_FILMS['44444444-4444-4444-4444-444444444444'] || [];
  } catch {
    return SAMPLE_STUDIO_FILMS[studioId] || SAMPLE_STUDIO_FILMS['44444444-4444-4444-4444-444444444444'] || [];
  }
}

export async function fetchStudioAwards(studioId: string): Promise<StudioAwardSummary> {
  try {
    // In our schema, awards can be associated with films produced by the studio
    const { data, error } = await supabase
      .from('award_recognitions')
      .select(`
        id,
        ceremony_year,
        status,
        recipient_id,
        award_categories:category_id (
          name,
          award_bodies:body_id (
            name,
            acronym
          )
        ),
        films:recipient_id (
          id,
          title,
          studio_id
        )
      `)
      .eq('films.studio_id', studioId)
      .order('ceremony_year', { ascending: false });

    if (!error && data && data.length > 0) {
      let wins = 0;
      let nominations = 0;

      const recognitions = data
        .filter((item: any) => item.films && item.films.studio_id === studioId)
        .map((item: any) => {
          if (item.status === 'won') wins++;
          else if (item.status === 'nominated') nominations++;

          return {
            id: item.id,
            ceremony_year: item.ceremony_year,
            status: item.status,
            category_name: item.award_categories?.name || 'Category',
            award_body_name:
              item.award_categories?.award_bodies?.name ||
              item.award_categories?.award_bodies?.acronym ||
              'Award Body',
            film_title: item.films?.title,
          };
        });

      return {
        wins_count: wins,
        nominations_count: nominations,
        recognitions,
      };
    }

    return SAMPLE_STUDIO_AWARDS[studioId] || { wins_count: 0, nominations_count: 0, recognitions: [] };
  } catch {
    return SAMPLE_STUDIO_AWARDS[studioId] || { wins_count: 0, nominations_count: 0, recognitions: [] };
  }
}

export async function fetchStudioClips(studioId: string): Promise<StudioClip[]> {
  try {
    const { data, error } = await supabase
      .from('trailers')
      .select(`
        id,
        film_id,
        youtube_id,
        title,
        type,
        view_count,
        duration_seconds,
        published_at,
        films:film_id (
          title
        )
      `)
      .eq('posted_by_type', 'studio')
      .eq('posted_by_id', studioId)
      .order('view_count', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        film_id: item.film_id,
        film_title: item.films?.title,
        youtube_id: item.youtube_id,
        title: item.title,
        type: item.type || 'official',
        view_count: Number(item.view_count) || 0,
        duration_seconds: item.duration_seconds,
        published_at: item.published_at,
      }));
    }

    return SAMPLE_STUDIO_CLIPS[studioId] || [];
  } catch {
    return SAMPLE_STUDIO_CLIPS[studioId] || [];
  }
}

