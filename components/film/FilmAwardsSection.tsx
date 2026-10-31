import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AwardBadge, AwardStatus } from '@/components/ui/AwardBadge';
import { FilmAwardItem } from '@/features/films/types';
import { radius, typography } from '@/lib/theme';

interface FilmAwardsSectionProps {
  awards: FilmAwardItem[];
}

export function FilmAwardsSection({ awards }: FilmAwardsSectionProps) {
  if (!awards || awards.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Awards & Recognitions</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}>
        {awards.map((item) => {
          const badgeLabel =
            item.status === 'won'
              ? 'WON'
              : item.status === 'nominated'
              ? 'NOMINATED'
              : item.status === 'official_selection'
              ? 'SELECTION'
              : 'SPECIAL MENTION';

          return (
            <View key={item.id} style={styles.awardCard}>
              <View style={styles.topRow}>
                <AwardBadge
                  status={item.status as AwardStatus}
                  label={badgeLabel}
                />
                <Text style={styles.ceremonyYear}>{item.ceremony_year}</Text>
              </View>

              <Text style={styles.awardBody} numberOfLines={1}>
                {item.award_body_name}
              </Text>

              <Text style={styles.categoryName} numberOfLines={2}>
                {item.category_name}
              </Text>

              {item.notes && (
                <Text style={styles.notesText} numberOfLines={1}>
                  {item.notes}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    gap: 12,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    paddingHorizontal: 16,
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  awardCard: {
    width: 220,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 14,
    gap: 6,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ceremonyYear: {
    ...typography.mono,
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '600',
  },
  awardBody: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  categoryName: {
    ...typography.body,
    color: '#D4D4D4',
    fontSize: 12,
    lineHeight: 16,
  },
  notesText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
});

