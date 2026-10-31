import { supabase } from '@/lib/supabase';
import {
  NationalArtistItem,
  PreservedFilmItem,
  FilmPreservationDetail,
  PreservationStatus,
} from './types';

// ==============================================================================
// 1. RICH SAMPLE DATASETS (Philippine Film Heritage & Preservation)
// ==============================================================================

export const SAMPLE_NATIONAL_ARTISTS: NationalArtistItem[] = [
  {
    id: 'na-001',
    person_id: 'aaaaaaaa-0001-0000-0000-000000000000',
    year_conferred: 1997,
    category: 'Film and Broadcast Arts',
    citation:
      'Pioneering champion of cinematic social realism and human dignity whose films courageously confronted political oppression, censorship, and the struggles of the urban poor.',
    person: {
      id: 'aaaaaaaa-0001-0000-0000-000000000000',
      name: 'Lino Brocka',
      slug: 'lino-brocka',
      role_type: 'director',
      birth_year: 1939,
      photo_url:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
      bio: 'One of the most acclaimed Philippine filmmakers in world cinema history, whose films Maynila sa mga Kuko ng Liwanag, Insiang, and Jaguar premiered at Cannes.',
    },
  },
  {
    id: 'na-002',
    person_id: 'aaaaaaaa-0002-0000-0000-000000000000',
    year_conferred: 2001,
    category: 'Film and Broadcast Arts',
    citation:
      'The lyrical satirist of Philippine cinema whose razor-sharp wit and profound visual poetry in Himala and Manila by Night exposed the complex moral contradictions of Filipino society.',
    person: {
      id: 'aaaaaaaa-0002-0000-0000-000000000000',
      name: 'Ishmael Bernal',
      slug: 'ishmael-bernal',
      role_type: 'director',
      birth_year: 1938,
      photo_url:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
      bio: 'Visionary auteur heralded as the "Genius of Philippine Cinema", director of landmark classics Himala, Relasyon, and Nunal sa Tubig.',
    },
  },
  {
    id: 'na-003',
    person_id: 'aaaaaaaa-0003-0000-0000-000000000000',
    year_conferred: 2022,
    category: 'Film and Broadcast Arts',
    citation:
      'The People’s National Artist whose peerless expressive genius, unforgettable vocal resonance, and commanding presence across hundreds of roles elevated Philippine screen acting into transcendent cultural mythos.',
    person: {
      id: 'aaaaaaaa-0003-0000-0000-000000000000',
      name: 'Nora Aunor',
      slug: 'nora-aunor',
      role_type: 'actor',
      birth_year: 1953,
      photo_url:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
      bio: 'The "Superstar" of Philippine entertainment, legendary star of Himala, Bona, Tatlong Taong Walang Diyos, and Thy Womb.',
    },
  },
  {
    id: 'na-004',
    person_id: 'aaaaaaaa-0005-0000-0000-000000000000',
    year_conferred: 2018,
    category: 'Film and Broadcast Arts',
    citation:
      'Father of Philippine Independent Cinema whose fiercely non-conformist collage aesthetic and indigenous worldview liberated generations of Southeast Asian filmmakers from Western colonial formulas.',
    person: {
      id: 'aaaaaaaa-0005-0000-0000-000000000000',
      name: 'Kidlat Tahimik',
      slug: 'kidlat-tahimik',
      role_type: 'director',
      birth_year: 1942,
      photo_url:
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop',
      bio: 'Born Eric de Guia in Baguio, his 1977 debut Mababangong Bangungot (Perfumed Nightmare) won the International Critics Prize at Berlinale.',
    },
  },
  {
    id: 'na-005',
    person_id: 'aaaaaaaa-0006-0000-0000-000000000000',
    year_conferred: 2006,
    category: 'Film',
    citation:
      'Cultural titan and "King of Philippine Movies" whose iconic portrayals of principled underdogs championing the poor became enduring beacons of hope for the Filipino masses.',
    person: {
      id: 'aaaaaaaa-0006-0000-0000-000000000000',
      name: 'Fernando Poe Jr.',
      slug: 'fernando-poe-jr',
      role_type: 'actor',
      birth_year: 1939,
      photo_url:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
      bio: 'Universally known as "FPJ" or "Da King", actor, director (as Ronwaldo Reyes), producer, and star of Ang Panday, Asedillo, and Isang Bala Ka Lang.',
    },
  },
  {
    id: 'na-006',
    person_id: 'aaaaaaaa-0007-0000-0000-000000000000',
    year_conferred: 1982,
    category: 'Cinema',
    citation:
      'First National Artist for Cinema whose revolutionary dynamic framing, dramatic lighting, and visceral cinematic language established the bedrock of Philippine visual storytelling.',
    person: {
      id: 'aaaaaaaa-0007-0000-0000-000000000000',
      name: 'Gerardo de Leon',
      slug: 'gerardo-de-leon',
      role_type: 'director',
      birth_year: 1913,
      photo_url:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
      bio: 'Master of Golden Age Philippine cinema, director of Noli Me Tangere, El Filibusterismo, Daigdig ng mga Api, and Sawa sa Lumang Simboryo.',
    },
  },
  {
    id: 'na-007',
    person_id: 'aaaaaaaa-0009-0000-0000-000000000000',
    year_conferred: 2009,
    category: 'Cinema',
    citation:
      'Pioneering innovator who translated Philippine folk literature, epics, and political satire to the global stage, earning historic early recognition at Venice with Genghis Khan.',
    person: {
      id: 'aaaaaaaa-0009-0000-0000-000000000000',
      name: 'Manuel Conde',
      slug: 'manuel-conde',
      role_type: 'director',
      birth_year: 1915,
      photo_url:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
      bio: 'Creator of the satirical Juan Tamad series and the epic Genghis Khan (1950), which introduced Philippine cinema to the Venice International Film Festival.',
    },
  },
  {
    id: 'na-008',
    person_id: 'aaaaaaaa-0010-0000-0000-000000000000',
    year_conferred: 2022,
    category: 'Film and Broadcast Arts',
    citation:
      'Transformative screenwriter whose legendary scripts redefined modern Philippine storytelling, giving voice to marginalized lives across more than 180 produced feature films.',
    person: {
      id: 'aaaaaaaa-0010-0000-0000-000000000000',
      name: 'Ricky Lee',
      slug: 'ricky-lee',
      role_type: 'writer',
      birth_year: 1948,
      photo_url:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      bio: 'Revered screenwriter and mentor of generations of filmmakers; authored Himala, Moral, Karnal, Brutal, and Jose Rizal.',
    },
  },
];

