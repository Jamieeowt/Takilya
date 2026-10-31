import {
  computeRecommendations,
  computeSimilarFilms,
} from '../features/films/recommendations';
import type { CandidateFilm, UserRatingInput } from '../features/films/types';

// Realistic Philippine Cinema Test Catalog
const TEST_FILMS: CandidateFilm[] = [
  {
    id: 'film-1',
    title: 'Himala',
    slug: 'himala',
    synopsis: 'Elsa claims to see apparitions of the Virgin Mary in Cupang.',
    release_year: 1982,
    director: 'Ishmael Bernal',
    genres: ['Drama', 'Social Realism', 'Heritage'],
    tags: ['restored-heritage', 'national-artist-masterwork', 'canonical'],
    audience_score: 96,
    critic_score: 98,
    ratings_count: 512,
    cast_names: ['Nora Aunor', 'Spanky Manikan'],
  },
  {
    id: 'film-2',
    title: 'Maynila sa mga Kuko ng Liwanag',
    slug: 'maynila',
    synopsis: 'Julio navigates Manila searching for Ligaya.',
    release_year: 1975,
    director: 'Lino Brocka',
    genres: ['Drama', 'Social Realism', 'Noir'],
    tags: ['social-realism', 'national-artist-masterwork'],
    audience_score: 97,
    critic_score: 99,
    ratings_count: 480,
    cast_names: ['Bembol Roco', 'Hilda Koronel'],
  },
  {
    id: 'film-3',
    title: 'Manila by Night (City After Dark)',
    slug: 'manila-by-night',
    synopsis: 'A polyphonic portrait of Manila nocturnal subcultures.',
    release_year: 1980,
    director: 'Ishmael Bernal',
    genres: ['Drama', 'Ensemble', 'Social Realism'],
    tags: ['restored-heritage', 'canonical'],
    audience_score: 95,
    critic_score: 97,
    ratings_count: 380,
    cast_names: ['Gina Alajar', 'Cherie Gil'],
  },
  {
    id: 'film-4',
    title: 'Insiang',
    slug: 'insiang',
    synopsis: 'A young laundrywoman living in Tondo seeks calculated vengeance.',
    release_year: 1976,
    director: 'Lino Brocka',
    genres: ['Drama', 'Social Realism', 'Tragedy'],
    tags: ['restored-heritage', 'cannes-premiere'],
    audience_score: 97,
    critic_score: 98,
    ratings_count: 420,
    cast_names: ['Hilda Koronel', 'Mona Lisa'],
  },
  {
    id: 'film-5',
    title: 'Leonor Will Never Die',
    slug: 'leonor',
    synopsis: 'A retired filmmaker falls into a coma into her unfinished screenplay.',
    release_year: 2022,
    director: 'Martika Ramirez Escobar',
    genres: ['Action', 'Comedy', 'Indie'],
    tags: ['indie', 'meta-cinema'],
    audience_score: 91,
    critic_score: 94,
    ratings_count: 320,
    cast_names: ['Sheila Francisco', 'Bong Cabrera'],
  },
  {
    id: 'film-6',
    title: 'John Denver Trending',
    slug: 'john-denver-trending',
    synopsis: 'A viral video of a junior high student leads to cyberbullying.',
    release_year: 2019,
    director: 'Arden Rod Condez',
    genres: ['Drama', 'Thriller', 'Regional Cinema'],
    tags: ['indie', 'regional-cinema', 'cinemalaya-winner'],
    audience_score: 93,
    critic_score: 95,
    ratings_count: 290,
    cast_names: ['Jansen Magpusao', 'Meryll Soriano'],
  },
  {
    id: 'film-7',
    title: 'Cleaners',
    slug: 'cleaners',
    synopsis: 'Classroom cleaners in Tuguegarao navigate high school.',
    release_year: 2019,
    director: 'Glenn Barit',
    genres: ['Comedy', 'Coming of Age', 'Regional Cinema'],
    tags: ['indie', 'regional-cinema', 'experimental'],
    audience_score: 94,
    critic_score: 96,
    ratings_count: 245,
    cast_names: ['Leona Lyle', 'Allan Gannaban'],
  },
  {
    id: 'film-8',
    title: 'Oda sa Wala',
    slug: 'oda-sa-wala',
    synopsis: 'An aging embalmer finds unexpected companionship with a corpse.',
    release_year: 2018,
    director: 'Dwein Baltazar',
    genres: ['Drama', 'Dark Comedy', 'Indie'],
    tags: ['indie', 'existential'],
    audience_score: 89,
    critic_score: 93,
    ratings_count: 180,
    cast_names: ['Pokwang', 'Joonee Gamboa'],
  },
];

