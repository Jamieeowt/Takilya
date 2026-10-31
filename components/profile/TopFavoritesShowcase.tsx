import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SlidersHorizontal, Plus } from 'lucide-react-native';
import { TopFilmItem } from '@/features/account/types';
import { radius, spacing, typography } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = spacing.md * 2;
const GAP = spacing.sm;
const SLOT_WIDTH = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING - GAP * 3) / 4);
const SLOT_HEIGHT = Math.floor(SLOT_WIDTH * 1.5);
const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

interface TopFavoritesShowcaseProps {
  topFilms: TopFilmItem[];
  onOpenReorder: () => void;
}

export function TopFavoritesShowcase({
  topFilms,
  onOpenReorder,
}: TopFavoritesShowcaseProps) {
  const router = useRouter();

  // Ensure 4 slots always exist
  const slots: (TopFilmItem | null)[] = [1, 2, 3, 4].map((pos) => {
    return topFilms.find((f) => f.position === pos) || null;
  });

  const handleFilmPress = (filmId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: filmId },
    });
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Top 4 Favorites</Text>
          <Text style={styles.subtitle}>Personal canon of Philippine masterworks</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reorder top 4 favorite films"
          onPress={() => {
            try {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch {}
            onOpenReorder();
          }}
          style={styles.reorderBtn}>
          <SlidersHorizontal size={14} color="#D4D4D4" />
          <Text style={styles.reorderText}>Reorder</Text>
        </Pressable>
      </View>

      {/* 4 Poster Slots */}
      <View style={styles.slotsRow}>
        {slots.map((film, index) => {
          const position = index + 1;
          if (film) {
            return (
              <Pressable
                key={film.id || `pos-${position}`}
                accessibilityRole="button"
                accessibilityLabel={`Favorite ${position}: ${film.title} (${film.year})`}
                onPress={() => handleFilmPress(film.id)}
                style={styles.slotItem}>
                <View style={[styles.posterWrapper, { width: SLOT_WIDTH, height: SLOT_HEIGHT }]}>
                  <Image
                    source={{ uri: film.poster_url || undefined }}
                    placeholder={{ blurhash: DEFAULT_BLURHASH }}
                    contentFit="cover"
                    transition={200}
                    style={styles.posterImage}
                  />
                  {/* Position Pill */}
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{position}</Text>
                  </View>
                </View>

                <Text style={styles.filmTitle} numberOfLines={1}>
                  {film.title}
                </Text>
                <Text style={styles.filmYear}>{film.year}</Text>
              </Pressable>
            );
          }

          // Empty Slot
          return (
            <Pressable
              key={`empty-pos-${position}`}
              accessibilityRole="button"
              accessibilityLabel={`Empty favorite slot ${position}. Tap to select a film`}
              onPress={onOpenReorder}
              style={styles.slotItem}>
              <View
                style={[
                  styles.emptySlot,
                  { width: SLOT_WIDTH, height: SLOT_HEIGHT },
                ]}>
                <Plus size={18} color="#8A8A8A" />
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{position}</Text>
                </View>
              </View>
              <Text style={styles.emptyTitle}>Add Film</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 1,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  reorderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4D4D4',
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: GAP,
  },
  slotItem: {
    width: SLOT_WIDTH,
    alignItems: 'flex-start',
  },
  posterWrapper: {
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  rankBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  filmTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 6,
    width: '100%',
  },
  filmYear: {
    fontSize: 10,
    color: '#8A8A8A',
    marginTop: 1,
  },
  emptySlot: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyTitle: {
    fontSize: 10,
    color: '#8A8A8A',
    fontWeight: '500',
    marginTop: 6,
  },
});

