import React, { useState, useEffect, useRef } from 'react';
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
import { colors, spacing, radius, typography } from '@/lib/theme';
import { Badge } from '@/components/Badge';
import { FeedTrailerItem } from '../types';
import { useIncrementTrailerView, useToggleWatchlist } from '../useFeed';
import { useAuth } from '@/features/auth';

interface FeedVideoItemProps {
  item: FeedTrailerItem;
  isVisible: boolean;
  play?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  itemHeight: number;
  itemWidth: number;
  onOpenComments: (item: FeedTrailerItem) => void;
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
}: FeedVideoItemProps) {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { user } = useAuth();

  // Player state: starts muted for autoplay compliance, player ready state, playing state
  const [isReady, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(externalIsMuted ?? true);
  const [hasPlayerError, setHasPlayerError] = useState(false);

  // Social engagement state
  const [isLiked, setIsLiked] = useState(Boolean(item.is_liked));
  const [likeCount, setLikeCount] = useState(item.like_count);
  const [isInWatchlist, setIsInWatchlist] = useState(Boolean(item.is_in_watchlist));

  const hasIncrementedView = useRef(false);
  const incrementViewMutation = useIncrementTrailerView();
  const toggleWatchlistMutation = useToggleWatchlist();

  // Synchronize external mute state when passed from global store or parent
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
    setIsMuted((prev) => !prev);
    if (onToggleMute) {
      onToggleMute();
    }
  };

  // Programmatic play/pause toggle when tapping anywhere on the video container
  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // 1. Playback View Count: Increment view_count after 3 seconds of continuous playback
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isViewable && isReady && isPlaying && !hasPlayerError && !hasIncrementedView.current) {
      timer = setTimeout(() => {
        hasIncrementedView.current = true;
        incrementViewMutation.mutate(item.id);
      }, 3000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isViewable, isReady, isPlaying, hasPlayerError, item.id]);

  // Handle Like Toggle
  const handleToggleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
  };

  // Handle Watchlist Toggle
  const handleToggleWatchlist = () => {
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
      await Share.share({
        title: item.film_title,
        message: `Watch "${item.film_title}" (${item.release_year}) official clip on Takilya: https://youtu.be/${item.youtube_video_id}`,
      });
    } catch {
      // user dismissed share
    }
  };

  // Navigate to Film Detail Screen
  const handleOpenFilmDetail = () => {
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: item.film_id },
    });
  };

  // Open in YouTube fallback
  const handleOpenExternalYouTube = () => {
    void Linking.openURL(`https://www.youtube.com/watch?v=${item.youtube_video_id}`);
  };

  return (
    <View style={[styles.container, { height: itemHeight, width: itemWidth }]}>
      {/* Background Player Layer: Expanded to fit full height cleanly behind overlays */}
      <View style={styles.playerContainer} pointerEvents="box-none">
        {hasPlayerError ? (
          // Error State: Video failed to load
          <View style={styles.errorOverlay}>
            {item.poster_url && (
              <Image
                source={{ uri: item.poster_url }}
                style={styles.fullFill}
                resizeMode="cover"
                blurRadius={10}
              />
            )}
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={40} color={colors.status.error} />
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
                  onPress={handleOpenExternalYouTube}
                  style={styles.openYouTubeBtn}>
                  <Ionicons name="logo-youtube" size={16} color={colors.gold.primary} />
                  <Text style={styles.openYouTubeText}>YouTube</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : Platform.OS === 'web' ? (
          // Web preview iframe embed
          <View style={styles.webEmbedWrapper}>
            <iframe
              src={`https://www.youtube.com/embed/${item.youtube_video_id}?autoplay=${
                isViewable ? 1 : 0
              }&mute=${isMuted ? 1 : 0}&controls=0&playsinline=1&modestbranding=1&rel=0&origin=https://www.youtube.com`}
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
          // Native YouTube Player using react-native-youtube-iframe
          <View style={styles.nativePlayerWrapper}>
            <YoutubePlayer
              height={itemHeight}
              width={itemWidth}
              play={isViewable && isReady}
              videoId={item.youtube_video_id}
              mute={isMuted ?? true}
              onReady={() => setReady(true)}
              viewContainerStyle={{ width: itemWidth, height: itemHeight, backgroundColor: '#000000' }}
              webViewStyle={{ backgroundColor: '#000000', opacity: 0.99 }}
              webViewProps={{
                androidLayerType: 'hardware',
                mediaPlaybackRequiresUserAction: false,
                allowsInlineMediaPlayback: true,
                origin: 'https://www.youtube.com',
              } as any}
              initialPlayerParams={{
                autoplay: true,
                preventFullScreen: true,
                controls: false,
                modestbranding: true,
                rel: false,
              } as any}
              onError={(err: string) => {
                console.warn('YouTube Player Error:', err);
                setHasPlayerError(true);
              }}
            />
          </View>
        )}
      </View>

      {/* Programmatic Play/Pause Tap Layer: Tapping anywhere on video toggles play/pause */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
        onPress={togglePlayPause}
        style={styles.touchableSurface}>
        {!isPlaying && isFocused && isVisible && !hasPlayerError && (
          <View style={styles.pausedIndicator}>
            <Ionicons name="play" size={44} color="rgba(255, 255, 255, 0.9)" />
          </View>
        )}
      </Pressable>

      {/* Top Floating Tap-to-Unmute Pill */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isMuted ? 'Tap to unmute video audio' : 'Mute video audio'}
        onPress={handleToggleMute}
        hitSlop={8}
        style={styles.unmuteButton}>
        <Ionicons
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={16}
          color={colors.text.primary}
        />
        <Text style={styles.unmuteText}>{isMuted ? 'Muted' : 'Sound On'}</Text>
      </Pressable>

      {/* Promoted Slot Banner (Top / Overlay) */}
      {item.is_promoted && (
        <View style={styles.promotedSlotTag} pointerEvents="box-none">
          <Badge
            variant="promoted"
            label={item.sponsor_name ? `Promoted • ${item.sponsor_name}` : 'Promoted'}
          />
        </View>
      )}

      {/* Bottom Gradient Scrim */}
      <View pointerEvents="none" style={styles.bottomScrim} />

      {/* Bottom Content & Overlays (pointerEvents="box-none" so taps pass through to video container) */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* Left Side: Film Details & Poster Account */}
        <View style={styles.detailsCol} pointerEvents="box-none">
          {/* Poster Account Row */}
          <View style={styles.posterAccountRow} pointerEvents="box-none">
            <View style={styles.accountBadgeIcon}>
              <Ionicons name="film" size={14} color={colors.gold.primary} />
            </View>
            <Text style={styles.posterAccountName} numberOfLines={1}>
              {item.posted_by_name}
            </Text>
            {item.is_verified && (
              <Ionicons name="checkmark-circle" size={14} color={colors.gold.primary} />
            )}
            <Badge
              variant="neutral"
              label={item.type === 'official' || item.type === 'teaser' ? 'Official Trailer' : 'Official Clip'}
            />
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

          {/* Poster Thumbnail + Trailer Title */}
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

            <View style={styles.trailerMetaCol} pointerEvents="box-none">
              <Text style={styles.directorText}>Dir. {item.director}</Text>
              <Text style={styles.trailerTitleText} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          </View>

          {/* Genre Chips */}
          <View style={styles.genreChipsRow} pointerEvents="box-none">
            {item.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} label={genre} variant="neutral" />
            ))}
          </View>

          {/* Dual Scores Row */}
          {(item.critic_score || item.audience_score) && (
            <View style={styles.scoresRow} pointerEvents="box-none">
              {item.critic_score && (
                <View style={styles.scorePill}>
                  <Ionicons name="star" size={12} color={colors.gold.primary} />
                  <Text style={styles.scoreValue}>Critic {item.critic_score}%</Text>
                </View>
              )}
              {item.audience_score && (
                <View style={styles.scorePill}>
                  <Ionicons name="people" size={12} color={colors.film.audienceScore} />
                  <Text style={styles.scoreValue}>Audience {item.audience_score}%</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Right Side: Action Rail */}
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
                color={isLiked ? '#EF4444' : colors.text.primary}
              />
            </View>
            <Text style={styles.actionRailCount}>
              {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
            </Text>
          </Pressable>

          {/* Comment Action */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View comments on trailer"
            onPress={() => onOpenComments(item)}
            style={styles.actionRailBtn}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.text.primary} />
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
                color={isInWatchlist ? colors.gold.primary : colors.text.primary}
              />
            </View>
            <Text
              style={[styles.actionRailLabel, isInWatchlist && styles.actionRailLabelSaved]}>
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
              <Ionicons name="share-social-outline" size={22} color={colors.text.primary} />
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
              <Ionicons name="film-outline" size={22} color={colors.gold.primary} />
            </View>
            <Text style={styles.actionRailLabelFilm}>View Film</Text>
          </Pressable>
        </View>
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
  pausedIndicator: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  unmuteButton: {
    position: 'absolute',
    top: 54,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    minHeight: 44,
    zIndex: 10,
  },
  unmuteText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  promotedSlotTag: {
    position: 'absolute',
    top: 54,
    left: spacing.md,
    zIndex: 10,
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 360,
    backgroundColor: 'transparent',
    opacity: 0.95,
  },
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
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
  accountBadgeIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.gold.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterAccountName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  filmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  filmYear: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold.primary,
    textShadowColor: 'rgba(0,0,0,0.8)',
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
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1,
    backgroundColor: colors.background.secondary,
  },
  trailerMetaCol: {
    flex: 1,
    gap: 2,
  },
  directorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gold.primary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  trailerTitleText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  genreChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(18, 18, 22, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  scoreValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
  },
  actionRailCol: {
    width: 60,
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  actionRailBtn: {
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    gap: 2,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(18, 18, 22, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconWrapLiked: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  actionIconWrapSaved: {
    borderColor: colors.gold.primary,
    backgroundColor: colors.gold.subtle,
  },
  actionIconWrapFilm: {
    borderColor: colors.gold.primary,
    backgroundColor: colors.gold.subtle,
  },
  actionRailCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionRailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.secondary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionRailLabelSaved: {
    color: colors.gold.primary,
  },
  actionRailLabelFilm: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold.primary,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#08080A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorCard: {
    backgroundColor: 'rgba(18, 18, 22, 0.9)',
    borderRadius: radius.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 320,
  },
  errorTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
  },
  errorSub: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  retryButton: {
    backgroundColor: colors.gold.primary,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 13,
  },
  openYouTubeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderColor: colors.border.default,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: radius.xs,
    justifyContent: 'center',
  },
  openYouTubeText: {
    color: colors.gold.primary,
    fontWeight: '600',
    fontSize: 13,
  },
});
