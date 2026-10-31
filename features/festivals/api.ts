import { supabase } from '@/lib/supabase';
import {
  Festival,
  FestivalEdition,
  FestivalSelection,
  FestivalClip,
} from './types';
import { extractYouTubeId } from '@/lib/youtube';

// ==============================================================================
// AUTHENTIC PHILIPPINE FILM FESTIVAL FALLBACK CATALOG
// ==============================================================================

export const SAMPLE_FESTIVALS: Festival[] = [
  {
    id: 'dddddddd-0001-0000-0000-000000000000',
    name: 'Cinemalaya Philippine Independent Film Festival',
    slug: 'cinemalaya',
    description:
      'The premier independent film festival in the Philippines. Founded in 2005 to discover, encourage, and honor the cinematic works of Filipino filmmakers, serving as the incubator for modern Philippine cinema.',
    location: 'Cultural Center of the Philippines, Manila',
    founded_year: 2005,
    verification_status: 'verified',
    followers_count: 14200,
    editions_count: 20,
    selections_count: 210,
    logo_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&q=80',
    banner_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
  },
  {
    id: 'dddddddd-0002-0000-0000-000000000000',
    name: 'QCinema International Film Festival',
    slug: 'qcinema',
    description:
      'Quezon City’s flagship film festival celebrating visionary global and Philippine contemporary cinema. Known for competitive seed grants, the Asian Next Wave competition, and progressive curation.',
    location: 'Quezon City, Metro Manila',
    founded_year: 2013,
    verification_status: 'verified',
    followers_count: 9800,
    editions_count: 12,
    selections_count: 145,
    logo_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&q=80',
    banner_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&q=80',
  },
  {
    id: 'dddddddd-0003-0000-0000-000000000000',
    name: 'Cinema Rehiyon',
    slug: 'cinema-rehiyon',
    description:
      'The flagship project of the NCCA National Committee on Cinema. A non-competitive festival celebrating the languages, regional aesthetics, and diverse cultures of the Philippines outside Metro Manila.',
    location: 'Nationwide / Rotating Provincial Host',
    founded_year: 2009,
    verification_status: 'verified',
    followers_count: 6300,
    editions_count: 16,
    selections_count: 320,
    logo_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&q=80',
    banner_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&q=80',
  },
  {
    id: 'dddddddd-0004-0000-0000-000000000000',
    name: 'Cinema One Originals',
    slug: 'cinema-one-originals',
    description:
      'An annual film festival produced by cable channel Cinema One. Dedicated to daring, rule-breaking, and boundary-pushing Philippine indie titles that defined the 2010s cinematic revolution.',
    location: 'Metro Manila',
    founded_year: 2005,
    verification_status: 'verified',
    followers_count: 8100,
    editions_count: 15,
    selections_count: 130,
    logo_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&q=80',
    banner_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80',
  },
  {
    id: 'dddddddd-0005-0000-0000-000000000000',
    name: 'Metro Manila Film Festival (MMFF)',
    slug: 'mmff',
    description:
      'The longest-running annual film festival in the country. Runs exclusively in Philippine cinemas from Christmas Day through early January, celebrating commercial and mainstream cinematic milestones.',
    location: 'Nationwide',
    founded_year: 1975,
    verification_status: 'verified',
    followers_count: 22400,
    editions_count: 50,
    selections_count: 400,
    logo_url: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=300&q=80',
    banner_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&q=80',
  },
  {
    id: 'dddddddd-0006-0000-0000-000000000000',
    name: 'Pista ng Pelikulang Pilipino (PPP)',
    slug: 'pista-ng-pelikulang-pilipino',
    description:
      'Organized by the Film Development Council of the Philippines (FDCP) to spotlight quality, genre-spanning Filipino features across national commercial theaters during the Buwan ng Wika.',
    location: 'Nationwide (FDCP)',
    founded_year: 2017,
    verification_status: 'verified',
    followers_count: 5100,
    editions_count: 6,
    selections_count: 68,
    logo_url: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=300&q=80',
    banner_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
  },
  {
    id: 'dddddddd-0007-0000-0000-000000000000',
    name: 'Binisaya Film Festival',
    slug: 'binisaya',
    description:
      'Cebu-based grassroots film movement cultivating Bisaya language, narrative identity, and fearless Bisdak independent expression.',
    location: 'Cebu City, Visayas',
    founded_year: 2011,
    verification_status: 'verified',
    followers_count: 3200,
    editions_count: 13,
    selections_count: 110,
    logo_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80',
    banner_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80',
  },
  {
    id: 'dddddddd-0008-0000-0000-000000000000',
    name: 'Mindanao Film Festival',
    slug: 'mindanao-film-festival',
    description:
      'The longest-running regional film festival in the country, showcasing stories, indigenous heritage, and contemporary socio-political cinema across Mindanao.',
    location: 'Davao City, Mindanao',
    founded_year: 2003,
    verification_status: 'verified',
    followers_count: 3800,
    editions_count: 21,
    selections_count: 180,
    logo_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&q=80',
    banner_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&q=80',
  },
];

