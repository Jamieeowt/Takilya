import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Landmark, ChevronRight, ShieldCheck, Archive } from 'lucide-react-native';
import { PreservedFilmItem } from '@/features/heritage/types';
import { radius, spacing, typography } from '@/lib/theme';

interface HeritageRailProps {
  preservedFilms: PreservedFilmItem[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';
const CARD_WIDTH = 150;

export function HeritageRail({
  preservedFilms,
  title = 'Philippine Film Heritage',
  subtitle = 'Restored 4K masterworks, national archives & cultural preservation',
}: HeritageRailProps) {
  const router = useRouter();

  if (!preservedFilms || preservedFilms.length === 0) return null;

  const handleViewAll = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push('/heritage' as any);
  };

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <View style={styles.badgeRow}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.badgePill}>
              <Landmark size={10} color="#FFFFFF" />
              <Text style={styles.badgePillText}>PRESERVATION</Text>
            </View>
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all preserved films and heritage archives"
          onPress={handleViewAll}
          style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={14} color="#8A8A8A" />
        </Pressable>
      </View>

      {/* Rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}>
        {preservedFilms.map((item) => {
          const isRestored = item.status === 'restored';

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Preserved film ${item.film.title}`}
              onPress={() => handlePress(item.film_id)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}>
              <View style={styles.posterWrap}>
                <Image
                  source={{ uri: item.film.poster_url || undefined }}
                  placeholder={DEFAULT_BLURHASH}
                  contentFit="cover"
                  transition={200}
                  style={styles.poster}
                />
                <View style={[styles.statusBadge, isRestored ? styles.badgeRestored : styles.badgeArchived]}>
                  {isRestored ? (
                    <ShieldCheck size={9} color="#000000" strokeWidth={2.5} />
                  ) : (
                    <Archive size={9} color="#FFFFFF" strokeWidth={2} />
                  )}
                  <Text style={[styles.statusText, isRestored ? styles.textRestored : styles.textArchived]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.filmTitle} numberOfLines={1}>
                {item.film.title}
              </Text>
              <Text style={styles.metaText}>
                {item.film.release_year} {item.film.director ? `• ${item.film.director}` : ''}
              </Text>

              {item.restoring_body && (
                <Text style={styles.restoringText} numberOfLines={1}>
                  {item.restoring_body}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
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
    marginBottom: spacing.md,
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
  railContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
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
  statusBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  badgeRestored: {
    backgroundColor: '#FFFFFF',
  },
  badgeArchived: {
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  statusText: {
    ...typography.caption,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textRestored: {
    color: '#000000',
  },
  textArchived: {
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
  restoringText: {
    ...typography.caption,
    fontSize: 10,
    color: '#D4D4D4',
    marginTop: 1,
  },
});

