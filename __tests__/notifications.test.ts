import {
  groupNotifications,
  calculateUnreadCount,
  getNotificationDeepLink,
} from '../features/notifications/utils';
import type { AppNotification } from '../features/notifications/types';

const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    user_id: 'user-123',
    actor_id: 'actor-martika',
    actor_name: 'Martika Ramirez Escobar',
    type: 'official_post',
    entity_type: 'trailer',
    entity_id: 'film-leonor-uuid',
    title: 'New Official Clip',
    message: 'Martika posted an official clip for Leonor Will Never Die.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago (Today)
  },
  {
    id: 'notif-2',
    user_id: 'user-123',
    actor_id: 'actor-critic',
    actor_name: 'Richard Bolisay',
    type: 'reply',
    entity_type: 'thread',
    entity_id: 'film-himala-uuid',
    title: 'New Reply',
    message: 'Richard Bolisay replied to your comment on Himala.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago (Today)
  },
  {
    id: 'notif-3',
    user_id: 'user-123',
    actor_id: 'actor-user',
    actor_name: 'Manunuri Cinephile',
    type: 'review_vote',
    entity_type: 'review',
    entity_id: 'film-maynila-uuid',
    title: 'Review Upvoted',
    message: 'Your review of Maynila sa mga Kuko ng Liwanag received 12 upvotes.',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago (Earlier)
  },
  {
    id: 'notif-4',
    user_id: 'user-123',
    actor_id: null,
    actor_name: 'Takilya Official',
    type: 'verification',
    entity_type: 'film',
    entity_id: 'film-cleaners-uuid',
    title: 'Verification Approved',
    message: 'Your official studio badge has been verified by Takilya admins.',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago (Earlier)
  },
];

describe('Takilya Notifications Module (Prompt 4.5 & 5.1)', () => {
  it('correctly calculates unread notification count', () => {
    const unread = calculateUnreadCount(SAMPLE_NOTIFICATIONS);
    expect(unread).toBe(2);

    const allRead = SAMPLE_NOTIFICATIONS.map((n) => ({ ...n, is_read: true }));
    expect(calculateUnreadCount(allRead)).toBe(0);
  });

  it('groups notifications chronologically into Today and Earlier', () => {
    const groups = groupNotifications(SAMPLE_NOTIFICATIONS);

    expect(groups.length).toBe(2);
    expect(groups[0].title).toBe('Today');
    expect(groups[0].data.length).toBe(2);
    expect(groups[0].data[0].id).toBe('notif-1');
    expect(groups[0].data[1].id).toBe('notif-2');

    expect(groups[1].title).toBe('Earlier');
    expect(groups[1].data.length).toBe(2);
    expect(groups[1].data[0].id).toBe('notif-3');
    expect(groups[1].data[1].id).toBe('notif-4');
  });

  it('resolves correct deep-link target routes for each notification entity', () => {
    // 1. Film / trailer deep-link
    const trailerLink = getNotificationDeepLink(SAMPLE_NOTIFICATIONS[0]);
    expect(trailerLink.pathname).toBe('/film/[id]');
    expect(trailerLink.params?.id).toBe('film-leonor-uuid');

    // 2. Thread / discussion deep-link
    const threadLink = getNotificationDeepLink(SAMPLE_NOTIFICATIONS[1]);
    expect(threadLink.pathname).toBe('/film/[id]');
    expect(threadLink.params?.id).toBe('film-himala-uuid');

    // 3. Review vote deep-link
    const reviewLink = getNotificationDeepLink(SAMPLE_NOTIFICATIONS[2]);
    expect(reviewLink.pathname).toBe('/film/[id]');
    expect(reviewLink.params?.id).toBe('film-maynila-uuid');

    // 4. Verification deep-link
    const verificationLink = getNotificationDeepLink(SAMPLE_NOTIFICATIONS[3]);
    expect(verificationLink.pathname).toBe('/settings');
  });

  it('verifies notification mutation state transitions', () => {
    // Single item read transition
    let list = [...SAMPLE_NOTIFICATIONS];
    const targetId = 'notif-1';
    list = list.map((n) => (n.id === targetId ? { ...n, is_read: true } : n));

    const updatedItem = list.find((n) => n.id === targetId);
    expect(updatedItem?.is_read).toBe(true);
    expect(calculateUnreadCount(list)).toBe(1);

    // Mark all as read transition
    list = list.map((n) => ({ ...n, is_read: true }));
    expect(calculateUnreadCount(list)).toBe(0);
    expect(list.every((n) => n.is_read)).toBe(true);
  });

  it('handles empty notifications array gracefully', () => {
    const emptyGroups = groupNotifications([]);
    expect(emptyGroups).toEqual([]);
    expect(calculateUnreadCount([])).toBe(0);
  });
});
