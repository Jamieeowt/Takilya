import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/features/auth';
import { useUnreadNotificationCount, useRealtimeNotifications } from '@/features/notifications';
import { radius } from '@/lib/theme';

interface NotificationBellButtonProps {
  style?: ViewStyle;
  iconSize?: number;
  color?: string;
}

export function NotificationBellButton({
  style,
  iconSize = 20,
  color = '#FFFFFF',
}: NotificationBellButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: unreadCount = 0 } = useUnreadNotificationCount(user?.id);

  // Maintain active Supabase Realtime subscription
  useRealtimeNotifications(user?.id);

  const handlePress = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push('/notifications' as any);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Notifications, ${unreadCount} unread`}
      onPress={handlePress}
      style={[styles.button, style]}>
      <Bell size={iconSize} color={color} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#000000',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
  },
});
