import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { ExploreFilterState } from '@/features/explore/types';
import {
  useExploreSections,
  useFilteredFilms,
  useExploreSearch,
} from '@/features/explore/useExplore';
import { ExploreSearchBar } from '@/features/explore/components/ExploreSearchBar';
import { ExploreFilterChips } from '@/features/explore/components/ExploreFilterChips';
import { FeaturedHeroCard } from '@/features/explore/components/FeaturedHeroCard';
import { FilmHorizontalRail } from '@/features/explore/components/FilmHorizontalRail';
import { NationalArtistSection } from '@/features/explore/components/NationalArtistSection';
import { CinemalayaSection } from '@/features/explore/components/CinemalayaSection';
import { RestoredClassicsSection } from '@/features/explore/components/RestoredClassicsSection';
import { SearchResultsList } from '@/features/explore/components/SearchResultsList';
import { FilteredFilmsGrid } from '@/features/explore/components/FilteredFilmsGrid';
import { ExploreSkeleton } from '@/features/explore/components/ExploreSkeleton';
import { useFestivals } from '@/features/festivals/useFestivals';
import { FestivalsRail } from '@/components/festivals';
import { usePeople } from '@/features/people/usePeople';
import { PeopleRail } from '@/components/people';
import { useStudios } from '@/features/studios/useStudios';
import { StudiosRail } from '@/components/studios';
import { useAwardBodies, useMMFFSeason } from '@/features/awards/useAwards';
import { AwardsRail, MMFFSeasonWidget } from '@/components/awards';
import { usePreservedFilms } from '@/features/heritage/useHeritage';
import { HeritageRail } from '@/components/heritage';
import { WhereToWatchRail } from '@/components/availability';




