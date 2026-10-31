import React from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { spacing } from '@/lib/theme';
import { PosterCard, PosterCardFilm } from './PosterCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PosterGridProps {
  films: PosterCardFilm[];
  numColumns?: number;
  style?: ViewStyle;
}

export function PosterGrid({ films, numColumns = 3, style }: PosterGridProps) {
  const horizontalPadding = spacing.md * 2;
  const gap = spacing.sm;
  const cardWidth = Math.floor((SCREEN_WIDTH - horizontalPadding - (numColumns - 1) * gap) / numColumns);

  return (
    <View style={[styles.grid, style]}>
      {films.map((film) => (
        <PosterCard key={film.id} film={film} width={cardWidth} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
});

