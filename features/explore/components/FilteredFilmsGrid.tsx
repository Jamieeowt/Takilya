import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { FilmCard } from './FilmCard';
import { ExploreFilmCard, ExploreFilterState } from '../types';

interface FilteredFilmsGridProps {
  filters: ExploreFilterState;
  films: ExploreFilmCard[];
  isLoading: boolean;
  onClearFilters: () => void;
}

export function FilteredFilmsGrid({
  filters,
  films,
  isLoading,
  onClearFilters,
}: FilteredFilmsGridProps) {
  const activeChips: { label: string; key: keyof ExploreFilterState }[] = [];
  if (filters.decade) activeChips.push({ label: `Decade: ${filters.decade}`, key: 'decade' });
  if (filters.mtrcb_rating) activeChips.push({ label: `MTRCB: ${filters.mtrcb_rating}`, key: 'mtrcb_rating' });
  if (filters.tag) activeChips.push({ label: `Tag: ${filters.tag}`, key: 'tag' });
  if (filters.language) activeChips.push({ label: `Language: ${filters.language}`, key: 'language' });

  if (films.length === 0 && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="filter-outline" size={32} color={colors.gold.primary} />
        </View>
        <Text style={styles.emptyTitle}>No matching films</Text>
        <Text style={styles.emptySubtitle}>
          No Philippine films match your current filter combination.
        </Text>
        <View style={styles.activeChipsSummary}>
          {activeChips.map((c) => (
            <View key={c.label} style={styles.activeChipPill}>
              <Text style={styles.activeChipPillText}>{c.label}</Text>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset all filters"
          onPress={onClearFilters}
          style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>Clear All Filters</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>
            Filtered Films ({films.length})
          </Text>
          <Text style={styles.subtitle}>Showing films matching your filter selections</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear all filters"
          onPress={onClearFilters}
          style={styles.clearBtn}>
          <Ionicons name="close-circle-outline" size={14} color={colors.gold.primary} />
          <Text style={styles.clearBtnText}>Reset</Text>
        </Pressable>
      </View>

      <View style={styles.gridContainer}>
        {films.map((film) => (
          <View key={film.id} style={styles.gridItem}>
            <FilmCard film={film} width={160} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold.subtle,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    minHeight: 34,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold.primary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  gridItem: {
    marginBottom: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.gold.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  activeChipsSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginVertical: spacing.sm,
  },
  activeChipPill: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeChipPillText: {
    fontSize: 11,
    color: colors.gold.primary,
    fontWeight: '600',
  },
  resetBtn: {
    backgroundColor: colors.gold.primary,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.inverse,
  },
});

