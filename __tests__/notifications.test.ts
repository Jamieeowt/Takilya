import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  groupNotifications,
  calculateUnreadCount,
  getNotificationDeepLink,
} from '../features/notifications/utils.ts';
import type { AppNotification } from '../features/notifications/types.ts';

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

describe('Takilya Notifications Module (Prompt 4.5)', () => {
  it('correctly calculates unread notification count', () => {
    const unread = calculateUnreadCount(SAMPLE_NOTIFICATIONS);
    assert.equal(unread, 2, 'Should have exactly 2 unread notifications');

    const allRead = SAMPLE_NOTIFICATIONS.map((n) => ({ ...n, is_read: true }));
    assert.equal(calculateUnreadCount(allRead), 0, 'Should be 0 when all are marked read');
  });

  it('groups notifications chronologically into Today and Earlier', () => {
    const groups = groupNotifications(SAMPLE_NOTIFICATIONS);

    assert.equal(groups.length, 2, 'Should create 2 groups: Today and Earlier');
    assert.equal(groups[0].title, 'Today');
    assert.equal(groups[0].data.length, 2, 'Today group should contain 2 items');
    assert.equal(groups[0].data[0].id, 'notif-1');
    assert.equal(groups[0].data[1].id, 'notif-2');

    assert.equal(groups[1].title, 'Earlier');
    assert.equal(groups[1].data.length, 2, 'Earlier group should contain 2 items');
    assert.equal(groups[1].data[0].id, 'notif-3');
    assert.equal(groups[1].data[1].id, 'notif-4');
  });

  it('resolves correct deep-link target routes for each notification entity', () => {
    // 1. Film / trailer deep-link
    const trailerLink = getNotificationDeepLink(SAMPLE_NOTIFICATIONS[0]);
    assert.equal(trailerLink.pathname, '/film/[id]');
    assert.equal(trailerLink.params?.id, 'film-leonor-uuid');

    // 2. Thread / discussion deep-link
    const threadLink = getNotificationDeepLink(SAMPLE_NOTIFICATIONS[1]);
    assert.equal(threadLink.pathname, '/film/[id]');
    assert.equal(threadLink.params?.id, 'film-himala-uuid');

    // 3. Review vote deep-link
    const reviewLink = getNotificationDeepLink(SAMPLE_NOTIFICATIONS[2]);
    assert.equal(reviewLink.pathname, '/film/[id]');
    assert.equal(reviewLink.params?.id, 'film-maynila-uuid');

    // 4. Verification deep-link
    const verificationLink = getNotificationDeepLink(SAMPLE_NOTIFICATIONS[3]);
    assert.equal(verificationLink.pathname, '/settings');
  });

  it('verifies notification mutation state transitions', () => {
    // Single item read transition
    let list = [...SAMPLE_NOTIFICATIONS];
    const targetId = 'notif-1';
    list = list.map((n) => (n.id === targetId ? { ...n, is_read: true } : n));

    const updatedItem = list.find((n) => n.id === targetId);
    assert.equal(updatedItem?.is_read, true);
    assert.equal(calculateUnreadCount(list), 1);

    // Mark all as read transition
    list = list.map((n) => ({ ...n, is_read: true }));
    assert.equal(calculateUnreadCount(list), 0);
    assert.ok(list.every((n) => n.is_read));
  });

  it('handles empty notifications array gracefully', () => {
    const emptyGroups = groupNotifications([]);
    assert.deepEqual(emptyGroups, []);
    assert.equal(calculateUnreadCount([]), 0);
  });
});
