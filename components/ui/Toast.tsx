import React, { useEffect } from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { radius, typography } from '@/lib/theme';

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss?: () => void;
  duration?: number;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Toast({
  message,
  visible,
  onDismiss,
  duration = 3000,
  icon,
  style,
}: ToastProps) {
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 14, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 250 });

      const timer = setTimeout(() => {
        translateY.value = withTiming(-60, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 });
        if (onDismiss) onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-60, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, duration, onDismiss, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {icon}
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.full,
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 9999,
  },
  text: {
    ...typography.titleSmall,
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
});

