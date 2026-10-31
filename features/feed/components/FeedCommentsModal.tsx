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
import * as Haptics from 'expo-haptics';
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
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

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
        {/* Backdrop tap to dismiss */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss comments sheet"
          style={styles.backdropTapArea}
          onPress={onClose}
        />

        {/* Bottom Sheet Container */}
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragHandle} />
            <View style={styles.headerTitleRow}>
              <View style={styles.titleCol}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Discussion: {item.film_title}
                </Text>
                <Text style={styles.commentsCountText}>{comments.length} comments</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close comments"
                onPress={() => {
                  try {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  onClose();
                }}
                hitSlop={8}
                style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
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
                  <Ionicons name="heart-outline" size={14} color="#8A8A8A" />
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
              placeholderTextColor="#8A8A8A"
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
                styles.postBtn,
                !commentText.trim() && styles.postBtnDisabled,
              ]}>
              <Text
                style={[
                  styles.postBtnText,
                  !commentText.trim() && styles.postBtnTextDisabled,
                ]}>
                Post
              </Text>
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  backdropTapArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: radius.cardLarge,
    borderTopRightRadius: radius.cardLarge,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderTopWidth: 1,
    height: '65%',
    maxHeight: 580,
  },
  sheetHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8A8A8A',
    marginBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  commentsCountText: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
    backgroundColor: '#1F1F1F',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
  criticBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  criticBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
  },
  timeAgo: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  commentBody: {
    fontSize: 13,
    color: '#D4D4D4',
    lineHeight: 18,
  },
  commentLikeBtn: {
    alignItems: 'center',
    gap: 2,
    paddingTop: 2,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  commentLikeCount: {
    fontSize: 10,
    color: '#8A8A8A',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderTopWidth: 1,
    backgroundColor: '#0A0A0A',
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    color: '#FFFFFF',
    fontSize: 13,
  },
  postBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: radius.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postBtnDisabled: {
    backgroundColor: '#1F1F1F',
  },
  postBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 13,
  },
  postBtnTextDisabled: {
    color: '#8A8A8A',
  },
});
