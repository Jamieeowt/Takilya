import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { PenLine, AlertTriangle, ChevronDown, ThumbsUp, Flag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FilmReviewItem } from '@/features/films/types';
import { Avatar } from '@/components/ui/Avatar';
import { RatingStars } from '@/components/ui/RatingStars';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Button } from '@/components/ui/Button';
import { ReportModal } from '@/components/moderation';
import { radius, typography } from '@/lib/theme';

interface FilmReviewsSectionProps {
  reviews: FilmReviewItem[];
  onWriteReview: () => void;
  filmTitle: string;
}

export function FilmReviewsSection({
  reviews,
  onWriteReview,
  filmTitle,
}: FilmReviewsSectionProps) {
  // Track which spoiler reviews have been unmasked by user
  const [unmaskedSpoilers, setUnmaskedSpoilers] = useState<Record<string, boolean>>({});
  const [reportingReview, setReportingReview] = useState<FilmReviewItem | null>(null);

  const toggleSpoiler = (reviewId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setUnmaskedSpoilers((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>Community Reviews</Text>
          <Text style={styles.sectionSubtitle}>
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} logged
          </Text>
        </View>

        {/* Prominent Write a Review Button */}
        <Button
          label="Write a Review"
          onPress={onWriteReview}
          variant="secondary"
          icon={<PenLine size={14} color="#FFFFFF" />}
          style={styles.writeButton}
          textStyle={styles.writeButtonText}
        />
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        {reviews.map((rev) => {
          const isSpoilerRevealed = Boolean(unmaskedSpoilers[rev.id]);
          const isCritic = rev.is_critic_review || rev.user_role === 'critic';

          return (
            <View key={rev.id} style={styles.reviewCard}>
              {/* Reviewer Header */}
              <View style={styles.reviewerRow}>
                <Avatar
                  url={rev.user_avatar}
                  name={rev.user_name}
                  size={38}
                  isVerified={isCritic}
                />

                <View style={styles.nameCol}>
                  <View style={styles.displayNameRow}>
                    <Text style={styles.displayName} numberOfLines={1}>
                      {rev.user_name}
                    </Text>
                    {isCritic && (
                      <View style={styles.criticPill}>
                        <Text style={styles.criticText}>CRITIC</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.username}>@{rev.user_username}</Text>
                </View>

                {/* Rating Stars */}
                <View style={styles.ratingWrap}>
                  <RatingStars score={rev.rating} size={14} />
                  <Text style={styles.dateText}>{formatDate(rev.created_at)}</Text>
                </View>
              </View>

              {/* Review Title */}
              {rev.title && (
                <Text style={styles.reviewTitle}>{rev.title}</Text>
              )}

              {/* Spoiler Mask or Body */}
              {rev.has_spoilers && !isSpoilerRevealed ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Review contains spoilers. Tap to reveal."
                  onPress={() => toggleSpoiler(rev.id)}
                  style={styles.spoilerBox}>
                  <AlertTriangle size={15} color="#8A8A8A" />
                  <Text style={styles.spoilerWarningText}>
                    Contains spoilers. Tap to reveal review.
                  </Text>
                  <ChevronDown size={14} color="#8A8A8A" />
                </Pressable>
              ) : (
                <Text style={styles.reviewBody}>{rev.body}</Text>
              )}

              {/* Footer info: upvotes & report button */}
              <View style={styles.reviewFooter}>
                {rev.upvotes_count ? (
                  <View style={styles.upvotesRow}>
                    <ThumbsUp size={12} color="#8A8A8A" />
                    <Text style={styles.upvotesText}>
                      {rev.upvotes_count} found this helpful
                    </Text>
                  </View>
                ) : (
                  <View style={{ flex: 1 }} />
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Report review by ${rev.user_name}`}
                  accessibilityHint="Flags this review for moderation"
                  onPress={() => {
                    try {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setReportingReview(rev);
                  }}
                  style={styles.reportBtn}>
                  <Flag size={12} color="#8A8A8A" />
                  <Text style={styles.reportBtnText}>Report</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {/* Moderation Report Modal */}
      {reportingReview ? (
        <ReportModal
          visible={Boolean(reportingReview)}
          targetType="review"
          targetId={reportingReview.id}
          targetTitle={reportingReview.title || `Review by ${reportingReview.user_name}`}
          onClose={() => setReportingReview(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    marginTop: 2,
  },
  writeButton: {
    paddingHorizontal: 12,
    height: 38,
    borderRadius: radius.full,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  writeButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    gap: 10,
  },
  reviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nameCol: {
    flex: 1,
    gap: 2,
  },
  displayNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  criticPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  criticText: {
    ...typography.mono,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  username: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },
  ratingWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dateText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 10,
  },
  reviewTitle: {
    ...typography.title,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  reviewBody: {
    ...typography.body,
    color: '#D4D4D4',
    fontSize: 13,
    lineHeight: 20,
  },
  spoilerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#141414',
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  spoilerWarningText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    flex: 1,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  upvotesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upvotesText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    justifyContent: 'center',
  },
  reportBtnText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    fontWeight: '600',
  },
});

