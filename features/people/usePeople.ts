import { useQuery } from '@tanstack/react-query';
import {
  fetchPeople,
  fetchPersonById,
  fetchPersonCredits,
  fetchPersonAwards,
  fetchPersonClips,
} from './api';

export function usePeople(roleFilter?: string) {
  return useQuery({
    queryKey: ['people', roleFilter],
    queryFn: () => fetchPeople(roleFilter),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePerson(idOrSlug: string) {
  return useQuery({
    queryKey: ['person', idOrSlug],
    queryFn: () => fetchPersonById(idOrSlug),
    enabled: Boolean(idOrSlug),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePersonCredits(personId: string) {
  return useQuery({
    queryKey: ['personCredits', personId],
    queryFn: () => fetchPersonCredits(personId),
    enabled: Boolean(personId),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePersonAwards(personId: string) {
  return useQuery({
    queryKey: ['personAwards', personId],
    queryFn: () => fetchPersonAwards(personId),
    enabled: Boolean(personId),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePersonClips(personId: string) {
  return useQuery({
    queryKey: ['personClips', personId],
    queryFn: () => fetchPersonClips(personId),
    enabled: Boolean(personId),
    staleTime: 1000 * 60 * 5,
  });
}

