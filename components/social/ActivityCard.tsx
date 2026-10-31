import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import {
  Film,
  Star,
  MessageSquare,
  Bookmark,
  ListFilter,
  Heart,
  Share2,
  Lock,
} from 'lucide-react-native';

import { ActivityItem, ActivityType } from '@/features/social/types';
import { Avatar } from '@/components/ui/Avatar';
import { RatingStars } from '@/components/ui/RatingStars';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { radius, spacing, typography } from '@/lib/theme';

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

interface ActivityCardProps {
  item: ActivityItem;
  onLikePress: () => void;
  onCommentPress: () => void;
  onFilmPress: (filmId: string) => void;
  onUserPress?: (userId: string) => void;
  onSharePress: () => void;
}

export function ActivityCard({
  item,
  onLikePress,
  onCommentPress,
  onFilmPress,
  onUserPress,
  onSharePress,
}: ActivityCardProps) {
  const heartScale = useSharedValue(1);

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

  const getActionBadge = (type: ActivityType) => {
    switch (type) {
      case 'logged':
        return { label: 'LOGGED', icon: Film };
      case 'rated':
        return { label: 'RATED', icon: Star };
      case 'reviewed':
        return { label: 'REVIEWED', icon: MessageSquare };
      case 'watchlist':
        return { label: 'WATCHLIST', icon: Bookmark };
      case 'created_list':
        return { label: 'CREATED LIST', icon: ListFilter };
      default:
        return { label: 'ACTIVITY', icon: Film };
    }
  };

  const badgeInfo = getActionBadge(item.type);
  const ActionIcon = badgeInfo.icon;
  const isCritic = item.user.role === 'critic';
  const isVerified = item.user.role === 'verified_official' || isCritic || item.user.role === 'admin';

  return (
    <View style={styles.card}>
      {/* 1. Header: User Info & Action Type */}
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${item.user.name}'s profile`}
          onPress={() => onUserPress && onUserPress(item.user.id)}
          style={styles.userRow}>
          <Avatar
            url={item.user.avatar_url}
            name={item.user.name}
            size={38}
            isVerified={isVerified}
          />
          <View style={styles.userNameBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName} numberOfLines={1}>
                {item.user.name}
              </Text>
              {isCritic && (
                <View style={styles.criticPill}>
                  <Text style={styles.criticText}>CRITIC</Text>
                </View>
              )}
            </View>
            <Text style={styles.username}>@{item.user.username}</Text>
          </View>
        </Pressable>

        <View style={styles.actionBadgeCol}>
          <View style={styles.actionBadge}>
            <ActionIcon size={10} color="#FFFFFF" />
            <Text style={styles.actionBadgeText}>{badgeInfo.label}</Text>
          </View>
          <Text style={styles.timestamp}>{item.relative_time}</Text>
        </View>
      </View>

      {/* 2. Content: Film / List Info */}
      {item.film && (
        <View style={styles.filmContentRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View film ${item.film.title}`}
            onPress={() => item.film && onFilmPress(item.film.id)}
            style={styles.posterWrapper}>
            <Image
              source={{ uri: item.film.poster_url || undefined }}
              placeholder={{ blurhash: DEFAULT_BLURHASH }}
              contentFit="cover"
              style={styles.poster}
            />
          </Pressable>

          <View style={styles.filmDetailsCol}>
            <Pressable onPress={() => item.film && onFilmPress(item.film.id)}>
              <Text style={styles.filmTitle} numberOfLines={1}>
                {item.film.title}{' '}
                <Text style={styles.filmYear}>({item.film.release_year})</Text>
              </Text>
            </Pressable>

            {item.rating !== undefined && item.rating !== null && (
              <View style={styles.ratingRow}>
                <RatingStars score={item.rating} size={13} />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}

            {item.review?.title && (
              <Text style={styles.reviewHeadline} numberOfLines={1}>
                &ldquo;{item.review.title}&rdquo;
              </Text>
            )}

            {item.review?.body && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Read full review"
                onPress={onCommentPress}>
                <Text style={styles.reviewSnippet} numberOfLines={3}>
                  {item.review.body}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* If Activity is a Curated List */}
      {item.list && (
        <View style={styles.listContentBlock}>
          <View style={styles.listCollage}>
            {item.list.preview_posters.slice(0, 4).map((poster, pIdx) => (
              <View key={pIdx} style={styles.listCollageItem}>
                <Image
                  source={{ uri: poster }}
                  placeholder={{ blurhash: DEFAULT_BLURHASH }}
                  contentFit="cover"
                  style={styles.collageImg}
                />
              </View>
            ))}
          </View>

          <View style={styles.listDetails}>
            <Text style={styles.listTitle} numberOfLines={2}>
              {item.list.title}
            </Text>
            {item.list.description ? (
              <Text style={styles.listDesc} numberOfLines={2}>
                {item.list.description}
              </Text>
            ) : null}
            <View style={styles.filmCountBadge}>
              <Film size={10} color="#FFFFFF" />
              <Text style={styles.filmCountText}>{item.list.film_count} films</Text>
            </View>
          </View>
        </View>
      )}

      {/* 3. Action Bar: Like, Comments, Share */}
      <View style={styles.actionBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Like activity, currently ${item.likes_count} likes`}
          onPress={handleLike}
          style={styles.actionBtn}>
          <Animated.View style={heartAnimatedStyle}>
            <Heart
              size={17}
              color={item.is_liked ? '#FFFFFF' : '#8A8A8A'}
              fill={item.is_liked ? '#FFFFFF' : 'transparent'}
            />
          </Animated.View>
          <Text style={[styles.actionBtnText, item.is_liked && styles.actionBtnActiveText]}>
            {item.likes_count}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Comments, currently ${item.comments_count} comments`}
          onPress={onCommentPress}
          style={styles.actionBtn}>
          <MessageSquare size={17} color="#8A8A8A" />
          <Text style={styles.actionBtnText}>{item.comments_count}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share activity"
          onPress={onSharePress}
          style={styles.actionBtn}>
          <Share2 size={16} color="#8A8A8A" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  userNameBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    ...typography.title,
    fontSize: 14,
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
  username: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
  },
  actionBadgeCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  actionBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 10,
    color: '#8A8A8A',
  },
  filmContentRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  posterWrapper: {
    width: 64,
    height: 96,
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
  filmDetailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  filmTitle: {
    ...typography.title,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filmYear: {
    fontWeight: '400',
    color: '#8A8A8A',
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4D4D4',
  },
  reviewHeadline: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  reviewSnippet: {
    ...typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: '#8A8A8A',
    marginTop: 4,
  },
  listContentBlock: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  listCollage: {
    width: 68,
    height: 68,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: radius.xs,
    overflow: 'hidden',
  },
  listCollageItem: {
    width: '50%',
    height: '50%',
  },
  collageImg: {
    width: '100%',
    height: '100%',
  },
  listDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    ...typography.title,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listDesc: {
    ...typography.body,
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },
  filmCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  filmCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  actionBtnActiveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

