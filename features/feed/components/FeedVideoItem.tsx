import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Share,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Image } from 'expo-image';
import { useRouter, useIsFocused } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Disc,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography } from '@/lib/theme';
import { extractVimeoId, DEFAULT_VIMEO_FALLBACK_ID } from '@/lib/video';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { PromotedPill } from '@/components/ui/PromotedPill';
import { FeedTrailerItem } from '../types';
import { logFailedTrailer } from '../api';
import { useIncrementTrailerView, useToggleWatchlist } from '../useFeed';
import { useAuth } from '@/features/auth';
import { useRecordPromotedEvent } from '@/features/promoted';
import { ReportModal } from '@/components/moderation';

function formatCount(num?: number): string {
  if (num === undefined || num === null || num < 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return num.toString();
}

interface FeedVideoItemProps {
  item: FeedTrailerItem;
  isVisible: boolean;
  shouldPreload?: boolean;
  play?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  itemHeight: number;
  itemWidth: number;
  onOpenComments: (item: FeedTrailerItem) => void;
  onPressFilm?: (filmId: string) => void;
}

export function FeedVideoItem({
  item,
  isVisible,
  shouldPreload = false,
  play: propPlay,
  isMuted: externalIsMuted,
  onToggleMute,
  itemHeight,
  itemWidth,
  onOpenComments,
  onPressFilm,
}: FeedVideoItemProps) {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<any>(null);

  const [isMuted, setIsMuted] = useState(externalIsMuted ?? true);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [isLiked, setIsLiked] = useState(Boolean(item.is_liked));
  const [likeCount, setLikeCount] = useState<number>((item as any).likes_count ?? item.like_count ?? 0);
  const [isInWatchlist, setIsInWatchlist] = useState(Boolean(item.is_in_watchlist));
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isExpandedSynopsis, setIsExpandedSynopsis] = useState(false);

  const hasIncrementedView = useRef(false);
  const incrementViewMutation = useIncrementTrailerView();
  const toggleWatchlistMutation = useToggleWatchlist();
  const recordPromotedEventMutation = useRecordPromotedEvent();

  // Active state for lifecycle virtualization
  const isActive = isVisible && isFocused;

  // Resolve clean Vimeo ID & build URL with dynamic audio parameter
  const cleanVimeoId =
    item.vimeo_id ||
    extractVimeoId(item.video_url) ||
    DEFAULT_VIMEO_FALLBACK_ID;
  const vimeoUri = `https://player.vimeo.com/video/${cleanVimeoId}?autoplay=1&loop=1&byline=0&title=0&portrait=0&muted=${isMuted ? '1' : '0'}&playsinline=1&transparent=0&dnt=1`;

  // Send volume/mute message to Vimeo via postMessage API
  const setVimeoAudio = (muted: boolean) => {
    const js = `
      (function() {
        try {
          var msg = JSON.stringify({ method: '${muted ? 'setMuted' : 'setVolume'}', value: ${muted ? 'true' : '1'} });
          window.postMessage(msg, '*');
          var iframes = document.getElementsByTagName('iframe');
          for (var i = 0; i < iframes.length; i++) {
            iframes[i].contentWindow.postMessage(msg, '*');
          }
          if (window.player) {
            if (typeof window.player.setVolume === 'function') window.player.setVolume(${muted ? 0 : 1});
            if (typeof window.player.setMuted === 'function') window.player.setMuted(${muted});
          }
        } catch (e) {}
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(js);
  };

  // Sync external mute state
  useEffect(() => {
    if (externalIsMuted !== undefined && externalIsMuted !== isMuted) {
      setIsMuted(externalIsMuted);
      setVimeoAudio(externalIsMuted);
    }
  }, [externalIsMuted]);

  // Handle Mute/Unmute Toggle
  const handleToggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setVimeoAudio(nextMuted);
    if (onToggleMute) {
      onToggleMute();
    }
  };

  // View count increment
  useEffect(() => {
    if (isActive && !hasIncrementedView.current) {
      hasIncrementedView.current = true;
      incrementViewMutation.mutate(item.id);

      if (item.is_promoted && (item.promoted_slot_id || item.id)) {
        recordPromotedEventMutation.mutate({
          slot_id: item.promoted_slot_id || item.id,
          event_type: 'impression',
        });
      }
    }
  }, [isActive, item.id, item.is_promoted, item.promoted_slot_id]);

  // Promoted tap tracking
  const recordPromotedTap = () => {
    if (item.is_promoted && (item.promoted_slot_id || item.id)) {
      recordPromotedEventMutation.mutate({
        slot_id: item.promoted_slot_id || item.id,
        event_type: 'tap',
      });
    }
  };

  // Rotating vinyl poster disc animation
  const discRotation = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      discRotation.value = withRepeat(
        withTiming(360, { duration: 6000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(discRotation);
    }
  }, [isActive]);

  const animatedDiscStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${discRotation.value}deg` }],
  }));

  // Double-tap heart animation
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const triggerDoubleTapHeart = () => {
    heartScale.value = 0.5;
    heartOpacity.value = 1;
    heartScale.value = withSpring(1.3, { damping: 8, stiffness: 220 }, () => {
      heartOpacity.value = withTiming(0, { duration: 350 });
      heartScale.value = withTiming(0, { duration: 350 });
    });
  };

  // Single vs double tap handling on the background video area
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVideoBackgroundTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      // Double tap: like trailer
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      recordPromotedTap();
      triggerDoubleTapHeart();
      if (!isLiked) {
        setIsLiked(true);
        setLikeCount((prev: number) => prev + 1);
      }
    } else {
      lastTapRef.current = now;
      tapTimeoutRef.current = setTimeout(() => {
        // Single tap: toggle audio mute/unmute
        handleToggleMute();
      }, DOUBLE_TAP_DELAY);
    }
  };

  // Toggle Like Handler
  const handleToggleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    recordPromotedTap();
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev: number) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikeCount((prev: number) => prev + 1);
      triggerDoubleTapHeart();
    }
  };

  // Toggle Watchlist Handler
  const handleToggleWatchlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    recordPromotedTap();
    setIsInWatchlist((prev) => !prev);
    if (user?.id) {
      toggleWatchlistMutation.mutate({
        userId: user.id,
        filmId: item.film_id,
        currentlySaved: isInWatchlist,
      });
    }
  };

  // Share Handler
  const handleShare = async () => {
    Haptics.selectionAsync().catch(() => {});
    recordPromotedTap();
    try {
      await Share.share({
        message: `Watch the trailer for "${item.film_title}" (${item.release_year}) on Takilya: Philippine Cinema.`,
        title: item.title,
      });
    } catch {
      // User cancelled
    }
  };

  // Film detail navigation
  const handleOpenFilmDetail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    recordPromotedTap();
    const filmId = item.film_id || item.id;
    if (onPressFilm) {
      onPressFilm(filmId);
    } else {
      router.push(`/film/${filmId}` as any);
    }
  };

  // Retry failed trailer playback
  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setHasError(false);
    setRetryKey((prev) => prev + 1);
  };

  const culturalTags: string[] = (item as any).cultural_tags || item.genres || [];

  return (
    <View style={[styles.fullScreenContainer, { height: itemHeight, width: itemWidth }]}>
      {/* 1. Background Video Layer (WebView) */}
      <View style={StyleSheet.absoluteFill}>
        {isActive && !hasError ? (
          <WebView
            ref={webViewRef}
            key={`vimeo-${cleanVimeoId}-${retryKey}`}
            source={{ uri: vimeoUri }}
            style={styles.webView}
            containerStyle={styles.webViewContainer}
            backgroundColor="#000000"
            opacity={0.99}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            androidHardwareAccelerationDisabled={false}
            androidLayerType="hardware"
            bounces={false}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={['*']}
            injectedJavaScript={`
              (function() {
                try {
                  var applyAudio = function() {
                    var msg = JSON.stringify({ method: '${isMuted ? 'setMuted' : 'setVolume'}', value: ${isMuted ? 'true' : '1'} });
                    window.postMessage(msg, '*');
                    var iframes = document.getElementsByTagName('iframe');
                    for (var i = 0; i < iframes.length; i++) {
                      iframes[i].contentWindow.postMessage(msg, '*');
                    }
                  };
                  window.addEventListener('load', applyAudio);
                  setTimeout(applyAudio, 500);
                  setTimeout(applyAudio, 1500);
                } catch(e) {}
              })();
              true;
            `}
            onShouldStartLoadWithRequest={(request: any) => {
              return (
                request.url.startsWith('https://player.vimeo.com') ||
                request.url.startsWith('https://vimeo.com') ||
                request.url.startsWith('about:blank')
              );
            }}
            onError={(e: any) => {
              console.warn('[Vimeo WebView Error]:', e.nativeEvent);
              setHasError(true);
              logFailedTrailer(item.id, e.nativeEvent?.description || 'WebView error');
            }}
            onHttpError={(e: any) => {
              if (e.nativeEvent?.statusCode >= 400) {
                console.warn('[Vimeo HTTP Error]:', e.nativeEvent.statusCode);
                setHasError(true);
                logFailedTrailer(item.id, `HTTP ${e.nativeEvent.statusCode}`);
              }
            }}
          />
        ) : hasError ? (
          /* Error Fallback: Poster backdrop with Retry button (never black screen) */
          <View style={StyleSheet.absoluteFill}>
            {item.poster_url && (
              <Image
                source={{ uri: item.poster_url }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            )}
            <View style={styles.errorOverlay}>
              <View style={styles.errorCard}>
                <Ionicons name="alert-circle-outline" size={36} color="#FFFFFF" />
                <Text style={styles.errorTitle}>Trailer Unavailable</Text>
                <Text style={styles.errorSubtitle}>
                  Unable to load Vimeo player stream.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retry trailer playback"
                  onPress={handleRetry}
                  style={styles.retryButton}
                >
                  <Ionicons name="refresh" size={18} color="#000000" style={{ marginRight: 6 }} />
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          /* Off-Screen Virtualization: Poster backdrop or dark placeholder */
          <View style={StyleSheet.absoluteFill}>
            {item.poster_url ? (
              <Image
                source={{ uri: item.poster_url }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.darkPlaceholder]} />
            )}
          </View>
        )}
      </View>

      {/* 2. Transparent Background Tap Surface for Play/Pause, Audio & Double-Tap Like */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleVideoBackgroundTap}
        accessibilityRole="button"
        accessibilityLabel="Video playback area, single tap to toggle audio, double tap to like"
      />

      {/* 3. Centered Double-Tap Animated Heart */}
      <Animated.View pointerEvents="none" style={[styles.centeredHeart, animatedHeartStyle]}>
        <Ionicons name="heart" size={96} color="#FFFFFF" />
      </Animated.View>

      {/* 4. Top Header: Promoted Slot Tag (Left) & Floating Speaker Button (Right) */}
      {item.is_promoted && (
        <View style={[styles.promotedSlotTag, { top: Math.max(insets.top + 8, 48) }]} pointerEvents="box-none">
          <PromotedPill label="Promoted" sponsorName={item.sponsor_name} />
        </View>
      )}

      <View style={[styles.topRightControls, { top: Math.max(insets.top + 8, 48) }]} pointerEvents="box-none">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isMuted ? 'Unmute video audio' : 'Mute video audio'}
          onPress={handleToggleMute}
          style={styles.speakerButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          {isMuted ? (
            <VolumeX color="#FFFFFF" size={20} />
          ) : (
            <Volume2 color="#FFFFFF" size={20} />
          )}
        </TouchableOpacity>
      </View>

      {/* 5. Bottom Gradient Scrim for readable white typography */}
      <View pointerEvents="none" style={styles.bottomScrimWrap}>
        <Svg width={itemWidth} height={420} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="scrimGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity="0" />
              <Stop offset="0.4" stopColor="#000000" stopOpacity="0.45" />
              <Stop offset="0.75" stopColor="#000000" stopOpacity="0.85" />
              <Stop offset="1" stopColor="#000000" stopOpacity="0.98" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={itemWidth} height={420} fill="url(#scrimGrad)" />
        </Svg>
      </View>

      {/* 6. Bottom TikTok Interface (Pinned Flush to Bottom above Tab Bar) */}
      <View pointerEvents="box-none" style={styles.bottomOverlayContainer}>
        {/* Left Side: Film Information */}
        <View pointerEvents="box-none" style={styles.bottomLeftDetails}>
          {/* Badge Row (Festival & Official Trailer) */}
          <View style={styles.badgeRow} pointerEvents="box-none">
            <Text style={styles.festivalBadge} numberOfLines={1}>
              {item.posted_by_name || 'Cinemalaya'}
            </Text>
            {item.is_verified && <VerifiedBadge size={13} />}
            <Text style={styles.officialBadge}>
              {item.type === 'clip' ? 'OFFICIAL CLIP' : item.type === 'teaser' ? 'TEASER' : 'OFFICIAL TRAILER'}
            </Text>
          </View>

          {/* Film Title & Release Year */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`View film details for ${item.film_title}`}
            onPress={handleOpenFilmDetail}
            activeOpacity={0.8}
          >
            <Text numberOfLines={1} style={styles.filmTitle}>
              {item.film_title} <Text style={styles.filmYear}>({item.release_year})</Text>
            </Text>
          </TouchableOpacity>

          {/* Film Director */}
          <Text numberOfLines={1} style={styles.filmDirector}>
            Dir. {item.director}
          </Text>

          {/* Film Description / Synopsis (Expandable) */}
          {item.synopsis ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={isExpandedSynopsis ? 'Collapse synopsis' : 'Expand synopsis'}
              onPress={() => setIsExpandedSynopsis((prev) => !prev)}
              activeOpacity={0.9}
            >
              <Text
                numberOfLines={isExpandedSynopsis ? undefined : 2}
                style={styles.filmDescription}
              >
                {item.synopsis}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Cultural Tags / Genre Pills */}
          {culturalTags.length > 0 && (
            <View style={styles.tagRow} pointerEvents="box-none">
              {culturalTags.slice(0, 3).map((tag, idx) => (
                <View key={`${tag}-${idx}`} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Rights Note */}
          {item.rights_note && (
            <View style={styles.rightsNoteRow} pointerEvents="box-none">
              <Ionicons name="shield-checkmark-outline" size={11} color="#8A8A8A" style={{ marginRight: 4 }} />
              <Text style={styles.rightsNoteText} numberOfLines={1}>
                {item.rights_note}
              </Text>
            </View>
          )}
        </View>

        {/* Right Side: Action Rail (Flush Bottom-Right) */}
        <View pointerEvents="auto" style={styles.bottomRightRail}>
          {/* Like Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={isLiked ? 'Unlike trailer' : 'Like trailer'}
            onPress={handleToggleLike}
            style={styles.railButton}
            activeOpacity={0.7}
          >
            <Heart color="#FFFFFF" fill={isLiked ? '#FFFFFF' : 'transparent'} size={28} />
            <Text style={styles.railText}>{formatCount(likeCount)}</Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open discussion comments"
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              recordPromotedTap();
              onOpenComments(item);
            }}
            style={styles.railButton}
            activeOpacity={0.7}
          >
            <MessageCircle color="#FFFFFF" size={28} />
            <Text style={styles.railText}>
              {formatCount((item as any).comments_count ?? item.comment_count)}
            </Text>
          </TouchableOpacity>

          {/* Watchlist / Save Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            onPress={handleToggleWatchlist}
            style={styles.railButton}
            activeOpacity={0.7}
          >
            <Bookmark color="#FFFFFF" fill={isInWatchlist ? '#FFFFFF' : 'transparent'} size={28} />
            <Text style={styles.railText}>Watch</Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Share trailer"
            onPress={handleShare}
            style={styles.railButton}
            activeOpacity={0.7}
          >
            <Share2 color="#FFFFFF" size={28} />
            <Text style={styles.railText}>Share</Text>
          </TouchableOpacity>

          {/* Film Disc / View Details Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="View film details and soundtrack disc"
            onPress={handleOpenFilmDetail}
            style={styles.railButton}
            activeOpacity={0.7}
          >
            <Animated.View style={animatedDiscStyle}>
              {item.poster_url ? (
                <View style={styles.discOuter}>
                  <Image source={{ uri: item.poster_url }} style={styles.discImage} contentFit="cover" />
                  <View style={styles.discHole} />
                </View>
              ) : (
                <Disc color="#FFFFFF" size={28} />
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Moderation Report Modal */}
      <ReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        targetType="trailer"
        targetId={item.id}
        targetTitle={`${item.film_title} Trailer`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
    opacity: 0.99,
  },
  darkPlaceholder: {
    backgroundColor: '#0A0A0A',
  },
  centeredHeart: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -48,
    marginTop: -48,
    zIndex: 15,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxWidth: 280,
  },
  errorTitle: {
    ...typography.titleMedium,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  errorSubtitle: {
    ...typography.caption,
    color: '#8A8A8A',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    minHeight: 44,
    minWidth: 120,
  },
  retryText: {
    ...typography.caption,
    color: '#000000',
    fontWeight: '700',
  },
  promotedSlotTag: {
    position: 'absolute',
    left: 16,
    zIndex: 25,
  },
  topRightControls: {
    position: 'absolute',
    right: 16,
    zIndex: 25,
  },
  speakerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomScrimWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 420,
    zIndex: 5,
  },
  bottomOverlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16, // Sits directly on top of the tab bar
    zIndex: 10,
  },
  bottomLeftDetails: {
    flex: 1,
    marginRight: 12,
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  festivalBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    maxWidth: 160,
  },
  officialBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D4D4D4',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  filmTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  filmYear: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  filmDirector: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4D4D4',
  },
  filmDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#D4D4D4',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rightsNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rightsNoteText: {
    fontSize: 10,
    color: '#8A8A8A',
  },
  bottomRightRail: {
    width: 50,
    alignItems: 'center',
    gap: 16,
    paddingBottom: 4,
  },
  railButton: {
    alignItems: 'center',
    gap: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  railText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  discOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#141414',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  discImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  discHole: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
});
