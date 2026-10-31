import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { radius } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = 10;
const PADDING = 16;
const POSTER_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - COLUMN_GAP * 2) / 3);
const POSTER_HEIGHT = Math.floor(POSTER_WIDTH * 1.5); // 2:3 ratio

export function SearchSkeletonGrid() {
  const dummyItems = Array.from({ length: 6 }, (_, i) => i);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {dummyItems.map((key) => (
          <View key={key} style={[styles.cardItem, { width: POSTER_WIDTH }]}>
            <SkeletonLoader
              width={POSTER_WIDTH}
              height={POSTER_HEIGHT}
              borderRadius={radius.sm}
            />
            <SkeletonLoader width="85%" height={12} style={styles.titleLine} />
            <SkeletonLoader width="50%" height={10} style={styles.yearLine} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING,
    paddingVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COLUMN_GAP,
  },
  cardItem: {
    gap: 6,
    marginBottom: 10,
  },
  titleLine: {
    marginTop: 4,
  },
  yearLine: {
    marginTop: 2,
  },
});

