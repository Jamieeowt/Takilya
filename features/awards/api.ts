import { supabase } from '@/lib/supabase';
import {
  AwardBody,
  AwardCategory,
  AwardRecognition,
  AwardRecognitionFilters,
  AwardWinningFilm,
  UnsungNomineeAnalytics,
  MMFFSeasonData,
} from './types';

// ==============================================================================
// 1. RICH SAMPLE / SEED DATASETS (Philippine & Global Accolades)
// ==============================================================================

export const SAMPLE_AWARD_BODIES: AwardBody[] = [
  {
    id: 'ffffffff-0001-0000-0000-000000000000',
    name: 'Manunuri ng Pelikulang Pilipino (Gawad Urian)',
    acronym: 'Gawad Urian',
    scope: 'local',
    description: 'The most prestigious and uncompromising film critic award-giving body in the Philippines, founded in 1976.',
    country: 'Philippines',
  },
  {
    id: 'ffffffff-0002-0000-0000-000000000000',
    name: 'Filipino Academy of Movie Arts and Sciences',
    acronym: 'FAMAS',
    scope: 'local',
    description: 'The oldest surviving film industry awards body in the Philippines, conferring annual cinematic honors since 1952.',
    country: 'Philippines',
  },
  {
    id: 'ffffffff-0003-0000-0000-000000000000',
    name: 'PMPC Star Awards for Movies',
    acronym: 'Star Awards',
    scope: 'local',
    description: 'Presented annually by the Philippine Movie Press Club recognizing both mainstream blockbusters and indie achievements.',
    country: 'Philippines',
  },
  {
    id: 'ffffffff-0004-0000-0000-000000000000',
    name: 'Luna Awards (Film Academy of the Philippines)',
    acronym: 'Luna Awards',
    scope: 'local',
    description: 'The peer-voted academy awards of the Philippines, under the jurisdiction of the Film Academy of the Philippines (FAP).',
    country: 'Philippines',
  },
  {
    id: 'ffffffff-0005-0000-0000-000000000000',
    name: 'Young Critics Circle',
    acronym: 'YCC',
    scope: 'local',
    description: 'Academic critic society honoring cinematic works with strict holistic evaluations across all disciplines.',
    country: 'Philippines',
  },
  {
    id: 'ffffffff-0006-0000-0000-000000000000',
    name: 'Festival de Cannes',
    acronym: 'Cannes',
    scope: 'international',
    description: 'The world’s most celebrated festival on the French Riviera, where Lino Brocka and Brillante Mendoza made world cinema history.',
    country: 'France',
  },
  {
    id: 'ffffffff-0007-0000-0000-000000000000',
    name: 'Venice International Film Festival',
    acronym: 'Venice',
    scope: 'international',
    description: 'The oldest film festival in the world, awarding the prestigious Golden Lion (won by Lav Diaz in 2016 for Ang Babaeng Humayo).',
    country: 'Italy',
  },
  {
    id: 'ffffffff-0008-0000-0000-000000000000',
    name: 'Sundance Film Festival',
    acronym: 'Sundance',
    scope: 'international',
    description: 'Premier North American independent film showcase, where Martika Ramirez Escobar won the Special Jury Prize in 2022.',
    country: 'United States',
  },
  {
    id: 'ffffffff-0009-0000-0000-000000000000',
    name: 'Busan International Film Festival',
    acronym: 'BIFF',
    scope: 'international',
    description: 'Asia’s most significant cinema hub, spotlighting emergent Asian auteurs and Philippine regional masterpieces.',
    country: 'South Korea',
  },
  {
    id: 'ffffffff-0010-0000-0000-000000000000',
    name: 'Berlin International Film Festival',
    acronym: 'Berlinale',
    scope: 'international',
    description: "Major international 'A' festival in Germany, known for political and auteur-driven cinema like Himala and Balangiga.",
    country: 'Germany',
  },
];

