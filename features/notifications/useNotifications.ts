import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
} from './api';
import { AppNotification } from './types';

/**
 * Hook to fetch notifications for the user
 */
export function useNotifications(userId?: string | null) {
  return useQuery<AppNotification[]>({
    queryKey: ['notifications', userId || 'anonymous'],
    queryFn: () => fetchNotifications(userId || 'current-user'),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to fetch unread notification count
 */
export function useUnreadNotificationCount(userId?: string | null) {
  return useQuery<number>({
    queryKey: ['unreadNotificationCount', userId || 'anonymous'],
    queryFn: () => fetchUnreadCount(userId || 'current-user'),
    staleTime: 1000 * 15, // 15 seconds
  });
}

/**
 * Mutation to mark a single notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId }: { notificationId: string; userId?: string | null }) =>
      markAsRead(notificationId),
    onMutate: async ({ notificationId, userId }) => {
      const targetUser = userId || 'anonymous';
      await queryClient.cancelQueries({ queryKey: ['notifications', targetUser] });
      await queryClient.cancelQueries({ queryKey: ['unreadNotificationCount', targetUser] });

      const prevNotifications = queryClient.getQueryData<AppNotification[]>([
        'notifications',
        targetUser,
      ]);
      const prevCount = queryClient.getQueryData<number>([
        'unreadNotificationCount',
        targetUser,
      ]);

      // Optimistically update notifications list
      if (prevNotifications) {
        queryClient.setQueryData<AppNotification[]>(
          ['notifications', targetUser],
          prevNotifications.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
      }

      // Optimistically decrement count
      if (typeof prevCount === 'number' && prevCount > 0) {
        queryClient.setQueryData<number>(
          ['unreadNotificationCount', targetUser],
          Math.max(0, prevCount - 1)
        );
      }

      return { prevNotifications, prevCount };
    },
    onError: (_, variables, context) => {
      const targetUser = variables.userId || 'anonymous';
      if (context?.prevNotifications) {
        queryClient.setQueryData(['notifications', targetUser], context.prevNotifications);
      }
      if (typeof context?.prevCount === 'number') {
        queryClient.setQueryData(['unreadNotificationCount', targetUser], context.prevCount);
      }
    },
    onSettled: (_, __, variables) => {
      const targetUser = variables.userId || 'anonymous';
      void queryClient.invalidateQueries({ queryKey: ['notifications', targetUser] });
      void queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', targetUser] });
    },
  });
}

/**
 * Mutation to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => markAllAsRead(userId),
    onMutate: async ({ userId }) => {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      await queryClient.cancelQueries({ queryKey: ['notifications', userId] });
      await queryClient.cancelQueries({ queryKey: ['unreadNotificationCount', userId] });

      const prevNotifications = queryClient.getQueryData<AppNotification[]>([
        'notifications',
        userId,
      ]);
      const prevCount = queryClient.getQueryData<number>([
        'unreadNotificationCount',
        userId,
      ]);

      if (prevNotifications) {
        queryClient.setQueryData<AppNotification[]>(
          ['notifications', userId],
          prevNotifications.map((n) => ({ ...n, is_read: true }))
        );
      }

      queryClient.setQueryData<number>(['unreadNotificationCount', userId], 0);

      return { prevNotifications, prevCount };
    },
    onError: (_, { userId }, context) => {
      if (context?.prevNotifications) {
        queryClient.setQueryData(['notifications', userId], context.prevNotifications);
      }
      if (typeof context?.prevCount === 'number') {
        queryClient.setQueryData(['unreadNotificationCount', userId], context.prevCount);
      }
    },
    onSettled: (_, __, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      void queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', userId] });
    },
  });
}

/**
 * Supabase Realtime Subscription hook:
 * Subscribes to INSERT and UPDATE events on 'notifications' table for userId.
 * Automatically updates TanStack Query cache.
 */
export function useRealtimeNotifications(userId?: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as AppNotification;
          try {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}

          // 1. Immediately update notifications list cache
          queryClient.setQueryData<AppNotification[]>(
            ['notifications', userId],
            (old) => {
              if (!old) return [newNotification];
              if (old.some((n) => n.id === newNotification.id)) return old;
              return [newNotification, ...old];
            }
          );

          // 2. Immediately update unread count
          if (!newNotification.is_read) {
            queryClient.setQueryData<number>(
              ['unreadNotificationCount', userId],
              (oldCount) => (oldCount ?? 0) + 1
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as AppNotification;

          // 1. Update matching notification in list cache
          queryClient.setQueryData<AppNotification[]>(
            ['notifications', userId],
            (old) => {
              if (!old) return old;
              return old.map((n) =>
                n.id === updatedNotification.id ? { ...n, ...updatedNotification } : n
              );
            }
          );

          // 2. Recalculate unread count
          void queryClient.invalidateQueries({
            queryKey: ['unreadNotificationCount', userId],
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
