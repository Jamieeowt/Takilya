import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, radius, spacing } from '@/lib/theme';

interface CardProps extends ViewProps {
  goldBorder?: boolean;
  children: React.ReactNode;
}

export function Card({ goldBorder = false, style, children, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        goldBorder && styles.goldBorder,
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    padding: spacing.lg,
  },
  goldBorder: {
    borderColor: colors.gold.subtleBorder,
  },
});