export const SAMPLE_PRESERVED_FILMS: PreservedFilmItem[] = [
  {
    id: 'pres-001',
    film_id: 'cccccccc-0001-0000-0000-000000000000',
    status: 'restored',
    restoring_body: 'ABS-CBN Film Restoration (Sagip Pelikula) & Central Digital Lab',
    restoration_year: 2012,
    archive_location: 'ABS-CBN Film Archives & FDCP National Film Archive, Manila',
    notes:
      '4K digital restoration from the original 35mm negative. Celebrated 30th anniversary restoration world premiere at the 69th Venice International Film Festival (Venice Classics).',
    film: {
      id: 'cccccccc-0001-0000-0000-000000000000',
      title: 'Himala',
      release_year: 1982,
      director: 'Ishmael Bernal',
      poster_url:
        'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop',
      synopsis:
        'In a barren provincial village, a young woman’s miraculous apparitions spark fervent mass pilgrimage, fanaticism, and catastrophic commercialization.',
      is_classic: true,
    },
  },
  {
    id: 'pres-002',
    film_id: 'cccccccc-0002-0000-0000-000000000000',
    status: 'restored',
    restoring_body: 'World Cinema Project (The Film Foundation) & Cineteca di Bologna (L’Immagine Ritrovata)',
    restoration_year: 2013,
    archive_location: 'Bologna, Italy & FDCP National Film Archive',
    notes:
      '4K digital restoration carried out by Cineteca di Bologna / L’Immagine Ritrovata laboratory in association with LVN Pictures and the Film Development Council of the Philippines.',
    film: {
      id: 'cccccccc-0002-0000-0000-000000000000',
      title: 'Maynila sa mga Kuko ng Liwanag',
      release_year: 1975,
      director: 'Lino Brocka',
      poster_url:
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
      synopsis:
        'A naive provincial youth ventures into the unforgiving urban labyrinth of Manila to find his missing beloved, encountering systemic exploitation and heartbreak.',
      is_classic: true,
    },
  },
  {
    id: 'pres-003',
    film_id: 'cccccccc-0009-0000-0000-000000000000',
    status: 'restored',
    restoring_body: 'Film Development Council of the Philippines (FDCP) & L’Immagine Ritrovata',
    restoration_year: 2012,
    archive_location: 'FDCP National Film Archive of the Philippines, Manila',
    notes:
      'The first Filipino film screened at the Venice International Film Festival (1952). Restored from extant European prints and reintroduced at Venice Classics.',
    film: {
      id: 'cccccccc-0009-0000-0000-000000000000',
      title: 'Genghis Khan',
      release_year: 1950,
      director: 'Manuel Conde',
      poster_url:
        'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop',
      synopsis:
        'The mythic rise of Temujin as he unites the Mongol tribes, rendered with innovative choreography and breathtaking cinematic pageantry.',
      is_classic: true,
    },
  },
  {
    id: 'pres-004',
    film_id: 'cccccccc-0006-0000-0000-000000000000',
    status: 'restored',
    restoring_body: 'The Film Foundation World Cinema Project & L’Immagine Ritrovata',
    restoration_year: 2015,
    archive_location: 'Cineteca di Bologna, Italy & FDCP Archive',
    notes:
      'First Philippine feature at the Cannes Film Festival (Directors’ Fortnight 1978). Restored in 4K resolution using the original 35mm camera and sound negatives.',
    film: {
      id: 'cccccccc-0006-0000-0000-000000000000',
      title: 'Insiang',
      release_year: 1976,
      director: 'Lino Brocka',
      poster_url:
        'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop',
      synopsis:
        'Trapped in the slums of Tondo, a young woman suffers brutal betrayal at the hands of her mother’s lover and executes a calculated, unyielding revenge.',
      is_classic: true,
    },
  },
  {
    id: 'pres-005',
    film_id: 'cccccccc-0011-0000-0000-000000000000',
    status: 'restored',
    restoring_body: 'Philippine Film Archive (FDCP) & National Film and Sound Archive of Australia',
    restoration_year: 2019,
    archive_location: 'FDCP National Film Archive, Manila',
    notes:
      'The earliest surviving sound feature in Philippine cinema history, produced in 1939 by LVN Pictures. Restored to mark the Philippine Cinema Centennial.',
    film: {
      id: 'cccccccc-0011-0000-0000-000000000000',
      title: 'Giliw Ko',
      release_year: 1939,
      director: 'Carlos Vander Tolosa',
      poster_url:
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop',
      synopsis:
        'A gifted provincial singer is courted by a Manila bandleader, creating tensions between rustic tradition and American jazz influences.',
      is_classic: true,
    },
  },
  {
    id: 'pres-006',
    film_id: 'cccccccc-0012-0000-0000-000000000000',
    status: 'restored',
    restoring_body: 'Mike De Leon & Asian Film Archive (Singapore)',
    restoration_year: 2022,
    archive_location: 'Asian Film Archive, Singapore',
    notes:
      'Restored in 4K from the original 35mm camera negative; official selection at Cannes Classics 2022.',
    film: {
      id: 'cccccccc-0012-0000-0000-000000000000',
      title: 'Itim (The Rites of May)',
      release_year: 1976,
      director: 'Mike De Leon',
      poster_url:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
      synopsis:
        'A photographer returns to his provincial home during Holy Week and inadvertently summons the restless spirit of his sister through a mysterious woman.',
      is_classic: true,
    },
  },
  {
    id: 'pres-007',
    film_id: 'cccccccc-0013-0000-0000-000000000000',
    status: 'archived',
    restoring_body: 'LVN Pictures Archive / ABS-CBN Film Archives',
    restoration_year: 2011,
    archive_location: 'ABS-CBN Film Archives, Quezon City',
    notes:
      'Preserved in temperature-controlled archives with its famous historical hand-colored sequences intact.',
    film: {
      id: 'cccccccc-0013-0000-0000-000000000000',
      title: 'Ibong Adarna',
      release_year: 1941,
      director: 'Vicente Salumbides',
      poster_url:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop',
      synopsis:
        'Three royal princes embark on a treacherous quest to capture the mythical singing bird that alone can cure their ailing sovereign father.',
      is_classic: true,
    },
  },
  {
    id: 'pres-008',
    film_id: 'cccccccc-0014-0000-0000-000000000000',
    status: 'at_risk',
    restoring_body: 'Pending Cultural Digitization Grant',
    restoration_year: null,
    archive_location: 'Private Studio Cold Storage, Metro Manila',
    notes:
      'Extant 35mm elements exhibit early signs of vinegar syndrome and color fading. Marked as critical priority for institutional restoration funding.',
    film: {
      id: 'cccccccc-0014-0000-0000-000000000000',
      title: 'Tirad Pass: The Last Stand of Gen. Gregorio del Pilar',
      release_year: 1996,
      director: 'Tikoy Aguiluz',
      poster_url:
        'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop',
      synopsis:
        'A historical chronicle of the young general who commanded a heroic rearguard defense against invading American forces in the Cordillera mountains.',
      is_classic: true,
    },
  },
  {
    id: 'pres-009',
    film_id: 'cccccccc-0015-0000-0000-000000000000',
    status: 'lost',
    restoring_body: 'Unrecovered Studio Camera Negatives',
    restoration_year: null,
    archive_location: 'No known complete 35mm print preserved',
    notes:
      'Believed lost during historic studio vault fires in the 1970s. Only promotional lobby cards and newspaper stills currently survive in cultural libraries.',
    film: {
      id: 'cccccccc-0015-0000-0000-000000000000',
      title: 'Darna at ang Planetman',
      release_year: 1969,
      director: 'Marcelino Navarro',
      poster_url:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
      synopsis:
        'The beloved superheroine battles extraterrestrial invaders in one of the most culturally sought-after unrecovered films of the late Golden Age.',
      is_classic: true,
    },
  },
];

