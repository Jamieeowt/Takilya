import { supabase } from '@/lib/supabase';
import {
  Person,
  PersonFilmCredit,
  PersonAwardSummary,
  PersonClip,
} from './types';

// ==============================================================================
// AUTHENTIC PHILIPPINE CINEMA PEOPLE FALLBACK CATALOG
// ==============================================================================

export const SAMPLE_PEOPLE: Person[] = [
  {
    id: 'aaaaaaaa-0001-0000-0000-000000000000',
    name: 'Ishmael Bernal',
    slug: 'ishmael-bernal',
    bio: 'Conferred National Artist for Cinema (2001). Master of social satire, humanism, and sharp feminist drama. Celebrated as the greatest Philippine filmmaker alongside Lino Brocka.',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    birth_year: 1938,
    role_type: 'director',
    verification_status: 'verified',
    followers_count: 8900,
    films_count: 24,
    national_artist: {
      year_conferred: 2001,
      category: 'Cinema',
      citation: 'For his incisive social commentaries, stylistic mastery, and indelible contributions to the Golden Age of Philippine Cinema including Himala and Manila by Night.',
    },
  },
  {
    id: 'aaaaaaaa-0002-0000-0000-000000000000',
    name: 'Lino Brocka',
    slug: 'lino-brocka',
    bio: 'Conferred National Artist for Cinema (1997). Legendary champion of freedom of expression and militant Philippine social realism. The first Filipino director in competition at Cannes.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    birth_year: 1939,
    role_type: 'director',
    verification_status: 'verified',
    followers_count: 10400,
    films_count: 28,
    national_artist: {
      year_conferred: 1997,
      category: 'Cinema',
      citation: 'For pioneering militant social realism, exposing the plight of marginalized urban poor, and asserting films as vital agents for social change.',
    },
  },
  {
    id: 'aaaaaaaa-0003-0000-0000-000000000000',
    name: 'Kidlat Tahimik',
    slug: 'kidlat-tahimik',
    bio: 'Conferred National Artist for Film and Broadcast Arts (2018). Father of Philippine independent cinema. Master of post-colonial mythmaking and indigenous cinematic language.',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    birth_year: 1942,
    role_type: 'director',
    verification_status: 'verified',
    followers_count: 6700,
    films_count: 12,
    national_artist: {
      year_conferred: 2018,
      category: 'Film and Broadcast Arts',
      citation: 'For trailblazing indigenous, personal, and fiercely independent cinema with international acclaim for Mababangong Bangungot.',
    },
  },
  {
    id: 'aaaaaaaa-0007-0000-0000-000000000000',
    name: 'Nora Aunor',
    slug: 'nora-aunor',
    bio: 'Conferred National Artist for Film and Broadcast Arts (2022). The Philippine Grand Dame of Cinema and its most revered dramatic performer, immortalized in Himala and Bona.',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    birth_year: 1953,
    role_type: 'actor',
    verification_status: 'verified',
    followers_count: 18200,
    films_count: 52,
    national_artist: {
      year_conferred: 2022,
      category: 'Film and Broadcast Arts',
      citation: 'For unmatched dramatic vulnerability, distinct vocal mastery, and immortal performances that defined generations of Philippine storytelling.',
    },
  },
  {
    id: 'aaaaaaaa-0004-0000-0000-000000000000',
    name: 'Martika Ramirez Escobar',
    slug: 'martika-escobar',
    bio: 'Director and cinematographer. First Filipino feature filmmaker to win the Sundance Film Festival Special Jury Prize with Leonor Will Never Die (2022).',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    birth_year: 1992,
    role_type: 'director',
    verification_status: 'verified',
    followers_count: 7300,
    films_count: 4,
    national_artist: null,
  },
  {
    id: 'aaaaaaaa-0010-0000-0000-000000000000',
    name: 'Mike De Leon',
    slug: 'mike-de-leon',
    bio: 'Visionary auteur and film preservation advocate. Renowned for subversive psychological thrillers, dark familial allegories, and pristine visual craftsmanship in Kisapmata and Batch 81.',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
    birth_year: 1947,
    role_type: 'director',
    verification_status: 'verified',
    followers_count: 8100,
    films_count: 14,
    national_artist: null,
  },
  {
    id: 'aaaaaaaa-0008-0000-0000-000000000000',
    name: 'Bembol Roco',
    slug: 'bembol-roco',
    bio: 'Legendary Filipino actor whose devastating debut as Julio Madiaga in Brocka’s Maynila sa mga Kuko ng Liwanag set the eternal standard for Philippine cinematic realism.',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    birth_year: 1953,
    role_type: 'actor',
    verification_status: 'verified',
    followers_count: 4200,
    films_count: 38,
    national_artist: null,
  },
  {
    id: 'aaaaaaaa-0009-0000-0000-000000000000',
    name: 'Sheila Francisco',
    slug: 'sheila-francisco',
    bio: 'Acclaimed theater, screen, and musical actress. Internationally celebrated for her radiant, meta-action performance as Leonor Reyes in Leonor Will Never Die.',
    photo_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&auto=format&fit=crop&q=80',
    birth_year: 1957,
    role_type: 'actor',
    verification_status: 'verified',
    followers_count: 3600,
    films_count: 16,
    national_artist: null,
  },
  {
    id: 'aaaaaaaa-0005-0000-0000-000000000000',
    name: 'Arden Rod Condez',
    slug: 'arden-rod-condez',
    bio: 'Antiqueño filmmaker and screenwriter. Champion of authentic Kinaray-a language cinema with his viral social drama John Denver Trending.',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    birth_year: 1982,
    role_type: 'director',
    verification_status: 'verified',
    followers_count: 3400,
    films_count: 3,
    national_artist: null,
  },
  {
    id: 'aaaaaaaa-0006-0000-0000-000000000000',
    name: 'Glenn Barit',
    slug: 'glenn-barit',
    bio: 'Tuguegarao-born filmmaker recognized for inventive tactile filmmaking, photocopied paper animation, and authentic regional youth portraits in Cleaners.',
    photo_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600&auto=format&fit=crop&q=80',
    birth_year: 1992,
    role_type: 'director',
    verification_status: 'verified',
    followers_count: 3900,
    films_count: 4,
    national_artist: null,
  },
];

