import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { radius, typography } from '@/lib/theme';

export type AwardStatus = 'won' | 'nominated' | 'official_selection' | 'special_mention';

interface AwardBadgeProps {
  status: AwardStatus;
  label: string;
  style?: ViewStyle;
}

export function AwardBadge({ status, label, style }: AwardBadgeProps) {
  if (status === 'won') {
    // Won = filled badge
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel={`Award won: ${label}`}
        style={[styles.baseBadge, styles.wonBadge, style]}>
        <Text style={styles.wonText}>{label}</Text>
      </View>
    );
  }

  if (status === 'nominated') {
    // Nominated = outlined badge
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel={`Award nominated: ${label}`}
        style={[styles.baseBadge, styles.nominatedBadge, style]}>
        <Text style={styles.nominatedText}>{label}</Text>
      </View>
    );
  }

  if (status === 'official_selection') {
    // Official Selection = dashed outline
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel={`Official selection: ${label}`}
        style={[styles.baseBadge, styles.selectionBadge, style]}>
        <Text style={styles.selectionText}>{label}</Text>
      </View>
    );
  }

  // Special Mention = double outline
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Special mention: ${label}`}
      style={[styles.doubleOuter, style]}>
      <View style={styles.doubleInner}>
        <Text style={styles.specialText}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  baseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  wonBadge: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  wonText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  nominatedBadge: {
    backgroundColor: 'transparent',
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  nominatedText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  selectionBadge: {
    backgroundColor: 'transparent',
    borderColor: '#8A8A8A',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  selectionText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: '#D4D4D4',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  doubleOuter: {
    padding: 1.5,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  doubleInner: {
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  specialText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});

