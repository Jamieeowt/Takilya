import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchFilmsForSelector,
  fetchTrailersByFilm,
  postOfficialClip,
} from './api';
import { PostOfficialClipPayload, PostOfficialClipResult } from './types';

/**
 * Hook to query trailers for a film.
 */
export function useFilmTrailers(filmId?: string) {
  return useQuery({
    queryKey: ['trailers', 'film', filmId],
    queryFn: () => (filmId ? fetchTrailersByFilm(filmId) : Promise.resolve([])),
    enabled: Boolean(filmId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to query selectable films for posting official trailers & clips.
 */
export function useFilmsForSelector() {
  return useQuery({
    queryKey: ['films', 'selector'],
    queryFn: fetchFilmsForSelector,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to submit an official trailer/clip.
 */
export function usePostOfficialClip() {
  const queryClient = useQueryClient();

  return useMutation<PostOfficialClipResult, Error, PostOfficialClipPayload>({
    mutationFn: postOfficialClip,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      void queryClient.invalidateQueries({ queryKey: ['film', variables.film_id] });
      void queryClient.invalidateQueries({ queryKey: ['trailers', 'film', variables.film_id] });
    },
  });
}