// ==============================================================================
// 2. TYPED SUPABASE API FUNCTIONS
// ==============================================================================

/**
 * Fetch all Philippine National Artists for Film & Broadcast Arts
 */
export async function fetchNationalArtists(): Promise<NationalArtistItem[]> {
  try {
    const { data, error } = await supabase
      .from('national_artists')
      .select(`
        id,
        person_id,
        year_conferred,
        category,
        citation,
        people (
          id,
          name,
          slug,
          photo_url,
          role_type,
          birth_year,
          bio
        )
      `)
      .order('year_conferred', { ascending: false });

    if (error || !data || data.length === 0) {
      return SAMPLE_NATIONAL_ARTISTS;
    }

    return data.map((row: any) => ({
      id: row.id,
      person_id: row.person_id,
      year_conferred: row.year_conferred,
      category: row.category,
      citation: row.citation,
      person: {
        id: row.people?.id || row.person_id,
        name: row.people?.name || 'National Artist',
        slug: row.people?.slug,
        photo_url: row.people?.photo_url,
        role_type: row.people?.role_type,
        birth_year: row.people?.birth_year,
        bio: row.people?.bio,
      },
    }));
  } catch {
    return SAMPLE_NATIONAL_ARTISTS;
  }
}

/**
 * Fetch preserved films filtered optionally by preservation status
 */
