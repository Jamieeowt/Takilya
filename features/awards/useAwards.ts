import { useQuery } from '@tanstack/react-query';
import {
  fetchAwardBodies,
  fetchAwardRecognitions,
  fetchAwardWinningFilms,
  fetchMostNominatedUnwon,
  fetchMMFFSeasonData,
} from './api';
import { AwardRecognitionFilters } from './types';

export function useAwardBodies(scope: 'all' | 'local' | 'international' = 'all') {
  return useQuery({
    queryKey: ['awardBodies', scope],
    queryFn: () => fetchAwardBodies(scope),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAwardRecognitions(filters: AwardRecognitionFilters = {}) {
  return useQuery({
    queryKey: ['awardRecognitions', filters],
    queryFn: () => fetchAwardRecognitions(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAwardWinningFilms() {
  return useQuery({
    queryKey: ['awardWinningFilms'],
    queryFn: () => fetchAwardWinningFilms(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useMostNominatedUnwon() {
  return useQuery({
    queryKey: ['mostNominatedUnwon'],
    queryFn: () => fetchMostNominatedUnwon(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useMMFFSeason() {
  return useQuery({
    queryKey: ['mmffSeason'],
    queryFn: () => fetchMMFFSeasonData(),
    staleTime: 1000 * 60 * 10,
  });
}

