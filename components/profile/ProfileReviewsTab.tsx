import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, ThumbsUp, Plus } from 'lucide-react-native';
import { UserReviewEntry } from '@/features/account/types';
import { RatingStars } from '@/components/ui/RatingStars';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

interface ProfileReviewsTabProps {
  reviews: UserReviewEntry[];
  onWriteReviewPress?: () => void;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function ProfileReviewsTab({
  reviews,
  onWriteReviewPress,
}: ProfileReviewsTabProps) {
  const router = useRouter();
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          title="No Reviews Written Yet"
          description="Publish in-depth reviews, critique performances and cinematography, and engage with the Philippine cinema community."
        />
        {onWriteReviewPress && (
          <Button
            label="Write a Review"
            variant="primary"
            onPress={onWriteReviewPress}
            icon={<Plus size={16} color="#000000" />}
            style={styles.emptyCta}
          />
        )}
      </View>
    );
  }

  const handleFilmPress = (filmId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: filmId },
    });
  };

  const toggleSpoiler = (reviewId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setRevealedSpoilers((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.reviewsList}>
        {reviews.map((rev) => {
          const isSpoilerRevealed = revealedSpoilers[rev.id];
          const hasHiddenSpoiler = rev.has_spoilers && !isSpoilerRevealed;

          return (
            <View key={rev.id} style={styles.reviewCard}>
              {/* Film Header */}
              <View style={styles.filmHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Film poster for ${rev.film_title}`}
                  onPress={() => handleFilmPress(rev.film_id)}
                  style={styles.posterWrapper}>
                  <Image
                    source={{ uri: rev.poster_url || undefined }}
                    placeholder={{ blurhash: DEFAULT_BLURHASH }}
                    contentFit="cover"
                    style={styles.poster}
                  />
                </Pressable>

                <View style={styles.headerInfo}>
                  <Pressable onPress={() => handleFilmPress(rev.film_id)}>
                    <Text style={styles.filmTitle} numberOfLines={1}>
                      {rev.film_title}{' '}
                      <Text style={styles.releaseYear}>({rev.release_year})</Text>
                    </Text>
                  </Pressable>

                  <View style={styles.ratingRow}>
                    <RatingStars score={rev.rating} size={14} />
                    <Text style={styles.scoreText}>{rev.rating.toFixed(1)}</Text>
                    <Text style={styles.dateText}>
                      {new Date(rev.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  {rev.has_spoilers && (
                    <View style={styles.spoilerBadge}>
                      <AlertTriangle size={11} color="#FFFFFF" />
                      <Text style={styles.spoilerText}>Contains Spoilers</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Review Content */}
              <View style={styles.reviewContent}>
                {rev.title ? (
                  <Text style={styles.reviewTitle}>{rev.title}</Text>
                ) : null}

                {hasHiddenSpoiler ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Reveal spoiler content"
                    onPress={() => toggleSpoiler(rev.id)}
                    style={styles.spoilerBlurBox}>
                    <AlertTriangle size={16} color="#8A8A8A" />
                    <Text style={styles.spoilerWarningText}>
                      This review contains spoilers. Tap to read.
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={styles.reviewBody}>{rev.body}</Text>
                )}
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.upvotesWrap}>
                  <ThumbsUp size={13} color="#8A8A8A" />
                  <Text style={styles.upvotesText}>
                    {rev.upvotes_count} {rev.upvotes_count === 1 ? 'like' : 'likes'}
                  </Text>
                </View>

                {rev.has_spoilers && isSpoilerRevealed && (
                  <Pressable onPress={() => toggleSpoiler(rev.id)}>
                    <Text style={styles.hideSpoilerText}>Hide spoilers</Text>
                  </Pressable>
                )}
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyWrap: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyCta: {
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 260,
  },
  reviewsList: {
    gap: spacing.md,
  },
  reviewCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  filmHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  posterWrapper: {
    width: 52,
    height: 78,
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  filmTitle: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  releaseYear: {
    fontWeight: '400',
    color: '#8A8A8A',
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4D4D4',
  },
  dateText: {
    fontSize: 11,
    color: '#8A8A8A',
    marginLeft: 6,
  },
  spoilerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 6,
  },
  spoilerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  reviewContent: {
    marginTop: spacing.md,
  },
  reviewTitle: {
    ...typography.title,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  reviewBody: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: '#D4D4D4',
  },
  spoilerBlurBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  spoilerWarningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  upvotesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upvotesText: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  hideSpoilerText: {
    fontSize: 11,
    color: '#8A8A8A',
    textDecorationLine: 'underline',
  },
});

