import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import {
  DecadeFilter,
  MtrcbFilter,
  TagFilter,
  LanguageFilter,
  ExploreFilterState,
} from '../types';

interface ExploreFilterChipsProps {
  filters: ExploreFilterState;
  onFilterChange: (filters: ExploreFilterState) => void;
  onClearAll: () => void;
}

const DECADES: { label: string; value: DecadeFilter }[] = [
  { label: '70s', value: '70s' },
  { label: '80s', value: '80s' },
  { label: '90s', value: '90s' },
  { label: '2000s', value: '2000s' },
  { label: '2010s', value: '2010s' },
  { label: '2020s', value: '2020s' },
];

const MTRCB_RATINGS: { label: string; value: MtrcbFilter }[] = [
  { label: 'G', value: 'G' },
  { label: 'PG', value: 'PG' },
  { label: 'R-13', value: 'R-13' },
  { label: 'R-16', value: 'R-16' },
  { label: 'R-18', value: 'R-18' },
];

const TAGS: { label: string; value: TagFilter }[] = [
  { label: 'Indie', value: 'indie' },
  { label: 'Regional', value: 'regional' },
  { label: 'Restored', value: 'restored' },
  { label: 'National Artist', value: 'national-artist' },
];

const LANGUAGES: { label: string; value: LanguageFilter }[] = [
  { label: 'Filipino', value: 'Filipino' },
  { label: 'Cebuano', value: 'Cebuano' },
  { label: 'Ilokano', value: 'Ilokano' },
  { label: 'Hiligaynon', value: 'Hiligaynon' },
  { label: 'Kinaray-a', value: 'Kinaray-a' },
];

