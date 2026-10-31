import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MessageSquare, MessageCircle, ThumbsUp, Film } from 'lucide-react-native';
import { UserDiscussionItem } from '@/features/account/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

interface ProfileDiscussionsTabProps {
  discussions: UserDiscussionItem[];
  onStartDiscussionPress?: () => void;
  onSelectDiscussion?: (discussion: UserDiscussionItem) => void;
}

export function ProfileDiscussionsTab({
  discussions,
  onStartDiscussionPress,
  onSelectDiscussion,
}: ProfileDiscussionsTabProps) {
  if (!discussions || discussions.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare size={28} color="#8A8A8A" />}
        title="No Discussions Yet"
        description="Share analyses, theories, and critiques of Philippine cinema with the community."
        actionLabel={onStartDiscussionPress ? 'Start a Discussion' : undefined}
        onAction={onStartDiscussionPress}
        style={styles.emptyWrap}
      />
    );
  }

  const formatRelativeDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      {discussions.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`Discussion: ${item.title}`}
          onPress={() => {
            try {
              void Haptics.selectionAsync();
            } catch {}
            onSelectDiscussion?.(item);
          }}
          style={({ pressed }) => [
            styles.discussionCard,
            pressed && styles.discussionCardPressed,
          ]}>
          {/* Film Tag if attached */}
          {item.film_title && (
            <View style={styles.filmTag}>
              <Film size={12} color="#D4D4D4" />
              <Text style={styles.filmTagText} numberOfLines={1}>
                {item.film_title}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Body Preview */}
          <Text style={styles.body} numberOfLines={3}>
            {item.body}
          </Text>

          {/* Footer: Date & Engagement */}
          <View style={styles.footer}>
            <Text style={styles.dateText}>{formatRelativeDate(item.created_at)}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MessageCircle size={13} color="#8A8A8A" />
                <Text style={styles.metaText}>{item.comments_count}</Text>
              </View>

              <View style={styles.metaItem}>
                <ThumbsUp size={13} color="#8A8A8A" />
                <Text style={styles.metaText}>{item.upvotes_count}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  emptyWrap: {
    paddingVertical: spacing.xxl,
  },
  discussionCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  discussionCardPressed: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  filmTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#141414',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filmTagText: {
    ...typography.caption,
    fontSize: 11,
    color: '#D4D4D4',
    fontWeight: '600',
  },
  title: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 6,
  },
  body: {
    ...typography.body,
    fontSize: 13,
    color: '#8A8A8A',
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  dateText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.mono,
    fontSize: 11,
    color: '#8A8A8A',
  },
});

