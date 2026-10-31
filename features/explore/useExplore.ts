import { useQuery } from '@tanstack/react-query';
import { fetchExploreSections, fetchFilteredFilms, searchExplore } from './api';
import { ExploreFilterState } from './types';

export function useExploreSections() {
  return useQuery({
    queryKey: ['exploreSections'],
    queryFn: fetchExploreSections,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useFilteredFilms(filters: ExploreFilterState, enabled: boolean) {
  return useQuery({
    queryKey: ['filteredFilms', filters],
    queryFn: () => fetchFilteredFilms(filters),
    enabled,
    staleTime: 1000 * 60 * 3,
  });
}

export function useExploreSearch(query: string) {
  const cleanQuery = query.trim();
  return useQuery({
    queryKey: ['exploreSearch', cleanQuery],
    queryFn: () => searchExplore(cleanQuery),
    enabled: cleanQuery.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}