export const SAMPLE_PERSON_CREDITS: Record<string, PersonFilmCredit[]> = {
  // Ishmael Bernal
  'aaaaaaaa-0001-0000-0000-000000000000': [
    {
      id: 'cred-1',
      film_id: 'cccccccc-0001-0000-0000-000000000000',
      film_title: 'Himala',
      release_year: 1982,
      poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
      role: 'director',
      billing_order: 1,
    },
    {
      id: 'cred-2',
      film_id: 'cccccccc-0011-0000-0000-000000000000',
      film_title: 'Manila by Night (City After Dark)',
      release_year: 1980,
      poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
      role: 'director',
      billing_order: 1,
    },
    {
      id: 'cred-3',
      film_id: 'cccccccc-0012-0000-0000-000000000000',
      film_title: 'Relasyon',
      release_year: 1982,
      poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      role: 'director',
      billing_order: 1,
    },
  ],
  // Nora Aunor
  'aaaaaaaa-0007-0000-0000-000000000000': [
    {
      id: 'cred-4',
      film_id: 'cccccccc-0001-0000-0000-000000000000',
      film_title: 'Himala',
      release_year: 1982,
      poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
      role: 'lead_actor',
      character_name: 'Elsa',
      billing_order: 1,
    },
    {
      id: 'cred-5',
      film_id: 'cccccccc-0013-0000-0000-000000000000',
      film_title: 'Bona',
      release_year: 1980,
      poster_url: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=600&auto=format&fit=crop&q=80',
      role: 'lead_actor',
      character_name: 'Bona',
      billing_order: 1,
    },
  ],
  // Martika Ramirez Escobar
  'aaaaaaaa-0004-0000-0000-000000000000': [
    {
      id: 'cred-6',
      film_id: 'cccccccc-0006-0000-0000-000000000000',
      film_title: 'Leonor Will Never Die',
      release_year: 2022,
      poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      role: 'director',
      billing_order: 1,
    },
    {
      id: 'cred-7',
      film_id: 'cccccccc-0006-0000-0000-000000000000',
      film_title: 'Leonor Will Never Die',
      release_year: 2022,
      poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      role: 'writer',
      billing_order: 1,
    },
  ],
};

