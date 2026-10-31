import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '@/lib/theme';
import { FilmCard } from './FilmCard';
import { ExploreFilmCard } from '../types';

interface FilmHorizontalRailProps {
  title: string;
  subtitle?: string;
  badge?: string;
  films: ExploreFilmCard[];
  cardWidth?: number;
  showRank?: boolean;
}

export function FilmHorizontalRail({
  title,
  subtitle,
  badge,
  films,
  cardWidth = 140,
  showRank = false,
}: FilmHorizontalRailProps) {
  if (!films || films.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <View style={styles.titleWithBadge}>
            <Text style={styles.title}>{title}</Text>
            {badge && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{badge}</Text>
              </View>
            )}
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {/* Horizontal Rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}>
        {films.map((film) => (
          <FilmCard
            key={film.id}
            film={film}
            width={cardWidth}
            showRank={showRank}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: spacing.md,
  },
  headerRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  titleColumn: {
    flex: 1,
    gap: 2,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  title: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerBadge: {
    backgroundColor: colors.gold.subtle,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold.primary,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  railContent: {
    paddingHorizontal: spacing.md,
  },
});