export function ExploreFilterChips({
  filters,
  onFilterChange,
  onClearAll,
}: ExploreFilterChipsProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'decade' | 'mtrcb' | 'tag' | 'language'>('all');

  const hasActiveFilters = Boolean(
    filters.decade || filters.mtrcb_rating || filters.tag || filters.language
  );

  const activeFilterCount = [
    filters.decade,
    filters.mtrcb_rating,
    filters.tag,
    filters.language,
  ].filter(Boolean).length;

  const toggleDecade = (val: DecadeFilter) => {
    onFilterChange({
      ...filters,
      decade: filters.decade === val ? null : val,
    });
  };

  const toggleMtrcb = (val: MtrcbFilter) => {
    onFilterChange({
      ...filters,
      mtrcb_rating: filters.mtrcb_rating === val ? null : val,
    });
  };

  const toggleTag = (val: TagFilter) => {
    onFilterChange({
      ...filters,
      tag: filters.tag === val ? null : val,
    });
  };

  const toggleLanguage = (val: LanguageFilter) => {
    onFilterChange({
      ...filters,
      language: filters.language === val ? null : val,
    });
  };

  return (
    <View style={styles.container}>
      {/* Category selector row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}>
        {hasActiveFilters && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Clear all ${activeFilterCount} active filters`}
            onPress={onClearAll}
            style={styles.clearAllChip}>
            <Ionicons name="close" size={14} color={colors.gold.primary} />
            <Text style={styles.clearAllText}>Clear ({activeFilterCount})</Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show all filters"
          onPress={() => setActiveCategory('all')}
          style={[styles.categoryPill, activeCategory === 'all' && styles.categoryPillActive]}>
          <Text style={[styles.categoryText, activeCategory === 'all' && styles.categoryTextActive]}>
            All Filters
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter by Decade"
          onPress={() => setActiveCategory('decade')}
          style={[
            styles.categoryPill,
            activeCategory === 'decade' && styles.categoryPillActive,
            Boolean(filters.decade) && styles.categoryPillHasSelection,
          ]}>
          <Text style={[styles.categoryText, activeCategory === 'decade' && styles.categoryTextActive]}>
            Decade {filters.decade ? `(${filters.decade})` : ''}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter by MTRCB Rating"
          onPress={() => setActiveCategory('mtrcb')}
          style={[
            styles.categoryPill,
            activeCategory === 'mtrcb' && styles.categoryPillActive,
            Boolean(filters.mtrcb_rating) && styles.categoryPillHasSelection,
          ]}>
          <Text style={[styles.categoryText, activeCategory === 'mtrcb' && styles.categoryTextActive]}>
            MTRCB {filters.mtrcb_rating ? `(${filters.mtrcb_rating})` : ''}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter by Tag"
          onPress={() => setActiveCategory('tag')}
          style={[
            styles.categoryPill,
            activeCategory === 'tag' && styles.categoryPillActive,
            Boolean(filters.tag) && styles.categoryPillHasSelection,
          ]}>
          <Text style={[styles.categoryText, activeCategory === 'tag' && styles.categoryTextActive]}>
            Tag {filters.tag ? `(${filters.tag})` : ''}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter by Language"
          onPress={() => setActiveCategory('language')}
          style={[
            styles.categoryPill,
            activeCategory === 'language' && styles.categoryPillActive,
            Boolean(filters.language) && styles.categoryPillHasSelection,
          ]}>
          <Text style={[styles.categoryText, activeCategory === 'language' && styles.categoryTextActive]}>
            Language {filters.language ? `(${filters.language})` : ''}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Sub-chips horizontal scroll based on category */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subChipsRow}>
        {/* Decade options */}
        {(activeCategory === 'all' || activeCategory === 'decade') && (
          <View style={styles.groupWrapper}>
            {activeCategory === 'all' && <Text style={styles.groupLabel}>Decade:</Text>}
            {DECADES.map((d) => {
              const isSelected = filters.decade === d.value;
              return (
                <Pressable
                  key={d.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle decade ${d.label}`}
                  onPress={() => toggleDecade(d.value)}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}>
                  {isSelected && <Ionicons name="checkmark" size={13} color={colors.gold.primary} />}
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* MTRCB Rating options */}
        {(activeCategory === 'all' || activeCategory === 'mtrcb') && (
          <View style={styles.groupWrapper}>
            {activeCategory === 'all' && <Text style={styles.groupLabel}>MTRCB:</Text>}
            {MTRCB_RATINGS.map((m) => {
              const isSelected = filters.mtrcb_rating === m.value;
              return (
                <Pressable
                  key={m.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle MTRCB rating ${m.label}`}
                  onPress={() => toggleMtrcb(m.value)}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}>
                  {isSelected && <Ionicons name="checkmark" size={13} color={colors.gold.primary} />}
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Tag options */}
        {(activeCategory === 'all' || activeCategory === 'tag') && (
          <View style={styles.groupWrapper}>
            {activeCategory === 'all' && <Text style={styles.groupLabel}>Tag:</Text>}
            {TAGS.map((t) => {
              const isSelected = filters.tag === t.value;
              return (
                <Pressable
                  key={t.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle tag ${t.label}`}
                  onPress={() => toggleTag(t.value)}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}>
                  {isSelected && <Ionicons name="checkmark" size={13} color={colors.gold.primary} />}
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Language options */}
        {(activeCategory === 'all' || activeCategory === 'language') && (
          <View style={styles.groupWrapper}>
            {activeCategory === 'all' && <Text style={styles.groupLabel}>Language:</Text>}
            {LANGUAGES.map((l) => {
              const isSelected = filters.language === l.value;
              return (
                <Pressable
                  key={l.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle language ${l.label}`}
                  onPress={() => toggleLanguage(l.value)}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}>
                  {isSelected && <Ionicons name="checkmark" size={13} color={colors.gold.primary} />}
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {l.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    gap: 8,
  },
  categoryRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  clearAllChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold.subtle,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    minHeight: 34,
    justifyContent: 'center',
  },
  clearAllText: {
    color: colors.gold.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    minHeight: 34,
    borderRadius: radius.full,
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPillActive: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.default,
  },
  categoryPillHasSelection: {
    borderColor: colors.gold.subtleBorder,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  categoryTextActive: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  subChipsRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  groupWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    minHeight: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(18, 18, 22, 0.7)',
    borderColor: colors.border.subtle,
    borderWidth: 1,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.gold.subtle,
    borderColor: colors.gold.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.gold.primary,
    fontWeight: '700',
  },
});

