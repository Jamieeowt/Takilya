import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Film, Users, Sparkles } from 'lucide-react-native';
import { Studio } from '@/features/studios/types';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { FollowButton } from '@/components/social/FollowButton';
import { radius, spacing, typography } from '@/lib/theme';

interface StudiosRailProps {
  studios: Studio[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';
const STUDIO_CARD_WIDTH = 200;

export function StudiosRail({
  studios,
  title = 'Studios & Collectives',
  subtitle = 'Production outfits, indie houses & regional cinema collectives',
}: StudiosRailProps) {
  const router = useRouter();

  if (!studios || studios.length === 0) return null;

  const handleViewAll = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push('/studios' as any);
  };

  const handleCardPress = (studioId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/studio/[id]' as any,
      params: { id: studioId },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <View style={styles.badgeRow}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.badgePill}>
              <Sparkles size={10} color="#FFFFFF" />
              <Text style={styles.badgePillText}>STUDIOS</Text>
            </View>
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all film studios"
          onPress={handleViewAll}
          style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={14} color="#8A8A8A" />
        </Pressable>
      </View>

      {/* Horizontal Rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}>
        {studios.map((studio) => {
          const isVerified = studio.verification_status === 'verified';

          return (
            <Pressable
              key={studio.id}
              accessibilityRole="button"
              accessibilityLabel={`Studio: ${studio.name}`}
              onPress={() => handleCardPress(studio.id)}
              style={({ pressed }) => [
                styles.railCard,
                pressed && styles.railCardPressed,
              ]}>
              {/* Studio Logo Banner */}
              <View style={styles.logoWrap}>
                <Image
                  source={{ uri: studio.logo_url || undefined }}
                  placeholder={DEFAULT_BLURHASH}
                  contentFit="cover"
                  transition={200}
                  style={styles.logoImage}
                />
              </View>

              {/* Studio Info */}
              <View style={styles.infoWrap}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {studio.name}
                  </Text>
                  {isVerified && <VerifiedBadge size={13} />}
                </View>

                {studio.founded_year && (
                  <Text style={styles.foundedText}>Est. {studio.founded_year}</Text>
                )}

                {/* Stats */}
                <View style={styles.statsRow}>
                  {studio.films_count !== undefined && (
                    <View style={styles.statItem}>
                      <Film size={11} color="#8A8A8A" />
                      <Text style={styles.statText}>
                        {studio.films_count} {studio.films_count === 1 ? 'film' : 'films'}
                      </Text>
                    </View>
                  )}
                  {studio.followers_count !== undefined && (
                    <View style={styles.statItem}>
                      <Users size={11} color="#8A8A8A" />
                      <Text style={styles.statText}>{studio.followers_count}</Text>
                    </View>
                  )}
                </View>

                {/* Inline Follow Button */}
                <View style={styles.actionWrap}>
                  <FollowButton
                    targetType="studio"
                    targetId={studio.id}
                    size="sm"
                  />
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
  railCard: {
    width: STUDIO_CARD_WIDTH,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  railCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  logoWrap: {
    width: '100%',
    height: 100,
    backgroundColor: '#141414',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  infoWrap: {
    padding: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  foundedText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },
  actionWrap: {
    marginTop: spacing.md,
  },
});

