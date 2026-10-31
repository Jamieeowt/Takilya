import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { radius } from '@/lib/theme';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
  scrollable?: boolean;
}

export function SegmentedControl({
  options,
  selectedIndex,
  onChange,
  style,
  scrollable = false,
}: SegmentedControlProps) {
  const handleSelect = (idx: number) => {
    if (idx !== selectedIndex) {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      onChange(idx);
    }
  };

  const isCompact = options.length >= 5;

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.container, styles.scrollableContent, style]}>
        {options.map((option, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <Pressable
              key={option}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Select ${option}`}
              onPress={() => handleSelect(idx)}
              style={[
                styles.segment,
                styles.scrollableSegment,
                isSelected && styles.segmentActive,
              ]}>
              <Text
                style={[
                  styles.label,
                  isCompact && styles.compactLabel,
                  isSelected && styles.labelActive,
                ]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {options.map((option, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Select ${option}`}
            onPress={() => handleSelect(idx)}
            style={[
              styles.segment,
              isCompact && styles.compactSegment,
              isSelected && styles.segmentActive,
            ]}>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                isCompact && styles.compactLabel,
                isSelected && styles.labelActive,
              ]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: radius.full,
    padding: 3,
  },
  scrollableContent: {
    paddingHorizontal: 3,
    gap: 4,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: 12,
  },
  compactSegment: {
    paddingHorizontal: 4,
  },
  scrollableSegment: {
    flex: undefined,
    paddingHorizontal: 14,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  compactLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  labelActive: {
    color: '#000000',
    fontWeight: '800',
  },
});
