import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Share,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useIsFocused } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
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

import { colors, spacing, radius, typography } from '@/lib/theme';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { PromotedPill } from '@/components/ui/PromotedPill';
import { Chip } from '@/components/ui/Chip';
import { extractYouTubeId } from '@/lib/youtube';
import { FeedTrailerItem } from '../types';
import { useIncrementTrailerView, useToggleWatchlist } from '../useFeed';
import { useAuth } from '@/features/auth';
import { useRecordPromotedEvent } from '@/features/promoted';

interface FeedVideoItemProps {
  item: FeedTrailerItem;
  isVisible: boolean;
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

  // Player state: starts muted for autoplay compliance, player ready state, playing state
  const [isReady, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(externalIsMuted ?? true);
  const [hasPlayerError, setHasPlayerError] = useState(false);

  // Safely extract the 11-character YouTube video ID (handles raw IDs, watch URLs, youtu.be, embed, shorts)
  const cleanVideoId = useMemo(
    () => extractYouTubeId(item.youtube_video_id),
    [item.youtube_video_id]
  );

  // Reset player error and ready state when the video changes
  useEffect(() => {
    setHasPlayerError(false);
    setReady(false);
  }, [cleanVideoId]);

  // Social engagement state (Strict Monochrome: White #FFFFFF / Grays)
  const [isLiked, setIsLiked] = useState(Boolean(item.is_liked));
  const [likeCount, setLikeCount] = useState(item.like_count);
  const [isInWatchlist, setIsInWatchlist] = useState(Boolean(item.is_in_watchlist));

  const hasIncrementedView = useRef(false);
  const incrementViewMutation = useIncrementTrailerView();
  const toggleWatchlistMutation = useToggleWatchlist();
  const recordPromotedEventMutation = useRecordPromotedEvent();

  // Helper to record tap events on promoted items
  const recordPromotedTap = () => {
    if (item.is_promoted && (item.promoted_slot_id || item.id)) {
      recordPromotedEventMutation.mutate({
        slot_id: item.promoted_slot_id || item.id,
        event_type: 'tap',
      });
    }
  };

  // Double tap detection & spring heart animation
  const lastTapRef = useRef<number>(0);
  const singleTapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  // Rotating vinyl poster disc animation
  const discRotation = useSharedValue(0);

  // Bottom white progress bar animation
  const progressWidth = useSharedValue(0);

  // Synchronize external mute state
  useEffect(() => {
    if (externalIsMuted !== undefined) {
      setIsMuted(externalIsMuted);
    }
  }, [externalIsMuted]);

  // Make sure the active visible card sets play={true} when it becomes the primary viewable item
  useEffect(() => {
    if (isVisible && isFocused) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isVisible, isFocused]);

  // Active viewability: true when screen is focused, card is visible, and playback is active
  const isViewable = isFocused && isVisible && (propPlay !== undefined ? propPlay : true) && isPlaying;

  // Toggle mute handler (keeps mute=true by default for autoplay compliance)
  const handleToggleMute = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsMuted((prev) => !prev);
    if (onToggleMute) {
      onToggleMute();
    }
  };

