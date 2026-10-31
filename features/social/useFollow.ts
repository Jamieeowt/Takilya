import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  checkIsFollowing,
  toggleFollow,
  fetchUserFollowing,
  fetchTargetFollowers,
  fetchFollowCounts,
} from './api';
import { FollowEntity, FollowTargetType, ToggleFollowPayload } from './types';

// ==============================================================================
// QUERY KEYS
// ==============================================================================

export const followQueryKeys = {
  all: ['follows'] as const,
  status: (targetType: FollowTargetType, targetId: string, followerId?: string | null) =>
    ['follow-status', targetType, targetId, followerId || 'anonymous'] as const,
  following: (userId?: string | null, targetType?: FollowTargetType) =>
    ['following', userId || 'anonymous', targetType || 'all'] as const,
  followers: (targetId?: string | null, targetType?: FollowTargetType) =>
    ['followers', targetId || 'anonymous', targetType || 'all'] as const,
  counts: (targetId?: string | null, targetType?: FollowTargetType) =>
    ['follow-counts', targetId || 'anonymous', targetType || 'user'] as const,
};

// ==============================================================================
// 1. USE IS FOLLOWING
// ==============================================================================

export function useIsFollowing(
  targetType: FollowTargetType,
  targetId: string,
  userId?: string | null
) {
  return useQuery({
    queryKey: followQueryKeys.status(targetType, targetId, userId),
    queryFn: async () => {
      if (!userId || !targetId) return false;
      return checkIsFollowing(userId, targetType, targetId);
    },
    enabled: Boolean(userId && targetId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ==============================================================================
// 2. USE FOLLOWING (List entities user follows)
// ==============================================================================

export function useFollowing(
  userId?: string | null,
  targetType?: FollowTargetType
) {
  return useQuery({
    queryKey: followQueryKeys.following(userId, targetType),
    queryFn: async () => {
      if (!userId) return [];
      return fetchUserFollowing(userId, targetType);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// ==============================================================================
// 3. USE FOLLOWERS (List followers of an entity)
// ==============================================================================

export function useFollowers(
  targetId?: string | null,
  targetType?: FollowTargetType
) {
  return useQuery({
    queryKey: followQueryKeys.followers(targetId, targetType),
    queryFn: async () => {
      if (!targetId) return [];
      return fetchTargetFollowers(targetId, targetType);
    },
    enabled: Boolean(targetId),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// ==============================================================================
// 4. USE FOLLOW COUNTS
// ==============================================================================

export function useFollowCounts(
  targetId?: string | null,
  targetType: FollowTargetType = 'user'
) {
  return useQuery({
    queryKey: followQueryKeys.counts(targetId, targetType),
    queryFn: async () => {
      if (!targetId) {
        return {
          followers: 0,
          following: { festivals: 0, studios: 0, people: 0, users: 0, total: 0 },
        };
      }
      return fetchFollowCounts(targetId, targetType);
    },
    enabled: Boolean(targetId),
    staleTime: 1000 * 60 * 5,
  });
}

// ==============================================================================
// 5. USE TOGGLE FOLLOW (Optimistic Mutation)
// ==============================================================================

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      followerId,
      targetType,
      targetId,
      currentlyFollowing,
    }: ToggleFollowPayload) => {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      return toggleFollow(followerId, targetType, targetId, currentlyFollowing);
    },

    onMutate: async ({ followerId, targetType, targetId, currentlyFollowing }) => {
      const statusKey = followQueryKeys.status(targetType, targetId, followerId);
      const followingKey = followQueryKeys.following(followerId, targetType);
      const allFollowingKey = followQueryKeys.following(followerId, undefined);

      // Cancel queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: statusKey });
      await queryClient.cancelQueries({ queryKey: followingKey });
      await queryClient.cancelQueries({ queryKey: allFollowingKey });

      // Snapshot previous state
      const previousStatus = queryClient.getQueryData<boolean>(statusKey);
      const previousFollowing = queryClient.getQueryData<FollowEntity[]>(followingKey);
      const previousAllFollowing = queryClient.getQueryData<FollowEntity[]>(allFollowingKey);

      const nextStatus = !currentlyFollowing;

      // Optimistically update status query
      queryClient.setQueryData<boolean>(statusKey, nextStatus);

      // Optimistically update following lists
      const updateList = (list?: FollowEntity[]) => {
        if (!list) return [];
        if (nextStatus) {
          // If followed, update or keep
          return list.map((item) =>
            item.id === targetId ? { ...item, is_following: true } : item
          );
        } else {
          // If unfollowed, filter out or set is_following false
          return list.map((item) =>
            item.id === targetId ? { ...item, is_following: false } : item
          );
        }
      };

      queryClient.setQueryData<FollowEntity[]>(followingKey, updateList(previousFollowing));
      queryClient.setQueryData<FollowEntity[]>(allFollowingKey, updateList(previousAllFollowing));

      return {
        previousStatus,
        previousFollowing,
        previousAllFollowing,
        statusKey,
        followingKey,
        allFollowingKey,
      };
    },

    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(context.statusKey, context.previousStatus);
        queryClient.setQueryData(context.followingKey, context.previousFollowing);
        queryClient.setQueryData(context.allFollowingKey, context.previousAllFollowing);
      }
    },

    onSettled: (_data, _err, { followerId, targetType, targetId }) => {
      // Invalidate target status and user lists
      queryClient.invalidateQueries({
        queryKey: followQueryKeys.status(targetType, targetId, followerId),
      });
      queryClient.invalidateQueries({
        queryKey: followQueryKeys.following(followerId),
      });
      queryClient.invalidateQueries({
        queryKey: followQueryKeys.followers(targetId),
      });
      queryClient.invalidateQueries({
        queryKey: followQueryKeys.counts(followerId),
      });
      queryClient.invalidateQueries({
        queryKey: ['user-profile', followerId],
      });
      // Invalidate For You feed so new content from followed entity surfaces immediately
      queryClient.invalidateQueries({
        queryKey: ['feed', 'for_you'],
      });
    },
  });
}

