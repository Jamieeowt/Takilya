import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { colors, radius, typography } from '@/lib/theme';
import { logFailedTrailer } from '@/features/feed/api';

export interface FeedPlayerProps {
  videoUrl: string;
  posterUrl?: string | null;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onDoubleTapLike?: () => void;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  style?: StyleProp<ViewStyle>;
  trailerId?: string;
  showProgressLine?: boolean;
}

export function FeedPlayer({
  videoUrl,
  posterUrl,
  isActive,
  isMuted,
  onToggleMute,
  onDoubleTapLike,
  onError,
  onTimeUpdate,
  style,
  trailerId,
  showProgressLine = true,
}: FeedPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [showPauseOverlay, setShowPauseOverlay] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [progress, setProgress] = useState(0);

  // Shimmer animation for poster loading
  const shimmerTranslate = useSharedValue(-1);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + (shimmerTranslate.value + 1) * 0.15,
  }));

  // Heart pop animation
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  // Double-tap vs single-tap refs
  const lastTapRef = useRef<number>(0);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize native video player via expo-video
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = isMuted;
    p.timeUpdateEventInterval = 0.2;
  });

  // Sync mute state
  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [player, isMuted]);

  // Sync active play/pause
  useEffect(() => {
    if (!player) return;

    if (isActive && !isPausedByUser && !hasError) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, isActive, isPausedByUser, hasError]);

  // Player event listeners
  useEffect(() => {
    if (!player) return;

    const statusSubscription = player.addListener('statusChange', (payload) => {
      if (payload.status === 'readyToPlay') {
        setIsReady(true);
        setHasError(false);
      } else if (payload.status === 'error') {
        setHasError(true);
        const err = payload.error?.message || 'Video failed to load';
        setErrorMessage(err);
        onError?.(err);
        if (trailerId) {
          logFailedTrailer(trailerId, err);
        }
      }
    });

    const timeSubscription = player.addListener('timeUpdate', (payload) => {
      if (player.duration > 0) {
        const cur = payload.currentTime || 0;
        const dur = player.duration || 1;
        const ratio = Math.min(Math.max(cur / dur, 0), 1);
        setProgress(ratio);
        onTimeUpdate?.(cur, dur);
      }
    });

    return () => {
      statusSubscription?.remove();
      timeSubscription?.remove();
    };
  }, [player, trailerId, onError, onTimeUpdate]);

  // Trigger double-tap heart like animation
  const triggerLikeAnimation = useCallback(() => {
    setShowHeart(true);
    heartScale.value = 0;
    heartOpacity.value = 1;
    heartScale.value = withSpring(1.2, { damping: 10, stiffness: 200 }, () => {
      heartScale.value = withSpring(1.0);
    });
    heartOpacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 300 }, () => {
        // Heart dismissed
      })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onDoubleTapLike?.();
  }, [onDoubleTapLike]);

  // Tap handler (Single tap = pause/play, Double tap = like)
  const handleSurfacePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      triggerLikeAnimation();
    } else {
      singleTapTimerRef.current = setTimeout(() => {
        if (!player) return;
        if (player.playing) {
          player.pause();
          setIsPausedByUser(true);
          setShowPauseOverlay(true);
          Haptics.selectionAsync().catch(() => {});
        } else {
          player.play();
          setIsPausedByUser(false);
          setShowPauseOverlay(false);
          Haptics.selectionAsync().catch(() => {});
        }
        singleTapTimerRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
    lastTapRef.current = now;
  };

  const handleRetry = () => {
    setHasError(false);
    setIsReady(false);
    if (player) {
      player.replay();
      player.play();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* 1. Native Video Player */}
      {!hasError && (
        <VideoView
          style={StyleSheet.absoluteFill}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />
      )}

      {/* 2. Poster Shimmer while loading or if not ready */}
      {(!isReady || hasError) && (
        <View style={StyleSheet.absoluteFill}>
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.darkPlaceholder]} />
          )}

          {/* Shimmer gradient overlay while loading */}
          {!hasError && (
            <Animated.View style={[StyleSheet.absoluteFill, styles.shimmerOverlay, shimmerStyle]} />
          )}
        </View>
      )}

      {/* 3. Surface Tap Target for Single Tap (Play/Pause) and Double Tap (Like) */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleSurfacePress}
        accessible={true}
        accessibilityLabel={player?.playing ? 'Pause video' : 'Play video'}
        accessibilityRole="button"
      >
        {/* Pause Overlay Icon */}
        {showPauseOverlay && isPausedByUser && !hasError && (
          <View style={styles.centerOverlay} pointerEvents="none">
            <View style={styles.pausePill}>
              <Ionicons name="pause" size={32} color="#FFFFFF" />
            </View>
          </View>
        )}

        {/* Double-tap Animated Heart */}
        {showHeart && (
          <View style={styles.centerOverlay} pointerEvents="none">
            <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
              <Ionicons name="heart" size={84} color="#FFFFFF" />
            </Animated.View>
          </View>
        )}
      </Pressable>

      {/* 4. Tap-to-Unmute Button (Accessible 44x44 tap target) */}
      <Pressable
        style={styles.muteButton}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onToggleMute();
        }}
        hitSlop={8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isMuted ? 'Unmute trailer video' : 'Mute trailer video'}
      >
        <Ionicons
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={18}
          color="#FFFFFF"
        />
      </Pressable>

      {/* 5. Error Fallback Card: Poster with Retry button only (No 'Watch on...' buttons) */}
      {hasError && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={36} color="#FFFFFF" style={{ marginBottom: 8 }} />
            <Text style={styles.errorTitle}>Playback Unavailable</Text>
            <Text style={styles.errorSubtitle}>
              Unable to load trailer. Tap retry to reload.
            </Text>
            <Pressable
              style={styles.retryButton}
              onPress={handleRetry}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Retry video playback"
            >
              <Ionicons name="refresh" size={16} color="#000000" style={{ marginRight: 6 }} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* 6. Thin Progress Line (driven by player.currentTime) */}
      {showProgressLine && !hasError && isReady && (
        <View style={styles.progressTrack} pointerEvents="none">
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  darkPlaceholder: {
    backgroundColor: '#0A0A0A',
  },
  shimmerOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  centerOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausePill: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartContainer: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  muteButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 48,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 10,
  },
  errorCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  errorTitle: {
    ...typography.titleMedium,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  errorSubtitle: {
    ...typography.caption,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    minHeight: 44,
    minWidth: 140,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '700',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});
