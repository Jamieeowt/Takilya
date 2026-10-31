import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { FilmCard } from './FilmCard';
import { CinemalayaEditionGroup } from '../types';

interface CinemalayaSectionProps {
  editions: CinemalayaEditionGroup[];
}

export function CinemalayaSection({ editions }: CinemalayaSectionProps) {
  const [selectedEditionIndex, setSelectedEditionIndex] = useState(0);

  if (!editions || editions.length === 0) return null;

  const currentEdition = editions[selectedEditionIndex] || editions[0];

  return (
    <View style={styles.sectionContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Ionicons name="film" size={14} color={colors.gold.primary} />
          <Text style={styles.badgeLabel}>Festival Retrospective</Text>
        </View>
        <Text style={styles.title}>Cinemalaya Through the Years</Text>
        <Text style={styles.subtitle}>
          Celebrating the brave, groundbreaking independent Philippine cinema editions
        </Text>
      </View>

      {/* Edition Selector Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.editionTabsRow}>
        {editions.map((edition, idx) => {
          const isSelected = idx === selectedEditionIndex;
          return (
            <Pressable
              key={edition.edition_id}
              accessibilityRole="button"
              accessibilityLabel={`Select ${edition.edition_name} from ${edition.year}`}
              onPress={() => setSelectedEditionIndex(idx)}
              style={[styles.editionTab, isSelected && styles.editionTabActive]}>
              <Text style={[styles.editionName, isSelected && styles.editionNameActive]}>
                {edition.edition_name}
              </Text>
              <Text style={[styles.editionYear, isSelected && styles.editionYearActive]}>
                ({edition.year})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Edition Theme Banner */}
      {currentEdition.theme && (
        <View style={styles.themeBanner}>
          <Ionicons name="bookmark" size={12} color={colors.gold.primary} />
          <Text style={styles.themeText}>
            Edition Theme: <Text style={styles.themeHighlight}>"{currentEdition.theme}"</Text>
          </Text>
        </View>
      )}

      {/* Films Rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filmsRow}>
        {currentEdition.films.map((film) => (
          <FilmCard key={film.id} film={film} width={145} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: spacing.md,
  },
  headerRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  editionTabsRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  editionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    minHeight: 34,
    borderRadius: radius.full,
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    justifyContent: 'center',
  },
  editionTabActive: {
    backgroundColor: colors.gold.subtle,
    borderColor: colors.gold.primary,
  },
  editionName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  editionNameActive: {
    color: colors.gold.primary,
    fontWeight: '700',
  },
  editionYear: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  editionYearActive: {
    color: colors.gold.primary,
    fontWeight: '700',
  },
  themeBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(229, 184, 66, 0.08)',
    borderColor: 'rgba(229, 184, 66, 0.2)',
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  themeText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  themeHighlight: {
    color: colors.gold.primary,
    fontWeight: '700',
  },
  filmsRow: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
});

