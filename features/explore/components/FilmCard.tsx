import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { Badge } from '@/components/Badge';
import { ExploreFilmCard } from '../types';

interface FilmCardProps {
  film: ExploreFilmCard;
  width?: number;
  showRank?: boolean;
}

export function FilmCard({ film, width = 150, showRank = false }: FilmCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: film.id },
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View film details for ${film.title}, directed by ${film.director} (${film.release_year})`}
      onPress={handlePress}
      style={[styles.container, { width }]}>
      {/* Poster Image with overlays */}
      <View style={styles.posterWrapper}>
        {film.poster_url ? (
          <Image
            source={{ uri: film.poster_url }}
            style={styles.posterImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.posterFallback}>
            <Ionicons name="film-outline" size={32} color={colors.text.tertiary} />
          </View>
        )}

        {/* Top Badges */}
        <View style={styles.topBadgesRow}>
          {film.mtrcb_rating && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>{film.mtrcb_rating}</Text>
            </View>
          )}

          {film.is_classic && (
            <Badge variant="heritage" label="Classic" />
          )}
        </View>

        {/* Trending Rank Number overlay */}
        {showRank && film.trending_rank && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankNumber}>#{film.trending_rank}</Text>
          </View>
        )}

        {/* Score pill overlay on bottom-right of poster */}
        {(film.critic_score || film.audience_score) && (
          <View style={styles.scoreOverlay}>
            <Ionicons name="star" size={10} color={colors.gold.primary} />
            <Text style={styles.scoreText}>
              {film.critic_score || film.audience_score}%
            </Text>
          </View>
        )}
      </View>

      {/* Metadata */}
      <View style={styles.metaContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {film.title}
        </Text>
        <Text style={styles.director} numberOfLines={1}>
          Dir. {film.director}
        </Text>
        <View style={styles.footerRow}>
          <Text style={styles.year}>{film.release_year}</Text>
          {film.language && (
            <Text style={styles.languageDot}>• {film.language}</Text>
          )}
        </View>

        {film.badge_label && (
          <View style={styles.customBadgeRow}>
            <Text style={styles.customBadgeText} numberOfLines={1}>
              {film.badge_label}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
  },
  posterWrapper: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: radius.sm,
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
  },
  topBadgesRow: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  ratingBadge: {
    backgroundColor: 'rgba(8, 8, 10, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  ratingBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.primary,
  },
  rankBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.gold.primary,
    borderRadius: radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  rankNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.inverse,
  },
  scoreOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(8, 8, 10, 0.85)',
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold.primary,
  },
  metaContainer: {
    marginTop: spacing.xs,
    gap: 2,
  },
  title: {
    ...typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  director: {
    fontSize: 11,
    color: colors.gold.primary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  year: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  languageDot: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  customBadgeRow: {
    marginTop: 2,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.gold.primary,
  },
});

