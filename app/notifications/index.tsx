import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  CheckCheck,
  BellOff,
  MessageSquare,
  Heart,
  Film,
  ShieldCheck,
  Bell,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useAuth } from '@/features/auth';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useRealtimeNotifications,
  groupNotifications,
  getNotificationDeepLink,
  AppNotification,
  NotificationGroup,
  NotificationType,
} from '@/features/notifications';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { radius, spacing, typography } from '@/lib/theme';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  // TanStack Query & Realtime
  const {
    data: notifications = [],
    isLoading,
    refetch,
    isRefetching,
  } = useNotifications(user?.id);

  const { data: unreadCount = 0 } = useUnreadNotificationCount(user?.id);
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  // Active Realtime Subscription
  useRealtimeNotifications(user?.id);

  // Group notifications into "Today" and "Earlier"
  const groupedData: NotificationGroup[] = useMemo(() => {
    return groupNotifications(notifications);
  }, [notifications]);

  const handleMarkAllRead = () => {
    if (!user?.id || unreadCount === 0) return;
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    markAllMutation.mutate({ userId: user.id });
  };

  const handleNotificationPress = (item: AppNotification) => {
    try {
      void Haptics.selectionAsync();
    } catch {}

    // 1. Mark as read if not already read
    if (!item.is_read) {
      markReadMutation.mutate({
        notificationId: item.id,
        userId: user?.id,
      });
    }

    // 2. Deep-link navigation
    const target = getNotificationDeepLink(item);
    router.push(target as any);
  };

  const formatRelativeTime = (isoString: string): string => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const renderTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'reply':
        return <MessageSquare size={13} color="#FFFFFF" />;
      case 'review_vote':
        return <Heart size={13} color="#FFFFFF" />;
      case 'official_post':
        return <Film size={13} color="#FFFFFF" />;
      case 'verification':
        return <ShieldCheck size={13} color="#FFFFFF" />;
      default:
        return <Bell size={13} color="#FFFFFF" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Header */}
      <GlassHeader
        title="Notifications"
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.backBtn}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
        }
        right={
          unreadCount > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications as read"
              onPress={handleMarkAllRead}
              style={styles.markAllBtn}>
              <CheckCheck size={17} color="#FFFFFF" />
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          ) : null
        }
      />

      {/* 2. Content */}
      {isLoading && !isRefetching ? (
        <View style={[styles.skeletonContainer, { paddingTop: insets.top + 60 }]}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <SkeletonLoader width={42} height={42} borderRadius={21} />
              <View style={styles.skeletonTextCol}>
                <SkeletonLoader width="60%" height={14} />
                <SkeletonLoader width="90%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon={<BellOff size={28} color="#FFFFFF" />}
            title="No Notifications"
            description="You are all caught up! Official trailer releases, discussion replies, and community recognition will appear here."
            actionLabel="Explore Philippine Films"
            onAction={() => router.push('/(tabs)/explore' as any)}
          />
        </View>
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={(group) => group.title}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: insets.top + 60, paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor="#FFFFFF"
            />
          }
          renderItem={({ item: group }) => (
            <View style={styles.groupSection}>
              {/* Group Title (Today / Earlier) */}
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitleText}>{group.title}</Text>
              </View>

              {/* Group Notifications */}
              <View style={styles.groupList}>
                {group.data.map((notification) => {
                  const isUnread = !notification.is_read;

                  return (
                    <Pressable
                      key={notification.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${isUnread ? 'Unread: ' : ''}${notification.title}. ${notification.message}`}
                      onPress={() => handleNotificationPress(notification)}
                      style={[
                        styles.notificationCard,
                        isUnread ? styles.unreadCard : styles.readCard,
                      ]}>
                      {/* Left: Avatar or Type Icon */}
                      <View style={styles.avatarWrapper}>
                        {notification.actor_avatar ? (
                          <Image
                            source={{ uri: notification.actor_avatar }}
                            style={styles.actorAvatar}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.defaultAvatarCircle}>
                            {renderTypeIcon(notification.type)}
                          </View>
                        )}
                        <View style={styles.typeBadgeCircle}>
                          {renderTypeIcon(notification.type)}
                        </View>
                      </View>

                      {/* Middle: Content */}
                      <View style={styles.contentCol}>
                        <View style={styles.metaRow}>
                          <Text
                            style={[
                              styles.notificationTitle,
                              isUnread ? styles.titleUnread : styles.titleRead,
                            ]}
                            numberOfLines={1}>
                            {notification.title || 'Notification'}
                          </Text>
                          <Text style={styles.timeText}>
                            {formatRelativeTime(notification.created_at)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.messageText,
                            isUnread ? styles.messageUnread : styles.messageRead,
                          ]}
                          numberOfLines={2}>
                          {notification.message}
                        </Text>
                      </View>

                      {/* Right: Unread Indicator Dot */}
                      {isUnread && <View style={styles.unreadDot} />}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  markAllText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skeletonContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  skeletonTextCol: {
    flex: 1,
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  groupSection: {
    marginBottom: spacing.lg,
  },
  groupHeader: {
    marginBottom: spacing.xs,
    paddingHorizontal: 4,
  },
  groupTitleText: {
    ...typography.title,
    fontSize: 13,
    fontWeight: '800',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  groupList: {
    gap: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  unreadCard: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  readCard: {
    backgroundColor: '#0A0A0A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatarWrapper: {
    position: 'relative',
    width: 44,
    height: 44,
  },
  actorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F1F1F',
  },
  defaultAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typeBadgeCircle: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  contentCol: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 14,
    flex: 1,
  },
  titleUnread: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  titleRead: {
    fontWeight: '600',
    color: '#D4D4D4',
  },
  timeText: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageUnread: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  messageRead: {
    color: '#8A8A8A',
    fontWeight: '400',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginLeft: 4,
  },
});
