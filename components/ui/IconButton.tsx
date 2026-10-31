import React from 'react';
import { StyleSheet, Pressable, ViewStyle, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { radius } from '@/lib/theme';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  variant?: 'ghost' | 'filled' | 'outlined';
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 44,
  variant = 'ghost',
  style,
}: IconButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.base,
        {
          width: Math.max(44, size),
          height: Math.max(44, size),
          borderRadius: size / 2,
        },
        variant === 'filled' && styles.filled,
        variant === 'outlined' && styles.outlined,
        animatedStyle,
        style,
      ]}>
      {icon}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  filled: {
    backgroundColor: '#FFFFFF',
  },
  outlined: {
    backgroundColor: 'rgba(10, 10, 10, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
  },
});

