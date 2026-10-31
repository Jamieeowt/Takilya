import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StudioFilm } from '@/features/studios/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

interface StudioFilmGridProps {
  films: StudioFilm[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = spacing.md * 2;
const GAP = spacing.sm;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING - GAP * 2) / 3);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.48);
const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function StudioFilmGrid({ films }: StudioFilmGridProps) {
  const router = useRouter();

  if (!films || films.length === 0) {
    return (
      <EmptyState
        title="No Catalog Films"
        description="No films have been indexed under this studio's production slate yet."
      />
    );
  }

  const handlePress = (filmId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: filmId },
    });
  };

  return (
    <View style={styles.gridContainer}>
      {films.map((film) => (
        <Pressable
          key={film.id}
          accessibilityRole="button"
          accessibilityLabel={`Film ${film.title} (${film.release_year})`}
          onPress={() => handlePress(film.id)}
          style={({ pressed }) => [
            styles.card,
            { width: CARD_WIDTH },
            pressed && styles.cardPressed,
          ]}>
          <View style={[styles.posterWrap, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
            <Image
              source={{ uri: film.poster_url || undefined }}
              placeholder={DEFAULT_BLURHASH}
              contentFit="cover"
              style={styles.poster}
            />
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {film.title}
          </Text>
          <Text style={styles.metaText}>{film.release_year}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.xs,
  },
  cardPressed: {
    opacity: 0.85,
  },
  posterWrap: {
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 4,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
  },
});