describe('Takilya Recommendation Engine (Prompt 4.4)', () => {
  // --------------------------------------------------------------------------
  // Case 1: User with no ratings (returns top-rated fallback)
  // --------------------------------------------------------------------------
  it('Case 1: User with no ratings returns top-rated fallback catalog', () => {
    const recommendations = computeRecommendations([], TEST_FILMS);

    expect(recommendations.length).toBeGreaterThan(0);
    // Top-rated fallback must be sorted by audience score descending
    expect(recommendations[0].title).toBe('Maynila sa mga Kuko ng Liwanag');
    expect(recommendations[0].audience_score).toBe(97);
    expect(recommendations[0].recommendation_reason).toBe('Top Rated in Philippine Cinema');
  });

  // --------------------------------------------------------------------------
  // Case 2: High genre affinity (returns films matching preferred genres)
  // --------------------------------------------------------------------------
  it('Case 2: User with high genre affinity receives matching genre films', () => {
    // User loved 3 Regional Cinema / Indie titles with 4.5 - 5.0
    const userRatings: UserRatingInput[] = [
      { film_id: 'film-6', score: 5.0 }, // John Denver Trending (Regional Cinema, Indie)
      { film_id: 'film-7', score: 4.5 }, // Cleaners (Regional Cinema, Indie)
      { film_id: 'film-8', score: 4.0 }, // Oda sa Wala (Indie, Drama)
    ];

    const recommendations = computeRecommendations(userRatings, TEST_FILMS);

    // Film 5 (Leonor Will Never Die) has Indie tag & Comedy genre, matching user's taste
    const topRecommended = recommendations[0];
    expect(topRecommended).toBeDefined();
    expect(topRecommended.id).toBe('film-5');
    const reason = topRecommended.recommendation_reason;
    const matchesAffinity = reason.includes('genre') || reason.includes('theme') || reason.includes('taste');
    expect(matchesAffinity).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Case 3: High director affinity (returns unrated films by same director)
  // --------------------------------------------------------------------------
  it('Case 3: High director affinity prioritizes unrated film by same director', () => {
    // User rated 3 high films, including Ishmael Bernal's Himala with 5.0
    const userRatings: UserRatingInput[] = [
      { film_id: 'film-1', score: 5.0 }, // Himala (Dir. Ishmael Bernal)
      { film_id: 'film-2', score: 4.5 }, // Maynila (Dir. Lino Brocka)
      { film_id: 'film-5', score: 4.0 }, // Leonor
    ];

    const recommendations = computeRecommendations(userRatings, TEST_FILMS);

    // Ishmael Bernal's unrated 'Manila by Night' (film-3) should be boosted to the top!
    const bernalMatch = recommendations.find((r) => r.id === 'film-3');
    expect(bernalMatch).toBeDefined();
    expect(bernalMatch!.recommendation_reason).toBe('Because you like director Ishmael Bernal');
    expect(bernalMatch!.recommendation_score).toBeGreaterThan(3.0);
  });

  // --------------------------------------------------------------------------
  // Case 4: Cold-start user with low scores only (ensures excluded low-affinity items)
  // --------------------------------------------------------------------------
  it('Case 4: User with low scores only falls back to top-rated catalog and excludes low items', () => {
    // User gave 3 poor ratings (< 4.0)
    const userRatings: UserRatingInput[] = [
      { film_id: 'film-1', score: 1.5 },
      { film_id: 'film-2', score: 2.0 },
      { film_id: 'film-3', score: 2.5 },
    ];

    const recommendations = computeRecommendations(userRatings, TEST_FILMS);

    // 1. Should not recommend the poorly rated films
    const recommendedIds = recommendations.map((r) => r.id);
    expect(recommendedIds).not.toContain('film-1');
    expect(recommendedIds).not.toContain('film-2');
    expect(recommendedIds).not.toContain('film-3');

    // 2. Cold-start fallback should kick in because high ratings count (< 4.0) is 0 < 3
    expect(recommendations[0].recommendation_reason).toBe('Top Rated in Philippine Cinema');
    expect(recommendations[0].id).toBe('film-4');
  });

  // --------------------------------------------------------------------------
  // Case 5: Already-rated and seen films are strictly excluded
  // --------------------------------------------------------------------------
  it('Case 5: Already-rated and seen films are strictly excluded from recommendations', () => {
    const userRatings: UserRatingInput[] = [
      { film_id: 'film-1', score: 5.0 },
      { film_id: 'film-2', score: 5.0 },
      { film_id: 'film-3', score: 5.0 },
    ];
    const watchedFilmIds = ['film-4', 'film-6'];

    const recommendations = computeRecommendations(userRatings, TEST_FILMS, watchedFilmIds);

    const recommendedIds = new Set(recommendations.map((r) => r.id));
    expect(recommendedIds.has('film-1')).toBe(false);
    expect(recommendedIds.has('film-2')).toBe(false);
    expect(recommendedIds.has('film-3')).toBe(false);
    expect(recommendedIds.has('film-4')).toBe(false);
    expect(recommendedIds.has('film-6')).toBe(false);

    // Only unrated and unwatched films should remain (film-5, film-7, film-8)
    expect(recommendedIds.has('film-5')).toBe(true);
    expect(recommendedIds.has('film-7')).toBe(true);
    expect(recommendedIds.has('film-8')).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Bonus: Similar Films Recommendation
  // --------------------------------------------------------------------------
  it('Bonus: Similar films finds same-director and genre-matching films', () => {
    const himala = TEST_FILMS[0]; // Directed by Ishmael Bernal
    const similar = computeSimilarFilms(himala, TEST_FILMS, 5);

    expect(similar.length).toBeGreaterThan(0);
    // Manila by Night is also directed by Ishmael Bernal and has Drama/Social Realism
    expect(similar[0].id).toBe('film-3');
    expect(similar[0].similarity_reason).toBe('Also directed by Ishmael Bernal');
  });
});