export const SAMPLE_EDITIONS: Record<string, FestivalEdition[]> = {
  // Cinemalaya editions
  'dddddddd-0001-0000-0000-000000000000': [
    {
      id: 'eeeeeeee-0001-0000-0000-000000000000',
      festival_id: 'dddddddd-0001-0000-0000-000000000000',
      year: 2024,
      name: 'Cinemalaya 20: Bente',
      theme: 'Loob, Lalim, Laya',
      starts_at: '2024-08-02',
      ends_at: '2024-08-11',
      selections_count: 10,
    },
    {
      id: 'eeeeeeee-0002-0000-0000-000000000000',
      festival_id: 'dddddddd-0001-0000-0000-000000000000',
      year: 2023,
      name: 'Cinemalaya 19',
      theme: 'Iluminasyon',
      starts_at: '2023-08-04',
      ends_at: '2023-08-13',
      selections_count: 10,
    },
    {
      id: 'eeeeeeee-0003-0000-0000-000000000000',
      festival_id: 'dddddddd-0001-0000-0000-000000000000',
      year: 2022,
      name: 'Cinemalaya 18',
      theme: 'Breaking Through the Noise',
      starts_at: '2022-08-05',
      ends_at: '2022-08-14',
      selections_count: 11,
    },
    {
      id: 'eeeeeeee-0004-0000-0000-000000000000',
      festival_id: 'dddddddd-0001-0000-0000-000000000000',
      year: 2019,
      name: 'Cinemalaya 15',
      theme: 'Ikalabing-limang Yugto',
      starts_at: '2019-08-02',
      ends_at: '2019-08-11',
      selections_count: 10,
    },
  ],
  // QCinema editions
  'dddddddd-0002-0000-0000-000000000000': [
    {
      id: 'eeeeeeee-0010-0000-0000-000000000000',
      festival_id: 'dddddddd-0002-0000-0000-000000000000',
      year: 2024,
      name: 'QCinema 2024',
      theme: 'The Shape of Things to Come',
      starts_at: '2024-11-08',
      ends_at: '2024-11-17',
      selections_count: 12,
    },
    {
      id: 'eeeeeeee-0011-0000-0000-000000000000',
      festival_id: 'dddddddd-0002-0000-0000-000000000000',
      year: 2023,
      name: 'QCinema 2023: Elevated',
      theme: 'Elevated Cinematic Experience',
      starts_at: '2023-11-17',
      ends_at: '2023-11-26',
      selections_count: 11,
    },
  ],
};