export const SAMPLE_PERSON_AWARDS: Record<string, PersonAwardSummary> = {
  // Ishmael Bernal
  'aaaaaaaa-0001-0000-0000-000000000000': {
    wins_count: 5,
    nominations_count: 9,
    recognitions: [
      {
        id: 'aw-1',
        ceremony_year: 1983,
        status: 'won',
        category_name: 'Best Director',
        award_body_name: 'Gawad Urian',
        film_title: 'Relasyon',
      },
      {
        id: 'aw-2',
        ceremony_year: 1983,
        status: 'nominated',
        category_name: 'Golden Bear (Best Film)',
        award_body_name: 'Berlin International Film Festival',
        film_title: 'Himala',
      },
      {
        id: 'aw-3',
        ceremony_year: 1981,
        status: 'won',
        category_name: 'Best Director',
        award_body_name: 'Gawad Urian',
        film_title: 'City After Dark (Manila by Night)',
      },
      {
        id: 'aw-4',
        ceremony_year: 2008,
        status: 'won',
        category_name: 'CNN Viewer’s Choice Best Asia-Pacific Film of All Time',
        award_body_name: 'Asia Pacific Screen Awards / CNN',
        film_title: 'Himala',
      },
    ],
  },
  // Nora Aunor
  'aaaaaaaa-0007-0000-0000-000000000000': {
    wins_count: 7,
    nominations_count: 14,
    recognitions: [
      {
        id: 'aw-5',
        ceremony_year: 1983,
        status: 'won',
        category_name: 'Best Actress',
        award_body_name: 'Metro Manila Film Festival',
        film_title: 'Himala',
      },
      {
        id: 'aw-6',
        ceremony_year: 1981,
        status: 'won',
        category_name: 'Best Actress',
        award_body_name: 'Gawad Urian',
        film_title: 'Bona',
      },
      {
        id: 'aw-7',
        ceremony_year: 2013,
        status: 'won',
        category_name: 'Best Actress',
        award_body_name: 'Asian Film Awards',
        film_title: 'Thy Womb',
      },
    ],
  },
  // Martika Ramirez Escobar
  'aaaaaaaa-0004-0000-0000-000000000000': {
    wins_count: 3,
    nominations_count: 6,
    recognitions: [
      {
        id: 'aw-8',
        ceremony_year: 2022,
        status: 'won',
        category_name: 'Special Jury Prize (World Cinema Dramatic)',
        award_body_name: 'Sundance Film Festival',
        film_title: 'Leonor Will Never Die',
      },
      {
        id: 'aw-9',
        ceremony_year: 2023,
        status: 'nominated',
        category_name: 'Best International Feature',
        award_body_name: 'Independent Spirit Awards',
        film_title: 'Leonor Will Never Die',
      },
      {
        id: 'aw-10',
        ceremony_year: 2023,
        status: 'won',
        category_name: 'Best Director',
        award_body_name: 'Gawad Urian',
        film_title: 'Leonor Will Never Die',
      },
    ],
  },
};

export const SAMPLE_PERSON_CLIPS: Record<string, PersonClip[]> = {
  // Martika Ramirez Escobar
  'aaaaaaaa-0004-0000-0000-000000000000': [
    {
      id: 'clip-p-1',
      film_id: 'cccccccc-0006-0000-0000-000000000000',
      film_title: 'Leonor Will Never Die',
      youtube_id: '7lMwbA9bUVo',
      title: 'Director’s Commentary: The Meta-Cinematic World of Leonor',
      type: 'behind_the_scenes',
      view_count: 14200,
      duration_seconds: 180,
      published_at: '2023-01-10T12:00:00Z',
    },
  ],
};

// ==============================================================================
// SUPABASE API FUNCTIONS
// ==============================================================================

export async function fetchPeople(roleFilter?: string): Promise<Person[]> {
  try {
    let query = supabase.from('people').select(`
      *,
      national_artists (
        year_conferred,
        category,
        citation
      )
    `).order('name', { ascending: true });

    if (roleFilter && roleFilter !== 'all') {
      query = query.eq('role_type', roleFilter);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (roleFilter && roleFilter !== 'all') {
        return SAMPLE_PEOPLE.filter((p) => p.role_type === roleFilter);
      }
      return SAMPLE_PEOPLE;
    }

    // Enhance with follower counts
    const peopleWithStats = await Promise.all(
      data.map(async (row: any) => {
        const [followsRes, creditsRes] = await Promise.all([
          supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('target_type', 'person')
            .eq('target_id', row.id),
          supabase
            .from('film_credits')
            .select('*', { count: 'exact', head: true })
            .eq('person_id', row.id),
        ]);

        const sample = SAMPLE_PEOPLE.find(
          (s) => s.id === row.id || s.slug === row.slug
        );

        const naRow = Array.isArray(row.national_artists)
          ? row.national_artists[0]
          : row.national_artists;

        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          bio: row.bio || sample?.bio,
          photo_url: row.photo_url || sample?.photo_url,
          birth_year: row.birth_year || sample?.birth_year,
          role_type: row.role_type || 'director',
          verification_status: row.verification_status || 'unverified',
          followers_count: followsRes.count ?? (sample?.followers_count || 1200),
          films_count: creditsRes.count ?? (sample?.films_count || 5),
          national_artist: naRow || sample?.national_artist || null,
        };
      })
    );

    return peopleWithStats;
  } catch (err) {
    console.warn('fetchPeople error, using fallback:', err);
    return SAMPLE_PEOPLE;
  }
}

