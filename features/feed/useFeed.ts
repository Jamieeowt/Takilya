import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFeedTrailers, incrementTrailerView, toggleFilmWatchlist } from './api';
import { FeedType } from './types';

export function useInfiniteFeed(feedType: FeedType, userId?: string | null) {
  return useInfiniteQuery({
    queryKey: ['feedTrailers', feedType, userId],
    queryFn: ({ pageParam }) =>
      fetchFeedTrailers({
        feedType,
        cursor: pageParam,
        limit: 10,
        userId,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}

export function useIncrementTrailerView() {
  return useMutation({
    mutationFn: (trailerId: string) => incrementTrailerView(trailerId),
  });
}

export function useToggleWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      filmId,
      userId,
      currentlySaved,
    }: {
      filmId: string;
      userId: string;
      currentlySaved: boolean;
    }) => toggleFilmWatchlist(filmId, userId, currentlySaved),
    onSuccess: () => {
      // Invalidate relevant queries
      void queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