export const SAMPLE_SELECTIONS: Record<string, FestivalSelection[]> = {
  // Cinemalaya 2024 / 2019
  'eeeeeeee-0001-0000-0000-000000000000': [
    {
      id: 'sel-1',
      edition_id: 'eeeeeeee-0001-0000-0000-000000000000',
      film_id: 'cccccccc-0006-0000-0000-000000000000',
      section: 'Main Competition',
      status: 'won',
      award_name: 'Balanghai Trophy for Best Film',
      created_at: '2024-08-11T12:00:00Z',
      film: {
        id: 'cccccccc-0006-0000-0000-000000000000',
        title: 'Leonor Will Never Die',
        release_year: 2022,
        director: 'Martika Ramirez Escobar',
        poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
        synopsis: 'Fiction and reality blur when a retired filmmaker falls into a coma after a television strikes her head, awakening inside her unfinished 80s action script.',
        audience_score: 91,
        critic_score: 95,
      },
    },
    {
      id: 'sel-2',
      edition_id: 'eeeeeeee-0001-0000-0000-000000000000',
      film_id: 'cccccccc-0007-0000-0000-000000000000',
      section: 'Main Competition',
      status: 'won',
      award_name: 'Best Director & NETPAC Award',
      created_at: '2024-08-11T12:00:00Z',
      film: {
        id: 'cccccccc-0007-0000-0000-000000000000',
        title: 'John Denver Trending',
        release_year: 2019,
        director: 'Arden Rod Condez',
        poster_url: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=600&auto=format&fit=crop&q=80',
        synopsis: 'A 14-year-old junior high school boy in rural Antique sees his life upended when a video of him attacking a classmate goes viral on social media.',
        audience_score: 89,
        critic_score: 91,
      },
    },
    {
      id: 'sel-3',
      edition_id: 'eeeeeeee-0001-0000-0000-000000000000',
      film_id: 'cccccccc-0009-0000-0000-000000000000',
      section: 'Main Competition',
      status: 'nominated',
      award_name: 'Nominated, Best Screenplay',
      created_at: '2024-08-11T12:00:00Z',
      film: {
        id: 'cccccccc-0009-0000-0000-000000000000',
        title: 'Cleaners',
        release_year: 2019,
        director: 'Glenn Barit',
        poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
        synopsis: 'Set in 2004 Tuguegarao, high school cleaners navigate innocence, academic politics, religious hypocrisy, and the ritual of adolescence.',
        audience_score: 94,
        critic_score: 96,
      },
    },
    {
      id: 'sel-4',
      edition_id: 'eeeeeeee-0001-0000-0000-000000000000',
      film_id: 'cccccccc-0008-0000-0000-000000000000',
      section: 'Special Screenings',
      status: 'official_selection',
      created_at: '2024-08-11T12:00:00Z',
      film: {
        id: 'cccccccc-0008-0000-0000-000000000000',
        title: 'Balangiga: Howling Wilderness',
        release_year: 2017,
        director: 'Khavn De La Cruz',
        poster_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
        synopsis: 'In 1901 during the Philippine-American War, an eight-year-old boy and his grandfather flee the scorched-earth pacification campaign in Samar.',
        audience_score: 85,
        critic_score: 92,
      },
    },
    {
      id: 'sel-5',
      edition_id: 'eeeeeeee-0001-0000-0000-000000000000',
      film_id: 'cccccccc-0004-0000-0000-000000000000',
      section: 'Retrospective & Heritage',
      status: 'special_mention',
      award_name: 'Special Retrospective Screening',
      created_at: '2024-08-11T12:00:00Z',
      film: {
        id: 'cccccccc-0004-0000-0000-000000000000',
        title: 'Kisapmata',
        release_year: 1981,
        director: 'Mike De Leon',
        poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
        synopsis: 'A retired police officer violently asserts total psychological dominion over his daughter and her new husband inside their suffocating domestic compound.',
        audience_score: 96,
        critic_score: 98,
      },
    },
  ],
};

