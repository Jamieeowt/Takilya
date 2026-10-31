import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { RestoredClassicItem } from '../types';

interface RestoredClassicsSectionProps {
  items: RestoredClassicItem[];
}

export function RestoredClassicsSection({ items }: RestoredClassicsSectionProps) {
  const router = useRouter();

  if (!items || items.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Ionicons name="shield-checkmark" size={14} color={colors.film.heritageBadge} />
          <Text style={styles.badgeLabel}>Film Preservation</Text>
        </View>
        <Text style={styles.title}>Restored Classics</Text>
        <Text style={styles.subtitle}>
          Masterpieces saved and revitalized by Sagip Pelikula and international archives
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsRow}>
        {items.map((item) => {
          const film = item.film;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`View restored classic ${film.title} (${film.release_year}) restored in ${item.restoration_year}`}
              onPress={() => {
                router.push({
                  pathname: '/film/[id]' as any,
                  params: { id: film.id },
                });
              }}
              style={styles.card}>
              <View style={styles.posterWrapper}>
                <Image
                  source={{ uri: film.poster_url || '' }}
                  style={styles.posterImage}
                  resizeMode="cover"
                />
                <View style={styles.restoredPill}>
                  <Ionicons name="sparkles" size={10} color="#FFFFFF" />
                  <Text style={styles.restoredPillText}>4K Restored ({item.restoration_year})</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.filmTitle} numberOfLines={1}>
                  {film.title}
                </Text>
                <Text style={styles.filmMeta}>
                  {film.release_year} • Dir. {film.director}
                </Text>

                <View style={styles.restorerBox}>
                  <Text style={styles.restorerLabel}>Restored by:</Text>
                  <Text style={styles.restorerBody} numberOfLines={2}>
                    {item.restoring_body}
                  </Text>
                </View>

                {item.archive_location && (
                  <View style={styles.archiveRow}>
                    <Ionicons name="business-outline" size={11} color={colors.text.tertiary} />
                    <Text style={styles.archiveText} numberOfLines={1}>
                      {item.archive_location}
                    </Text>
                  </View>
                )}
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
    color: colors.film.heritageBadge,
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
    width: 250,
    backgroundColor: colors.background.secondary,
    borderColor: 'rgba(244, 114, 182, 0.25)',
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  posterWrapper: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#000000',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  restoredPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(157, 23, 77, 0.85)',
    borderColor: 'rgba(244, 114, 182, 0.6)',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  restoredPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: spacing.md,
    gap: 4,
  },
  filmTitle: {
    ...typography.label,
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
  },
  filmMeta: {
    fontSize: 11,
    color: colors.gold.primary,
    fontWeight: '600',
  },
  restorerBox: {
    marginTop: 4,
    backgroundColor: 'rgba(8, 8, 10, 0.5)',
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radius.xs,
    padding: 6,
    gap: 2,
  },
  restorerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  restorerBody: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 14,
  },
  archiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  archiveText: {
    fontSize: 10,
    color: colors.text.tertiary,
    flex: 1,
  },
});

