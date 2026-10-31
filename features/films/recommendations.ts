import type {
  CandidateFilm,
  UserRatingInput,
  RecommendedFilmItem,
  SimilarFilmItem,
} from './types';

/**
 * Computes personalized film recommendations.
 *
 * Requirements:
 * 1. Cold-start fallback: If target user has fewer than 3 ratings >= 4.0 (or no ratings),
 *    return top-rated films sorted by audience score and vote count.
 * 2. Metadata affinity: Extract preferred genres, tags, directors, and cast members
 *    from films rated >= 4.0.
 * 3. Scoring: Weight metadata overlap by candidate film's audience score.
 * 4. Exclusion: Never recommend films already rated or watched by the user.
 * 5. Returns top 20 ranked candidates.
 */
export function computeRecommendations(
  userRatings: UserRatingInput[] = [],
  candidates: CandidateFilm[] = [],
  watchedFilmIds: string[] = []
): RecommendedFilmItem[] {
  const ratedMap = new Map<string, number>();
  userRatings.forEach((r) => ratedMap.set(r.film_id, r.score));

  const watchedSet = new Set(watchedFilmIds);

  // Filter out any films the user has already rated or logged as watched
  const unratedCandidates = candidates.filter(
    (c) => !ratedMap.has(c.id) && !watchedSet.has(c.id)
  );

  // Find films rated 4.0 or higher
  const highRatings = userRatings.filter((r) => r.score >= 4.0);

  // Cold-Start Fallback:
  // If fewer than 3 high ratings (or no ratings / only low scores), fall back to top-rated catalog
  if (highRatings.length < 3) {
    const sorted = [...unratedCandidates].sort((a, b) => {
      const scoreA = a.audience_score ?? 0;
      const scoreB = b.audience_score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;

      const votesA = a.ratings_count ?? 0;
      const votesB = b.ratings_count ?? 0;
      if (votesB !== votesA) return votesB - votesA;

      return b.release_year - a.release_year;
    });

    return sorted.slice(0, 20).map((c) => ({
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
      recommendation_score: c.audience_score ?? 85,
      recommendation_reason: 'Top Rated in Philippine Cinema',
      genres: c.genres,
      tags: c.tags,
    }));
  }

  // Personalized Affinity Vector Calculation
  const highRatedIds = new Set(highRatings.map((r) => r.film_id));
  const candidateLookup = new Map<string, CandidateFilm>();
  candidates.forEach((c) => candidateLookup.set(c.id, c));

  const genreWeights: Record<string, number> = {};
  const tagWeights: Record<string, number> = {};
  const directorWeights: Record<string, number> = {};
  const castWeights: Record<string, number> = {};

  highRatings.forEach((rating) => {
    const film = candidateLookup.get(rating.film_id);
    if (!film) return;

    // Director affinity (heavy weight)
    if (film.director) {
      directorWeights[film.director] = (directorWeights[film.director] || 0) + 1;
    }

    // Genre affinity
    film.genres?.forEach((g) => {
      genreWeights[g] = (genreWeights[g] || 0) + 1;
    });

    // Tag affinity
    film.tags?.forEach((t) => {
      tagWeights[t] = (tagWeights[t] || 0) + 1;
    });

    // Cast affinity
    film.cast_names?.forEach((c) => {
      castWeights[c] = (castWeights[c] || 0) + 1;
    });
  });

  // Score candidate films based on metadata overlap
  const scoredItems = unratedCandidates.map((candidate) => {
    // 1. Director score (5.0 points per matching high-rated film)
    const directorScore = candidate.director && directorWeights[candidate.director]
      ? directorWeights[candidate.director] * 5.0
      : 0;

    // 2. Genre score (3.0 points per matching genre)
    let genreScore = 0;
    candidate.genres?.forEach((g) => {
      if (genreWeights[g]) {
        genreScore += genreWeights[g] * 3.0;
      }
    });

    // 3. Tag score (2.0 points per matching tag)
    let tagScore = 0;
    candidate.tags?.forEach((t) => {
      if (tagWeights[t]) {
        tagScore += tagWeights[t] * 2.0;
      }
    });

    // 4. Cast score (2.5 points per matching actor)
    let castScore = 0;
    let matchingActorName: string | null = null;
    candidate.cast_names?.forEach((actor) => {
      if (castWeights[actor]) {
        castScore += castWeights[actor] * 2.5;
        if (!matchingActorName) matchingActorName = actor;
      }
    });

    const rawAffinity = directorScore + genreScore + tagScore + castScore;
    const audienceMultiplier = (candidate.audience_score ?? 75) / 100;
    const recommendation_score = Math.round((rawAffinity + 1.0) * audienceMultiplier * 100) / 100;

    // Determine intuitive recommendation reason
    let recommendation_reason = 'Recommended for your taste';
    if (directorScore > 0) {
      recommendation_reason = `Because you like director ${candidate.director}`;
    } else if (castScore > 0 && matchingActorName) {
      recommendation_reason = `Stars ${matchingActorName}`;
    } else if (genreScore > 0 && tagScore > 0) {
      recommendation_reason = 'Matches your genre & cinema style taste';
    } else if (genreScore > 0) {
      recommendation_reason = 'Based on your favorite genres';
    } else if (tagScore > 0) {
      recommendation_reason = 'Matches themes you enjoy';
    }

    return {
      item: {
        id: candidate.id,
        title: candidate.title,
        original_title: candidate.original_title,
        slug: candidate.slug,
        synopsis: candidate.synopsis,
        release_year: candidate.release_year,
        poster_url: candidate.poster_url,
        backdrop_url: candidate.backdrop_url,
        director: candidate.director,
        audience_score: candidate.audience_score,
        critic_score: candidate.critic_score,
        ratings_count: candidate.ratings_count,
        recommendation_score,
        recommendation_reason,
        genres: candidate.genres,
        tags: candidate.tags,
      } as RecommendedFilmItem,
      rawAffinity,
    };
  });

  // Sort by recommendation_score descending, then audience_score descending
  scoredItems.sort((a, b) => {
    if (b.item.recommendation_score !== a.item.recommendation_score) {
      return b.item.recommendation_score - a.item.recommendation_score;
    }
    const scoreA = a.item.audience_score ?? 0;
    const scoreB = b.item.audience_score ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.item.release_year - a.item.release_year;
  });

  return scoredItems.slice(0, 20).map((s) => s.item);
}

