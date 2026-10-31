import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Film, Compass, MessageSquare, Check, Lock } from 'lucide-react-native';
import { AchievementBadge } from '@/features/account/types';
import { radius, spacing, typography } from '@/lib/theme';

interface AchievementBadgesProps {
  badges?: AchievementBadge[];
}

export function AchievementBadges({ badges = [] }: AchievementBadgesProps) {
  if (!badges || badges.length === 0) return null;

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const handleBadgePress = (badge: AchievementBadge) => {
    try {
      void Haptics.selectionAsync();
    } catch {}

    const statusText = badge.unlocked
      ? 'Achievement Unlocked'
      : `Progress: ${badge.currentCount} of ${badge.targetCount}`;

    Alert.alert(badge.title, `${badge.description}\n\n${statusText}`);
  };

  const renderIcon = (name: AchievementBadge['iconName'], isUnlocked: boolean) => {
    const iconColor = isUnlocked ? '#000000' : '#8A8A8A';
    const size = 18;
    switch (name) {
      case 'Film':
        return <Film size={size} color={iconColor} />;
      case 'Compass':
        return <Compass size={size} color={iconColor} />;
      case 'MessageSquare':
        return <MessageSquare size={size} color={iconColor} />;
      default:
        return <Film size={size} color={iconColor} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
          <Text style={styles.sectionSubtitle}>Milestones in Philippine Cinema</Text>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {unlockedCount} / {badges.length} UNLOCKED
          </Text>
        </View>
      </View>

      {/* Badges Grid / Cards */}
      <View style={styles.grid}>
        {badges.map((badge) => {
          const progressPercent = Math.min(
            100,
            Math.round((badge.currentCount / Math.max(1, badge.targetCount)) * 100)
          );

          return (
            <Pressable
              key={badge.id}
              accessibilityRole="button"
              accessibilityLabel={`${badge.title}, ${
                badge.unlocked ? 'Unlocked' : `In progress, ${badge.currentCount} of ${badge.targetCount}`
              }`}
              accessibilityHint={badge.description}
              onPress={() => handleBadgePress(badge)}
              style={({ pressed }) => [
                styles.badgeCard,
                badge.unlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked,
                pressed && styles.badgeCardPressed,
              ]}>
              <View style={styles.badgeTopRow}>
                {/* Icon Circle */}
                <View
                  style={[
                    styles.iconCircle,
                    badge.unlocked ? styles.iconCircleUnlocked : styles.iconCircleLocked,
                  ]}>
                  {renderIcon(badge.iconName, badge.unlocked)}
                </View>

                {/* Status Indicator */}
                {badge.unlocked ? (
                  <View style={styles.unlockedTag}>
                    <Check size={11} color="#000000" strokeWidth={3} />
                    <Text style={styles.unlockedTagText}>EARNED</Text>
                  </View>
                ) : (
                  <View style={styles.lockedTag}>
                    <Lock size={11} color="#8A8A8A" />
                    <Text style={styles.lockedTagText}>
                      {badge.currentCount}/{badge.targetCount}
                    </Text>
                  </View>
                )}
              </View>

              {/* Title & Description */}
              <Text
                style={[
                  styles.badgeTitle,
                  badge.unlocked ? styles.badgeTitleUnlocked : styles.badgeTitleLocked,
                ]}
                numberOfLines={1}>
                {badge.title}
              </Text>
              <Text style={styles.badgeDesc} numberOfLines={2}>
                {badge.description}
              </Text>

              {/* Progress bar for locked badges */}
              {!badge.unlocked && (
                <View style={styles.progressBarWrap}>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progressPercent}%` },
                      ]}
                    />
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 1,
  },
  sectionSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: '#D4D4D4',
    marginTop: 2,
  },
  counterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: '#141414',
  },
  counterText: {
    ...typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  grid: {
    gap: spacing.sm,
    marginTop: 6,
  },
  badgeCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 88,
  },
  badgeCardUnlocked: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeCardLocked: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  badgeCardPressed: {
    opacity: 0.85,
  },
  badgeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnlocked: {
    backgroundColor: '#FFFFFF',
  },
  iconCircleLocked: {
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unlockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  unlockedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  lockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#141414',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  lockedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  badgeTitle: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  badgeTitleUnlocked: {
    color: '#FFFFFF',
  },
  badgeTitleLocked: {
    color: '#D4D4D4',
  },
  badgeDesc: {
    ...typography.bodySmall,
    fontSize: 12,
    lineHeight: 16,
    color: '#8A8A8A',
  },
  progressBarWrap: {
    marginTop: 8,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#1F1F1F',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8A8A8A',
    borderRadius: radius.full,
  },
});

