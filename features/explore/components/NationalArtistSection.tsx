import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { NationalArtistMasterwork } from '../types';

interface NationalArtistSectionProps {
  items: NationalArtistMasterwork[];
}

export function NationalArtistSection({ items }: NationalArtistSectionProps) {
  const router = useRouter();

  if (!items || items.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.badgeRow}>
            <Ionicons name="ribbon-outline" size={16} color={colors.gold.primary} />
            <Text style={styles.badgeLabel}>National Heritage</Text>
          </View>
          <Text style={styles.title}>National Artist Masterworks</Text>
          <Text style={styles.subtitle}>
            Immortal cinema by filmmakers and artists conferred the highest state honor
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsRow}>
        {items.map((item) => {
          const film = item.film;
          return (
            <Pressable
              key={item.artist_id + film.id}
              accessibilityRole="button"
              accessibilityLabel={`View National Artist masterwork ${film.title} by ${item.artist_name}`}
              onPress={() => {
                router.push({
                  pathname: '/film/[id]' as any,
                  params: { id: film.id },
                });
              }}
              style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.artistInfo}>
                  <Text style={styles.artistName}>{item.artist_name}</Text>
                  <Text style={styles.confermentYear}>Conferred {item.conferment_year} • {item.category}</Text>
                </View>
                <View style={styles.orderMedal}>
                  <Ionicons name="medal" size={18} color={colors.gold.primary} />
                </View>
              </View>

              <Text style={styles.citation} numberOfLines={3}>
                "{item.citation}"
              </Text>

              <View style={styles.filmPreviewRow}>
                <Image
                  source={{ uri: film.poster_url || '' }}
                  style={styles.filmPoster}
                  resizeMode="cover"
                />
                <View style={styles.filmMeta}>
                  <Text style={styles.filmTitle} numberOfLines={1}>
                    {film.title}
                  </Text>
                  <Text style={styles.filmYear}>
                    {film.release_year} • Dir. {film.director}
                  </Text>
                  <View style={styles.scoreRow}>
                    <Ionicons name="star" size={12} color={colors.gold.primary} />
                    <Text style={styles.scoreText}>Critic {film.critic_score}%</Text>
                  </View>
                  <View style={styles.classicTag}>
                    <Text style={styles.classicTagText}>National Treasure</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
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
  },
  headerLeft: {
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  cardsRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  card: {
    width: 290,
    backgroundColor: colors.background.secondary,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    ...typography.label,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  confermentYear: {
    fontSize: 11,
    color: colors.gold.primary,
    fontWeight: '600',
  },
  orderMedal: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.gold.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  citation: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  filmPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(8, 8, 10, 0.6)',
    borderRadius: radius.sm,
    padding: spacing.xs,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  filmPoster: {
    width: 48,
    height: 68,
    borderRadius: radius.xs,
    backgroundColor: colors.background.tertiary,
  },
  filmMeta: {
    flex: 1,
    gap: 2,
  },
  filmTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  filmYear: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold.primary,
  },
  classicTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(244, 114, 182, 0.15)',
    borderColor: 'rgba(244, 114, 182, 0.4)',
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginTop: 2,
  },
  classicTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.film.heritageBadge,
  },
});

