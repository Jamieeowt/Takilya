import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import {
  X,
  Heart,
  Share2,
  Send,
  AtSign,
  AlertTriangle,
} from 'lucide-react-native';

import { ActivityItem } from '@/features/social/types';
import { useReviewComments, useAddReviewComment } from '@/features/social/useActivity';
import { Avatar } from '@/components/ui/Avatar';
import { RatingStars } from '@/components/ui/RatingStars';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { radius, spacing, typography } from '@/lib/theme';

interface ReviewDetailModalProps {
  visible: boolean;
  activityItem: ActivityItem | null;
  currentUserId?: string;
  onClose: () => void;
  onLikePress: () => void;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function ReviewDetailModal({
  visible,
  activityItem,
  currentUserId,
  onClose,
  onLikePress,
}: ReviewDetailModalProps) {
  const [newCommentText, setNewCommentText] = useState('');
  const heartScale = useSharedValue(1);

  const reviewId = activityItem?.review?.id || activityItem?.id || '';
  const { data: comments = [], isLoading: isCommentsLoading } = useReviewComments(reviewId);
  const addCommentMutation = useAddReviewComment();

  if (!activityItem) return null;

  const isCritic = activityItem.user.role === 'critic';
  const isVerified = activityItem.user.role === 'verified_official' || isCritic || activityItem.user.role === 'admin';

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleLike = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    heartScale.value = withSpring(1.3, { damping: 4, stiffness: 300 }, () => {
      heartScale.value = withSpring(1);
    });
    onLikePress();
  };

