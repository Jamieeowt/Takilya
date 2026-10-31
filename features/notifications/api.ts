import { supabase } from '@/lib/supabase';
import { AppNotification } from './types';

// ==============================================================================
// SEED FALLBACK NOTIFICATIONS (Philippine Cinema Centered)
// ==============================================================================

const FALLBACK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    user_id: 'current-user',
    actor_id: 'aaaaaaaa-0004-0000-0000-000000000000',
    actor_name: 'Martika Ramirez Escobar',
    actor_username: 'martika_reyes',
    actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    type: 'official_post',
    entity_type: 'trailer',
    entity_id: 'cccccccc-0003-0000-0000-000000000000',
    title: 'New Official Clip',
    message: 'Martika Ramirez Escobar uploaded an official behind-the-scenes clip for "Leonor Will Never Die".',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago (Today)
  },
  {
    id: 'notif-2',
    user_id: 'current-user',
    actor_id: 'user-critic-1',
    actor_name: 'Richard Bolisay',
    actor_username: 'lilokpelikula',
    actor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    type: 'reply',
    entity_type: 'thread',
    entity_id: 'cccccccc-0001-0000-0000-000000000000',
    title: 'New Reply on Discussion',
    message: 'Richard Bolisay replied to your comment in "Allegorical subtexts in Himala\'s sand dunes".',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago (Today)
  },
  {
    id: 'notif-3',
    user_id: 'current-user',
    actor_id: 'user-cinephile-2',
    actor_name: 'Manunuri Collective',
    actor_username: 'pelikulaph',
    actor_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    type: 'review_vote',
    entity_type: 'review',
    entity_id: 'cccccccc-0002-0000-0000-000000000000',
    title: 'Review Upvoted',
    message: 'Manunuri Collective and 12 other cinephiles found your review of "Maynila sa mga Kuko ng Liwanag" helpful.',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago (Today)
  },
  {
    id: 'notif-4',
    user_id: 'current-user',
    actor_id: null,
    actor_name: 'Takilya Curators',
    actor_username: 'takilya_official',
    actor_avatar: null,
    type: 'verification',
    entity_type: 'film',
    entity_id: 'cccccccc-0005-0000-0000-000000000000',
    title: 'Verification Request Approved',
    message: 'Your official verification request for Glenn Barit\'s production outfit has been approved.',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // Yesterday (Earlier)
  },
  {
    id: 'notif-5',
    user_id: 'current-user',
    actor_id: 'dddddddd-0001-0000-0000-000000000000',
    actor_name: 'Cinemalaya Film Festival',
    actor_username: 'cinemalaya_official',
    actor_avatar: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&q=80',
    type: 'official_post',
    entity_type: 'film',
    entity_id: 'cccccccc-0004-0000-0000-000000000000',
    title: 'Official Selection Announcement',
    message: 'Cinemalaya 15 added "John Denver Trending" to the Main Competition section.',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago (Earlier)
  },
];

let localNotificationsCache: AppNotification[] = [...FALLBACK_NOTIFICATIONS];

/**
 * Fetches notifications for user with fallback to seed data
 */
export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        actor_id,
        type,
        entity_type,
        entity_id,
        title,
        message,
        is_read,
        created_at,
        actor:profiles!actor_id(
          display_name,
          username,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        actor_id: item.actor_id,
        actor_name: item.actor?.display_name || null,
        actor_username: item.actor?.username || null,
        actor_avatar: item.actor?.avatar_url || null,
        type: item.type,
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        title: item.title,
        message: item.message,
        is_read: Boolean(item.is_read),
        created_at: item.created_at,
      }));
    }
  } catch (err) {
    console.warn('fetchNotifications error, fallback to local cache:', err);
  }

  // Fallback
  return localNotificationsCache;
}

/**
 * Fetches the exact unread notification count
 */
export async function fetchUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (!error && count !== null) {
      return count;
    }
  } catch (err) {
    console.warn('fetchUnreadCount error:', err);
  }

  // Fallback
  return localNotificationsCache.filter((n) => !n.is_read).length;
}

/**
 * Marks a single notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.warn('markAsRead Supabase error:', error);
    }
  } catch (err) {
    console.warn('markAsRead error:', err);
  }

  // Update fallback cache
  localNotificationsCache = localNotificationsCache.map((n) =>
    n.id === notificationId ? { ...n, is_read: true } : n
  );
}

/**
 * Marks all notifications as read for the user
 */
export async function markAllAsRead(userId: string): Promise<number> {
  let updatedCount = 0;
  try {
    // 1. Try atomic RPC
    const { data, error } = await supabase.rpc('mark_all_notifications_read', {
      target_user_id: userId,
    });

    if (!error && data !== null) {
      updatedCount = Number(data);
    } else {
      // 2. Direct update fallback
      const { data: updateData, error: updateErr } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select('id');

      if (!updateErr && updateData) {
        updatedCount = updateData.length;
      }
    }
  } catch (err) {
    console.warn('markAllAsRead error:', err);
  }

  // Update fallback cache
  localNotificationsCache = localNotificationsCache.map((n) => ({
    ...n,
    is_read: true,
  }));

  return updatedCount;
}
