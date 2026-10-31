import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { radius, typography } from '@/lib/theme';
import { POSTER_IMAGE_PROPS } from '@/lib/image';

export interface PosterCardFilm {
  id: string;
  title: string;
  release_year: number;
  poster_url?: string | null;
  director?: string;
  critic_score?: number | null;
  audience_score?: number | null;
}

interface PosterCardProps {
  film: PosterCardFilm;
  width?: number;
  style?: ViewStyle;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function PosterCard({ film, width = 135, style }: PosterCardProps) {
  const router = useRouter();

  const handlePress = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: film.id },
    });
  };

  const score = film.critic_score || film.audience_score;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View film ${film.title} (${film.release_year})`}
      onPress={handlePress}
      style={[styles.container, { width }, style]}>
      {/* 2:3 Poster Image with Blurhash */}
      <View style={styles.posterWrapper}>
        <Image
          source={{ uri: film.poster_url || undefined }}
          {...POSTER_IMAGE_PROPS}
          style={styles.posterImage}
        />

        {/* Score Chip Overlay */}
        {score ? (
          <View style={styles.scoreChip}>
            <Text style={styles.scoreText}>{score}%</Text>
          </View>
        ) : null}
      </View>

      {/* Title & Year Below */}
      <View style={styles.metaRow}>
        <Text style={styles.title} numberOfLines={1}>
          {film.title}
        </Text>
        <Text style={styles.year}>{film.release_year}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  posterWrapper: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: radius.card,
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  scoreChip: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.24)',
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metaRow: {
    gap: 1,
  },
  title: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  year: {
    fontSize: 11,
    color: '#8A8A8A',
  },
});

