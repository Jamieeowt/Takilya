import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { typography } from '@/lib/theme';

interface GlassHeaderProps {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
}

export function GlassHeader({
  title,
  left,
  right,
  intensity = 60,
  style,
}: GlassHeaderProps) {
  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.header, style]}>
      <View style={styles.leftCol}>{left}</View>
      {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
      <View style={styles.rightCol}>{right}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomWidth: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.65)',
  },
  leftCol: {
    minWidth: 44,
    alignItems: 'flex-start',
  },
  rightCol: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.title,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    flex: 1,
  },
});

