import { useQuery } from '@tanstack/react-query';
import {
  fetchStreamingPlatforms,
  fetchFilmWatchAvailability,
  fetchBrowseFilmsByPlatform,
} from './api';

export function useStreamingPlatforms() {
  return useQuery({
    queryKey: ['streamingPlatforms'],
    queryFn: () => fetchStreamingPlatforms(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useFilmWatchAvailability(filmId: string) {
  return useQuery({
    queryKey: ['filmWatchAvailability', filmId],
    queryFn: () => fetchFilmWatchAvailability(filmId),
    enabled: Boolean(filmId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useBrowseFilmsByPlatform(
  platformSlug: string = 'all',
  freeOnly: boolean = false
) {
  return useQuery({
    queryKey: ['browseFilmsByPlatform', platformSlug, freeOnly],
    queryFn: () => fetchBrowseFilmsByPlatform(platformSlug, freeOnly),
    staleTime: 1000 * 60 * 5,
  });
}

