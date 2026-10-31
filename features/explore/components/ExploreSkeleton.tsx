import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, radius } from '@/lib/theme';

export function ExploreSkeleton() {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <View style={styles.container}>
      {/* Hero Card Skeleton */}
      <View style={styles.heroSkeletonWrap}>
        <Animated.View style={[styles.heroSkeleton, { opacity: opacityAnim }]} />
      </View>

      {/* Filter Row Skeleton */}
      <View style={styles.filterSkeletonRow}>
        {[80, 60, 70, 90, 65].map((w, i) => (
          <Animated.View
            key={i}
            style={[styles.filterChipSkeleton, { width: w, opacity: opacityAnim }]}
          />
        ))}
      </View>

      {/* Section 1 Rails Skeleton */}
      <View style={styles.railSectionSkeleton}>
        <Animated.View style={[styles.titleSkeleton, { width: 180, opacity: opacityAnim }]} />
        <View style={styles.cardsRow}>
          {[140, 140, 140].map((_, i) => (
            <View key={i} style={styles.cardSkeleton}>
              <Animated.View style={[styles.posterSkeleton, { opacity: opacityAnim }]} />
              <Animated.View style={[styles.textLineSkeleton, { width: '80%', opacity: opacityAnim }]} />
              <Animated.View style={[styles.textLineSkeleton, { width: '50%', opacity: opacityAnim }]} />
            </View>
          ))}
        </View>
      </View>

      {/* Section 2 Rails Skeleton */}
      <View style={styles.railSectionSkeleton}>
        <Animated.View style={[styles.titleSkeleton, { width: 220, opacity: opacityAnim }]} />
        <View style={styles.cardsRow}>
          {[140, 140, 140].map((_, i) => (
            <View key={i} style={styles.cardSkeleton}>
              <Animated.View style={[styles.posterSkeleton, { opacity: opacityAnim }]} />
              <Animated.View style={[styles.textLineSkeleton, { width: '75%', opacity: opacityAnim }]} />
              <Animated.View style={[styles.textLineSkeleton, { width: '45%', opacity: opacityAnim }]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    gap: spacing.lg,
  },
  heroSkeletonWrap: {
    paddingHorizontal: spacing.md,
  },
  heroSkeleton: {
    width: '100%',
    height: 180,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  filterSkeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChipSkeleton: {
    height: 32,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.full,
  },
  railSectionSkeleton: {
    gap: spacing.sm,
  },
  titleSkeleton: {
    height: 20,
    marginLeft: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xs,
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  cardSkeleton: {
    width: 140,
    gap: 6,
  },
  posterSkeleton: {
    width: 140,
    height: 210,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  textLineSkeleton: {
    height: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xs,
  },
});

