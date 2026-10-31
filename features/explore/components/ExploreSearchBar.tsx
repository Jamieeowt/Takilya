import React from 'react';
import { View, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';

interface ExploreSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function ExploreSearchBar({
  value,
  onChangeText,
  onClear,
  isLoading = false,
}: ExploreSearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.inputWrapper}>
        <Ionicons name="search" size={20} color={colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          accessibilityRole="search"
          accessibilityLabel="Search Philippine films, directors, festivals, or studios"
          style={styles.textInput}
          placeholder="Search films, people, festivals, studios..."
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.gold.primary} style={styles.actionIcon} />
        ) : value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search input"
            onPress={onClear}
            hitSlop={12}
            style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
  },
  actionIcon: {
    marginLeft: spacing.sm,
  },
  clearBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
});

