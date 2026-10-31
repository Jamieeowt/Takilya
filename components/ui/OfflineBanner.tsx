import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react-native';

import { useNetworkStatus } from '@/lib/offline';
import { haptics } from '@/lib/haptics';
import { radius, spacing } from '@/lib/theme';

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const { isOnline, isSyncing, queuedCount, syncNow } = useNetworkStatus();

  const spinValue = useSharedValue(0);

  useEffect(() => {
    if (isSyncing) {
      spinValue.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      spinValue.value = 0;
    }
  }, [isSyncing]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value}deg` }],
  }));

  // Hide when connected and no pending queue
  if (isOnline && !isSyncing && queuedCount === 0) {
    return null;
  }

  const handleManualSync = () => {
    haptics.light();
    syncNow();
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 10) : insets.top + 4 },
      ]}>
      <View style={styles.bannerBar}>
        {isSyncing ? (
          <Animated.View style={spinStyle}>
            <RefreshCw size={14} color="#FFFFFF" />
          </Animated.View>
        ) : !isOnline ? (
          <WifiOff size={14} color="#D4D4D4" />
        ) : (
          <CheckCircle2 size={14} color="#FFFFFF" />
        )}

        <View style={styles.textWrap}>
          {isSyncing ? (
            <Text style={styles.bannerText}>
              Reconnected • Syncing {queuedCount} offline {queuedCount === 1 ? 'log' : 'logs'}...
            </Text>
          ) : !isOnline ? (
            <Text style={styles.bannerText}>
              Offline Mode • Cached lists active
              {queuedCount > 0 ? ` (${queuedCount} queued)` : ''}
            </Text>
          ) : (
            <Text style={styles.bannerText}>
              {queuedCount} {queuedCount === 1 ? 'change' : 'changes'} pending sync
            </Text>
          )}
        </View>

        {isOnline && !isSyncing && queuedCount > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sync now"
            onPress={handleManualSync}
            style={styles.syncBtn}>
            <Text style={styles.syncText}>Sync</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 999,
  },
  bannerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  textWrap: {
    flexShrink: 1,
  },
  bannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4D4D4',
    letterSpacing: 0.2,
  },
  syncBtn: {
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginLeft: 4,
  },
  syncText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

