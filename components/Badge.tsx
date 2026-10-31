import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/lib/theme';

interface BadgeProps {
  label: string;
  variant?: 'critic' | 'audience' | 'verified' | 'promoted' | 'heritage' | 'neutral';
  icon?: React.ReactNode;
}

export function Badge({ label, variant = 'neutral', icon }: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'critic':
        return {
          bg: colors.gold.subtle,
          border: colors.gold.subtleBorder,
          text: colors.gold.primary,
        };
      case 'audience':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
          text: colors.film.audienceScore,
        };
      case 'verified':
        return {
          bg: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.3)',
          text: colors.film.verifiedBadge,
        };
      case 'promoted':
        return {
          bg: 'rgba(251, 191, 36, 0.15)',
          border: 'rgba(251, 191, 36, 0.4)',
          text: colors.film.promotedBadge,
        };
      case 'heritage':
        return {
          bg: 'rgba(244, 114, 182, 0.12)',
          border: 'rgba(244, 114, 182, 0.35)',
          text: colors.film.heritageBadge,
        };
      case 'neutral':
      default:
        return {
          bg: colors.background.tertiary,
          border: colors.border.default,
          text: colors.text.secondary,
        };
    }
  };

  const currentColors = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentColors.bg,
          borderColor: currentColors.border,
        },
      ]}>
      {icon}
      <Text style={[styles.text, { color: currentColors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});

