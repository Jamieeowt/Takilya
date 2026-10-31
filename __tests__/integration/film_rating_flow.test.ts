import { computeDualScore, isValidRating } from '../../features/films/ratingValidation';

describe('Integration Test: Film Rating Mutation & Dual Score Flow (Prompt 5.1 & AGENTS.md)', () => {
  interface FilmRatingRecord {
    film_id: string;
    user_id: string;
    score: number;
    user_role: 'user' | 'critic';
  }

  it('separately tracks and re-computes audience score vs critic score', () => {
    // Initial state with 4 audience ratings and 2 critic ratings
    const ratingsDatabase: FilmRatingRecord[] = [
      { film_id: 'film-1', user_id: 'u-1', score: 5.0, user_role: 'user' },
      { film_id: 'film-1', user_id: 'u-2', score: 4.5, user_role: 'user' },
      { film_id: 'film-1', user_id: 'u-3', score: 4.0, user_role: 'user' },
      { film_id: 'film-1', user_id: 'u-4', score: 4.5, user_role: 'user' },
      { film_id: 'film-1', user_id: 'critic-1', score: 5.0, user_role: 'critic' },
      { film_id: 'film-1', user_id: 'critic-2', score: 4.5, user_role: 'critic' },
    ];

    const getFilmScores = (filmId: string) => {
      const audienceScores = ratingsDatabase
        .filter((r) => r.film_id === filmId && r.user_role === 'user')
        .map((r) => r.score);

      const criticScores = ratingsDatabase
        .filter((r) => r.film_id === filmId && r.user_role === 'critic')
        .map((r) => r.score);

      return {
        audience: computeDualScore(audienceScores),
        critic: computeDualScore(criticScores),
      };
    };

    const initial = getFilmScores('film-1');
    expect(initial.audience.totalVotes).toBe(4);
    expect(initial.audience.averageStars).toBe(4.5);
    expect(initial.audience.scorePercentage).toBe(90);

    expect(initial.critic.totalVotes).toBe(2);
    expect(initial.critic.averageStars).toBe(4.8);
    expect(initial.critic.scorePercentage).toBe(96);

    // Mutation: New user rates the film 5.0
    const newRating: FilmRatingRecord = {
      film_id: 'film-1',
      user_id: 'u-5',
      score: 5.0,
      user_role: 'user',
    };
    expect(isValidRating(newRating.score)).toBe(true);
    ratingsDatabase.push(newRating);

    // Recomputed dual scores
    const updated = getFilmScores('film-1');
    expect(updated.audience.totalVotes).toBe(5);
    // (5.0 + 4.5 + 4.0 + 4.5 + 5.0) / 5 = 23 / 5 = 4.6
    expect(updated.audience.averageStars).toBe(4.6);
    expect(updated.audience.scorePercentage).toBe(92);

    // Critic score remains untouched by audience rating!
    expect(updated.critic.totalVotes).toBe(2);
    expect(updated.critic.scorePercentage).toBe(96);
  });
});

