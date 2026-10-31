import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Trophy, Award, ChevronRight, Globe, Sparkles } from 'lucide-react-native';
import { AwardBody } from '@/features/awards/types';
import { radius, spacing, typography } from '@/lib/theme';

interface AwardsRailProps {
  awardBodies: AwardBody[];
  title?: string;
  subtitle?: string;
}

const BODY_CARD_WIDTH = 200;

export function AwardsRail({
  awardBodies,
  title = 'Awards & Recognitions',
  subtitle = 'FAMAS, Gawad Urian, Cannes, Venice, Sundance & global honors',
}: AwardsRailProps) {
  const router = useRouter();

  if (!awardBodies || awardBodies.length === 0) return null;

  const handleViewAll = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push('/awards' as any);
  };

  const handleBodyPress = (bodyId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/awards' as any,
      params: { bodyId },
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
              <Trophy size={10} color="#FFFFFF" />
              <Text style={styles.badgePillText}>AWARDS</Text>
            </View>
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all awards and recognitions"
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
        {awardBodies.map((body) => {
          const isLocal = body.scope === 'local';

          return (
            <Pressable
              key={body.id}
              accessibilityRole="button"
              accessibilityLabel={`Award body ${body.name}`}
              onPress={() => handleBodyPress(body.id)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}>
              {/* Scope & Country Pill */}
              <View style={styles.topRow}>
                <View style={[styles.scopePill, isLocal ? styles.localPill : styles.intlPill]}>
                  {isLocal ? (
                    <Award size={10} color={isLocal ? '#FFFFFF' : '#000000'} />
                  ) : (
                    <Globe size={10} color="#000000" />
                  )}
                  <Text style={[styles.scopeText, isLocal ? styles.localText : styles.intlText]}>
                    {isLocal ? 'PHILIPPINE' : 'GLOBAL'}
                  </Text>
                </View>

                <Text style={styles.countryText}>{body.country}</Text>
              </View>

              {/* Acronym & Full Name */}
              <Text style={styles.acronymText}>
                {body.acronym || body.name}
              </Text>
              <Text style={styles.fullNameText} numberOfLines={2}>
                {body.name}
              </Text>

              {/* Description */}
              {body.description && (
                <Text style={styles.descText} numberOfLines={2}>
                  {body.description}
                </Text>
              )}

              {/* Footer action */}
              <View style={styles.cardFooter}>
                <Text style={styles.footerActionText}>Explore Laurels</Text>
                <ChevronRight size={12} color="#FFFFFF" />
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
  card: {
    width: BODY_CARD_WIDTH,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  scopePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  localPill: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  intlPill: {
    backgroundColor: '#FFFFFF',
  },
  scopeText: {
    ...typography.caption,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  localText: {
    color: '#FFFFFF',
  },
  intlText: {
    color: '#000000',
  },
  countryText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 10,
  },
  acronymText: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  fullNameText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  descText: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 11,
    lineHeight: 15,
    marginTop: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  footerActionText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
});

