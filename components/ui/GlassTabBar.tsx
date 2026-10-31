import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassTabBarProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
}

export function GlassTabBar({
  children,
  intensity = 70,
  style,
}: GlassTabBarProps) {
  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.tabBar, style]}>
      <View style={styles.content}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderTopWidth: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});

