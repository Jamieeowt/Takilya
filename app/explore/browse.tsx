import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Filter,
  RotateCcw,
  Sparkles,
  Trophy,
  Globe,
  Film,
  Tag,
  Calendar,
  Layers,
} from 'lucide-react-native';

import { useTheme, radius, spacing, typography } from '@/lib/theme';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBrowseFilms } from '@/features/search/useSearch';
import { BrowseFilterState, BrowseFilmCard } from '@/features/search/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = 8;
const PADDING = 16;
// Responsive Letterboxd-style 3-column poster grid
const POSTER_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - COLUMN_GAP * 2) / 3);
const POSTER_HEIGHT = Math.round(POSTER_WIDTH * 1.5);

const GENRES = [
  'All',
  'Drama',
  'Social Realism',
  'Comedy',
  'Meta-Comedy',
  'Action',
  'Thriller',
  'Psychological Thriller',
  'Coming-of-Age',
];

const CULTURAL_TAGS = [
  'All',
  'indie',
  'regional-cinema',
  'based-on-true-story',
  'restored-heritage',
  'national-artist-masterwork',
];

const DECADES = ['All', '2020s', '2010s', '2000s', '1990s', '1980s', '1970s'];

const LANGUAGES = ['All', 'Tagalog', 'Kinaray-a', 'Ilokano', 'Cebuano', 'Hiligaynon'];

export default function BrowseByGenreAndTagScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ genre?: string; tag?: string; language?: string }>();
  const { tokens, isDark } = useTheme();

  // Multi-facet filter state
  const [selectedGenre, setSelectedGenre] = useState<string>(params.genre || 'All');
  const [selectedTag, setSelectedTag] = useState<string>(params.tag || 'All');
  const [selectedDecade, setSelectedDecade] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(params.language || 'All');
  const [onlyAwardWinners, setOnlyAwardWinners] = useState<boolean>(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState<
    'genre' | 'tag' | 'decade' | 'language'
  >('genre');

  // Build filter query object
  const filterState: BrowseFilterState = useMemo(() => {
    return {
      genre: selectedGenre !== 'All' ? selectedGenre : null,
      tag: selectedTag !== 'All' ? selectedTag : null,
      decade: selectedDecade !== 'All' ? selectedDecade : null,
      language: selectedLanguage !== 'All' ? selectedLanguage : null,
      awardScope: onlyAwardWinners ? 'won' : null,
      sortBy: 'rating',
    };
  }, [selectedGenre, selectedTag, selectedDecade, selectedLanguage, onlyAwardWinners]);

  const { data: films = [], isLoading, isRefetching, refetch } = useBrowseFilms(filterState);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGenre !== 'All') count++;
    if (selectedTag !== 'All') count++;
    if (selectedDecade !== 'All') count++;
    if (selectedLanguage !== 'All') count++;
    if (onlyAwardWinners) count++;
    return count;
  }, [selectedGenre, selectedTag, selectedDecade, selectedLanguage, onlyAwardWinners]);

  const handleResetFilters = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedGenre('All');
    setSelectedTag('All');
    setSelectedDecade('All');
    setSelectedLanguage('All');
    setOnlyAwardWinners(false);
  };

  const handleOpenFilm = (id: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id },
    });
  };

  const renderFilterCategoryButton = (
    cat: 'genre' | 'tag' | 'decade' | 'language',
    label: string,
    activeValue: string
  ) => {
    const isSelected = activeFilterCategory === cat;
    const hasAppliedFilter = activeValue !== 'All';

    return (
      <Pressable
        key={cat}
        accessibilityRole="tab"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`Filter by ${label}`}
        onPress={() => {
          try {
            void Haptics.selectionAsync();
          } catch {}
          setActiveFilterCategory(cat);
        }}
        style={[
          styles.catTab,
          isSelected
            ? styles.catTabSelected
            : hasAppliedFilter
            ? styles.catTabHasFilter
            : { borderColor: tokens.border.hairline },
        ]}>
        <Text
          style={[
            styles.catTabText,
            {
              color: isSelected ? '#000000' : hasAppliedFilter ? '#FFFFFF' : tokens.text.secondary,
              fontFamily: isSelected || hasAppliedFilter
                ? typography.titleSmall.fontFamily
                : typography.bodySmall.fontFamily,
              fontWeight: isSelected || hasAppliedFilter ? '700' : '500',
            },
          ]}>
          {hasAppliedFilter ? `${label}: ${activeValue}` : label}
        </Text>
      </Pressable>
    );
  };

  const renderActiveOptionChips = () => {
    let options: string[] = [];
    let currentSelected = '';
    let onSelect: (val: string) => void = () => {};

    if (activeFilterCategory === 'genre') {
      options = GENRES;
      currentSelected = selectedGenre;
      onSelect = setSelectedGenre;
    } else if (activeFilterCategory === 'tag') {
      options = CULTURAL_TAGS;
      currentSelected = selectedTag;
      onSelect = setSelectedTag;
    } else if (activeFilterCategory === 'decade') {
      options = DECADES;
      currentSelected = selectedDecade;
      onSelect = setSelectedDecade;
    } else if (activeFilterCategory === 'language') {
      options = LANGUAGES;
      currentSelected = selectedLanguage;
      onSelect = setSelectedLanguage;
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsChipsContainer}>
        {options.map((option) => {
          const isChosen = currentSelected === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: isChosen }}
              onPress={() => {
                try {
                  void Haptics.selectionAsync();
                } catch {}
                onSelect(option);
              }}
              style={[
                styles.optionChip,
                isChosen
                  ? styles.optionChipChosen
                  : { borderColor: tokens.border.hairline, backgroundColor: tokens.background.secondary },
              ]}>
              <Text
                style={[
                  styles.optionChipText,
                  {
                    color: isChosen ? '#000000' : tokens.text.secondary,
                    fontWeight: isChosen ? '700' : '500',
                  },
                ]}>
                {option === 'All' ? 'All' : option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  const renderFilmItem = ({ item }: { item: BrowseFilmCard }) => {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View film ${item.title}`}
        onPress={() => handleOpenFilm(item.id)}
        style={[styles.posterCard, { width: POSTER_WIDTH }]}>
        <View style={[styles.posterImageWrapper, { height: POSTER_HEIGHT }]}>
          <Image
            source={{ uri: item.poster_url || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80' }}
            style={styles.posterImage}
            contentFit="cover"
            transition={200}
          />
          {/* Letterboxd-style Score Badge Overlay */}
          {Boolean(item.critic_score) && (
            <View style={styles.scorePill}>
              <Text style={styles.scorePillText}>{item.critic_score}%</Text>
            </View>
          )}

          {item.has_won_award && (
            <View style={styles.awardBadgeOverlay}>
              <Trophy size={11} color="#000000" />
            </View>
          )}
        </View>

        <Text style={[styles.filmTitle, { color: tokens.text.primary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.filmMeta, { color: tokens.text.tertiary }]} numberOfLines={1}>
          {item.release_year} • {item.language}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.background.primary }]}>
      <GlassHeader
        title="Browse Films"
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.headerBtn}>
            <ArrowLeft size={20} color={tokens.text.primary} />
          </Pressable>
        }
        right={
          activeFiltersCount > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reset all filters"
              onPress={handleResetFilters}
              style={styles.resetBtn}>
              <RotateCcw size={14} color={tokens.text.primary} />
              <Text style={[styles.resetBtnText, { color: tokens.text.primary }]}>
                Reset ({activeFiltersCount})
              </Text>
            </Pressable>
          ) : null
        }
      />

      <View style={[styles.filterSection, { paddingTop: insets.top + 48 }]}>
        {/* Category Selector Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsScroll}>
          {renderFilterCategoryButton('genre', 'Genre', selectedGenre)}
          {renderFilterCategoryButton('tag', 'Tag', selectedTag)}
          {renderFilterCategoryButton('decade', 'Decade', selectedDecade)}
          {renderFilterCategoryButton('language', 'Language', selectedLanguage)}

          {/* Quick toggle for Award Winners */}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: onlyAwardWinners }}
            accessibilityLabel="Filter by award winners"
            onPress={() => {
              try {
                void Haptics.selectionAsync();
              } catch {}
              setOnlyAwardWinners((prev) => !prev);
            }}
            style={[
              styles.catTab,
              onlyAwardWinners
                ? styles.catTabSelected
                : { borderColor: tokens.border.hairline },
            ]}>
            <Trophy
              size={13}
              color={onlyAwardWinners ? '#000000' : tokens.text.primary}
            />
            <Text
              style={[
                styles.catTabText,
                {
                  color: onlyAwardWinners ? '#000000' : tokens.text.primary,
                  fontWeight: onlyAwardWinners ? '700' : '500',
                },
              ]}>
              Won Awards
            </Text>
          </Pressable>
        </ScrollView>

        {/* Dynamic sub-chips for selected category */}
        {renderActiveOptionChips()}

        {/* Results summary counter */}
        <View style={styles.resultsCounterRow}>
          <Text style={[styles.resultsCounterText, { color: tokens.text.tertiary }]}>
            {isLoading ? 'Searching catalog...' : `${films.length} Philippine Films`}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.text.primary} />
        </View>
      ) : (
        <FlatList
          data={films}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.gridContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={renderFilmItem}
          ListEmptyComponent={
            <EmptyState
              title="No Films Found"
              description="No Philippine films matched this filter combination. Try clearing some facets or selecting a different decade."
              actionLabel="Reset Filters"
              onAction={handleResetFilters}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 34,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterSection: {
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  categoryTabsScroll: {
    paddingHorizontal: PADDING,
    gap: spacing.sm,
    paddingBottom: 4,
  },
  catTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 36,
  },
  catTabSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  catTabHasFilter: {
    backgroundColor: '#1F1F1F',
    borderColor: '#FFFFFF',
  },
  catTabText: {
    fontSize: 12,
  },
  optionsChipsContainer: {
    paddingHorizontal: PADDING,
    gap: 6,
    paddingVertical: 6,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionChipChosen: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  optionChipText: {
    fontSize: 12,
  },
  resultsCounterRow: {
    paddingHorizontal: PADDING,
    paddingTop: 4,
    paddingBottom: 4,
  },
  resultsCounterText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  gridContent: {
    paddingHorizontal: PADDING,
    paddingTop: spacing.xs,
    gap: 16,
  },
  columnWrapper: {
    gap: COLUMN_GAP,
    justifyContent: 'flex-start',
  },
  posterCard: {
    gap: 4,
  },
  posterImageWrapper: {
    width: '100%',
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: '#141414',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  scorePill: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scorePillText: {
    color: '#FFFFFF',
    fontFamily: typography.caption.fontFamily,
    fontSize: 9,
    fontWeight: '800',
  },
  awardBadgeOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filmTitle: {
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  filmMeta: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

