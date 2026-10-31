import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { radius, typography } from '@/lib/theme';

interface SearchBarProps {
  query: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  activeFiltersCount?: number;
  onOpenFilters?: () => void;
  onSubmit?: () => void;
}

export function SearchBar({
  query,
  onChangeText,
  onClear,
  isLoading = false,
  activeFiltersCount = 0,
  onOpenFilters,
  onSubmit,
}: SearchBarProps) {
  const handleClear = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onClear();
  };

  const handleOpenFilters = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (onOpenFilters) {
      onOpenFilters();
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.inputWrapper}>
        <Search size={18} color="#8A8A8A" style={styles.searchIcon} />

        <TextInput
          value={query}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder="Search films, directors, actors, festivals..."
          placeholderTextColor="#8A8A8A"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.textInput}
        />

        {/* Loading Spinner or Clear Button */}
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
        ) : query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search input"
            onPress={handleClear}
            hitSlop={8}
            style={styles.clearBtn}>
            <X size={16} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>

      {/* Filter Action Button */}
      {onOpenFilters && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            activeFiltersCount > 0
              ? `Filters active: ${activeFiltersCount}. Tap to configure.`
              : 'Open filters'
          }
          onPress={handleOpenFilters}
          style={[
            styles.filterBtn,
            activeFiltersCount > 0 && styles.filterBtnActive,
          ]}>
          <SlidersHorizontal
            size={18}
            color={activeFiltersCount > 0 ? '#000000' : '#FFFFFF'}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <View style={styles.filterBadgeDot} />
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: '#000000',
  },
  inputWrapper: {
    flex: 1,
    height: 46,
    backgroundColor: '#141414',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  spinner: {
    marginLeft: 6,
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2E2E2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000000',
  },
});

