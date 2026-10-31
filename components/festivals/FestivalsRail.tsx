import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronRight, MapPin, Sparkles } from 'lucide-react-native';
import { Festival } from '@/features/festivals/types';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { FollowButton } from '@/components/social/FollowButton';
import { radius, spacing, typography } from '@/lib/theme';

interface FestivalsRailProps {
  festivals: Festival[];
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';
const FESTIVAL_CARD_WIDTH = 220;

export function FestivalsRail({ festivals }: FestivalsRailProps) {
  const router = useRouter();

  if (!festivals || festivals.length === 0) return null;

  const handleViewAll = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push('/festivals' as any);
  };

  const handleCardPress = (festivalId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/festival/[id]' as any,
      params: { id: festivalId },
    });
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <View style={styles.badgeRow}>
            <Text style={styles.title}>Philippine Film Festivals</Text>
            <View style={styles.badgePill}>
              <Sparkles size={10} color="#FFFFFF" />
              <Text style={styles.badgePillText}>DATABASE</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Cinemalaya, QCinema, MMFF, Cinema Rehiyon & more
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all film festivals"
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
        {festivals.map((fest) => {
          const isVerified = fest.verification_status === 'verified';

          return (
            <Pressable
              key={fest.id}
              accessibilityRole="button"
              accessibilityLabel={`Festival: ${fest.name}`}
              onPress={() => handleCardPress(fest.id)}
              style={({ pressed }) => [
                styles.railCard,
                pressed && styles.railCardPressed,
              ]}>
              {/* Logo / Poster Header */}
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: fest.logo_url || fest.banner_url || undefined }}
                  placeholder={DEFAULT_BLURHASH}
                  contentFit="cover"
                  transition={200}
                  style={styles.cardImage}
                />
              </View>

              {/* Info */}
              <View style={styles.infoWrap}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={2}>
                    {fest.name}
                  </Text>
                  {isVerified && <VerifiedBadge size={13} style={styles.verifiedBadge} />}
                </View>

                {fest.location && (
                  <View style={styles.metaRow}>
                    <MapPin size={11} color="#8A8A8A" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {fest.location}
                    </Text>
                  </View>
                )}

                <Text style={styles.followersText}>
                  {fest.followers_count.toLocaleString()} followers
                </Text>

                <View style={styles.buttonWrap}>
                  <FollowButton
                    targetType="festival"
                    targetId={fest.id}
                    targetName={fest.name}
                    size="sm"
                    style={styles.followBtn}
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
    marginVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingLeft: 8,
  },
  viewAllText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  railContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  railCard: {
    width: FESTIVAL_CARD_WIDTH,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  railCardPressed: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  imageWrap: {
    width: '100%',
    height: 90,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing.sm,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  infoWrap: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  name: {
    ...typography.title,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
    flex: 1,
  },
  verifiedBadge: {
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    flex: 1,
  },
  followersText: {
    ...typography.caption,
    fontSize: 11,
    color: '#D4D4D4',
    marginTop: 4,
    fontWeight: '600',
  },
  buttonWrap: {
    marginTop: 8,
  },
  followBtn: {
    width: '100%',
  },
});

