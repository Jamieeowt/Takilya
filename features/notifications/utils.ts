import type { AppNotification, NotificationGroup } from './types';

/**
 * Groups notifications chronologically into "Today" and "Earlier"
 */
export function groupNotifications(notifications: AppNotification[] = []): NotificationGroup[] {
  const now = new Date();
  const today: AppNotification[] = [];
  const earlier: AppNotification[] = [];

  notifications.forEach((item) => {
    const itemDate = new Date(item.created_at);
    const isSameDay =
      itemDate.getDate() === now.getDate() &&
      itemDate.getMonth() === now.getMonth() &&
      itemDate.getFullYear() === now.getFullYear();

    if (isSameDay) {
      today.push(item);
    } else {
      earlier.push(item);
    }
  });

  const groups: NotificationGroup[] = [];
  if (today.length > 0) {
    groups.push({ title: 'Today', data: today });
  }
  if (earlier.length > 0) {
    groups.push({ title: 'Earlier', data: earlier });
  }
  return groups;
}

/**
 * Calculates unread count from a list of notifications
 */
export function calculateUnreadCount(notifications: AppNotification[] = []): number {
  return notifications.filter((n) => !n.is_read).length;
}

/**
 * Resolves destination route for deep-linking when tapping a notification
 */
export function getNotificationDeepLink(item: AppNotification): {
  pathname: string;
  params?: Record<string, string>;
} {
  if (item.type === 'verification') {
    return { pathname: '/settings' };
  }

  if (item.entity_id) {
    return {
      pathname: '/film/[id]',
      params: { id: item.entity_id },
    };
  }

  return { pathname: '/(tabs)/explore' };
}

