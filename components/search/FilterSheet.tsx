import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { SearchFilterState } from '@/features/search/types';
import { radius, typography } from '@/lib/theme';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: SearchFilterState;
  onApply: (newFilters: SearchFilterState) => void;
  onReset: () => void;
}

const GENRES = [
  'Drama',
  'Indie',
  'Romance',
  'Action',
  'Horror',
  'Social Realism',
  'Meta-Comedy',
  'Coming-of-Age',
  'Psychological',
  'Classics',
];

const DECADES = [
  { label: 'All Decades', value: null },
  { label: 'Classics', value: 'classics' },
  { label: '2010s', value: '2010s' },
  { label: '2020s', value: '2020s' },
  { label: 'Latest', value: 'latest' },
];

const PLATFORMS = [
  { label: 'All Platforms', value: null },
  { label: 'Netflix', value: 'netflix' },
  { label: 'Prime', value: 'prime' },
  { label: 'Vivamax', value: 'vivamax' },
  { label: 'iWantTFC', value: 'iwanttfc' },
  { label: 'Theatrical', value: 'theatrical' },
];

const RATINGS = [
  { label: 'Any Score', value: null },
  { label: '70%+', value: 70 },
  { label: '80%+', value: 80 },
  { label: '90%+', value: 90 },
];

const SORTS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Release Year', value: 'year' },
  { label: 'Title (A-Z)', value: 'title' },
];

export function FilterSheet({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}: FilterSheetProps) {
  const [draft, setDraft] = useState<SearchFilterState>(filters);

  useEffect(() => {
    if (visible) {
      setDraft(filters);
    }
  }, [visible, filters]);

  const handleApply = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const defaultState: SearchFilterState = {
      genre: null,
      decade: null,
      streamingPlatform: null,
      minRating: null,
      sortBy: 'relevance',
    };
    setDraft(defaultState);
    onReset();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter Philippine Cinema">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Genre</Text>
          <View style={styles.chipsWrap}>
            <Chip
              label="All Genres"
              variant="filled"
              selected={draft.genre === null}
              onPress={() => setDraft((p) => ({ ...p, genre: null }))}
            />
            {GENRES.map((g) => {
              const isSelected = draft.genre?.toLowerCase() === g.toLowerCase();
              return (
                <Chip
                  key={g}
                  label={g}
                  variant="outlined"
                  selected={isSelected}
                  onPress={() =>
                    setDraft((p) => ({
                      ...p,
                      genre: isSelected ? null : g,
                    }))
                  }
                />
              );
            })}
          </View>
        </View>

        {/* 2. Decade / Era */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Decade & Era</Text>
          <View style={styles.chipsWrap}>
            {DECADES.map((d) => {
              const isSelected = draft.decade === d.value;
              return (
                <Chip
                  key={d.label}
                  label={d.label}
                  variant="outlined"
                  selected={isSelected}
                  onPress={() => setDraft((p) => ({ ...p, decade: d.value }))}
                />
              );
            })}
          </View>
        </View>

        {/* 3. Streaming Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Where to Watch</Text>
          <View style={styles.chipsWrap}>
            {PLATFORMS.map((p) => {
              const isSelected = draft.streamingPlatform === p.value;
              return (
                <Chip
                  key={p.label}
                  label={p.label}
                  variant="outlined"
                  selected={isSelected}
                  onPress={() => setDraft((prev) => ({ ...prev, streamingPlatform: p.value }))}
                />
              );
            })}
          </View>
        </View>

        {/* 4. Rating Threshold */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Critic / Audience Score</Text>
          <View style={styles.chipsWrap}>
            {RATINGS.map((r) => {
              const isSelected = draft.minRating === r.value;
              return (
                <Chip
                  key={r.label}
                  label={r.label}
                  variant="outlined"
                  selected={isSelected}
                  onPress={() => setDraft((prev) => ({ ...prev, minRating: r.value }))}
                />
              );
            })}
          </View>
        </View>

        {/* 5. Sort Order */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Sort By</Text>
          <View style={styles.chipsWrap}>
            {SORTS.map((s) => {
              const isSelected = draft.sortBy === s.value;
              return (
                <Chip
                  key={s.label}
                  label={s.label}
                  variant="outlined"
                  selected={isSelected}
                  onPress={() => setDraft((prev) => ({ ...prev, sortBy: s.value as any }))}
                />
              );
            })}
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.actionsRow}>
          <Button
            label="Reset All"
            onPress={handleReset}
            variant="ghost"
            style={styles.resetBtn}
          />
          <Button
            label="Apply Filters"
            onPress={handleApply}
            variant="primary"
            style={styles.applyBtn}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 20,
    paddingBottom: 24,
  },
  section: {
    gap: 10,
  },
  sectionHeading: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '700',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  resetBtn: {
    flex: 1,
  },
  applyBtn: {
    flex: 2,
  },
});

