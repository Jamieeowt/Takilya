import { useQuery } from '@tanstack/react-query';
import {
  fetchDiscoveryCuratedSections,
  searchEntitiesAndFilms,
  fetchBrowseFilms,
} from './api';
import {
  SearchFilterState,
  BrowseFilterState,
  SearchResultsResponse,
  DiscoveryCuratedSections,
  BrowseFilmCard,
} from './types';

export function useDiscoverySections() {
  return useQuery<DiscoveryCuratedSections>({
    queryKey: ['discoverySections'],
    queryFn: fetchDiscoveryCuratedSections,
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

export function useBrowseFilms(filters: BrowseFilterState) {
  return useQuery<BrowseFilmCard[]>({
    queryKey: ['browseFilms', filters],
    queryFn: () => fetchBrowseFilms(filters),
    staleTime: 1000 * 60 * 3,
  });
}
