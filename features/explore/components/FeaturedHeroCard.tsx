import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { Badge } from '@/components/Badge';
import { FeaturedTodayHero } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeaturedHeroCardProps {
  hero: FeaturedTodayHero;
}

export function FeaturedHeroCard({ hero }: FeaturedHeroCardProps) {
  const router = useRouter();
  const film = hero.film;

  const handleOpenFilm = () => {
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: film.id },
    });
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Featured film: ${film.title} directed by ${film.director}. Tap to view film details.`}
        onPress={handleOpenFilm}
        style={styles.cardWrap}>
        {/* Backdrop Image */}
        <View style={styles.backdropWrap}>
          {film.backdrop_url || film.poster_url ? (
            <Image
              source={{ uri: film.backdrop_url || film.poster_url || '' }}
              style={styles.backdropImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.backdropFallback} />
          )}

          {/* Obsidian Gradient Layer */}
          <View style={styles.scrimLayer} />

          {/* Promoted / Featured Header Badge */}
          <View style={styles.badgeRow}>
            {hero.is_promoted ? (
              <Badge
                variant="promoted"
                label={hero.sponsor_name ? `Promoted • ${hero.sponsor_name}` : 'Promoted'}
              />
            ) : (
              <View style={styles.editorialBadge}>
                <Ionicons name="sparkles" size={12} color={colors.gold.primary} />
                <Text style={styles.editorialBadgeText}>Featured Today</Text>
              </View>
            )}

            {film.mtrcb_rating && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingBadgeText}>{film.mtrcb_rating}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          <Text style={styles.headline}>{hero.headline}</Text>

          <View style={styles.titleRow}>
            <Text style={styles.filmTitle}>{film.title}</Text>
            <Text style={styles.filmYear}>({film.release_year})</Text>
          </View>

          <Text style={styles.directorText}>Dir. {film.director}</Text>

          <Text style={styles.curatorNote} numberOfLines={2}>
            {hero.curator_note}
          </Text>

          {/* Genres + CTA Row */}
          <View style={styles.actionRow}>
            <View style={styles.genresRow}>
              {film.genres.slice(0, 2).map((genre) => (
                <Badge key={genre} label={genre} variant="neutral" />
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View film ${film.title}`}
              onPress={handleOpenFilm}
              style={styles.viewFilmBtn}>
              <Text style={styles.viewFilmText}>View Film</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.text.inverse} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  cardWrap: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1.5,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  backdropWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#000000',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.tertiary,
  },
  scrimLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 8, 10, 0.45)',
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editorialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(8, 8, 10, 0.85)',
    borderColor: colors.gold.primary,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editorialBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold.primary,
    letterSpacing: 0.2,
  },
  ratingBadge: {
    backgroundColor: 'rgba(8, 8, 10, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.primary,
  },
  contentContainer: {
    padding: spacing.md,
    gap: 4,
  },
  headline: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  filmTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  filmYear: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold.primary,
  },
  directorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  curatorNote: {
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 17,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopColor: colors.border.subtle,
    borderTopWidth: 1,
  },
  genresRow: {
    flexDirection: 'row',
    gap: 4,
  },
  viewFilmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold.primary,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: radius.xs,
    justifyContent: 'center',
  },
  viewFilmText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.inverse,
  },
});

