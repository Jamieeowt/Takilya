import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { Badge } from '@/components/Badge';
import { SearchEntityResult, SearchResultType } from '../types';

interface SearchResultsListProps {
  query: string;
  results: SearchEntityResult[];
  onClear: () => void;
}

export function SearchResultsList({ query, results, onClear }: SearchResultsListProps) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<'all' | SearchResultType>('all');

  const filteredResults =
    selectedFilter === 'all'
      ? results
      : results.filter((r) => r.type === selectedFilter);

  const filmCount = results.filter((r) => r.type === 'film').length;
  const personCount = results.filter((r) => r.type === 'person').length;
  const festCount = results.filter((r) => r.type === 'festival').length;
  const studioCount = results.filter((r) => r.type === 'studio').length;

  if (results.length === 0) {
    // Empty Search Result State
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="search-outline" size={36} color={colors.gold.primary} />
        </View>
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptySubtitle}>
          We couldn't find any films, people, festivals, or studios matching{' '}
          <Text style={styles.emptyQueryText}>"{query}"</Text>.
        </Text>
        <Text style={styles.emptyHint}>
          Try searching for directors like <Text style={styles.hintAccent}>Ishmael Bernal</Text>, festivals like{' '}
          <Text style={styles.hintAccent}>Cinemalaya</Text>, or titles like{' '}
          <Text style={styles.hintAccent}>Himala</Text>.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search query"
          onPress={onClear}
          style={styles.clearSearchBtn}>
          <Text style={styles.clearSearchBtnText}>Clear Search</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Header & Type Filters */}
      <View style={styles.header}>
        <Text style={styles.resultCountText}>
          Found {results.length} match{results.length !== 1 ? 'es' : ''} for "{query}"
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Show all search results"
            onPress={() => setSelectedFilter('all')}
            style={[styles.filterPill, selectedFilter === 'all' && styles.filterPillActive]}>
            <Text style={[styles.filterPillText, selectedFilter === 'all' && styles.filterPillTextActive]}>
              All ({results.length})
            </Text>
          </Pressable>

          {filmCount > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Show ${filmCount} film results`}
              onPress={() => setSelectedFilter('film')}
              style={[styles.filterPill, selectedFilter === 'film' && styles.filterPillActive]}>
              <Text style={[styles.filterPillText, selectedFilter === 'film' && styles.filterPillTextActive]}>
                Films ({filmCount})
              </Text>
            </Pressable>
          )}

          {personCount > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Show ${personCount} filmmaker results`}
              onPress={() => setSelectedFilter('person')}
              style={[styles.filterPill, selectedFilter === 'person' && styles.filterPillActive]}>
              <Text style={[styles.filterPillText, selectedFilter === 'person' && styles.filterPillTextActive]}>
                People ({personCount})
              </Text>
            </Pressable>
          )}

          {festCount > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Show ${festCount} festival results`}
              onPress={() => setSelectedFilter('festival')}
              style={[styles.filterPill, selectedFilter === 'festival' && styles.filterPillActive]}>
              <Text style={[styles.filterPillText, selectedFilter === 'festival' && styles.filterPillTextActive]}>
                Festivals ({festCount})
              </Text>
            </Pressable>
          )}

          {studioCount > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Show ${studioCount} studio results`}
              onPress={() => setSelectedFilter('studio')}
              style={[styles.filterPill, selectedFilter === 'studio' && styles.filterPillActive]}>
              <Text style={[styles.filterPillText, selectedFilter === 'studio' && styles.filterPillTextActive]}>
                Studios ({studioCount})
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      {/* Results List */}
      <View style={styles.resultsList}>
        {filteredResults.map((item) => {
          const isFilm = item.type === 'film';

          return (
            <Pressable
              key={`${item.type}-${item.id}`}
              accessibilityRole="button"
              accessibilityLabel={`View ${item.type}: ${item.title}`}
              onPress={() => {
                if (isFilm && item.film_id) {
                  router.push({
                    pathname: '/film/[id]' as any,
                    params: { id: item.film_id },
                  });
                }
              }}
              style={styles.resultItem}>
              {/* Thumbnail or Avatar */}
              <View style={[styles.thumbnailWrap, !isFilm && styles.avatarWrap]}>
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name={
                      item.type === 'film'
                        ? 'film'
                        : item.type === 'person'
                        ? 'person'
                        : item.type === 'festival'
                        ? 'calendar'
                        : 'business'
                    }
                    size={22}
                    color={colors.gold.primary}
                  />
                )}
              </View>

              {/* Information */}
              <View style={styles.infoCol}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.is_verified && (
                    <Ionicons name="checkmark-circle" size={15} color={colors.gold.primary} />
                  )}
                  {item.badge && <Badge label={item.badge} variant="neutral" />}
                </View>

                <Text style={styles.itemSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>

                <View style={styles.typeBadgeRow}>
                  <Text style={styles.typeLabel}>{item.type.toUpperCase()}</Text>
                  {isFilm && (
                    <Text style={styles.viewFilmPrompt}>Tap to view details ›</Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  header: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultCountText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    minHeight: 32,
    borderRadius: radius.full,
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: colors.gold.subtle,
    borderColor: colors.gold.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterPillTextActive: {
    color: colors.gold.primary,
    fontWeight: '700',
  },
  resultsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    minHeight: 64,
  },
  thumbnailWrap: {
    width: 48,
    height: 64,
    borderRadius: radius.xs,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold.primary,
    letterSpacing: 0.5,
  },
  viewFilmPrompt: {
    fontSize: 11,
    color: colors.gold.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.gold.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
  emptyQueryText: {
    color: colors.gold.primary,
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  hintAccent: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  clearSearchBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.gold.primary,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSearchBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.inverse,
  },
});

