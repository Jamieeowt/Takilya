import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { Badge } from '@/components/Badge';
import { useExplore } from '@/features/explore/useExplore';

export default function ExploreScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useExplore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'festivals' | 'studios' | 'heritage'>('all');

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.gold.primary} />
        <Text style={styles.loadingText}>Loading Philippine cinema databases...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.status.error} />
        <Text style={styles.errorTitle}>Failed to load Explore directory</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry loading explore directory"
          onPress={() => refetch()}
          style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const filters = [
    { key: 'all', label: 'All Catalog' },
    { key: 'festivals', label: 'Film Festivals' },
    { key: 'studios', label: 'Studios & Outfits' },
    { key: 'heritage', label: 'National Artists' },
  ] as const;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            void refetch();
          }}
          tintColor={colors.gold.primary}
        />
      }>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.text.tertiary} />
        <TextInput
          accessibilityLabel="Search Philippine films, festivals, or directors"
          style={styles.searchInput}
          placeholder="Search films, festivals, directors..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search input"
            onPress={() => setSearchQuery('')}
            hitSlop={8}
            style={styles.clearBtn}>
            <Ionicons name="close-circle" size={16} color={colors.text.tertiary} />
          </Pressable>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${f.label}`}
            onPress={() => setSelectedFilter(f.key)}
            style={[
              styles.filterPill,
              selectedFilter === f.key && styles.filterPillActive,
            ]}>
            <Text
              style={[
                styles.filterPillText,
                selectedFilter === f.key && styles.filterPillTextActive,
              ]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Genres Chips */}
      {(selectedFilter === 'all' || selectedFilter === 'festivals') && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Philippine Film Genres</Text>
          <View style={styles.tagsContainer}>
            {data.genres.map((genre) => (
              <View key={genre} style={styles.genreTag}>
                <Text style={styles.genreTagText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Film Festivals Section */}
      {(selectedFilter === 'all' || selectedFilter === 'festivals') && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Prestigious Film Festivals</Text>
            <Badge label="Cinemalaya / QCinema" variant="critic" />
          </View>

          {data.festivals.map((fest) => (
            <View key={fest.id} style={styles.itemCard}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{fest.name}</Text>
                <Text style={styles.cardMeta}>Est. {fest.established_year}</Text>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.gold.primary} />
                <Text style={styles.locationText}>{fest.location}</Text>
              </View>
              <Text style={styles.cardDescription}>{fest.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Heritage & National Artists */}
      {(selectedFilter === 'all' || selectedFilter === 'heritage') && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Heritage & National Artists</Text>
            <Badge label="Preserved 4K" variant="heritage" />
          </View>

          {data.heritageArtists.map((artist) => (
            <View key={artist.id} style={styles.itemCard}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{artist.name}</Text>
                <Badge label={`Conferred ${artist.conferment_year}`} variant="critic" />
              </View>
              <Text style={styles.subheading}>Notable Classics:</Text>
              <View style={styles.notableRow}>
                {artist.notable_films.map((film) => (
                  <View key={film} style={styles.notablePill}>
                    <Text style={styles.notableText}>{film}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Studios Database */}
      {(selectedFilter === 'all' || selectedFilter === 'studios') && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Studios & Production Outfits</Text>
            <Badge label="Verified Entities" variant="verified" />
          </View>

          <View style={styles.studiosGrid}>
            {data.studios.map((st) => (
              <View key={st.id} style={styles.studioCard}>
                <View style={styles.studioTitleRow}>
                  <Text style={styles.studioName}>{st.name}</Text>
                  {st.verified && (
                    <Ionicons name="checkmark-circle" size={14} color={colors.film.verifiedBadge} />
                  )}
                </View>
                <Badge
                  label={st.type.toUpperCase()}
                  variant={st.type === 'indie' ? 'critic' : 'neutral'}
                />
              </View>
            ))}
          </View>
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
    padding: spacing.lg,
    gap: spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.sm,
    borderColor: colors.border.default,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    paddingVertical: spacing.sm,
  },
  clearBtn: {
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterPill: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: colors.gold.subtle,
    borderColor: colors.gold.primary,
  },
  filterPillText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: colors.gold.primary,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    ...typography.titleSmall,
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genreTag: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xs,
    borderColor: colors.border.default,
    borderWidth: 1,
  },
  genreTagText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  itemCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  cardTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    flex: 1,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  locationText: {
    fontSize: 12,
    color: colors.gold.primary,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 4,
  },
  subheading: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  notableRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  notablePill: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  notableText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  studiosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  studioCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    padding: spacing.md,
    flex: 1,
    minWidth: '45%',
    gap: spacing.sm,
  },
  studioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studioName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontSize: 14,
  },
  errorTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.gold.primary,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.xs,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 14,
  },
});