export async function fetchPreservedFilms(
  statusFilter?: PreservationStatus | 'all'
): Promise<PreservedFilmItem[]> {
  try {
    let query = supabase
      .from('preservation_records')
      .select(`
        id,
        film_id,
        status,
        restoring_body,
        restoration_year,
        archive_location,
        notes,
        films (
          id,
          title,
          release_year,
          poster_url,
          director,
          synopsis,
          is_classic
        )
      `)
      .order('restoration_year', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (!statusFilter || statusFilter === 'all') {
        return SAMPLE_PRESERVED_FILMS;
      }
      return SAMPLE_PRESERVED_FILMS.filter((f) => f.status === statusFilter);
    }

    const mapped = data.map((row: any) => ({
      id: row.id,
      film_id: row.film_id,
      status: row.status as PreservationStatus,
      restoring_body: row.restoring_body,
      restoration_year: row.restoration_year,
      archive_location: row.archive_location,
      notes: row.notes,
      film: {
        id: row.films?.id || row.film_id,
        title: row.films?.title || 'Preserved Film',
        release_year: row.films?.release_year || 1980,
        poster_url: row.films?.poster_url,
        director: row.films?.director,
        synopsis: row.films?.synopsis,
        is_classic: Boolean(row.films?.is_classic),
      },
    }));

    return mapped;
  } catch {
    if (!statusFilter || statusFilter === 'all') {
      return SAMPLE_PRESERVED_FILMS;
    }
    return SAMPLE_PRESERVED_FILMS.filter((f) => f.status === statusFilter);
  }
}

/**
 * Fetch preservation record for a specific film (used on Film Detail screen)
 */
export async function fetchFilmPreservationRecord(
  filmId: string
): Promise<FilmPreservationDetail | null> {
  try {
    const { data, error } = await supabase
      .from('preservation_records')
      .select('id, film_id, status, restoring_body, restoration_year, archive_location, notes')
      .eq('film_id', filmId)
      .maybeSingle();

    if (error || !data) {
      // Check offline sample
      const match = SAMPLE_PRESERVED_FILMS.find((p) => p.film_id === filmId);
      if (match) {
        return {
          id: match.id,
          film_id: match.film_id,
          status: match.status,
          restoring_body: match.restoring_body || 'Philippine Film Archives',
          restoration_year: match.restoration_year,
          archive_location: match.archive_location,
          notes: match.notes,
        };
      }
      return null;
    }

    return {
      id: data.id,
      film_id: data.film_id,
      status: data.status as PreservationStatus,
      restoring_body: data.restoring_body || 'Philippine Film Archives',
      restoration_year: data.restoration_year,
      archive_location: data.archive_location,
      notes: data.notes,
    };
  } catch {
    const match = SAMPLE_PRESERVED_FILMS.find((p) => p.film_id === filmId);
    if (match) {
      return {
        id: match.id,
        film_id: match.film_id,
        status: match.status,
        restoring_body: match.restoring_body || 'Philippine Film Archives',
        restoration_year: match.restoration_year,
        archive_location: match.archive_location,
        notes: match.notes,
      };
    }
    return null;
  }
}

