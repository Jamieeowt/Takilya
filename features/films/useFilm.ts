import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchFilmDetail,
  toggleFilmWatchlist,
  markFilmWatched,
  submitFilmRating,
  submitFilmReview,
  logFilmAndReview,
} from './api';
import { FilmDetailFull, LogFilmPayload } from './types';
import { enqueueMutation } from '@/lib/offline';
import { haptics } from '@/lib/haptics';

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
      haptics.medium();
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
    onError: (_, variables) => {
      // Queue offline mutation for automatic background sync
      void enqueueMutation({
        type: 'TOGGLE_WATCHLIST',
        payload: {
          filmId: variables.filmId,
          userId: variables.userId,
          currentStatus: variables.currentlyInWatchlist,
        },
        userId: variables.userId,
      });
      haptics.warning();
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

export function useLogFilmAndReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LogFilmPayload) => logFilmAndReview(payload),
    onMutate: async (newLog: LogFilmPayload) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['filmDetail', newLog.filmId] });

      // Snapshot previous value
      const previousFilmDetail = queryClient.getQueryData<FilmDetailFull>([
        'filmDetail',
        newLog.filmId,
        newLog.userId,
      ]);

      // Optimistically update film detail
      if (previousFilmDetail) {
        queryClient.setQueryData<FilmDetailFull>(
          ['filmDetail', newLog.filmId, newLog.userId],
          {
            ...previousFilmDetail,
            user_state: {
              ...previousFilmDetail.user_state,
              is_watched: true,
              user_rating: newLog.rating,
              user_review: newLog.reviewBody
                ? {
                    id: 'optimistic-rev-' + Date.now(),
                    film_id: newLog.filmId,
                    user_id: newLog.userId,
                    user_name: 'You',
                    user_username: 'current_user',
                    user_role: 'user',
                    rating: newLog.rating,
                    title: newLog.reviewTitle || null,
                    body: newLog.reviewBody,
                    has_spoilers: Boolean(newLog.hasSpoilers),
                    is_critic_review: false,
                    created_at: new Date().toISOString(),
                    upvotes_count: 0,
                  }
                : previousFilmDetail.user_state.user_review,
            },
          }
        );
      }

      return { previousFilmDetail };
    },
    onError: (_, newLog) => {
      // Offline fallback: queue for sync when connection recovers
      void enqueueMutation({
        type: 'LOG_FILM',
        payload: newLog,
        userId: newLog.userId,
      });
      haptics.warning();
    },
    onSuccess: () => {
      haptics.success();
    },
    onSettled: (_, __, newLog) => {
      void queryClient.invalidateQueries({
        queryKey: ['filmDetail', newLog.filmId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['userProfile'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['reviews'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['watchHistory'],
      });
    },
  });
}




