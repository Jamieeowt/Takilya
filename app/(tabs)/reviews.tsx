import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { Badge } from '@/components/Badge';
import { useReviews } from '@/features/reviews/useReviews';
import { FilmReview } from '@/features/reviews/types';

export default function ReviewsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useReviews();
  const [filterRole, setFilterRole] = useState<'all' | 'critic' | 'user'>('all');

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.gold.primary} />
        <Text style={styles.loadingText}>Loading Philippine film reviews & discussions...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.status.error} />
        <Text style={styles.errorTitle}>Failed to load reviews</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry loading reviews"
          onPress={() => refetch()}
          style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const filteredReviews = data.reviews.filter((r) => {
    if (filterRole === 'all') return true;
    return r.author_role === filterRole;
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Featured Community Discussion */}
      <View style={styles.featuredDiscussionCard}>
        <View style={styles.discussionTopRow}>
          <Badge label="Active Discussion" variant="critic" />
          <View style={styles.commentCountRow}>
            <Ionicons name="chatbubbles-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.commentCountText}>
              {data.featuredDiscussion.comments_count} replies
            </Text>
          </View>
        </View>

        <Text style={styles.discussionFilm}>{data.featuredDiscussion.film_title}</Text>
        <Text style={styles.discussionTopic}>{data.featuredDiscussion.topic}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Join this discussion"
          style={styles.joinDiscussionBtn}>
          <Text style={styles.joinDiscussionText}>Join Discussion</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.gold.primary} />
        </Pressable>
      </View>

      {/* Dual Rating Filter Segment */}
      <View style={styles.segmentContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show all reviews"
          onPress={() => setFilterRole('all')}
          style={[styles.segmentBtn, filterRole === 'all' && styles.segmentBtnActive]}>
          <Text style={[styles.segmentText, filterRole === 'all' && styles.segmentTextActive]}>
            All ({data.reviews.length})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter by critic reviews only"
          onPress={() => setFilterRole('critic')}
          style={[styles.segmentBtn, filterRole === 'critic' && styles.segmentBtnActive]}>
          <Ionicons
            name="star"
            size={12}
            color={filterRole === 'critic' ? colors.gold.primary : colors.text.tertiary}
          />
          <Text style={[styles.segmentText, filterRole === 'critic' && styles.segmentTextActive]}>
            Critics
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter by audience reviews only"
          onPress={() => setFilterRole('user')}
          style={[styles.segmentBtn, filterRole === 'user' && styles.segmentBtnActive]}>
          <Ionicons
            name="people"
            size={12}
            color={filterRole === 'user' ? colors.film.audienceScore : colors.text.tertiary}
          />
          <Text style={[styles.segmentText, filterRole === 'user' && styles.segmentTextActive]}>
            Audience
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderReviewItem = ({ item }: { item: FilmReview }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTopRow}>
        <View style={styles.authorGroup}>
          <Text style={styles.authorName}>{item.author_name}</Text>
          <Badge
            label={item.author_role === 'critic' ? 'Verified Critic' : 'Audience'}
            variant={item.author_role === 'critic' ? 'critic' : 'audience'}
          />
        </View>

        <View style={styles.ratingBox}>
          <Ionicons name="star" size={14} color={colors.gold.primary} />
          <Text style={styles.ratingNumber}>{item.rating} / 5</Text>
        </View>
      </View>

      <Text style={styles.reviewFilmTitle}>{item.film_title}</Text>
      <Text style={styles.reviewContent}>{item.content}</Text>

      {item.awards_mentioned && item.awards_mentioned.length > 0 && (
        <View style={styles.awardsRow}>
          {item.awards_mentioned.map((award) => (
            <Badge key={award} label={award} variant="critic" />
          ))}
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{item.created_at}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Helpful review"
          style={styles.helpfulBtn}
          hitSlop={8}>
          <Ionicons name="thumbs-up-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.helpfulText}>Helpful</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderReviewItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              void refetch();
            }}
            tintColor={colors.gold.primary}
          />
        }
      />

      {/* Floating Write Review Action Button (min 44px target) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Write a film review"
        style={styles.fab}>
        <Ionicons name="create-outline" size={20} color={colors.text.inverse} />
        <Text style={styles.fabText}>Write Review</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 80,
    gap: spacing.lg,
  },
  headerContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xs,
  },
  featuredDiscussionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  discussionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentCountText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  discussionFilm: {
    ...typography.titleSmall,
    color: colors.text.primary,
  },
  discussionTopic: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  joinDiscussionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    minHeight: 44,
  },
  joinDiscussionText: {
    color: colors.gold.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xs,
    padding: 3,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    gap: 4,
    borderRadius: radius.xs,
  },
  segmentBtnActive: {
    backgroundColor: colors.background.tertiary,
  },
  segmentText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: colors.text.primary,
  },
  reviewCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  reviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    color: colors.gold.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  reviewFilmTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  reviewContent: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 21,
  },
  awardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: colors.border.subtle,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    minWidth: 44,
  },
  helpfulText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: colors.gold.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontSize: 14,
  },
  errorTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.gold.primary,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.xs,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 14,
  },
});
