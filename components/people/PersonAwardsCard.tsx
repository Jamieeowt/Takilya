import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trophy, Award } from 'lucide-react-native';
import { PersonAwardSummary } from '@/features/people/types';
import { radius, spacing, typography } from '@/lib/theme';

interface PersonAwardsCardProps {
  awards: PersonAwardSummary;
}

export function PersonAwardsCard({ awards }: PersonAwardsCardProps) {
  if (!awards || awards.recognitions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header Metric Summary */}
      <View style={styles.metricBanner}>
        <View style={styles.metricItem}>
          <Trophy size={18} color="#FFFFFF" strokeWidth={2.5} />
          <View>
            <Text style={styles.metricNumber}>{awards.wins_count}</Text>
            <Text style={styles.metricLabel}>{awards.wins_count === 1 ? 'Award Win' : 'Award Wins'}</Text>
          </View>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Award size={18} color="#8A8A8A" strokeWidth={2} />
          <View>
            <Text style={styles.metricNumber}>{awards.nominations_count}</Text>
            <Text style={styles.metricLabel}>{awards.nominations_count === 1 ? 'Nomination' : 'Nominations'}</Text>
          </View>
        </View>
      </View>

      {/* Recognitions List */}
      <View style={styles.awardsList}>
        {awards.recognitions.map((item) => {
          const isWon = item.status === 'won';

          return (
            <View key={item.id} style={styles.awardRow}>
              {/* Year & Status Badge */}
              <View style={styles.awardLeftCol}>
                <Text style={styles.ceremonyYear}>{item.ceremony_year}</Text>
                <View style={[styles.statusBadge, isWon ? styles.badgeWon : styles.badgeNominated]}>
                  <Text style={[styles.statusBadgeText, isWon ? styles.textWon : styles.textNominated]}>
                    {isWon ? 'WON' : 'NOMINATED'}
                  </Text>
                </View>
              </View>

              {/* Award Details */}
              <View style={styles.awardRightCol}>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {item.category_name}
                </Text>
                <Text style={styles.bodyName}>
                  {item.award_body_name}
                  {item.film_title ? ` • for ${item.film_title}` : ''}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  metricBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricNumber: {
    ...typography.mono,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 10,
    color: '#8A8A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  awardsList: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  awardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  awardLeftCol: {
    alignItems: 'center',
    minWidth: 54,
    gap: 4,
  },
  ceremonyYear: {
    ...typography.mono,
    fontSize: 12,
    fontWeight: '700',
    color: '#D4D4D4',
  },
  statusBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  badgeWon: {
    backgroundColor: '#FFFFFF',
  },
  badgeNominated: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textWon: {
    color: '#000000',
  },
  textNominated: {
    color: '#D4D4D4',
  },
  awardRightCol: {
    flex: 1,
  },
  categoryName: {
    ...typography.title,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bodyName: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },
});

