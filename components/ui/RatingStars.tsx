import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Star, StarHalf } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface RatingStarsProps {
  score: number; // 0 to 5
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  style?: ViewStyle;
}

export function RatingStars({
  score,
  maxStars = 5,
  size = 20,
  interactive = false,
  onRate,
  style,
}: RatingStarsProps) {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  const handleStarPress = (val: number) => {
    if (interactive && onRate) {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      onRate(val);
    }
  };

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Rating: ${score} out of ${maxStars} stars`}
      style={[styles.container, style]}>
      {stars.map((starIndex) => {
        const isFull = score >= starIndex;
        const isHalf = !isFull && score >= starIndex - 0.5;

        const starIcon = isFull ? (
          <Star size={size} color="#FFFFFF" fill="#FFFFFF" />
        ) : isHalf ? (
          <StarHalf size={size} color="#FFFFFF" fill="#FFFFFF" />
        ) : (
          <Star size={size} color="rgba(255, 255, 255, 0.3)" />
        );

        if (interactive) {
          return (
            <Pressable
              key={starIndex}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${starIndex} stars`}
              onPress={() => handleStarPress(starIndex)}
              hitSlop={6}
              style={styles.starTouch}>
              {starIcon}
            </Pressable>
          );
        }

        return <View key={starIndex}>{starIcon}</View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starTouch: {
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

