import {
  isValidRating,
  validateRating,
  computeDualScore,
  VALID_RATINGS,
} from '../../features/films/ratingValidation';

describe('Unit Test: Film Rating Constraints & Dual Scoring (Prompt 5.1 & AGENTS.md)', () => {
  it('accepts all valid rating scale steps from 1.0 to 5.0 in 0.5 increments', () => {
    expect(VALID_RATINGS).toEqual([1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]);

    VALID_RATINGS.forEach((score) => {
      expect(isValidRating(score)).toBe(true);
      const res = validateRating(score);
      expect(res.valid).toBe(true);
      expect(res.score).toBe(score);
    });
  });

  it('rejects scores below 1.0', () => {
    expect(isValidRating(0.5)).toBe(false);
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(-1.0)).toBe(false);

    const res = validateRating(0.5);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('less than 1.0');
  });

  it('rejects scores above 5.0', () => {
    expect(isValidRating(5.5)).toBe(false);
    expect(isValidRating(10.0)).toBe(false);

    const res = validateRating(5.5);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('cannot exceed 5.0');
  });

  it('rejects non-half step scores', () => {
    const invalidSteps = [1.2, 2.3, 3.7, 4.9];
    invalidSteps.forEach((score) => {
      expect(isValidRating(score)).toBe(false);
      const res = validateRating(score);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('increments of 0.5');
    });
  });

  it('re-computes dual score metrics accurately', () => {
    const audienceRatings = [5.0, 4.5, 4.0, 4.5]; // Average = 4.5
    const dualScore = computeDualScore(audienceRatings);

    expect(dualScore.totalVotes).toBe(4);
    expect(dualScore.averageStars).toBe(4.5);
    expect(dualScore.scorePercentage).toBe(90); // 4.5 * 20 = 90%
  });

  it('handles empty rating arrays cleanly without crashing', () => {
    const emptyScore = computeDualScore([]);
    expect(emptyScore.totalVotes).toBe(0);
    expect(emptyScore.averageStars).toBe(0);
    expect(emptyScore.scorePercentage).toBe(0);
  });
});

