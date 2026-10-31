import { useQuery } from '@tanstack/react-query';
import {
  fetchStudios,
  fetchStudioById,
  fetchStudioFilms,
  fetchStudioAwards,
  fetchStudioClips,
} from './api';

export function useStudios() {
  return useQuery({
    queryKey: ['studios'],
    queryFn: () => fetchStudios(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudio(idOrSlug: string) {
  return useQuery({
    queryKey: ['studio', idOrSlug],
    queryFn: () => fetchStudioById(idOrSlug),
    enabled: Boolean(idOrSlug),
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudioFilms(studioId: string) {
  return useQuery({
    queryKey: ['studioFilms', studioId],
    queryFn: () => fetchStudioFilms(studioId),
    enabled: Boolean(studioId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudioAwards(studioId: string) {
  return useQuery({
    queryKey: ['studioAwards', studioId],
    queryFn: () => fetchStudioAwards(studioId),
    enabled: Boolean(studioId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudioClips(studioId: string) {
  return useQuery({
    queryKey: ['studioClips', studioId],
    queryFn: () => fetchStudioClips(studioId),
    enabled: Boolean(studioId),
    staleTime: 1000 * 60 * 5,
  });
}