export async function fetchPersonById(idOrSlug: string): Promise<Person | null> {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  try {
    let query = supabase.from('people').select(`
      *,
      national_artists (
        year_conferred,
        category,
        citation
      )
    `);

    if (isUUID) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data: row, error } = await query.maybeSingle();

    if (error || !row) {
      const sample = SAMPLE_PEOPLE.find(
        (p) => p.id === idOrSlug || p.slug === idOrSlug
      );
      return sample || null;
    }

    const [followsRes, creditsRes] = await Promise.all([
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'person')
        .eq('target_id', row.id),
      supabase
        .from('film_credits')
        .select('*', { count: 'exact', head: true })
        .eq('person_id', row.id),
    ]);

    const sample = SAMPLE_PEOPLE.find(
      (s) => s.id === row.id || s.slug === row.slug
    );

    const naRow = Array.isArray(row.national_artists)
      ? row.national_artists[0]
      : row.national_artists;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      bio: row.bio || sample?.bio,
      photo_url: row.photo_url || sample?.photo_url,
      birth_year: row.birth_year || sample?.birth_year,
      role_type: row.role_type || 'director',
      verification_status: row.verification_status || 'unverified',
      followers_count: followsRes.count ?? (sample?.followers_count || 1400),
      films_count: creditsRes.count ?? (sample?.films_count || 6),
      national_artist: naRow || sample?.national_artist || null,
    };
  } catch (err) {
    console.warn('fetchPersonById error, using fallback:', err);
    return SAMPLE_PEOPLE.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }
}

export async function fetchPersonCredits(personId: string): Promise<PersonFilmCredit[]> {
  try {
    const { data, error } = await supabase
      .from('film_credits')
      .select(`
        id,
        film_id,
        role,
        character_name,
        billing_order,
        films:film_id (
          id,
          title,
          release_date,
          poster_url
        )
      `)
      .eq('person_id', personId)
      .order('billing_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((item: any) => {
        const year = item.films?.release_date
          ? new Date(item.films.release_date).getFullYear()
          : 2020;

        return {
          id: item.id,
          film_id: item.film_id,
          film_title: item.films?.title || 'Philippine Film',
          release_year: year,
          poster_url: item.films?.poster_url,
          role: item.role,
          character_name: item.character_name,
          billing_order: item.billing_order,
        };
      });
    }

    return SAMPLE_PERSON_CREDITS[personId] || SAMPLE_PERSON_CREDITS['aaaaaaaa-0001-0000-0000-000000000000'] || [];
  } catch {
    return SAMPLE_PERSON_CREDITS[personId] || SAMPLE_PERSON_CREDITS['aaaaaaaa-0001-0000-0000-000000000000'] || [];
  }
}

export async function fetchPersonAwards(personId: string): Promise<PersonAwardSummary> {
  try {
    const { data, error } = await supabase
      .from('award_recognitions')
      .select(`
        id,
        ceremony_year,
        status,
        notes,
        award_categories:category_id (
          name,
          award_bodies:body_id (
            name,
            acronym
          )
        )
      `)
      .eq('recipient_type', 'person')
      .eq('recipient_id', personId)
      .order('ceremony_year', { ascending: false });

    if (!error && data && data.length > 0) {
      let wins = 0;
      let nominations = 0;

      const recognitions = data.map((item: any) => {
        if (item.status === 'won') wins++;
        else if (item.status === 'nominated') nominations++;

        const categoryName = item.award_categories?.name || 'Category';
        const bodyName =
          item.award_categories?.award_bodies?.name ||
          item.award_categories?.award_bodies?.acronym ||
          'Award Body';

        return {
          id: item.id,
          ceremony_year: item.ceremony_year,
          status: item.status,
          category_name: categoryName,
          award_body_name: bodyName,
          notes: item.notes,
        };
      });

      return {
        wins_count: wins,
        nominations_count: nominations,
        recognitions,
      };
    }

    return SAMPLE_PERSON_AWARDS[personId] || { wins_count: 0, nominations_count: 0, recognitions: [] };
  } catch {
    return SAMPLE_PERSON_AWARDS[personId] || { wins_count: 0, nominations_count: 0, recognitions: [] };
  }
}

export async function fetchPersonClips(personId: string): Promise<PersonClip[]> {
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
      .eq('posted_by_type', 'person')
      .eq('posted_by_id', personId)
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

    return SAMPLE_PERSON_CLIPS[personId] || [];
  } catch {
    return SAMPLE_PERSON_CLIPS[personId] || [];
  }
}

