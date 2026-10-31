/**
 * Film Rating Constraints & Validation (Prompt 5.1 & AGENTS.md)
 * 1.0 to 5.0 rating scale in 0.5 step increments.
 */

export const VALID_RATINGS = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0] as const;

export type ValidRating = (typeof VALID_RATINGS)[number];

export interface ValidateRatingResult {
  valid: boolean;
  score?: ValidRating;
  error?: string;
}

/**
 * Checks if a given number is a valid Takilya film rating (1.0 to 5.0 in 0.5 steps)
 */
export function isValidRating(score: number): score is ValidRating {
  if (typeof score !== 'number' || Number.isNaN(score)) return false;
  return VALID_RATINGS.includes(score as ValidRating);
}

/**
 * Validates a rating value and returns descriptive error if invalid
 */
export function validateRating(score: number): ValidateRatingResult {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return { valid: false, error: 'Rating must be a valid number.' };
  }

  if (score < 1.0) {
    return { valid: false, error: 'Rating cannot be less than 1.0 star.' };
  }

  if (score > 5.0) {
    return { valid: false, error: 'Rating cannot exceed 5.0 stars.' };
  }

  // Ensure it's in 0.5 increments
  if ((score * 2) % 1 !== 0) {
    return {
      valid: false,
      error: 'Rating must be in increments of 0.5 (e.g. 1.0, 1.5, 2.0, ..., 5.0).',
    };
  }

  return { valid: true, score: score as ValidRating };
}

/**
 * Calculates dual score metrics (audience percentage and star average)
 */
export function computeDualScore(ratings: number[]): {
  averageStars: number;
  scorePercentage: number;
  totalVotes: number;
} {
  if (!ratings || ratings.length === 0) {
    return { averageStars: 0, scorePercentage: 0, totalVotes: 0 };
  }

  const validRatings = ratings.filter(isValidRating);
  if (validRatings.length === 0) {
    return { averageStars: 0, scorePercentage: 0, totalVotes: 0 };
  }

  const sum = validRatings.reduce((acc, curr) => acc + curr, 0);
  const averageStars = Math.round((sum / validRatings.length) * 10) / 10;
  // Convert 1-5 scale to percentage (e.g. 5.0 * 20 = 100%)
  const scorePercentage = Math.round(averageStars * 20);

  return {
    averageStars,
    scorePercentage,
    totalVotes: validRatings.length,
  };
}