export default function ExploreScreen() {
  // Search state with debouncing (300ms)
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Chip filters state
  const [filters, setFilters] = useState<ExploreFilterState>({
    decade: null,
    mtrcb_rating: null,
    tag: null,
    language: null,
  });

  const hasActiveFilters = Boolean(
    filters.decade || filters.mtrcb_rating || filters.tag || filters.language
  );

  const handleClearFilters = () => {
    setFilters({
      decade: null,
      mtrcb_rating: null,
      tag: null,
      language: null,
    });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setDebouncedQuery('');
  };

  // Queries
  const {
    data: sectionsData,
    isLoading: isSectionsLoading,
    isError: isSectionsError,
    refetch: refetchSections,
    isRefetching: isSectionsRefetching,
  } = useExploreSections();

  const isFiltering = hasActiveFilters && debouncedQuery.length === 0;
  const {
    data: filteredFilms,
    isLoading: isFilteredLoading,
    refetch: refetchFiltered,
    isRefetching: isFilteredRefetching,
  } = useFilteredFilms(filters, isFiltering);

  const isSearching = debouncedQuery.length > 0;
  const {
    data: searchResults,
    isLoading: isSearchLoading,
  } = useExploreSearch(debouncedQuery);

  const {
    data: festivals = [],
    refetch: refetchFestivals,
  } = useFestivals();

  const {
    data: people = [],
    refetch: refetchPeople,
  } = usePeople();

  const {
    data: studios = [],
    refetch: refetchStudios,
  } = useStudios();

  const {
    data: awardBodies = [],
    refetch: refetchAwardBodies,
  } = useAwardBodies('all');

  const {
    data: mmffSeason,
    refetch: refetchMMFFSeason,
  } = useMMFFSeason();

  const {
    data: preservedFilms = [],
    refetch: refetchPreservedFilms,
  } = usePreservedFilms('all');

  const handleRefresh = () => {
    if (isFiltering) {
      void refetchFiltered();
    } else {
      void refetchSections();
      void refetchFestivals();
      void refetchPeople();
      void refetchStudios();
      void refetchAwardBodies();
      void refetchMMFFSeason();
      void refetchPreservedFilms();
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isSectionsRefetching || isFilteredRefetching}
          onRefresh={handleRefresh}
          tintColor="#FFFFFF"
          colors={['#FFFFFF']}
        />
      }>
      {/* 1. Top Search Bar with Debounced Query */}
      <ExploreSearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        onClear={handleClearSearch}
        isLoading={isSearching && isSearchLoading}
      />

      {/* 2. Horizontal Chip Filters (Decade, MTRCB, Tag, Language) */}
      <ExploreFilterChips
        filters={filters}
        onFilterChange={setFilters}
        onClearAll={handleClearFilters}
      />

      {/* 3. Dynamic Content Rendering */}
      {isSearching ? (
        // Mode A: Search Results View
        isSearchLoading && !searchResults ? (
          <ExploreSkeleton />
        ) : (
          <SearchResultsList
            query={debouncedQuery}
            results={searchResults || []}
            onClear={handleClearSearch}
          />
        )
      ) : isFiltering ? (
        // Mode B: Filtered Films View
        isFilteredLoading && !filteredFilms ? (
          <ExploreSkeleton />
        ) : (
          <FilteredFilmsGrid
            filters={filters}
            films={filteredFilms || []}
            isLoading={isFilteredLoading}
            onClearFilters={handleClearFilters}
          />
        )
      ) : isSectionsLoading ? (
        // Mode C: Initial Loading Skeleton
        <ExploreSkeleton />
      ) : isSectionsError || !sectionsData ? (
        // Mode D: Error State
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.status.error} />
          <Text style={styles.errorTitle}>Failed to load Explore catalog</Text>
          <Text style={styles.errorSub}>
            Please check your connection and try again.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading catalog"
            onPress={() => refetchSections()}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        // Mode E: Curated Vertical Sections (6 Rich Sections)
        <View style={styles.sectionsContainer}>
          {/* Section 1: Featured Today (Promoted or Editorial Hero Card) */}
          <FeaturedHeroCard hero={sectionsData.featured} />

          {/* Section: Where to Watch Streaming Hub */}
          <WhereToWatchRail />

          {/* Section: MMFF Seasonal Showcase Widget */}
          {mmffSeason && <MMFFSeasonWidget seasonData={mmffSeason} />}

          {/* Section: Philippine Film Festivals Database Rail */}
          <FestivalsRail festivals={festivals} />

          {/* Section: Awards & Recognitions Database Rail */}
          <AwardsRail awardBodies={awardBodies} />

          {/* Section: Philippine Film Heritage Preserved Rail */}
          <HeritageRail preservedFilms={preservedFilms} />

          {/* Section: Directors & Actors Database Rail */}
          <PeopleRail people={people} />

          {/* Section: Studios & Production Outfits Database Rail */}
          <StudiosRail studios={studios} />

          {/* Section 2: National Artist Masterworks */}
          <NationalArtistSection items={sectionsData.nationalArtists} />

          {/* Section 3: Cinemalaya Through the Years (Grouped by Edition) */}
          <CinemalayaSection editions={sectionsData.cinemalaya} />

          {/* Section 4: Restored Classics (from preservation_records where status='restored') */}
          <RestoredClassicsSection items={sectionsData.restoredClassics} />

          {/* Section 5: Regional Cinema Spotlight */}
          <FilmHorizontalRail
            title="Regional Cinema Spotlight"
            subtitle="Groundbreaking cinema in Kinaray-a, Ilokano, Cebuano, and provincial dialects"
            badge="Regional"
            films={sectionsData.regionalSpotlight}
          />

          {/* Section 6: Trending This Week (Ranked by recent rating count) */}
          <FilmHorizontalRail
            title="Trending This Week"
            subtitle="Most engaged and reviewed titles by critics and the community"
            badge="Ranked"
            films={sectionsData.trendingThisWeek}
            showRank={true}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  sectionsContainer: {
    gap: spacing.xs,
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  errorTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  errorSub: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
});
