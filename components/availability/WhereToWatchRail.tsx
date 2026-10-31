import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Tv, ChevronRight, Sparkles, ExternalLink } from 'lucide-react-native';
import {
  useStreamingPlatforms,
  useBrowseFilmsByPlatform,
} from '@/features/availability/useAvailability';
import { radius, spacing, typography } from '@/lib/theme';

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';
const CARD_WIDTH = 130;

export function WhereToWatchRail() {
  const router = useRouter();

  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [freeOnly, setFreeOnly] = useState<boolean>(false);

  const { data: platforms = [] } = useStreamingPlatforms();
  const { data: browseFilms = [], isLoading } = useBrowseFilmsByPlatform(
    selectedPlatform,
    freeOnly
  );

  const handlePlatformSelect = (slug: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setSelectedPlatform(slug);
  };

  const handleToggleFree = (value: boolean) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setFreeOnly(value);
  };

  const handleViewAll = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/watch' as any,
      params: {
        platform: selectedPlatform,
        freeOnly: freeOnly ? 'true' : 'false',
      },
    });
  };

  const handleFilmPress = (filmId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: filmId },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <View style={styles.badgeRow}>
            <Text style={styles.title}>Where to Watch</Text>
            <View style={styles.badgePill}>
              <Tv size={10} color="#FFFFFF" />
              <Text style={styles.badgePillText}>STREAMING</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Browse Philippine cinema across local & global platforms
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all where to watch listings"
          onPress={handleViewAll}
          style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={14} color="#8A8A8A" />
        </Pressable>
      </View>

      {/* Filter Row: Platform Chips & Free-Only Toggle */}
      <View style={styles.controlsRow}>
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
                accessibilityLabel={`Select platform ${p.name}`}
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

        {/* Free Only Pill Toggle */}
        <View style={styles.toggleWrap}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel="Show only free to watch titles"
            onPress={() => handleToggleFree(!freeOnly)}
            style={[styles.freePill, freeOnly && styles.freePillActive]}>
            <Sparkles size={11} color={freeOnly ? '#000000' : '#8A8A8A'} />
            <Text style={[styles.freePillText, freeOnly && styles.freePillTextActive]}>
              Free Only
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Horizontal Rail of Filtered Titles */}
      {browseFilms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No titles match the selected platform and free filter criteria.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.railContent}>
          {browseFilms.map((film) => (
            <Pressable
              key={film.id}
              accessibilityRole="button"
              accessibilityLabel={`View film ${film.title}`}
              onPress={() => handleFilmPress(film.id)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}>
              <View style={styles.posterWrap}>
                <Image
                  source={{ uri: film.poster_url || undefined }}
                  placeholder={DEFAULT_BLURHASH}
                  contentFit="cover"
                  transition={200}
                  style={styles.poster}
                />
                <View
                  style={[
                    styles.platformTag,
                    film.is_free ? styles.tagFree : styles.tagPlatform,
                  ]}>
                  <Text
                    style={[
                      styles.platformTagText,
                      film.is_free ? styles.tagTextFree : styles.tagTextPlatform,
                    ]}>
                    {film.is_free ? 'FREE' : film.platform_name.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.filmTitle} numberOfLines={1}>
                {film.title}
              </Text>
              <Text style={styles.metaText}>
                {film.release_year} {film.director ? `• Dir. ${film.director}` : ''}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  title: {
    ...typography.titleMedium,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: '#141414',
  },
  badgePillText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  subtitle: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    minHeight: 44,
  },
  viewAllText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    marginVertical: spacing.xs,
    gap: spacing.xs,
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
  toggleWrap: {
    paddingLeft: 4,
  },
  freePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#141414',
    minHeight: 32,
  },
  freePillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  freePillText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  freePillTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  railContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  card: {
    width: CARD_WIDTH,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  posterWrap: {
    width: CARD_WIDTH,
    height: Math.floor(CARD_WIDTH * 1.48),
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  tagFree: {
    backgroundColor: '#FFFFFF',
  },
  tagPlatform: {
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  platformTagText: {
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
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 1,
  },
  emptyContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
  },
});

