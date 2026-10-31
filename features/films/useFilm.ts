import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchFilmDetail,
  toggleFilmWatchlist,
  markFilmWatched,
  submitFilmRating,
  submitFilmReview,
} from './api';
import { FilmDetailFull } from './types';

export function useFilmDetail(filmId: string, userId?: string | null) {
  return useQuery<FilmDetailFull>({
    queryKey: ['filmDetail', filmId, userId],
    queryFn: () => fetchFilmDetail(filmId, userId),
    enabled: Boolean(filmId),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });
}

export function useToggleFilmWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      filmId,
      userId,
      currentlyInWatchlist,
    }: {
      filmId: string;
      userId: string;
      currentlyInWatchlist: boolean;
    }) => toggleFilmWatchlist(filmId, userId, currentlyInWatchlist),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['filmDetail', variables.filmId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['userProfile'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['watchlist'],
      });
    },
  });
}

export function useMarkFilmWatched() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      filmId,
      userId,
      currentlyWatched,
    }: {
      filmId: string;
      userId: string;
      currentlyWatched: boolean;
    }) => markFilmWatched(filmId, userId, currentlyWatched),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['filmDetail', variables.filmId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['userProfile'],
      });
    },
  });
}

export function useSubmitFilmRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      filmId,
      userId,
      score,
    }: {
      filmId: string;
      userId: string;
      score: number;
    }) => submitFilmRating(filmId, userId, score),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['filmDetail', variables.filmId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['filmReviews', variables.filmId],
      });
    },
  });
}

export function useSubmitFilmReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      filmId,
      userId,
      title,
      body,
      hasSpoilers,
      score,
    }: {
      filmId: string;
      userId: string;
      title: string;
      body: string;
      hasSpoilers: boolean;
      score?: number;
    }) => submitFilmReview(filmId, userId, title, body, hasSpoilers, score),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['filmDetail', variables.filmId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['filmReviews', variables.filmId],
      });
    },
  });
}

