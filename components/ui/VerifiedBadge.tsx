import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';

interface VerifiedBadgeProps {
  size?: number;
  style?: ViewStyle;
}

export function VerifiedBadge({ size = 16, style }: VerifiedBadgeProps) {
  const iconSize = Math.max(8, Math.round(size * 0.65));

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Verified official account"
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}>
      <Check size={iconSize} color="#000000" strokeWidth={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