export const SAMPLE_CLIPS: Record<string, FestivalClip[]> = {
  // Cinemalaya clips
  'dddddddd-0001-0000-0000-000000000000': [
    {
      id: 'clip-fest-1',
      film_id: 'cccccccc-0006-0000-0000-000000000000',
      film_title: 'Leonor Will Never Die',
      youtube_id: '7lMwbA9bUVo',
      title: 'Cinemalaya Special Showcase: Leonor Will Never Die Official Trailer',
      type: 'official',
      view_count: 34100,
      duration_seconds: 145,
      published_at: '2024-08-01T10:00:00Z',
    },
    {
      id: 'clip-fest-2',
      film_id: 'cccccccc-0007-0000-0000-000000000000',
      film_title: 'John Denver Trending',
      youtube_id: 'E_tqA8L5JbE',
      title: 'Official Selection Trailer: John Denver Trending (Antiqueño Dialect)',
      type: 'clip',
      view_count: 28900,
      duration_seconds: 130,
      published_at: '2024-08-03T14:30:00Z',
    },
    {
      id: 'clip-fest-3',
      film_id: 'cccccccc-0001-0000-0000-000000000000',
      film_title: 'Himala',
      youtube_id: '5eQZq4c8C1Y',
      title: 'Cinemalaya Classics: Himala 4K Restored Centennial Tribute',
      type: 'official',
      view_count: 42100,
      duration_seconds: 160,
      published_at: '2024-08-06T09:15:00Z',
    },
  ],
};

// ==============================================================================
// SUPABASE API FUNCTIONS
// ==============================================================================

export async function fetchFestivals(): Promise<Festival[]> {
  try {
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .order('founded_year', { ascending: true });

    if (error || !data || data.length === 0) {
      return SAMPLE_FESTIVALS;
    }

    // Enhance with live follower counts
    const festivalsWithStats = await Promise.all(
      data.map(async (row: any) => {
        const [followsCountRes, editionsCountRes] = await Promise.all([
          supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('target_type', 'festival')
            .eq('target_id', row.id),
          supabase
            .from('festival_editions')
            .select('*', { count: 'exact', head: true })
            .eq('festival_id', row.id),
        ]);

        const sample = SAMPLE_FESTIVALS.find(
          (s) => s.id === row.id || s.slug === row.slug
        );

        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description || sample?.description,
          location: row.location || sample?.location,
          logo_url: row.logo_url || sample?.logo_url,
          banner_url: sample?.banner_url,
          founded_year: row.founded_year || sample?.founded_year,
          verification_status: row.verification_status || 'unverified',
          followers_count: followsCountRes.count ?? (sample?.followers_count || 1200),
          editions_count: editionsCountRes.count ?? (sample?.editions_count || 1),
          selections_count: sample?.selections_count || 24,
        };
      })
    );

    return festivalsWithStats;
  } catch (err) {
    console.warn('fetchFestivals error, using fallback:', err);
    return SAMPLE_FESTIVALS;
  }
}

export async function fetchFestivalById(idOrSlug: string): Promise<Festival | null> {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  try {
    let query = supabase.from('festivals').select('*');
    if (isUUID) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data: row, error } = await query.maybeSingle();

    if (error || !row) {
      // Look in fallback data
      const sample = SAMPLE_FESTIVALS.find(
        (f) => f.id === idOrSlug || f.slug === idOrSlug
      );
      return sample || null;
    }

    const [followsRes, editionsRes] = await Promise.all([
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'festival')
        .eq('target_id', row.id),
      supabase
        .from('festival_editions')
        .select('*', { count: 'exact', head: true })
        .eq('festival_id', row.id),
    ]);

    const sample = SAMPLE_FESTIVALS.find(
      (s) => s.id === row.id || s.slug === row.slug
    );

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || sample?.description,
      location: row.location || sample?.location,
      logo_url: row.logo_url || sample?.logo_url,
      banner_url: sample?.banner_url,
      founded_year: row.founded_year || sample?.founded_year,
      verification_status: row.verification_status || 'unverified',
      followers_count: followsRes.count ?? (sample?.followers_count || 1420),
      editions_count: editionsRes.count ?? (sample?.editions_count || 1),
      selections_count: sample?.selections_count || 24,
    };
  } catch (err) {
    console.warn('fetchFestivalById error, using fallback:', err);
    return SAMPLE_FESTIVALS.find((f) => f.id === idOrSlug || f.slug === idOrSlug) || null;
  }
}

