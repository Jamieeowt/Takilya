import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { FeedTrailerItem } from '../types';
import { useAuth } from '@/features/auth';

interface FeedCommentsModalProps {
  visible: boolean;
  item: FeedTrailerItem | null;
  onClose: () => void;
}

interface CommentEntry {
  id: string;
  author: string;
  role: string;
  timeAgo: string;
  body: string;
  likeCount: number;
}

export function FeedCommentsModal({ visible, item, onClose }: FeedCommentsModalProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<CommentEntry[]>([
    {
      id: 'c-1',
      author: 'sine_enthusiast',
      role: 'Cinephile',
      timeAgo: '2h ago',
      body: 'The cinematography here is peak Philippine cinema. Outstanding sound design as well!',
      likeCount: 24,
    },
    {
      id: 'c-2',
      author: 'film_critic_ph',
      role: 'Critic',
      timeAgo: '4h ago',
      body: 'One of the boldest narrative structures from any local film in the last decade.',
      likeCount: 58,
    },
    {
      id: 'c-3',
      author: 'regional_filmmaker',
      role: 'Filmmaker',
      timeAgo: '1d ago',
      body: 'Incredible regional authenticity. Proud to see our local dialects highlighted on the big screen.',
      likeCount: 31,
    },
  ]);

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment: CommentEntry = {
      id: `c-${Date.now()}`,
      author: user?.user_metadata?.username || 'You',
      role: 'Cinephile',
      timeAgo: 'Just now',
      body: commentText.trim(),
      likeCount: 0,
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText('');
  };

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdropTapArea} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragHandle} />
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>
                Discussion: {item.film_title}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close comments"
                onPress={onClose}
                hitSlop={8}
                style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </Pressable>
            </View>
            <Text style={styles.commentsCountText}>{comments.length} comments</Text>
          </View>

          {/* Comments List */}
          <FlatList
            data={comments}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.commentsList}
            renderItem={({ item: comment }) => (
              <View style={styles.commentItem}>
                <View style={styles.avatarMini}>
                  <Text style={styles.avatarInitial}>
                    {comment.author.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentMeta}>
                    <Text style={styles.authorName}>@{comment.author}</Text>
                    {comment.role === 'Critic' && (
                      <View style={styles.criticBadge}>
                        <Text style={styles.criticBadgeText}>CRITIC</Text>
                      </View>
                    )}
                    <Text style={styles.timeAgo}>{comment.timeAgo}</Text>
                  </View>
                  <Text style={styles.commentBody}>{comment.body}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Like comment"
                  style={styles.commentLikeBtn}
                  hitSlop={8}>
                  <Ionicons name="heart-outline" size={14} color={colors.text.tertiary} />
                  <Text style={styles.commentLikeCount}>{comment.likeCount}</Text>
                </Pressable>
              </View>
            )}
          />

          {/* Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              accessibilityLabel="Add to discussion"
              placeholder="Add your thoughts on this film..."
              placeholderTextColor={colors.text.tertiary}
              value={commentText}
              onChangeText={setCommentText}
              style={styles.textInput}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Post comment"
              onPress={handleAddComment}
              disabled={!commentText.trim()}
              style={[
                styles.sendBtn,
                !commentText.trim() && styles.sendBtnDisabled,
              ]}>
              <Ionicons
                name="send"
                size={16}
                color={commentText.trim() ? colors.text.inverse : colors.text.tertiary}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  backdropTapArea: {
    flex: 1,
  },
  sheetContainer: {
    height: '65%',
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    overflow: 'hidden',
  },
  sheetHeader: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.default,
    marginBottom: spacing.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    flex: 1,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsCountText: {
    fontSize: 12,
    color: colors.text.tertiary,
    alignSelf: 'flex-start',
  },
  commentsList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.gold.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gold.primary,
  },
  commentContent: {
    flex: 1,
    gap: 2,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  criticBadge: {
    backgroundColor: colors.gold.subtle,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  criticBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.gold.primary,
  },
  timeAgo: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  commentBody: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  commentLikeBtn: {
    alignItems: 'center',
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
  },
  commentLikeCount: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    borderColor: colors.border.default,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
    fontSize: 13,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.gold.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
});

