export type NotificationType =
  | 'reply'
  | 'review_vote'
  | 'official_post'
  | 'verification';

export type NotificationEntityType =
  | 'film'
  | 'thread'
  | 'comment'
  | 'review'
  | 'trailer';

export interface AppNotification {
  id: string;
  user_id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  actor_username?: string | null;
  actor_avatar?: string | null;
  type: NotificationType;
  entity_type?: NotificationEntityType | null;
  entity_id?: string | null;
  title?: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

export interface NotificationGroup {
  title: string;
  data: AppNotification[];
}
