import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/features/auth/AuthContext';
import { useIsFollowing, useToggleFollow } from '@/features/social/useFollow';
import { FollowTargetType } from '@/features/social/types';
import { radius, spacing, typography } from '@/lib/theme';

export interface FollowButtonProps {
  targetType: FollowTargetType;
  targetId: string;
  targetName?: string;
  initialIsFollowing?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  targetType,
  targetId,
  targetName,
  initialIsFollowing,
  size = 'md',
  style,
  onFollowChange,
}: FollowButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const { data: isFollowingQuery, isLoading: isQueryLoading } = useIsFollowing(
    targetType,
    targetId,
    user?.id
  );

  const toggleFollowMutation = useToggleFollow();

  // If query returned a value, use it; otherwise fallback to initialIsFollowing or false
  const isFollowing =
    isFollowingQuery !== undefined
      ? isFollowingQuery
      : initialIsFollowing !== undefined
      ? initialIsFollowing
      : false;

  const isPending = toggleFollowMutation.isPending;

  const handlePress = () => {
    // If not authenticated, route guest cleanly to login
    if (!isAuthenticated || !user) {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      router.push('/(auth)/login');
      return;
    }

    // Prevent toggling self
    if (targetType === 'user' && targetId === user.id) {
      return;
    }

    const nextState = !isFollowing;
    onFollowChange?.(nextState);

    toggleFollowMutation.mutate({
      followerId: user.id,
      targetType,
      targetId,
      currentlyFollowing: isFollowing,
    });
  };

  const isSelf = targetType === 'user' && user?.id === targetId;
  if (isSelf) {
    return null; // Cannot follow oneself
  }

  const isSmall = size === 'sm';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isFollowing
          ? `Unfollow ${targetName || targetType}`
          : `Follow ${targetName || targetType}`
      }
      accessibilityState={{ selected: isFollowing, busy: isPending }}
      onPress={handlePress}
      disabled={isPending}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [
        styles.base,
        isSmall ? styles.baseSmall : styles.baseMedium,
        isFollowing ? styles.followingBtn : styles.notFollowingBtn,
        pressed && (isFollowing ? styles.followingPressed : styles.notFollowingPressed),
        style,
      ]}>
      {isPending ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? '#FFFFFF' : '#000000'}
          style={styles.spinner}
        />
      ) : isFollowing ? (
        <>
          <Check size={isSmall ? 13 : 15} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={[styles.followingText, isSmall && styles.textSmall]}>
            Following
          </Text>
        </>
      ) : (
        <>
          <Plus size={isSmall ? 13 : 15} color="#000000" strokeWidth={2.5} />
          <Text style={[styles.notFollowingText, isSmall && styles.textSmall]}>
            Follow
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    gap: 6,
    // Minimum 44px tap target is ensured via hitSlop and container height
  },
  baseSmall: {
    height: 32,
    paddingHorizontal: 12,
    minWidth: 84,
  },
  baseMedium: {
    height: 38,
    paddingHorizontal: 16,
    minWidth: 102,
  },
  // When following: Outlined subtle dark pill
  followingBtn: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  followingPressed: {
    backgroundColor: '#1F1F1F',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  followingText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  // When not following: Solid high-contrast white pill
  notFollowingBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  notFollowingPressed: {
    backgroundColor: '#D4D4D4',
    borderColor: '#D4D4D4',
  },
  notFollowingText: {
    ...typography.caption,
    color: '#000000',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  textSmall: {
    fontSize: 12,
  },
  spinner: {
    marginHorizontal: 4,
  },
});