  const handleShare = async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        title: `Review of ${activityItem.film?.title || 'Philippine Film'} by ${activityItem.user.name}`,
        message: `"${activityItem.review?.title || activityItem.review?.body}" — ${activityItem.user.name} on Takilya`,
      });
    } catch {}
  };

  const handleAddMention = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setNewCommentText((prev) => prev + (prev.endsWith(' ') || prev.length === 0 ? '@' : ' @'));
  };

  const handleSendComment = () => {
    if (!newCommentText.trim() || !currentUserId) return;
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    addCommentMutation.mutate({
      userId: currentUserId,
      reviewId,
      body: newCommentText.trim(),
    });

    setNewCommentText('');
  };

  // Helper to render text with @mentions highlighted
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return (
      <Text style={styles.commentBodyText}>
        {parts.map((part, i) => {
          if (part.startsWith('@')) {
            return (
              <Text key={i} style={styles.mentionHighlight}>
                {part}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss review details"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View style={styles.sheetContent}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.headerBtn}>
              <X size={20} color="#8A8A8A" />
            </Pressable>

            <Text style={styles.headerTitle}>Review & Discussion</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share review"
              onPress={handleShare}
              style={styles.headerBtn}>
              <Share2 size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Film & Author Metadata Row */}
            <View style={styles.filmMetadataRow}>
              {activityItem.film && (
                <View style={styles.filmPosterWrapper}>
                  <Image
                    source={{ uri: activityItem.film.poster_url || undefined }}
                    placeholder={{ blurhash: DEFAULT_BLURHASH }}
                    contentFit="cover"
                    style={styles.poster}
                  />
                </View>
              )}

              <View style={styles.filmInfo}>
                {activityItem.film && (
                  <Text style={styles.filmTitle}>
                    {activityItem.film.title}{' '}
                    <Text style={styles.filmYear}>({activityItem.film.release_year})</Text>
                  </Text>
                )}

                <View style={styles.authorRow}>
                  <Avatar
                    url={activityItem.user.avatar_url}
                    name={activityItem.user.name}
                    size={28}
                    isVerified={isVerified}
                  />
                  <View>
                    <View style={styles.nameRow}>
                      <Text style={styles.authorName}>{activityItem.user.name}</Text>
                      {isCritic && (
                        <View style={styles.criticPill}>
                          <Text style={styles.criticText}>CRITIC</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.authorHandle}>@{activityItem.user.username}</Text>
                  </View>
                </View>

                {activityItem.rating !== undefined && (
                  <View style={styles.ratingRow}>
                    <RatingStars score={activityItem.rating} size={15} />
                    <Text style={styles.ratingScore}>{activityItem.rating.toFixed(1)} / 5.0</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Review Title & Body */}
            {activityItem.review?.title && (
              <Text style={styles.reviewFullTitle}>{activityItem.review.title}</Text>
            )}

            <Text style={styles.reviewFullBody}>
              {activityItem.review?.body || 'No review content'}
            </Text>

            {/* Like & Interaction Bar */}
            <View style={styles.reactionBar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Like review, currently ${activityItem.likes_count} likes`}
                onPress={handleLike}
                style={styles.likeBtn}>
                <Animated.View style={heartAnimatedStyle}>
                  <Heart
                    size={18}
                    color={activityItem.is_liked ? '#FFFFFF' : '#8A8A8A'}
                    fill={activityItem.is_liked ? '#FFFFFF' : 'transparent'}
                  />
                </Animated.View>
                <Text
                  style={[
                    styles.likeCountText,
                    activityItem.is_liked && styles.likeCountActive,
                  ]}>
                  {activityItem.likes_count} {activityItem.likes_count === 1 ? 'like' : 'likes'}
                </Text>
              </Pressable>

              <Text style={styles.postedTime}>{activityItem.relative_time}</Text>
            </View>

            {/* Comment Thread Divider */}
            <View style={styles.commentsHeaderRow}>
              <Text style={styles.commentsHeading}>
                Replies ({comments.length})
              </Text>
            </View>

            {/* Comments List */}
            <View style={styles.commentsList}>
              {comments.map((c) => (
                <View key={c.id} style={styles.commentItem}>
                  <Avatar
                    url={c.user.avatar_url}
                    name={c.user.name}
                    size={32}
                    isVerified={c.user.role === 'critic' || c.user.role === 'verified_official'}
                  />
                  <View style={styles.commentRight}>
                    <View style={styles.commentUserRow}>
                      <Text style={styles.commentUserName}>{c.user.name}</Text>
                      <Text style={styles.commentTime}>{c.created_at}</Text>
                    </View>
                    {renderFormattedText(c.body)}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Comment Input Bar */}
          <View style={styles.inputBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mention user"
              onPress={handleAddMention}
              style={styles.mentionBtn}>
              <AtSign size={18} color="#8A8A8A" />
            </Pressable>

            <TextInput
              value={newCommentText}
              onChangeText={setNewCommentText}
              placeholder="Add to discussion... (@username)"
              placeholderTextColor="#8A8A8A"
              style={styles.textInput}
              multiline
              maxLength={500}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send comment"
              disabled={!newCommentText.trim() || addCommentMutation.isPending}
              onPress={handleSendComment}
              style={[
                styles.sendBtn,
                !newCommentText.trim() && styles.sendBtnDisabled,
              ]}>
              <Send
                size={16}
                color={newCommentText.trim() ? '#000000' : '#8A8A8A'}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContent: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: radius.cardLarge,
    borderTopRightRadius: radius.cardLarge,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: '#2E2E2E',
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  filmMetadataRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  filmPosterWrapper: {
    width: 68,
    height: 102,
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  filmInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  filmTitle: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filmYear: {
    fontWeight: '400',
    color: '#8A8A8A',
    fontSize: 13,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  criticPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.full,
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  criticText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  authorHandle: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4D4D4',
  },
  reviewFullTitle: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  reviewFullBody: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: '#D4D4D4',
    marginTop: spacing.xs,
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  likeCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  likeCountActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  postedTime: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  commentsHeaderRow: {
    paddingVertical: spacing.md,
  },
  commentsHeading: {
    ...typography.title,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  commentsList: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  commentItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  commentRight: {
    flex: 1,
    backgroundColor: '#141414',
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  commentUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  commentTime: {
    fontSize: 10,
    color: '#8A8A8A',
  },
  commentBodyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#D4D4D4',
  },
  mentionHighlight: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#0A0A0A',
    gap: spacing.xs,
  },
  mentionBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#2E2E2E',
  },
});

