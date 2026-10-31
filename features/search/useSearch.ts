import { useQuery } from '@tanstack/react-query';
import { fetchDiscoverySections, searchEntitiesAndFilms } from './api';
import { SearchFilterState, SearchResultsResponse, DiscoveryCuratedSections } from './types';

export function useDiscoverySections() {
  return useQuery<DiscoveryCuratedSections>({
    queryKey: ['discoverySections'],
    queryFn: fetchDiscoverySections,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useSearchResults(searchQuery: string, filters: SearchFilterState) {
  return useQuery<SearchResultsResponse>({
    queryKey: ['searchResults', searchQuery, filters],
    queryFn: () => searchEntitiesAndFilms(searchQuery, filters),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}

