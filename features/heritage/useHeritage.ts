import { useQuery } from '@tanstack/react-query';
import {
  fetchNationalArtists,
  fetchPreservedFilms,
  fetchFilmPreservationRecord,
} from './api';
import { PreservationStatus } from './types';

export function useNationalArtists() {
  return useQuery({
    queryKey: ['nationalArtists'],
    queryFn: () => fetchNationalArtists(),
    staleTime: 1000 * 60 * 10,
  });
}

export function usePreservedFilms(statusFilter?: PreservationStatus | 'all') {
  return useQuery({
    queryKey: ['preservedFilms', statusFilter],
    queryFn: () => fetchPreservedFilms(statusFilter),
    staleTime: 1000 * 60 * 5,
  });
}

export function useFilmPreservation(filmId?: string) {
  return useQuery({
    queryKey: ['filmPreservation', filmId],
    queryFn: () => (filmId ? fetchFilmPreservationRecord(filmId) : null),
    enabled: Boolean(filmId),
    staleTime: 1000 * 60 * 10,
  });
}

