import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Search, X, Tv, Sparkles, Filter, ExternalLink } from 'lucide-react-native';
import {
  useStreamingPlatforms,
  useBrowseFilmsByPlatform,
} from '@/features/availability/useAvailability';
import { PlatformBrowseFilm } from '@/features/availability/types';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = spacing.lg;
const GAP = spacing.sm;
const COLUMN_COUNT = 3;
const POSTER_WIDTH = Math.floor(
  (SCREEN_WIDTH - GRID_PADDING * 2 - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT
);
const POSTER_HEIGHT = Math.floor(POSTER_WIDTH * 1.48);
const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export default function WhereToWatchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ platform?: string; freeOnly?: string }>();

  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    params.platform || 'all'
  );
  const [freeOnly, setFreeOnly] = useState<boolean>(params.freeOnly === 'true');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: platforms = [],
    isLoading: isPlatformsLoading,
    refetch: refetchPlatforms,
  } = useStreamingPlatforms();

  const {
    data: browseFilms = [],
    isLoading: isFilmsLoading,
    refetch: refetchFilms,
  } = useBrowseFilmsByPlatform(selectedPlatform, freeOnly);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchPlatforms(), refetchFilms()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePlatformSelect = (slug: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setSelectedPlatform(slug);
  };

  const handleToggleFree = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setFreeOnly(!freeOnly);
  };

  const filteredFilms = useMemo(() => {
    if (!searchQuery.trim()) return browseFilms;
    const q = searchQuery.toLowerCase().trim();
    return browseFilms.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        (f.director && f.director.toLowerCase().includes(q)) ||
        f.platform_name.toLowerCase().includes(q)
    );
  }, [browseFilms, searchQuery]);

  const handleFilmPress = (filmId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: filmId },
    });
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={16} color="#8A8A8A" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title, director, or platform..."
          placeholderTextColor="#8A8A8A"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setSearchQuery('')}
            style={styles.clearSearchBtn}>
            <X size={14} color="#8A8A8A" />
          </Pressable>
        )}
      </View>

      {/* Platform Chips Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.platformChipsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="All streaming platforms"
          onPress={() => handlePlatformSelect('all')}
          style={[
            styles.chip,
            selectedPlatform === 'all' && styles.chipActive,
          ]}>
          <Text
            style={[
              styles.chipText,
              selectedPlatform === 'all' && styles.chipTextActive,
            ]}>
            All Platforms
          </Text>
        </Pressable>

        {platforms.map((p) => {
          const isSelected = selectedPlatform === p.slug;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${p.name}`}
              onPress={() => handlePlatformSelect(p.slug)}
              style={[styles.chip, isSelected && styles.chipActive]}>
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextActive,
                ]}>
                {p.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Free Toggle & Counter Bar */}
      <View style={styles.filterMetaRow}>
        <Text style={styles.counterText}>
          {filteredFilms.length} {filteredFilms.length === 1 ? 'Title Available' : 'Titles Available'}
        </Text>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel="Toggle free to watch only"
          onPress={handleToggleFree}
          style={[styles.freeTogglePill, freeOnly && styles.freeTogglePillActive]}>
          <Sparkles size={11} color={freeOnly ? '#000000' : '#8A8A8A'} />
          <Text
            style={[
              styles.freeToggleText,
              freeOnly && styles.freeToggleTextActive,
            ]}>
            Free to Watch
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Navigation Header */}
      <GlassHeader
        title="Where to Watch"
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.backBtn}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
        }
      />

      {isFilmsLoading && !isRefreshing ? (
        <View style={styles.loadingGrid}>
          <SkeletonLoader style={styles.skeletonBar} />
          <View style={styles.skeletonGridRow}>
            <SkeletonLoader width={POSTER_WIDTH} height={POSTER_HEIGHT} />
            <SkeletonLoader width={POSTER_WIDTH} height={POSTER_HEIGHT} />
            <SkeletonLoader width={POSTER_WIDTH} height={POSTER_HEIGHT} />
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredFilms}
          keyExtractor={(item) => `${item.id}-${item.platform_slug}`}
          numColumns={COLUMN_COUNT}
          ListHeaderComponent={renderHeader}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View film ${item.title} on ${item.platform_name}`}
              onPress={() => handleFilmPress(item.id)}
              style={({ pressed }) => [
                styles.gridItem,
                pressed && styles.gridItemPressed,
              ]}>
              <View style={styles.posterContainer}>
                <Image
                  source={{ uri: item.poster_url || undefined }}
                  placeholder={DEFAULT_BLURHASH}
                  contentFit="cover"
                  transition={200}
                  style={styles.poster}
                />
                <View
                  style={[
                    styles.platformTag,
                    item.is_free ? styles.tagFree : styles.tagPlatform,
                  ]}>
                  <Text
                    style={[
                      styles.tagText,
                      item.is_free ? styles.tagTextFree : styles.tagTextPlatform,
                    ]}>
                    {item.is_free ? 'FREE' : item.platform_name.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.filmTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.metaYear}>
                {item.release_year}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No Watch Listings Found"
              description={
                searchQuery || selectedPlatform !== 'all' || freeOnly
                  ? 'Try selecting all platforms or disabling the free-only filter.'
                  : 'Where-to-watch streaming records will appear here.'
              }
            />
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#FFFFFF"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformChipsRow: {
    gap: spacing.xs,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#0A0A0A',
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#8A8A8A',
    fontSize: 11,
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  filterMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  counterText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '600',
  },
  freeTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#141414',
    minHeight: 32,
  },
  freeTogglePillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  freeToggleText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  freeToggleTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  columnWrapper: {
    paddingHorizontal: spacing.lg,
    gap: GAP,
    marginBottom: spacing.md,
  },
  gridItem: {
    width: POSTER_WIDTH,
  },
  gridItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  posterContainer: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: radius.sm,
    backgroundColor: '#141414',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
    marginBottom: 4,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  platformTag: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  tagFree: {
    backgroundColor: '#FFFFFF',
  },
  tagPlatform: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagText: {
    ...typography.caption,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagTextFree: {
    color: '#000000',
  },
  tagTextPlatform: {
    color: '#FFFFFF',
  },
  filmTitle: {
    ...typography.body,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaYear: {
    ...typography.caption,
    fontSize: 10,
    color: '#8A8A8A',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  loadingGrid: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  skeletonBar: {
    height: 44,
    borderRadius: radius.full,
  },
  skeletonGridRow: {
    flexDirection: 'row',
    gap: GAP,
  },
});

