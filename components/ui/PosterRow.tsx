import React from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { spacing, typography } from '@/lib/theme';
import { PosterCard, PosterCardFilm } from './PosterCard';

interface PosterRowProps {
  title: string;
  subtitle?: string;
  films: PosterCardFilm[];
  cardWidth?: number;
  style?: ViewStyle;
}

export function PosterRow({
  title,
  subtitle,
  films,
  cardWidth = 135,
  style,
}: PosterRowProps) {
  if (!films || films.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      {/* Section Title */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {films.map((film) => (
          <PosterCard key={film.id} film={film} width={cardWidth} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: 2,
  },
  title: {
    ...typography.title,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
});

