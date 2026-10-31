import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSearchStore } from '@/features/search/store';
import { useDiscoverySections, useSearchResults } from '@/features/search/useSearch';
import { SearchFilterState } from '@/features/search/types';
import {
  SearchBar,
  FilterSheet,
  RecentSearches,
  DiscoveryCarousels,
  SearchResultsGrid,
  SearchEmptyState,
  SearchSkeletonGrid,
} from '@/components/search';

const DEFAULT_FILTERS: SearchFilterState = {
  genre: null,
  decade: null,
  streamingPlatform: null,
  minRating: null,
  sortBy: 'relevance',
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);

  // Recent Searches Store
  const recentSearches = useSearchStore((state) => state.recentSearches);
  const addRecentSearch = useSearchStore((state) => state.addRecentSearch);
  const removeRecentSearch = useSearchStore((state) => state.removeRecentSearch);
  const clearRecentSearches = useSearchStore((state) => state.clearRecentSearches);
  const initRecentSearches = useSearchStore((state) => state.initRecentSearches);

  useEffect(() => {
    void initRecentSearches();
  }, [initRecentSearches]);

  // Debounce search query by 300ms for instant search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      if (searchQuery.trim().length >= 2) {
        addRecentSearch(searchQuery.trim());
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, addRecentSearch]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.genre) count++;
    if (filters.decade) count++;
    if (filters.streamingPlatform) count++;
    if (filters.minRating) count++;
    if (filters.sortBy !== 'relevance') count++;
    return count;
  }, [filters]);

  const hasSearchOrFilters = debouncedQuery.length > 0 || activeFiltersCount > 0;

  // React Query: Discovery Carousels (cached)
  const { data: discovery, isLoading: isDiscoveryLoading } = useDiscoverySections();

  // React Query: Instant Search & Filtered Results
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    isFetching,
  } = useSearchResults(debouncedQuery, filters);

  const handleSelectRecentOrSuggestion = (term: string) => {
    setSearchQuery(term);
    setDebouncedQuery(term);
    addRecentSearch(term);
    Keyboard.dismiss();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const totalResultsCount =
    (searchResults?.films.length || 0) +
    (searchResults?.people.length || 0) +
    (searchResults?.screenings.length || 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 1. Sticky Top Search Bar */}
      <SearchBar
        query={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleClearSearch}
        isLoading={isFetching && hasSearchOrFilters}
        activeFiltersCount={activeFiltersCount}
        onOpenFilters={() => setIsFilterSheetOpen(true)}
        onSubmit={() => {
          if (searchQuery.trim()) {
            addRecentSearch(searchQuery.trim());
          }
          Keyboard.dismiss();
        }}
      />

      {/* 2. Main Content Body */}
      {!hasSearchOrFilters ? (
        // A. Idle State: Recent Searches & Curated Discovery Carousels
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          {/* Recent Searches */}
          <RecentSearches
            searches={recentSearches}
            onSelectSearch={handleSelectRecentOrSuggestion}
            onDeleteSearch={removeRecentSearch}
            onClearAll={clearRecentSearches}
          />

          {/* Discovery Carousels: Trending, Award Winners, Now Showing */}
          {discovery ? (
            <DiscoveryCarousels sections={discovery} />
          ) : isDiscoveryLoading ? (
            <SearchSkeletonGrid />
          ) : null}
        </ScrollView>
      ) : isSearchLoading ? (
        // B. Loading / Transition Shimmer Skeletons
        <SearchSkeletonGrid />
      ) : totalResultsCount > 0 ? (
        // C. Results Grid & Multi-Entity Tabs (Films, Filmmakers, Screenings)
        <SearchResultsGrid
          films={searchResults?.films || []}
          people={searchResults?.people || []}
          screenings={searchResults?.screenings || []}
        />
      ) : (
        // D. Empty State with Suggested Alternative Titles
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <SearchEmptyState
            query={debouncedQuery}
            onSelectSuggestion={handleSelectRecentOrSuggestion}
            onResetFilters={handleResetFilters}
            hasActiveFilters={activeFiltersCount > 0}
          />
        </ScrollView>
      )}

      {/* 3. Expandable Filter Bottom Sheet */}
      <FilterSheet
        visible={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={handleResetFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

