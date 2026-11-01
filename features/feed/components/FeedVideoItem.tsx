import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Image } from 'expo-image';
import { useRouter, useIsFocused } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
import { extractVimeoId, getVimeoEmbedUrl, DEFAULT_VIMEO_FALLBACK_ID } from '@/lib/video';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { PromotedPill } from '@/components/ui/PromotedPill';
import { Chip } from '@/components/ui/Chip';
import { FeedTrailerItem } from '../types';
import { logFailedTrailer } from '../api';
import { useIncrementTrailerView, useToggleWatchlist } from '../useFeed';
import { useAuth } from '@/features/auth';
import { useRecordPromotedEvent } from '@/features/promoted';
import { ReportModal } from '@/components/moderation';

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

  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [isLiked, setIsLiked] = useState(Boolean(item.is_liked));
  const [likeCount, setLikeCount] = useState(item.like_count);
  const [isInWatchlist, setIsInWatchlist] = useState(Boolean(item.is_in_watchlist));
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isExpandedSynopsis, setIsExpandedSynopsis] = useState(false);

  const hasIncrementedView = useRef(false);
  const incrementViewMutation = useIncrementTrailerView();
  const toggleWatchlistMutation = useToggleWatchlist();
  const recordPromotedEventMutation = useRecordPromotedEvent();

  // Active state for lifecycle virtualization
  const isActive = isVisible && isFocused;

  // Resolve Vimeo ID & background autoplay embed URL
  const cleanVimeoId =
    item.vimeo_id ||
    extractVimeoId(item.video_url) ||
    DEFAULT_VIMEO_FALLBACK_ID;
  const vimeoUri = getVimeoEmbedUrl(cleanVimeoId);

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
        setLikeCount((prev) => prev + 1);
      }
    } else {
      lastTapRef.current = now;
      tapTimeoutRef.current = setTimeout(() => {
        // Single tap: toggle mute / play
        Haptics.selectionAsync().catch(() => {});
        if (onToggleMute) {
          onToggleMute();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  // Toggle Like Handler
  const handleToggleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    recordPromotedTap();
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
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

  // Safe area bottom padding offset according to docs/SAFE_AREAS.md
  const bottomInset = Math.max(insets.bottom, 12);
  const overlayBottomOffset = 56 + bottomInset + 16;

  return (
    <View style={[styles.container, { height: itemHeight, width: itemWidth }]}>
      {/* 1. Vimeo Video Player Embed Layer (WebView) */}
      <View style={StyleSheet.absoluteFill}>
        {isActive && !hasError ? (
          <WebView
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
            onShouldStartLoadWithRequest={(request) => {
              return (
                request.url.startsWith('https://player.vimeo.com') ||
                request.url.startsWith('https://vimeo.com') ||
                request.url.startsWith('about:blank')
              );
            }}
            onError={(e) => {
              console.warn('[Vimeo WebView Error]:', e.nativeEvent);
              setHasError(true);
              logFailedTrailer(item.id, e.nativeEvent.description || 'WebView error');
            }}
            onHttpError={(e) => {
              if (e.nativeEvent.statusCode >= 400) {
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

      {/* 2. Transparent Background Tap Surface for Play/Pause & Double-Tap Like */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleVideoBackgroundTap}
        accessibilityRole="button"
        accessibilityLabel="Video playback area, single tap to unmute, double tap to like"
      />

      {/* 3. Centered Double-Tap Animated Heart */}
      <Animated.View pointerEvents="none" style={[styles.centeredHeart, animatedHeartStyle]}>
        <Ionicons name="heart" size={96} color="#FFFFFF" />
      </Animated.View>

      {/* 4. Top Promoted Slot Tag (if sponsored) */}
      {item.is_promoted && (
        <View style={[styles.promotedSlotTag, { top: insets.top + 16 }]} pointerEvents="box-none">
          <PromotedPill label="Promoted" sponsorName={item.sponsor_name} />
        </View>
      )}

      {/* 5. Bottom Gradient Scrim for typography readability */}
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

      {/* 6. Bottom Overlay: Metadata (Left) & Action Rail (Right) with pointerEvents="box-none" */}
      <View
        style={[
          styles.overlayContainer,
          { paddingBottom: overlayBottomOffset },
        ]}
        pointerEvents="box-none"
      >
        {/* Left Side: Metadata Column */}
        <View style={styles.detailsCol} pointerEvents="box-none">
          {/* Entity Row (Poster account & verified badge) */}
          <View style={styles.posterAccountRow} pointerEvents="box-none">
            <View style={styles.accountIconBadge}>
              <Ionicons name="film" size={13} color="#FFFFFF" />
            </View>
            <Text style={styles.posterAccountName} numberOfLines={1}>
              {item.posted_by_name}
            </Text>
            {item.is_verified && <VerifiedBadge size={15} />}
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {item.type === 'official' || item.type === 'teaser' ? 'Official Trailer' : 'Official Clip'}
              </Text>
            </View>
          </View>

          {/* Film Title & Year */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View film details for ${item.film_title}`}
            onPress={handleOpenFilmDetail}
            style={styles.titleRow}
          >
            <Text style={styles.filmTitle} numberOfLines={1}>
              {item.film_title}
            </Text>
            <Text style={styles.filmYear}>({item.release_year})</Text>
          </Pressable>

          {/* Director & Poster thumbnail */}
          <View style={styles.trailerThumbnailRow} pointerEvents="box-none">
            {item.poster_url ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open film details"
                onPress={handleOpenFilmDetail}
              >
                <Image
                  source={{ uri: item.poster_url }}
                  style={styles.posterThumbnail}
                  contentFit="cover"
                />
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View film"
              onPress={handleOpenFilmDetail}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Text style={styles.directorText} numberOfLines={1}>
                Dir. {item.director}
              </Text>
              <Text style={styles.trailerItemTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </Pressable>
          </View>

          {/* Genre Chips */}
          {item.genres && item.genres.length > 0 && (
            <View style={styles.genreChipsRow} pointerEvents="box-none">
              {item.genres.slice(0, 3).map((genre, idx) => (
                <Chip
                  key={idx}
                  label={genre}
                  variant="outlined"
                  style={styles.genreChip}
                />
              ))}
            </View>
          )}

          {/* Synopsis (expandable) */}
          {item.synopsis && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isExpandedSynopsis ? 'Collapse synopsis' : 'Expand synopsis'}
              onPress={() => setIsExpandedSynopsis((prev) => !prev)}
              style={styles.synopsisContainer}
            >
              <Text
                style={styles.synopsisText}
                numberOfLines={isExpandedSynopsis ? undefined : 2}
              >
                {item.synopsis}
              </Text>
              {!isExpandedSynopsis && (
                <Text style={styles.synopsisMore}>more</Text>
              )}
            </Pressable>
          )}

          {/* Rights & Licensing Note */}
          {item.rights_note && (
            <View style={styles.rightsNoteRow} pointerEvents="box-none">
              <Ionicons name="shield-checkmark-outline" size={11} color="#8A8A8A" style={{ marginRight: 4 }} />
              <Text style={styles.rightsNoteText} numberOfLines={1}>
                {item.rights_note}
              </Text>
            </View>
          )}
        </View>

        {/* Right Side: Action Rail (Monochrome, min 44px tap targets) */}
        <View style={styles.actionRail} pointerEvents="box-none">
          {/* Like Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLiked ? 'Unlike trailer' : 'Like trailer'}
            onPress={handleToggleLike}
            style={styles.actionButton}
            hitSlop={8}
          >
            <View style={[styles.actionIconCircle, isLiked && styles.actionIconCircleActive]}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={isLiked ? '#000000' : '#FFFFFF'}
              />
            </View>
            <Text style={styles.actionLabel}>{likeCount}</Text>
          </Pressable>

          {/* Comments Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open discussion comments"
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              recordPromotedTap();
              onOpenComments(item);
            }}
            style={styles.actionButton}
            hitSlop={8}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="chatbubble-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>{item.comment_count}</Text>
          </Pressable>

          {/* Watchlist Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            onPress={handleToggleWatchlist}
            style={styles.actionButton}
            hitSlop={8}
          >
            <View style={[styles.actionIconCircle, isInWatchlist && styles.actionIconCircleActive]}>
              <Ionicons
                name={isInWatchlist ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isInWatchlist ? '#000000' : '#FFFFFF'}
              />
            </View>
            <Text style={styles.actionLabel}>
              {isInWatchlist ? 'Added' : 'Watch'}
            </Text>
          </Pressable>

          {/* Share Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share trailer"
            onPress={handleShare}
            style={styles.actionButton}
            hitSlop={8}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Share</Text>
          </Pressable>

          {/* Report / Moderation Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Report trailer"
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setIsReportModalVisible(true);
            }}
            style={styles.actionButton}
            hitSlop={8}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
            </View>
          </Pressable>

          {/* Rotating Vinyl Poster Disc */}
          {item.poster_url && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View film disc"
              onPress={handleOpenFilmDetail}
              style={styles.discContainer}
            >
              <Animated.View style={[styles.discOuter, animatedDiscStyle]}>
                <Image
                  source={{ uri: item.poster_url }}
                  style={styles.discImage}
                  contentFit="cover"
                />
                <View style={styles.discHole} />
              </Animated.View>
            </Pressable>
          )}
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
  container: {
    backgroundColor: '#000000',
    overflow: 'hidden',
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
    left: spacing.lg,
    zIndex: 20,
  },
  bottomScrimWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 420,
    zIndex: 5,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  detailsCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  posterAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  accountIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  posterAccountName: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    marginRight: 6,
    maxWidth: 150,
  },
  typeBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D4D4D4',
    textTransform: 'uppercase',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  filmTitle: {
    ...typography.titleLarge,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.5,
    marginRight: spacing.xs,
    flexShrink: 1,
  },
  filmYear: {
    ...typography.caption,
    color: '#8A8A8A',
    fontWeight: '600',
  },
  trailerThumbnailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  posterThumbnail: {
    width: 36,
    height: 52,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginRight: spacing.sm,
  },
  directorText: {
    ...typography.caption,
    color: '#D4D4D4',
    fontWeight: '600',
  },
  trailerItemTitle: {
    ...typography.caption,
    color: '#8A8A8A',
  },
  genreChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.xs,
  },
  genreChip: {
    height: 22,
    paddingHorizontal: 8,
  },
  synopsisContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  synopsisText: {
    ...typography.caption,
    color: '#D4D4D4',
    lineHeight: 16,
  },
  synopsisMore: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 4,
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
  actionRail: {
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionIconCircleActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  actionLabel: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  discContainer: {
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discOuter: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#141414',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  discImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  discHole: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});
