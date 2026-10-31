import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Clock, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { radius, typography } from '@/lib/theme';

interface RecentSearchesProps {
  searches: string[];
  onSelectSearch: (query: string) => void;
  onDeleteSearch: (query: string) => void;
  onClearAll: () => void;
}

export function RecentSearches({
  searches,
  onSelectSearch,
  onDeleteSearch,
  onClearAll,
}: RecentSearchesProps) {
  if (!searches || searches.length === 0) return null;

  const handleSelect = (term: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onSelectSearch(term);
  };

  const handleDelete = (term: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onDeleteSearch(term);
  };

  const handleClearAll = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onClearAll();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Recent Searches</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear all recent searches"
          onPress={handleClearAll}
          hitSlop={8}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </Pressable>
      </View>

      <View style={styles.chipsContainer}>
        {searches.map((item) => (
          <View key={item} style={styles.recentPill}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Search for ${item}`}
              onPress={() => handleSelect(item)}
              style={styles.pillTextTouch}>
              <Clock size={13} color="#8A8A8A" />
              <Text style={styles.pillText} numberOfLines={1}>
                {item}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item} from recent searches`}
              onPress={() => handleDelete(item)}
              hitSlop={6}
              style={styles.deleteBtn}>
              <X size={12} color="#8A8A8A" />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  clearAllText: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 12,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 6,
  },
  pillTextTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 180,
  },
  pillText: {
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 13,
  },
  deleteBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

