import React from 'react';
import { Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { radius, typography } from '@/lib/theme';

interface ChipProps {
  label: string;
  variant?: 'filled' | 'outlined';
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Chip({
  label,
  variant = 'outlined',
  selected = false,
  onPress,
  style,
  textStyle,
  icon,
}: ChipProps) {
  const isFilled = variant === 'filled' || selected;

  const handlePress = () => {
    if (onPress) {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      onPress();
    }
  };

  const content = (
    <>
      {icon}
      <Text style={[styles.text, isFilled ? styles.textFilled : styles.textOutlined, textStyle]}>
        {label}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Tag: ${label}`}
        accessibilityState={{ selected }}
        onPress={handlePress}
        hitSlop={8}
        style={({ pressed }) => [
          styles.base,
          isFilled ? styles.filled : styles.outlined,
          pressed && styles.pressed,
          style,
        ]}>
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable style={[styles.base, isFilled ? styles.filled : styles.outlined, style]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  filled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  outlined: {
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  text: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textFilled: {
    color: '#000000',
    fontWeight: '700',
  },
  textOutlined: {
    color: '#D4D4D4',
  },
});

