import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Trophy, Award, Sparkles } from 'lucide-react-native';
import { AwardWinningFilm } from '@/features/awards/types';
import { radius, spacing, typography } from '@/lib/theme';

interface AwardWinningFilmsCarouselProps {
  films: AwardWinningFilm[];
  title?: string;
  subtitle?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.floor(SCREEN_WIDTH * 0.75);
const POSTER_HEIGHT = 160;
const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function AwardWinningFilmsCarousel({
  films,
  title = 'DECORATED MASTERWORKS',
  subtitle = 'Philippine cinema’s most awarded and internationally recognized films',
}: AwardWinningFilmsCarouselProps) {
  const router = useRouter();

  if (!films || films.length === 0) return null;

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
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.badgePill}>
            <Trophy size={10} color="#FFFFFF" />
            <Text style={styles.badgePillText}>HONORS</Text>
          </View>
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {films.map((film) => (
          <Pressable
            key={film.id}
            accessibilityRole="button"
            accessibilityLabel={`View film ${film.title} (${film.release_year}) with ${film.wins_count} awards won`}
            onPress={() => handlePress(film.id)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}>
            {/* Poster Header */}
            <View style={styles.posterWrap}>
              <Image
                source={{ uri: film.poster_url || undefined }}
                placeholder={DEFAULT_BLURHASH}
                contentFit="cover"
                transition={200}
                style={styles.poster}
              />
              <View style={styles.winsTag}>
                <Trophy size={11} color="#000000" strokeWidth={3} />
                <Text style={styles.winsTagText}>
                  {film.wins_count} WINS
                </Text>
              </View>
            </View>

            {/* Content Details */}
            <View style={styles.infoWrap}>
              <Text style={styles.filmTitle} numberOfLines={1}>
                {film.title}
              </Text>
              <Text style={styles.metaText}>
                {film.release_year} {film.director ? `• Dir. ${film.director}` : ''}
              </Text>

              {/* Top Accolades List */}
              <View style={styles.accoladesWrap}>
                {film.top_accolades.slice(0, 2).map((acc, idx) => (
                  <View key={idx} style={styles.accoladeRow}>
                    <Award size={11} color="#FFFFFF" />
                    <Text style={styles.accoladeText} numberOfLines={1}>
                      {acc}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
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
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#8A8A8A',
    letterSpacing: 1.2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: '#141414',
  },
  badgePillText: {
    ...typography.caption,
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  subtitle: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  posterWrap: {
    width: '100%',
    height: POSTER_HEIGHT,
    backgroundColor: '#141414',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  winsTag: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  winsTagText: {
    ...typography.caption,
    color: '#000000',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  infoWrap: {
    padding: spacing.md,
  },
  filmTitle: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  metaText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    marginTop: 2,
  },
  accoladesWrap: {
    marginTop: spacing.sm,
    gap: 4,
  },
  accoladeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#141414',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  accoladeText: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
});

