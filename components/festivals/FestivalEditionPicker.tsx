import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FestivalEdition } from '@/features/festivals/types';
import { radius, spacing, typography } from '@/lib/theme';

interface FestivalEditionPickerProps {
  editions: FestivalEdition[];
  selectedEditionId?: string;
  onSelectEdition: (editionId: string) => void;
}

export function FestivalEditionPicker({
  editions,
  selectedEditionId,
  onSelectEdition,
}: FestivalEditionPickerProps) {
  if (!editions || editions.length === 0) return null;

  const handleSelect = (editionId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    onSelectEdition(editionId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pickerHeader}>FESTIVAL EDITIONS</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}>
        {editions.map((edition) => {
          const isSelected = edition.id === selectedEditionId;
          return (
            <Pressable
              key={edition.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Select edition ${edition.name || edition.year}`}
              onPress={() => handleSelect(edition.id)}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}>
              <Text
                style={[
                  styles.yearText,
                  isSelected ? styles.yearTextSelected : styles.yearTextUnselected,
                ]}>
                {edition.year}
              </Text>
              {edition.name && (
                <Text
                  style={[
                    styles.nameText,
                    isSelected ? styles.nameTextSelected : styles.nameTextUnselected,
                  ]}
                  numberOfLines={1}>
                  {edition.name.replace(/^[0-9]{4}\s*/, '')}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  pickerHeader: {
    ...typography.label,
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  scrollList: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
  },
  chipSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  chipUnselected: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  yearText: {
    fontSize: 13,
    fontWeight: '800',
  },
  yearTextSelected: {
    color: '#000000',
  },
  yearTextUnselected: {
    color: '#FFFFFF',
  },
  nameText: {
    fontSize: 12,
    fontWeight: '500',
  },
  nameTextSelected: {
    color: '#2E2E2E',
  },
  nameTextUnselected: {
    color: '#8A8A8A',
  },
});