  // Programmatic play/pause toggle
  const togglePlayPause = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsPlaying((prev) => !prev);
  };

  // Rotating disc animation: spins continuously when playing, pauses when stopped
  useEffect(() => {
    if (isViewable && isReady && isPlaying) {
      discRotation.value = withRepeat(
        withTiming(discRotation.value + 360, {
          duration: 7000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cancelAnimation(discRotation);
    }

    return () => {
      cancelAnimation(discRotation);
    };
  }, [isViewable, isReady, isPlaying]);

  // Bottom progress line animation: fills along bottom while playing
  useEffect(() => {
    if (isViewable && isReady && isPlaying) {
      progressWidth.value = withRepeat(
        withTiming(1, { duration: 30000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(progressWidth);
    }

    return () => {
      cancelAnimation(progressWidth);
    };
  }, [isViewable, isReady, isPlaying]);

  // View count increment: after 3 seconds of continuous playback
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isViewable && isReady && isPlaying && !hasPlayerError && !hasIncrementedView.current) {
      timer = setTimeout(() => {
        hasIncrementedView.current = true;
        incrementViewMutation.mutate(item.id);

        // Record impression for promoted slot after 3 seconds of continuous view
        if (item.is_promoted && (item.promoted_slot_id || item.id)) {
          recordPromotedEventMutation.mutate({
            slot_id: item.promoted_slot_id || item.id,
            event_type: 'impression',
          });
        }
      }, 3000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isViewable, isReady, isPlaying, hasPlayerError, item.id]);

  // Double tap to like handler
  const handleTapSurface = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap triggered!
      if (singleTapTimeout.current) {
        clearTimeout(singleTapTimeout.current);
        singleTapTimeout.current = null;
      }
      lastTapRef.current = 0;

      // Haptic tick
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}

      // Like state
      if (!isLiked) {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }

      // Spring heart animation
      heartScale.value = 0;
      heartOpacity.value = 1;
      heartScale.value = withSpring(1.25, { damping: 10, stiffness: 220 });
      heartOpacity.value = withTiming(0, { duration: 800 });
    } else {
      lastTapRef.current = now;
      // Single tap: wait to verify it is not a double tap
      singleTapTimeout.current = setTimeout(() => {
        togglePlayPause();
        lastTapRef.current = 0;
      }, DOUBLE_TAP_DELAY);
    }
  };

  // Handle Action Rail Like Toggle
  const handleToggleLike = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    recordPromotedTap();
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    if (nextState) {
      heartScale.value = 0;
      heartOpacity.value = 1;
      heartScale.value = withSpring(1.1, { damping: 10, stiffness: 220 });
      heartOpacity.value = withTiming(0, { duration: 700 });
    }
  };

  // Handle Watchlist Toggle
  const handleToggleWatchlist = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    recordPromotedTap();
    if (!user) {
      router.push('/(tabs)/account' as any);
      return;
    }

    const nextState = !isInWatchlist;
    setIsInWatchlist(nextState);
    toggleWatchlistMutation.mutate({
      filmId: item.film_id,
      userId: user.id,
      currentlySaved: isInWatchlist,
    });
  };

  // Handle Native Share
  const handleShare = async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    recordPromotedTap();
    try {
      await Share.share({
        title: item.film_title,
        message: `Watch "${item.film_title}" (${item.release_year}) official clip on Takilya: https://youtu.be/${item.youtube_video_id}`,
      });
    } catch {}
  };

  // Navigate to Film Detail Screen
  const handleOpenFilmDetail = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    recordPromotedTap();
    const filmId = item.film_id || item.id;
    if (onPressFilm) {
      onPressFilm(filmId);
    } else {
      router.push(`/film/${filmId}` as any);
    }
  };

  // Animated styles
  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const animatedDiscStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${discRotation.value}deg` }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <View style={[styles.container, { height: itemHeight, width: itemWidth }]}>
      {/* 1. Edge-to-edge Video Layer */}
      <View style={styles.playerContainer} pointerEvents="box-none">
        {hasPlayerError ? (
          <View style={styles.errorOverlay}>
            {item.poster_url && (
              <Image
                source={{ uri: item.poster_url }}
                style={styles.fullFill}
                resizeMode="cover"
                blurRadius={12}
              />
            )}
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={40} color="#FFFFFF" />
              <Text style={styles.errorTitle}>Video unavailable</Text>
              <Text style={styles.errorSub}>The official trailer could not be loaded.</Text>
              <View style={styles.errorActionRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading video"
                  onPress={() => {
                    setHasPlayerError(false);
                    setReady(false);
                    setIsPlaying(true);
                  }}
                  style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open trailer on YouTube"
                  onPress={() => void Linking.openURL(`https://www.youtube.com/watch?v=${cleanVideoId}`)}
                  style={styles.openYouTubeBtn}>
                  <Ionicons name="logo-youtube" size={16} color="#FFFFFF" />
                  <Text style={styles.openYouTubeText}>YouTube</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : Platform.OS === 'web' ? (
          <View style={styles.webEmbedWrapper}>
            <iframe
              src={`https://www.youtube.com/embed/${cleanVideoId}?autoplay=${
                isViewable ? 1 : 0
              }&mute=${isMuted ? 1 : 0}&controls=0&playsinline=1&modestbranding=1&rel=0&enablejsapi=1`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title={item.film_title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </View>
        ) : (
          <View style={styles.nativePlayerWrapper}>
            <YoutubePlayer
              height={itemHeight}
              width={itemWidth}
              play={isViewable && isPlaying}
              videoId={cleanVideoId}
              mute={isMuted ?? true}
              onReady={() => {
                setReady(true);
                setHasPlayerError(false);
              }}
              viewContainerStyle={{ width: itemWidth, height: itemHeight, backgroundColor: '#000000' }}
              webViewStyle={{ backgroundColor: '#000000', opacity: 0.99 }}
              webViewProps={{
                androidLayerType: 'hardware',
                mediaPlaybackRequiresUserAction: false,
                allowsInlineMediaPlayback: true,
              }}
              initialPlayerParams={{
                autoplay: true,
                preventFullScreen: true,
                controls: false,
                modestbranding: true,
                rel: false,
                iv_load_policy: 3,
                showClosedCaptions: false,
              }}
              onError={(err: string) => {
                console.warn('[Takilya Feed] YouTube Player Error:', err, 'Video ID:', cleanVideoId);
                // Only flag permanent error for genuine failure
                if (
                  err === 'HTML5_error' ||
                  err === 'video_not_found' ||
                  err === 'embed_not_allowed' ||
                  err === 'invalid_parameter' ||
                  err === '100' ||
                  err === '101' ||
                  err === '150' ||
                  err === '2'
                ) {
                  setHasPlayerError(true);
                }
              }}
            />
          </View>
        )}
      </View>

      {/* 2. Interactive Tap Layer (Single tap: play/pause, Double tap: like + spring heart) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause video. Double tap to like.' : 'Play video. Double tap to like.'}
        onPress={handleTapSurface}
        style={styles.touchableSurface}>
        {/* Centered Spring Heart Animation */}
        <Animated.View pointerEvents="none" style={[styles.centeredHeart, animatedHeartStyle]}>
          <Ionicons name="heart" size={100} color="#FFFFFF" />
        </Animated.View>

        {/* Centered Paused Indicator */}
        {!isPlaying && isFocused && isVisible && !hasPlayerError && (
          <View style={styles.pausedIndicator}>
            <Ionicons name="play" size={44} color="#FFFFFF" />
          </View>
        )}
      </Pressable>

      {/* 3. Top Floating Tap-to-Unmute Pill (Strict Monochrome) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isMuted ? 'Unmute video audio' : 'Mute video audio'}
        onPress={handleToggleMute}
        hitSlop={8}
        style={styles.unmuteButton}>
        <Ionicons
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={16}
          color="#FFFFFF"
        />
        <Text style={styles.unmuteText}>{isMuted ? 'Muted' : 'Sound On'}</Text>
      </Pressable>

      {/* 4. Promoted Slot Tag (Strict Monochrome outlined pill) */}
      {item.is_promoted && (
        <View style={styles.promotedSlotTag} pointerEvents="box-none">
          <PromotedPill
            label="Promoted"
            sponsorName={item.sponsor_name}
          />
        </View>
      )}

      {/* 5. Edge-to-edge Bottom Gradient Scrim (Svg: Transparent -> Black #000000) */}
      <View pointerEvents="none" style={styles.bottomScrimWrap}>
        <Svg width={itemWidth} height={420} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="scrimGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity="0" />
              <Stop offset="0.4" stopColor="#000000" stopOpacity="0.4" />
              <Stop offset="0.75" stopColor="#000000" stopOpacity="0.82" />
              <Stop offset="1" stopColor="#000000" stopOpacity="0.98" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={itemWidth} height={420} fill="url(#scrimGrad)" />
        </Svg>
      </View>

      {/* 6. Bottom Content & Overlay (pointerEvents="box-none") */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* Left Side: Metadata Column */}
        <View style={styles.detailsCol} pointerEvents="box-none">
          {/* Poster Account Row */}
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
            accessibilityLabel={`View film ${item.film_title}`}
            onPress={handleOpenFilmDetail}
            style={styles.titleRow}>
            <Text style={styles.filmTitle} numberOfLines={1}>
              {item.film_title}
            </Text>
            <Text style={styles.filmYear}>({item.release_year})</Text>
          </Pressable>

          {/* Poster Thumbnail + Director / Title */}
          <View style={styles.trailerThumbnailRow} pointerEvents="box-none">
            {item.poster_url ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open film details"
                onPress={handleOpenFilmDetail}>
                <Image
                  source={{ uri: item.poster_url }}
                  style={styles.posterThumbnail}
                  resizeMode="cover"
                />
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View film card for ${item.film_title}`}
              onPress={handleOpenFilmDetail}
              style={styles.trailerMetaCol}>
              <Text style={styles.directorText}>Dir. {item.director}</Text>
              <Text style={styles.trailerTitleText} numberOfLines={2}>
                {item.title}
              </Text>
            </Pressable>
          </View>

          {/* Genre Chips (Strict Monochrome) */}
          <View style={styles.genreChipsRow} pointerEvents="box-none">
            {item.genres.slice(0, 3).map((genre) => (
              <Chip key={genre} label={genre} variant="outlined" onPress={handleOpenFilmDetail} />
            ))}
          </View>

          {/* Dual Scores Row (Critic & Audience: Strict Monochrome) */}
          {(item.critic_score || item.audience_score) && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Scores for ${item.film_title}. Tap to view film details.`}
              onPress={handleOpenFilmDetail}
              style={styles.scoresRow}>
              {item.critic_score && (
                <View style={styles.scorePill}>
                  <Ionicons name="star" size={12} color="#FFFFFF" />
                  <Text style={styles.scoreValue}>Critic {item.critic_score}%</Text>
                </View>
              )}
              {item.audience_score && (
                <View style={styles.scorePill}>
                  <Ionicons name="people" size={12} color="#D4D4D4" />
                  <Text style={styles.scoreValueAudience}>Audience {item.audience_score}%</Text>
                </View>
              )}
            </Pressable>
          )}
        </View>

        {/* Right Side: Action Rail & Rotating Poster Disc */}
        <View style={styles.actionRailCol} pointerEvents="box-none">
          {/* Like Action */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLiked ? 'Unlike trailer' : 'Like trailer'}
            onPress={handleToggleLike}
            style={styles.actionRailBtn}>
            <View style={[styles.actionIconWrap, isLiked && styles.actionIconWrapLiked]}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={isLiked ? '#000000' : '#FFFFFF'}
              />
            </View>
            <Text style={styles.actionRailCount}>
              {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
            </Text>
          </Pressable>

          {/* Comment Action (Opens Bottom Sheet) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View comments on trailer"
            onPress={() => {
              try {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              onOpenComments(item);
            }}
            style={styles.actionRailBtn}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionRailCount}>{item.comment_count}</Text>
          </Pressable>

          {/* Add to Watchlist Action */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            onPress={handleToggleWatchlist}
            style={styles.actionRailBtn}>
            <View style={[styles.actionIconWrap, isInWatchlist && styles.actionIconWrapSaved]}>
              <Ionicons
                name={isInWatchlist ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={isInWatchlist ? '#000000' : '#FFFFFF'}
              />
            </View>
            <Text style={[styles.actionRailLabel, isInWatchlist && styles.actionRailLabelSaved]}>
              {isInWatchlist ? 'Saved' : 'Watchlist'}
            </Text>
          </Pressable>

          {/* Share Action */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share film trailer"
            onPress={handleShare}
            style={styles.actionRailBtn}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.actionRailLabel}>Share</Text>
          </Pressable>

          {/* View Film Detail Action */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View film details for ${item.film_title}`}
            onPress={handleOpenFilmDetail}
            style={styles.actionRailBtn}>
            <View style={[styles.actionIconWrap, styles.actionIconWrapFilm]}>
              <Ionicons name="film-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionRailLabelFilm}>View Film</Text>
          </Pressable>

          {/* Rotating Poster Disc (Prompt 2.1 Visual Spec) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Rotating vinyl disc for ${item.film_title}. Tap to view film.`}
            onPress={handleOpenFilmDetail}
            style={styles.discWrapper}>
            <Animated.View style={[styles.vinylDisc, animatedDiscStyle]}>
              {/* Concentric groove rings */}
              <View style={styles.grooveOuter}>
                <View style={styles.grooveInner}>
                  {item.poster_url ? (
                    <Image
                      source={{ uri: item.poster_url }}
                      style={styles.discPosterCenter}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.discPosterCenter}>
                      <Ionicons name="disc-outline" size={20} color="#8A8A8A" />
                    </View>
                  )}
                  {/* Spindle hole */}
                  <View style={styles.spindleHole} />
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </View>
      </View>

      {/* 7. Thin White Progress Line Along the Bottom */}
      <View style={styles.bottomProgressBarTrack}>
        <Animated.View style={[styles.bottomProgressBarFill, animatedProgressStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webEmbedWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativePlayerWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  touchableSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  centeredHeart: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  pausedIndicator: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  unmuteButton: {
    position: 'absolute',
    top: 54,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 44,
    zIndex: 10,
  },
  unmuteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  promotedSlotTag: {
    position: 'absolute',
    top: 54,
    left: spacing.md,
    zIndex: 10,
  },
  bottomScrimWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 420,
    zIndex: 2,
  },
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    zIndex: 5,
  },
  detailsCol: {
    flex: 1,
    gap: 6,
    paddingRight: spacing.md,
    marginBottom: spacing.xs,
  },
  posterAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  accountIconBadge: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: '#1F1F1F',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterAccountName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4D4D4',
    textTransform: 'uppercase',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  filmTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: -0.3,
  },
  filmYear: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4D4D4',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  trailerThumbnailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: 2,
  },
  posterThumbnail: {
    width: 36,
    height: 52,
    borderRadius: radius.xs,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    backgroundColor: '#141414',
  },
  trailerMetaCol: {
    flex: 1,
    gap: 2,
  },
  directorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  trailerTitleText: {
    fontSize: 12,
    color: '#D4D4D4',
    lineHeight: 16,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  genreChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 3,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  scoreValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scoreValueAudience: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4D4D4',
  },
  actionRailCol: {
    width: 60,
    alignItems: 'center',
    gap: 12,
    paddingBottom: spacing.xs,
  },
  actionRailBtn: {
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    gap: 3,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconWrapLiked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  actionIconWrapSaved: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  actionIconWrapFilm: {
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  actionRailCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionRailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D4D4D4',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionRailLabelSaved: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionRailLabelFilm: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  discWrapper: {
    marginTop: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylDisc: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0A0A0A',
    borderColor: '#2E2E2E',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  grooveOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grooveInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  discPosterCenter: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spindleHole: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
  },
  bottomProgressBarTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    zIndex: 20,
  },
  bottomProgressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 320,
  },
  errorTitle: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  errorSub: {
    ...typography.bodySmall,
    color: '#8A8A8A',
    textAlign: 'center',
  },
  errorActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 13,
  },
  openYouTubeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: radius.xs,
    justifyContent: 'center',
  },
  openYouTubeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
