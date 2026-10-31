import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Popcorn, Ticket, Star, Info } from 'lucide-react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { FilmRatingMetrics } from '@/features/films/types';
import { radius, typography } from '@/lib/theme';

interface FilmBreakdownSheetProps {
  visible: boolean;
  onClose: () => void;
  ratings: FilmRatingMetrics;
  filmTitle: string;
}

export function FilmBreakdownSheet({
  visible,
  onClose,
  ratings,
  filmTitle,
}: FilmBreakdownSheetProps) {
  const distributionRows = [
    { star: 5, pct: ratings.distribution.star5 },
    { star: 4, pct: ratings.distribution.star4 },
    { star: 3, pct: ratings.distribution.star3 },
    { star: 2, pct: ratings.distribution.star2 },
    { star: 1, pct: ratings.distribution.star1 },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Ratings & Consensus">
      <View style={styles.content}>
        {/* Consensus Header */}
        <View style={styles.comparisonGrid}>
          {/* Audience Card */}
          <View style={styles.scoreCard}>
            <View style={styles.cardHeader}>
              <Popcorn size={18} color="#FFFFFF" />
              <Text style={styles.cardLabel}>Audience Score</Text>
            </View>
            <Text style={styles.cardScoreBig}>{ratings.audience_score}%</Text>
            <View style={styles.starsRow}>
              <Star size={13} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.starsText}>{ratings.audience_average_stars} / 5.0</Text>
            </View>
            <Text style={styles.subCount}>
              {ratings.total_ratings_count.toLocaleString()} cinephile votes
            </Text>
          </View>

          {/* Critic Card */}
          <View style={styles.scoreCard}>
            <View style={styles.cardHeader}>
              <Ticket size={18} color="#FFFFFF" />
              <Text style={styles.cardLabel}>Critic Score</Text>
              <VerifiedBadge size={14} />
            </View>
            <Text style={styles.cardScoreBig}>{ratings.critic_score}%</Text>
            <View style={styles.starsRow}>
              <Star size={13} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.starsText}>{ratings.critic_average_stars} / 5.0</Text>
            </View>
            <Text style={styles.subCount}>
              Accredited Philippine Critics
            </Text>
          </View>
        </View>

        {/* Rating Distribution Section */}
        <View style={styles.distributionBox}>
          <Text style={styles.sectionHeading}>Score Distribution</Text>

          <View style={styles.barsList}>
            {distributionRows.map((item) => (
              <View key={item.star} style={styles.distRow}>
                <View style={styles.starLabel}>
                  <Text style={styles.starNum}>{item.star}</Text>
                  <Star size={11} color="#8A8A8A" fill="#8A8A8A" />
                </View>

                {/* Progress bar track */}
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.max(3, item.pct)}%` },
                    ]}
                  />
                </View>

                {/* Percentage value */}
                <Text style={styles.pctText}>{item.pct}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dual Policy Notice */}
        <View style={styles.policyBox}>
          <Info size={16} color="#8A8A8A" style={styles.infoIcon} />
          <Text style={styles.policyText}>
            Takilya maintains strict separation between verified Philippine film critics
            and organic cinephile audience scores. Scores reflect certified ratings with no paywall bias.
          </Text>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 8,
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardLabel: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 12,
    fontWeight: '600',
  },
  cardScoreBig: {
    ...typography.display,
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsText: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 12,
    fontWeight: '600',
  },
  subCount: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  distributionBox: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  sectionHeading: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  barsList: {
    gap: 8,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 28,
    gap: 2,
    justifyContent: 'flex-end',
  },
  starNum: {
    ...typography.mono,
    color: '#D4D4D4',
    fontSize: 12,
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
  },
  pctText: {
    ...typography.mono,
    color: '#8A8A8A',
    fontSize: 11,
    width: 34,
    textAlign: 'right',
  },
  policyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#141414',
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoIcon: {
    marginTop: 1,
  },
  policyText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});

