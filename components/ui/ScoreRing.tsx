import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { typography } from '@/lib/theme';

interface ScoreRingProps {
  score: number; // 0 to 100
  label?: 'Critic' | 'Audience' | string;
  size?: number;
  strokeWidth?: number;
  style?: ViewStyle;
}

export function ScoreRing({
  score,
  label,
  size = 54,
  strokeWidth = 4,
  style,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (circumference * clampedScore) / 100;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${label || 'Score'}: ${score}%`}
      style={[styles.container, style]}>
      <View style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size}>
          {/* Background track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FFFFFF"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        {/* Score number inside */}
        <View style={styles.centerLabel}>
          <Text style={styles.scoreText}>{clampedScore}%</Text>
        </View>
      </View>

      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  centerLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  label: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