/**
 * Computes similar films for "Because you liked [Film Title]"
 */
export function computeSimilarFilms(
  sourceFilm: CandidateFilm,
  candidates: CandidateFilm[],
  limit = 10
): SimilarFilmItem[] {
  const otherFilms = candidates.filter((c) => c.id !== sourceFilm.id);

  const scored = otherFilms.map((candidate) => {
    // 1. Same director match
    const sameDirector = Boolean(
      candidate.director &&
      sourceFilm.director &&
      candidate.director.toLowerCase() === sourceFilm.director.toLowerCase()
    );
    const directorScore = sameDirector ? 5.0 : 0;

    // 2. Matching genres
    const matchingGenres = (candidate.genres || []).filter((g) =>
      (sourceFilm.genres || []).some((sg) => sg.toLowerCase() === g.toLowerCase())
    );
    const genreScore = matchingGenres.length * 3.0;

    // 3. Matching tags
    const matchingTags = (candidate.tags || []).filter((t) =>
      (sourceFilm.tags || []).some((st) => st.toLowerCase() === t.toLowerCase())
    );
    const tagScore = matchingTags.length * 2.0;

    // 4. Matching cast
    const matchingCast = (candidate.cast_names || []).filter((c) =>
      (sourceFilm.cast_names || []).some((sc) => sc.toLowerCase() === c.toLowerCase())
    );
    const castScore = matchingCast.length * 2.5;

    const rawAffinity = directorScore + genreScore + tagScore + castScore;
    const audienceMultiplier = (candidate.audience_score ?? 75) / 100;
    const similarity_score = Math.round((rawAffinity + 0.5) * audienceMultiplier * 100) / 100;

    let similarity_reason = 'Recommended Philippine cinema';
    if (sameDirector) {
      similarity_reason = `Also directed by ${sourceFilm.director}`;
    } else if (matchingCast.length > 0) {
      similarity_reason = `Also stars ${matchingCast[0]}`;
    } else if (matchingGenres.length > 0 && matchingTags.length > 0) {
      similarity_reason = 'Similar themes and genre';
    } else if (matchingGenres.length > 0) {
      similarity_reason = `Similar genre (${matchingGenres[0]})`;
    } else if (matchingTags.length > 0) {
      similarity_reason = `Similar style (${matchingTags[0]})`;
    }

    return {
      id: candidate.id,
      title: candidate.title,
      original_title: candidate.original_title,
      slug: candidate.slug,
      synopsis: candidate.synopsis,
      release_year: candidate.release_year,
      poster_url: candidate.poster_url,
      backdrop_url: candidate.backdrop_url,
      director: candidate.director,
      audience_score: candidate.audience_score,
      critic_score: candidate.critic_score,
      ratings_count: candidate.ratings_count,
      similarity_score,
      similarity_reason,
      rawAffinity,
    };
  });

  // Prefer films that have at least some affinity, sorted by score
  scored.sort((a, b) => {
    if (b.similarity_score !== a.similarity_score) {
      return b.similarity_score - a.similarity_score;
    }
    const scoreA = a.audience_score ?? 0;
    const scoreB = b.audience_score ?? 0;
    return scoreB - scoreA;
  });

  return scored.slice(0, limit).map(({ rawAffinity, ...item }) => item);
}

