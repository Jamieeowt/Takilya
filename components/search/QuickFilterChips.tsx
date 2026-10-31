import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Chip } from '@/components/ui/Chip';
import { SearchFilterState } from '@/features/search/types';
import { radius, typography } from '@/lib/theme';

interface QuickFilterChipsProps {
  filters: SearchFilterState;
  onUpdateFilters: (updater: (prev: SearchFilterState) => SearchFilterState) => void;
  onOpenFilterSheet: () => void;
  activeFiltersCount: number;
}

export function QuickFilterChips({
  filters,
  onUpdateFilters,
  onOpenFilterSheet,
  activeFiltersCount,
}: QuickFilterChipsProps) {
  const handleOpenSheet = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onOpenFilterSheet();
  };

  const isAllActive =
    !filters.genre &&
    !filters.decade &&
    !filters.streamingPlatform &&
    !filters.minRating;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}>
        {/* 1. Filter Sheet Trigger Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open filter sheet. ${activeFiltersCount} filters currently active.`}
          onPress={handleOpenSheet}
          style={[
            styles.filterTrigger,
            activeFiltersCount > 0 && styles.filterTriggerActive,
          ]}>
          <SlidersHorizontal
            size={14}
            color={activeFiltersCount > 0 ? '#000000' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.filterTriggerText,
              activeFiltersCount > 0 && styles.filterTriggerTextActive,
            ]}>
            Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
          </Text>
        </Pressable>

        <View style={styles.separator} />

        {/* 2. All Quick Chip */}
        <Chip
          label="All"
          variant="filled"
          selected={isAllActive}
          onPress={() => {
            onUpdateFilters((prev) => ({
              ...prev,
              genre: null,
              decade: null,
              streamingPlatform: null,
              minRating: null,
            }));
          }}
        />

        {/* 3. Decade / Era Quick Tags */}
        <Chip
          label="Classics"
          variant="outlined"
          selected={filters.decade === 'classics'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              decade: prev.decade === 'classics' ? null : 'classics',
            }))
          }
        />

        <Chip
          label="2010s"
          variant="outlined"
          selected={filters.decade === '2010s'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              decade: prev.decade === '2010s' ? null : '2010s',
            }))
          }
        />

        <Chip
          label="2020s"
          variant="outlined"
          selected={filters.decade === '2020s'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              decade: prev.decade === '2020s' ? null : '2020s',
            }))
          }
        />

        <Chip
          label="Latest"
          variant="outlined"
          selected={filters.decade === 'latest'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              decade: prev.decade === 'latest' ? null : 'latest',
            }))
          }
        />

        {/* 4. Genres Quick Tags */}
        <Chip
          label="Indie"
          variant="outlined"
          selected={filters.genre?.toLowerCase() === 'indie'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              genre: prev.genre?.toLowerCase() === 'indie' ? null : 'Indie',
            }))
          }
        />

        <Chip
          label="Romance"
          variant="outlined"
          selected={filters.genre?.toLowerCase() === 'romance'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              genre: prev.genre?.toLowerCase() === 'romance' ? null : 'Romance',
            }))
          }
        />

        <Chip
          label="Horror"
          variant="outlined"
          selected={filters.genre?.toLowerCase() === 'horror'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              genre: prev.genre?.toLowerCase() === 'horror' ? null : 'Horror',
            }))
          }
        />

        <Chip
          label="Action"
          variant="outlined"
          selected={filters.genre?.toLowerCase() === 'action'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              genre: prev.genre?.toLowerCase() === 'action' ? null : 'Action',
            }))
          }
        />

        {/* 5. Streaming Availability Quick Tags */}
        <Chip
          label="Netflix"
          variant="outlined"
          selected={filters.streamingPlatform === 'netflix'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              streamingPlatform:
                prev.streamingPlatform === 'netflix' ? null : 'netflix',
            }))
          }
        />

        <Chip
          label="Prime"
          variant="outlined"
          selected={filters.streamingPlatform === 'prime'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              streamingPlatform:
                prev.streamingPlatform === 'prime' ? null : 'prime',
            }))
          }
        />

        <Chip
          label="Vivamax"
          variant="outlined"
          selected={filters.streamingPlatform === 'vivamax'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              streamingPlatform:
                prev.streamingPlatform === 'vivamax' ? null : 'vivamax',
            }))
          }
        />

        <Chip
          label="Theatrical"
          variant="outlined"
          selected={filters.streamingPlatform === 'theatrical'}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              streamingPlatform:
                prev.streamingPlatform === 'theatrical' ? null : 'theatrical',
            }))
          }
        />

        {/* 6. Score Quick Tag */}
        <Chip
          label="90%+ Score"
          variant="outlined"
          selected={filters.minRating === 90}
          onPress={() =>
            onUpdateFilters((prev) => ({
              ...prev,
              minRating: prev.minRating === 90 ? null : 90,
            }))
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  scrollList: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  filterTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  filterTriggerActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterTriggerText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  filterTriggerTextActive: {
    color: '#000000',
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    marginHorizontal: 2,
  },
});

