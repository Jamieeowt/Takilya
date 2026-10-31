import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Popcorn, Ticket, ChevronRight, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { FilmRatingMetrics } from '@/features/films/types';
import { FilmBreakdownSheet } from './FilmBreakdownSheet';
import { radius, typography } from '@/lib/theme';

interface FilmRatingsSectionProps {
  ratings: FilmRatingMetrics;
  filmTitle: string;
}

export function FilmRatingsSection({ ratings, filmTitle }: FilmRatingsSectionProps) {
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleOpenBreakdown = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSheetVisible(true);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ratings breakdown: Audience score ${ratings.audience_score} percent, Critic score ${ratings.critic_score} percent. Tap to view detailed distribution.`}
        onPress={handleOpenBreakdown}
        style={styles.cardContainer}>
        {/* Dual Score Rings Row */}
        <View style={styles.scoresRow}>
          {/* 1. Audience Score */}
          <View style={styles.scoreBlock}>
            <ScoreRing
              score={ratings.audience_score}
              label="Audience"
              size={64}
              strokeWidth={5}
            />
            <View style={styles.scoreDetails}>
              <View style={styles.labelRow}>
                <Popcorn size={14} color="#FFFFFF" />
                <Text style={styles.ringLabel}>Audience</Text>
              </View>
              <View style={styles.starSubRow}>
                <Star size={11} color="#8A8A8A" fill="#8A8A8A" />
                <Text style={styles.subtext}>
                  {ratings.audience_average_stars} ({ratings.total_ratings_count.toLocaleString()})
                </Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* 2. Critic Score */}
          <View style={styles.scoreBlock}>
            <ScoreRing
              score={ratings.critic_score}
              label="Critic"
              size={64}
              strokeWidth={5}
            />
            <View style={styles.scoreDetails}>
              <View style={styles.labelRow}>
                <Ticket size={14} color="#FFFFFF" />
                <Text style={styles.ringLabel}>Critic</Text>
              </View>
              <View style={styles.starSubRow}>
                <Star size={11} color="#8A8A8A" fill="#8A8A8A" />
                <Text style={styles.subtext}>
                  {ratings.critic_average_stars} (Certified)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Breakdown CTA Row */}
        <View style={styles.ctaRow}>
          <Text style={styles.ctaText}>View score distribution & reviews</Text>
          <ChevronRight size={16} color="#8A8A8A" />
        </View>
      </Pressable>

      {/* Expandable Bottom Sheet */}
      <FilmBreakdownSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        ratings={ratings}
        filmTitle={filmTitle}
      />
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 16,
    gap: 14,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  scoreDetails: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ringLabel: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  starSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtext: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 8,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  ctaText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '500',
  },
});

