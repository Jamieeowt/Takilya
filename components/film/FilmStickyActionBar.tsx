import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Star, Bookmark, Eye, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { radius, typography } from '@/lib/theme';

interface FilmStickyActionBarProps {
  isInWatchlist: boolean;
  isWatched: boolean;
  userRating: number | null;
  onToggleWatchlist: () => void;
  onToggleWatched: () => void;
  onOpenRateModal: () => void;
}

export function FilmStickyActionBar({
  isInWatchlist,
  isWatched,
  userRating,
  onToggleWatchlist,
  onToggleWatched,
  onOpenRateModal,
}: FilmStickyActionBarProps) {
  const handleRate = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onOpenRateModal();
  };

  const handleWatchlist = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onToggleWatchlist();
  };

  const handleWatched = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onToggleWatched();
  };

  return (
    <View style={styles.outerContainer}>
      <BlurView intensity={70} tint="dark" style={styles.blurBar}>
        {/* 1. Log / Rate Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={userRating ? `Logged rating ${userRating} stars. Tap to edit.` : 'Log and rate film'}
          onPress={handleRate}
          style={styles.actionItem}>
          <View style={[styles.iconPill, userRating ? styles.iconPillActive : null]}>
            <Star
              size={18}
              color={userRating ? '#000000' : '#FFFFFF'}
              fill={userRating ? '#000000' : 'none'}
            />
          </View>
          <Text style={[styles.actionLabel, userRating ? styles.actionLabelActive : null]}>
            {userRating ? `${userRating} ★` : 'Log / Rate'}
          </Text>
        </Pressable>

        <View style={styles.itemDivider} />

        {/* 2. Add to Watchlist Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isInWatchlist ? 'In watchlist. Tap to remove.' : 'Add to watchlist'}
          onPress={handleWatchlist}
          style={styles.actionItem}>
          <View style={[styles.iconPill, isInWatchlist ? styles.iconPillActive : null]}>
            {isInWatchlist ? (
              <Check size={18} color="#000000" strokeWidth={3} />
            ) : (
              <Bookmark size={18} color="#FFFFFF" />
            )}
          </View>
          <Text style={[styles.actionLabel, isInWatchlist ? styles.actionLabelActive : null]}>
            {isInWatchlist ? 'Watchlist' : 'Watchlist'}
          </Text>
        </Pressable>

        <View style={styles.itemDivider} />

        {/* 3. Mark as Watched Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isWatched ? 'Marked as watched. Tap to toggle.' : 'Mark as watched'}
          onPress={handleWatched}
          style={styles.actionItem}>
          <View style={[styles.iconPill, isWatched ? styles.iconPillActive : null]}>
            {isWatched ? (
              <Check size={18} color="#000000" strokeWidth={3} />
            ) : (
              <Eye size={18} color="#FFFFFF" />
            )}
          </View>
          <Text style={[styles.actionLabel, isWatched ? styles.actionLabelActive : null]}>
            {isWatched ? 'Watched' : 'Watched'}
          </Text>
        </Pressable>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurBar: {
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(10, 10, 10, 0.82)',
    paddingHorizontal: 16,
  },
  actionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44, // 44px tap target
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  actionLabel: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  actionLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  itemDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