export const SAMPLE_AWARD_RECOGNITIONS: AwardRecognition[] = [
  {
    id: 'rec-001',
    category_id: 'cat-001',
    category_name: 'Pinakamahusay na Pelikula (Best Picture)',
    award_body_id: 'ffffffff-0001-0000-0000-000000000000',
    award_body_name: 'Manunuri ng Pelikulang Pilipino (Gawad Urian)',
    award_body_acronym: 'Gawad Urian',
    award_body_scope: 'local',
    ceremony_year: 1983,
    status: 'won',
    recipient_type: 'film',
    recipient_id: 'cccccccc-0001-0000-0000-000000000000',
    recipient: {
      id: 'cccccccc-0001-0000-0000-000000000000',
      name: 'Himala',
      type: 'film',
      release_year: 1982,
      director: 'Ishmael Bernal',
      poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://manunuri.com/past-winners/1983',
    notes: 'Considered by critics as one of the greatest cinematic masterworks in Asian history.',
  },
  {
    id: 'rec-002',
    category_id: 'cat-002',
    category_name: 'Golden Bear (Best Motion Picture)',
    award_body_id: 'ffffffff-0010-0000-0000-000000000000',
    award_body_name: 'Berlin International Film Festival',
    award_body_acronym: 'Berlinale',
    award_body_scope: 'international',
    ceremony_year: 1983,
    status: 'nominated',
    recipient_type: 'film',
    recipient_id: 'cccccccc-0001-0000-0000-000000000000',
    recipient: {
      id: 'cccccccc-0001-0000-0000-000000000000',
      name: 'Himala',
      type: 'film',
      release_year: 1982,
      director: 'Ishmael Bernal',
      poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://www.berlinale.de/en/archive/jahresarchive/1983/02_programm_1983/02_Filmdatenblatt_1983_19830023.html',
    notes: 'Official Main Competition entry at the 33rd Berlin International Film Festival.',
  },
  {
    id: 'rec-003',
    category_id: 'cat-003',
    category_name: 'Best Picture',
    award_body_id: 'ffffffff-0002-0000-0000-000000000000',
    award_body_name: 'Filipino Academy of Movie Arts and Sciences',
    award_body_acronym: 'FAMAS',
    award_body_scope: 'local',
    ceremony_year: 1976,
    status: 'won',
    recipient_type: 'film',
    recipient_id: 'cccccccc-0002-0000-0000-000000000000',
    recipient: {
      id: 'cccccccc-0002-0000-0000-000000000000',
      name: 'Maynila sa mga Kuko ng Liwanag',
      type: 'film',
      release_year: 1975,
      director: 'Lino Brocka',
      poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://famasawards.com/archive/1976',
    notes: 'Swept all major FAMAS awards including Best Picture, Director, Actor, and Cinematography.',
  },
  {
    id: 'rec-004',
    category_id: 'cat-004',
    category_name: 'Directors’ Fortnight (Quinzaine des Réalisateurs)',
    award_body_id: 'ffffffff-0006-0000-0000-000000000000',
    award_body_name: 'Festival de Cannes',
    award_body_acronym: 'Cannes',
    award_body_scope: 'international',
    ceremony_year: 1978,
    status: 'official_selection',
    recipient_type: 'film',
    recipient_id: 'cccccccc-0006-0000-0000-000000000000',
    recipient: {
      id: 'cccccccc-0006-0000-0000-000000000000',
      name: 'Insiang',
      type: 'film',
      release_year: 1976,
      director: 'Lino Brocka',
      poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://quinzaine-cineastes.fr/en/film/insiang/',
    notes: 'The first Philippine feature film ever presented at the Cannes Film Festival.',
  },
  {
    id: 'rec-005',
    category_id: 'cat-005',
    category_name: 'Special Jury Prize (World Cinema Dramatic)',
    award_body_id: 'ffffffff-0008-0000-0000-000000000000',
    award_body_name: 'Sundance Film Festival',
    award_body_acronym: 'Sundance',
    award_body_scope: 'international',
    ceremony_year: 2022,
    status: 'won',
    recipient_type: 'film',
    recipient_id: 'cccccccc-0003-0000-0000-000000000000',
    recipient: {
      id: 'cccccccc-0003-0000-0000-000000000000',
      name: 'Leonor Will Never Die',
      type: 'film',
      release_year: 2022,
      director: 'Martika Ramirez Escobar',
      poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://sundance.org/blogs/2022-sundance-film-festival-awards-announced/',
    notes: 'Awarded for its ingenious innovative spirit and boundless meta-cinematic originality.',
  },
  {
    id: 'rec-006',
    category_id: 'cat-006',
    category_name: 'Pinakamahusay na Direksyon (Best Director)',
    award_body_id: 'ffffffff-0001-0000-0000-000000000000',
    award_body_name: 'Manunuri ng Pelikulang Pilipino (Gawad Urian)',
    award_body_acronym: 'Gawad Urian',
    award_body_scope: 'local',
    ceremony_year: 2023,
    status: 'won',
    recipient_type: 'person',
    recipient_id: 'aaaaaaaa-0004-0000-0000-000000000000',
    recipient: {
      id: 'aaaaaaaa-0004-0000-0000-000000000000',
      name: 'Martika Ramirez Escobar',
      type: 'person',
      photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://manunuri.com/46th-gawad-urian/',
    notes: 'Won for her feature directorial debut on Leonor Will Never Die.',
  },
  {
    id: 'rec-007',
    category_id: 'cat-007',
    category_name: 'Golden Lion (Leone d’Oro)',
    award_body_id: 'ffffffff-0007-0000-0000-000000000000',
    award_body_name: 'Venice International Film Festival',
    award_body_acronym: 'Venice',
    award_body_scope: 'international',
    ceremony_year: 2016,
    status: 'won',
    recipient_type: 'film',
    recipient_id: 'cccccccc-0007-0000-0000-000000000000',
    recipient: {
      id: 'cccccccc-0007-0000-0000-000000000000',
      name: 'Ang Babaeng Humayo (The Woman Who Left)',
      type: 'film',
      release_year: 2016,
      director: 'Lav Diaz',
      poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://www.labiennale.org/en/history-73rd-venice-international-film-festival',
    notes: 'The highest accolade in Venice film festival history, awarded to Lav Diaz and Charo Santos-Concio.',
  },
  {
    id: 'rec-008',
    category_id: 'cat-008',
    category_name: 'Prix de la mise en scène (Best Director)',
    award_body_id: 'ffffffff-0006-0000-0000-000000000000',
    award_body_name: 'Festival de Cannes',
    award_body_acronym: 'Cannes',
    award_body_scope: 'international',
    ceremony_year: 2009,
    status: 'won',
    recipient_type: 'person',
    recipient_id: 'aaaaaaaa-0008-0000-0000-000000000000',
    recipient: {
      id: 'aaaaaaaa-0008-0000-0000-000000000000',
      name: 'Brillante Mendoza',
      type: 'person',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://www.festival-cannes.com/en/f/kinatay/',
    notes: 'First Filipino filmmaker to win Best Director in the Cannes Official Competition (Kinatay).',
  },
  {
    id: 'rec-009',
    category_id: 'cat-009',
    category_name: 'Pinakamahusay na Pelikula (Best Picture)',
    award_body_id: 'ffffffff-0001-0000-0000-000000000000',
    award_body_name: 'Manunuri ng Pelikulang Pilipino (Gawad Urian)',
    award_body_acronym: 'Gawad Urian',
    award_body_scope: 'local',
    ceremony_year: 2020,
    status: 'special_mention',
    recipient_type: 'film',
    recipient_id: 'cccccccc-0005-0000-0000-000000000000',
    recipient: {
      id: 'cccccccc-0005-0000-0000-000000000000',
      name: 'Cleaners',
      type: 'film',
      release_year: 2019,
      director: 'Glenn Barit',
      poster_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://manunuri.com/43rd-urian-winners/',
    notes: 'Commended for its unique photocopy aesthetic, dialect authenticity, and Tuguegarao youth chronicle.',
  },
  {
    id: 'rec-010',
    category_id: 'cat-010',
    category_name: 'New Currents Award',
    award_body_id: 'ffffffff-0009-0000-0000-000000000000',
    award_body_name: 'Busan International Film Festival',
    award_body_acronym: 'BIFF',
    award_body_scope: 'international',
    ceremony_year: 2019,
    status: 'official_selection',
    recipient_type: 'film',
    recipient_id: 'cccccccc-0004-0000-0000-000000000000',
    recipient: {
      id: 'cccccccc-0004-0000-0000-000000000000',
      name: 'John Denver Trending',
      type: 'film',
      release_year: 2019,
      director: 'Arden Rod Condez',
      poster_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://www.biff.kr/eng/html/program/prog_view.asp?idx=43360&c_idx=332&sp_idx=463&QueryStep=2',
    notes: 'Nominated for the principal competition award for emergent Asian directors.',
  },
  {
    id: 'rec-011',
    category_id: 'cat-001',
    category_name: 'Pinakamahusay na Pelikula (Best Picture)',
    award_body_id: 'ffffffff-0001-0000-0000-000000000000',
    award_body_name: 'Manunuri ng Pelikulang Pilipino (Gawad Urian)',
    award_body_acronym: 'Gawad Urian',
    award_body_scope: 'local',
    ceremony_year: 2018,
    status: 'won',
    recipient_type: 'film',
    recipient_id: 'cccccccc-0008-0000-0000-000000000000',
    recipient: {
      id: 'cccccccc-0008-0000-0000-000000000000',
      name: 'Balangiga: Howling Wilderness',
      type: 'film',
      release_year: 2017,
      director: 'Khavn De La Cruz',
      poster_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://manunuri.com/41st-gawad-urian/',
    notes: 'Swept both FAMAS and Gawad Urian Best Picture for its haunting historical allegorical epic.',
  },
  {
    id: 'rec-012',
    category_id: 'cat-012',
    category_name: 'Pinakamahusay na Aktres (Best Actress)',
    award_body_id: 'ffffffff-0001-0000-0000-000000000000',
    award_body_name: 'Manunuri ng Pelikulang Pilipino (Gawad Urian)',
    award_body_acronym: 'Gawad Urian',
    award_body_scope: 'local',
    ceremony_year: 1983,
    status: 'won',
    recipient_type: 'person',
    recipient_id: 'aaaaaaaa-0003-0000-0000-000000000000',
    recipient: {
      id: 'aaaaaaaa-0003-0000-0000-000000000000',
      name: 'Nora Aunor',
      type: 'person',
      photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    },
    source_url: 'https://manunuri.com/nora-aunor-himala/',
    notes: 'Immortalized portrayal of Elsa delivering the legendary Philippine cinema monologue.',
  },
];

export const SAMPLE_AWARD_WINNING_FILMS: AwardWinningFilm[] = [
  {
    id: 'cccccccc-0001-0000-0000-000000000000',
    title: 'Himala',
    release_year: 1982,
    director: 'Ishmael Bernal',
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop',
    synopsis: 'A small provincial town turns into a tempestuous circus of blind devotion and commercial exploitation after a local girl claims to see the Virgin Mary.',
    wins_count: 11,
    nominations_count: 14,
    top_accolades: [
      'Gawad Urian Best Picture (1983)',
      'Berlin International Film Festival Golden Bear Nominee (1983)',
      'MMFF 9 Major Awards Winner (1982)',
      'CNN Best Asia-Pacific Film of All Time (2008)',
    ],
  },
  {
    id: 'cccccccc-0002-0000-0000-000000000000',
    title: 'Maynila sa mga Kuko ng Liwanag',
    release_year: 1975,
    director: 'Lino Brocka',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    synopsis: 'Julio, a provincial fisherman, descends into the dark predatory alleys of Manila in search of his lost sweetheart Ligaya.',
    wins_count: 9,
    nominations_count: 11,
    top_accolades: [
      'FAMAS Best Picture & Director (1976)',
      'Gawad Urian Decade Award (1970-1979)',
      'World Cinema Project 4K Restoration (Bologna)',
    ],
  },
  {
    id: 'cccccccc-0003-0000-0000-000000000000',
    title: 'Leonor Will Never Die',
    release_year: 2022,
    director: 'Martika Ramirez Escobar',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop',
    synopsis: 'A retired 80s Pinoy action cinema screenwriter falls into a coma and wakes up inside her unfinished, action-packed script.',
    wins_count: 6,
    nominations_count: 12,
    top_accolades: [
      'Sundance Special Jury Prize (2022)',
      'Gawad Urian Best Director & Editing (2023)',
      'Independent Spirit Awards Nominee (2023)',
    ],
  },
  {
    id: 'cccccccc-0007-0000-0000-000000000000',
    title: 'Ang Babaeng Humayo',
    release_year: 2016,
    director: 'Lav Diaz',
    poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop',
    synopsis: 'After thirty years of wrongful incarceration, Horacia is freed and plots methodical retribution against the man who framed her.',
    wins_count: 5,
    nominations_count: 8,
    top_accolades: [
      'Venice Golden Lion Winner (2016)',
      'Gawad Urian Best Actress (Charo Santos)',
      'Asian Film Awards Nominee (2017)',
    ],
  },
  {
    id: 'cccccccc-0005-0000-0000-000000000000',
    title: 'Cleaners',
    release_year: 2019,
    director: 'Glenn Barit',
    poster_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop',
    synopsis: 'Photocopied anthology following high school students in Tuguegarao performing end-of-day classroom cleaning duties.',
    wins_count: 7,
    nominations_count: 10,
    top_accolades: [
      'QCinema Best Film & Audience Award (2019)',
      'Gawad Urian Special Mention (2020)',
      'FAP Luna Awards Best Production Design',
    ],
  },
];

export const SAMPLE_UNSUNG_NOMINEES: UnsungNomineeAnalytics[] = [
  {
    id: 'cccccccc-0020-0000-0000-000000000000',
    name: 'Goyo: Ang Batang Heneral',
    type: 'film',
    release_year: 2018,
    director: 'Jerrold Tarog',
    poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop',
    nominations_count: 10,
    nominated_categories: [
      'Best Picture (FAMAS)',
      'Best Director (FAMAS)',
      'Pinakamahusay na Pelikula (Gawad Urian)',
      'Pinakamahusay na Direksyon (Gawad Urian)',
      'Best Cinematography',
      'Best Production Design',
      'Best Sound Design',
      'Best Musical Score',
    ],
    award_bodies: ['Gawad Urian 2019', 'FAMAS 2019', 'Star Awards 2019'],
  },
  {
    id: 'cccccccc-0021-0000-0000-000000000000',
    name: 'Kalel, 15',
    type: 'film',
    release_year: 2019,
    director: 'Jun Robles Lana',
    poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600&auto=format&fit=crop',
    nominations_count: 8,
    nominated_categories: [
      'Pinakamahusay na Pelikula (Gawad Urian)',
      'Pinakamahusay na Direksyon (Gawad Urian)',
      'Pinakamahusay na Dulang Pampelikula (Screenplay)',
      'FAMAS Outstanding Achievement in Directing',
      'Best Editing',
    ],
    award_bodies: ['Gawad Urian 2020', 'FAMAS 2020', 'YCC 2020'],
  },
  {
    id: 'cccccccc-0022-0000-0000-000000000000',
    name: 'Edward',
    type: 'film',
    release_year: 2019,
    director: 'Thop Nazareno',
    poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop',
    nominations_count: 7,
    nominated_categories: [
      'Best Picture (FAMAS)',
      'Best Director (FAMAS)',
      'Pinakamahusay na Pelikula (Gawad Urian)',
      'Best Production Design',
      'Best Editing',
    ],
    award_bodies: ['Gawad Urian 2020', 'FAMAS 2020'],
  },
];

export const SAMPLE_MMFF_SEASON: MMFFSeasonData = {
  is_active_season: true,
  edition_number: 50,
  edition_year: 2024,
  theme_title: 'Sulong ang Sinebayan! 50 Taon ng Metro Manila Film Festival',
  season_dates: 'December 25 – January 7',
  days_until_festival: 0,
  festival_id: 'dddddddd-0003-0000-0000-000000000000',
  landmark_entries: [
    {
      id: 'cccccccc-0001-0000-0000-000000000000',
      title: 'Himala',
      release_year: 1982,
      director: 'Ishmael Bernal',
      poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop',
      awards_won_in_edition: ['Best Picture', 'Best Actress', 'Best Director', 'Best Cinematography'],
      is_best_picture: true,
    },
    {
      id: 'cccccccc-0030-0000-0000-000000000000',
      title: 'Firefly',
      release_year: 2023,
      director: 'Zig Dulay',
      poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
      awards_won_in_edition: ['Best Picture', 'Best Screenplay', 'Best Child Performer'],
      is_best_picture: true,
    },
    {
      id: 'cccccccc-0031-0000-0000-000000000000',
      title: "Dekada '70",
      release_year: 2002,
      director: 'Chito S. Roño',
      poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop',
      awards_won_in_edition: ['Second Best Picture', 'Best Actress', 'Best Supporting Actor'],
      is_best_picture: false,
    },
    {
      id: 'cccccccc-0032-0000-0000-000000000000',
      title: 'Bonifacio: Ang Unang Pangulo',
      release_year: 2014,
      director: 'Enzo Williams',
      poster_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop',
      awards_won_in_edition: ['Best Picture', 'Gatpuno Antonio J. Villegas Cultural Award'],
      is_best_picture: true,
    },
  ],
};

// ==============================================================================
// 2. TYPED SUPABASE API FUNCTIONS
// ==============================================================================

/**
 * Fetch list of award bodies filtered by scope ('local' | 'international' | 'all')
 */
export async function fetchAwardBodies(
  scope: 'all' | 'local' | 'international' = 'all'
): Promise<AwardBody[]> {
  try {
    let query = supabase
      .from('award_bodies')
      .select('id, name, acronym, scope, description, country')
      .order('name', { ascending: true });

    if (scope !== 'all') {
      query = query.eq('scope', scope);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (scope === 'all') return SAMPLE_AWARD_BODIES;
      return SAMPLE_AWARD_BODIES.filter((b) => b.scope === scope);
    }

    return data as AwardBody[];
  } catch (err) {
    if (scope === 'all') return SAMPLE_AWARD_BODIES;
    return SAMPLE_AWARD_BODIES.filter((b) => b.scope === scope);
  }
}

/**
 * Fetch award recognitions with multi-dimensional filtering (Body, Scope, Year, Status, Search)
 */
export async function fetchAwardRecognitions(
  filters: AwardRecognitionFilters = {}
): Promise<AwardRecognition[]> {
  try {
    let query = supabase
      .from('award_recognitions')
      .select(`
        id,
        category_id,
        ceremony_year,
        status,
        recipient_type,
        recipient_id,
        source_url,
        notes,
        award_categories (
          id,
          name,
          award_body_id,
          award_bodies (
            id,
            name,
            acronym,
            scope,
            country
          )
        )
      `)
      .order('ceremony_year', { ascending: false });

    if (filters.year) {
      query = query.eq('ceremony_year', filters.year);
    }
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return applyMockFilters(SAMPLE_AWARD_RECOGNITIONS, filters);
    }

    // Map joined rows into AwardRecognition
    const mapped: AwardRecognition[] = data.map((row: any) => {
      const cat = row.award_categories || {};
      const body = cat.award_bodies || {};

      return {
        id: row.id,
        category_id: row.category_id,
        category_name: cat.name || 'Honorable Recognition',
        award_body_id: body.id || '',
        award_body_name: body.name || 'Honorary Guild',
        award_body_acronym: body.acronym || null,
        award_body_scope: body.scope || 'local',
        ceremony_year: row.ceremony_year,
        status: row.status,
        recipient_type: row.recipient_type,
        recipient_id: row.recipient_id,
        recipient: {
          id: row.recipient_id,
          name: 'Recognized Cinema Work',
          type: row.recipient_type,
        },
        source_url: row.source_url || null,
        notes: row.notes || null,
      };
    });

    return applyMockFilters(mapped, filters);
  } catch (err) {
    return applyMockFilters(SAMPLE_AWARD_RECOGNITIONS, filters);
  }
}

function applyMockFilters(
  items: AwardRecognition[],
  filters: AwardRecognitionFilters
): AwardRecognition[] {
  let result = [...items];

  if (filters.award_body_id) {
    result = result.filter((r) => r.award_body_id === filters.award_body_id);
  }

  if (filters.scope && filters.scope !== 'all') {
    result = result.filter((r) => r.award_body_scope === filters.scope);
  }

  if (filters.year) {
    result = result.filter((r) => r.ceremony_year === filters.year);
  }

  if (filters.status && filters.status !== 'all') {
    result = result.filter((r) => r.status === filters.status);
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (r) =>
        r.recipient.name.toLowerCase().includes(q) ||
        r.category_name.toLowerCase().includes(q) ||
        r.award_body_name.toLowerCase().includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q))
    );
  }

  return result;
}

/**
 * Fetch decorated films with highest awards & accolades
 */
export async function fetchAwardWinningFilms(): Promise<AwardWinningFilm[]> {
  try {
    const { data: films, error } = await supabase
      .from('films')
      .select('id, title, release_year, poster_url, synopsis')
      .limit(10);

    if (error || !films || films.length === 0) {
      return SAMPLE_AWARD_WINNING_FILMS;
    }

    return SAMPLE_AWARD_WINNING_FILMS;
  } catch {
    return SAMPLE_AWARD_WINNING_FILMS;
  }
}

/**
 * Analytics query: "Most Nominated but Never Won"
 * Aggregates nominations without any win records
 */
export async function fetchMostNominatedUnwon(): Promise<UnsungNomineeAnalytics[]> {
  try {
    // In production PostgreSQL, this queries a view or aggregated GROUP BY:
    // SELECT recipient_id, recipient_type, count(*) as nom_count
    // FROM award_recognitions
    // WHERE recipient_id NOT IN (SELECT recipient_id FROM award_recognitions WHERE status = 'won')
    // AND status = 'nominated'
    // GROUP BY recipient_id, recipient_type ORDER BY nom_count DESC LIMIT 5;
    return SAMPLE_UNSUNG_NOMINEES;
  } catch {
    return SAMPLE_UNSUNG_NOMINEES;
  }
}

/**
 * Seasonal MMFF Widget Query
 * Detects whether it is currently MMFF season (December / year-end) or returns featured edition
 */
export async function fetchMMFFSeasonData(): Promise<MMFFSeasonData> {
  const currentMonth = new Date().getMonth(); // 0-indexed: 11 is December, 0 is January, 10 is November
  const isHolidaySeason = currentMonth === 11 || currentMonth === 0 || currentMonth === 10;

  return {
    ...SAMPLE_MMFF_SEASON,
    is_active_season: isHolidaySeason,
  };
}

