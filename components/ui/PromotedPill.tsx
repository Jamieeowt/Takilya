import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { radius, typography } from '@/lib/theme';

interface PromotedPillProps {
  label?: string;
  sponsorName?: string | null;
  style?: ViewStyle;
}

export function PromotedPill({ label = 'Promoted', sponsorName, style }: PromotedPillProps) {
  const displayText = sponsorName ? `${label} • ${sponsorName}` : label;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Promoted post: ${displayText}`}
      style={[styles.pill, style]}>
      <Text style={styles.text} numberOfLines={1}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