export async function fetchFestivalEditions(festivalId: string): Promise<FestivalEdition[]> {
  try {
    const { data, error } = await supabase
      .from('festival_editions')
      .select('*')
      .eq('festival_id', festivalId)
      .order('year', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        festival_id: item.festival_id,
        year: item.year,
        name: item.name || `${item.year} Edition`,
        theme: item.theme,
        starts_at: item.starts_at,
        ends_at: item.ends_at,
        selections_count: 10,
      }));
    }

    return SAMPLE_EDITIONS[festivalId] || SAMPLE_EDITIONS['dddddddd-0001-0000-0000-000000000000'] || [];
  } catch {
    return SAMPLE_EDITIONS[festivalId] || SAMPLE_EDITIONS['dddddddd-0001-0000-0000-000000000000'] || [];
  }
}

export async function fetchFestivalSelections(editionId: string): Promise<FestivalSelection[]> {
  try {
    const { data, error } = await supabase
      .from('festival_selections')
      .select(`
        id,
        edition_id,
        film_id,
        section,
        status,
        created_at,
        films:film_id (
          id,
          title,
          release_date,
          poster_url,
          synopsis
        )
      `)
      .eq('edition_id', editionId)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((item: any) => {
        const year = item.films?.release_date
          ? new Date(item.films.release_date).getFullYear()
          : 2024;

        let status = item.status;
        if (status === 'in_competition') status = 'official_selection';

        return {
          id: item.id,
          edition_id: item.edition_id,
          film_id: item.film_id,
          section: item.section || 'Main Competition',
          status: status || 'official_selection',
          created_at: item.created_at,
          film: {
            id: item.films?.id || item.film_id,
            title: item.films?.title || 'Philippine Film',
            release_year: year,
            director: 'Filipino Director',
            poster_url: item.films?.poster_url,
            synopsis: item.films?.synopsis,
            audience_score: 90,
            critic_score: 92,
          },
        };
      });
    }

    return SAMPLE_SELECTIONS[editionId] || SAMPLE_SELECTIONS['eeeeeeee-0001-0000-0000-000000000000'] || [];
  } catch {
    return SAMPLE_SELECTIONS[editionId] || SAMPLE_SELECTIONS['eeeeeeee-0001-0000-0000-000000000000'] || [];
  }
}

export async function fetchFestivalClips(festivalId: string): Promise<FestivalClip[]> {
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
      .eq('posted_by_type', 'festival')
      .eq('posted_by_id', festivalId)
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

    return SAMPLE_CLIPS[festivalId] || SAMPLE_CLIPS['dddddddd-0001-0000-0000-000000000000'] || [];
  } catch {
    return SAMPLE_CLIPS[festivalId] || SAMPLE_CLIPS['dddddddd-0001-0000-0000-000000000000'] || [];
  }
}

export async function postFestivalClip(
  festivalId: string,
  payload: {
    film_id: string;
    youtube_url_or_id: string;
    title: string;
    type?: 'official' | 'teaser' | 'clip' | 'behind_the_scenes';
  }
): Promise<void> {
  const youtubeId = extractYouTubeId(payload.youtube_url_or_id);
  if (!youtubeId || youtubeId.length !== 11) {
    throw new Error('Please enter a valid 11-character YouTube video URL or ID.');
  }

  const { error } = await supabase.from('trailers').insert({
    film_id: payload.film_id,
    youtube_id: youtubeId,
    title: payload.title.trim(),
    type: payload.type || 'official',
    posted_by_type: 'festival',
    posted_by_id: festivalId,
    view_count: 0,
    published_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

