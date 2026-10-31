import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Film, Search, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { radius, typography } from '@/lib/theme';

interface SearchEmptyStateProps {
  query: string;
  onSelectSuggestion: (term: string) => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

const SUGGESTIONS = [
  'Himala',
  'Leonor Will Never Die',
  'Maynila sa mga Kuko',
  'Ishmael Bernal',
  'Lino Brocka',
  'Cinemalaya',
  'Cleaners',
];

export function SearchEmptyState({
  query,
  onSelectSuggestion,
  onResetFilters,
  hasActiveFilters = false,
}: SearchEmptyStateProps) {
  const handleSelect = (term: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onSelectSuggestion(term);
  };

  return (
    <View style={styles.container}>
      {/* Icon circle */}
      <View style={styles.iconCircle}>
        <Film size={28} color="#FFFFFF" />
      </View>

      <Text style={styles.title}>
        {query ? `No results for "${query}"` : 'No matching films found'}
      </Text>

      <Text style={styles.description}>
        {hasActiveFilters
          ? 'Try adjusting your filter criteria or searching for alternative titles.'
          : 'We could not find matching Philippine films, filmmakers, or cinema screenings.'}
      </Text>

      {hasActiveFilters && onResetFilters && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset active filters"
          onPress={onResetFilters}
          style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>Clear Active Filters</Text>
        </Pressable>
      )}

      {/* Suggested Search Titles */}
      <View style={styles.suggestionsContainer}>
        <View style={styles.suggestionsHeader}>
          <Sparkles size={14} color="#8A8A8A" />
          <Text style={styles.suggestionsTitle}>Suggested Philippine Titles</Text>
        </View>

        <View style={styles.chipsWrap}>
          {SUGGESTIONS.map((term) => (
            <Pressable
              key={term}
              accessibilityRole="button"
              accessibilityLabel={`Search for ${term}`}
              onPress={() => handleSelect(term)}
              style={styles.suggestionChip}>
              <Text style={styles.suggestionChipText}>{term}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    ...typography.title,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: '#8A8A8A',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
  },
  resetBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    marginTop: 4,
  },
  resetBtnText: {
    ...typography.caption,
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
  },
  suggestionsContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestionsTitle: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  suggestionChipText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

